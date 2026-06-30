import { Apple, Barcode, Check, ChevronDown, ChevronUp, Copy, Minus, Pencil, Plus, Save, Search, Trash2, Utensils, X } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { SectionTitle } from '../components/SectionTitle';
import { colors, radii } from '../styles/theme';
import type { Food, Meal, MealTemplate, NutritionUnit, UserProfile } from '../types';
import {
  calculateMealItemNutrition,
  calculateMealTotals,
  calculateNutritionTotals,
} from '../utils/nutrition';

type DietScreenProps = {
  foods: Food[];
  isLoaded: boolean;
  meals: Meal[];
  mealTemplates: MealTemplate[];
  profile: UserProfile;
  onFoodsChange: (foods: Food[]) => void;
  onMealsChange: (meals: Meal[]) => void;
  onMealTemplatesChange: (templates: MealTemplate[]) => void;
};

export function DietScreen({
  foods,
  isLoaded,
  meals,
  mealTemplates,
  onFoodsChange,
  onMealTemplatesChange,
  onMealsChange,
  profile,
}: DietScreenProps) {
  const [selectedMealId, setSelectedMealId] = useState(meals[0]?.id ?? 'breakfast');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [foodSearch, setFoodSearch] = useState('');
  const [showManualFoodForm, setShowManualFoodForm] = useState(false);
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [mealNameDraft, setMealNameDraft] = useState('');
  const [mealTimeDraft, setMealTimeDraft] = useState('');
  const [barcodeDraft, setBarcodeDraft] = useState('');
  const [isBarcodeLoading, setIsBarcodeLoading] = useState(false);
  const [lastAction, setLastAction] = useState('Dados sincronizados localmente.');
  const [draftFood, setDraftFood] = useState({
    name: '',
    category: 'Manual',
    caloriesPer100g: '100',
    proteinPer100g: '10',
    carbsPer100g: '10',
    fatPer100g: '3',
    servingAmount: '100',
    servingGrams: '100',
    servingLabel: '100g',
    servingUnit: 'g' as NutritionUnit,
  });

  const mealsWithTotals = useMemo(
    () =>
      meals.map((meal) => ({
        ...meal,
        totals: calculateMealTotals(meal, foods),
      })),
    [meals],
  );

  const nutritionTotals = useMemo(() => calculateNutritionTotals(meals, foods), [meals]);

  const calorieProgress = Math.min(
    100,
    Math.round((nutritionTotals.calories / profile.dailyCalorieGoal) * 100),
  );
  const remainingCalories = profile.dailyCalorieGoal - nutritionTotals.calories;
  const selectedMeal = meals.find((meal) => meal.id === selectedMealId) ?? meals[0];
  const foodCategories = useMemo(() => ['Todos', ...Array.from(new Set(foods.map((food) => food.category)))], [foods]);
  const filteredFoods = foods.filter((food) => {
    const search = foodSearch.trim().toLowerCase();
    const matchesCategory = selectedCategory === 'Todos' || food.category === selectedCategory;

    if (!matchesCategory) {
      return false;
    }

    if (!search) {
      return true;
    }

    return food.name.toLowerCase().includes(search) || food.category.toLowerCase().includes(search);
  });

  function createMeal() {
    const mealNumber = meals.length + 1;
    const newMeal: Meal = {
      id: `meal-${Date.now()}`,
      name: `Refeicao ${mealNumber}`,
      time: '',
      items: [],
    };

    onMealsChange([...meals, newMeal]);
    setSelectedMealId(newMeal.id);
    setLastAction(`${newMeal.name} criada e selecionada.`);
  }

  function startEditingMeal(meal: Meal) {
    setEditingMealId(meal.id);
    setMealNameDraft(meal.name);
    setMealTimeDraft(meal.time ?? '');
  }

  function cancelEditingMeal() {
    setEditingMealId(null);
    setMealNameDraft('');
    setMealTimeDraft('');
  }

  function saveMealName(mealId: string) {
    const mealName = mealNameDraft.trim();

    if (!mealName) {
      return;
    }

    onMealsChange(
      meals.map((meal) => (meal.id === mealId ? { ...meal, name: mealName, time: mealTimeDraft.trim() } : meal)),
    );
    setEditingMealId(null);
    setMealNameDraft('');
    setLastAction(`Refeicao renomeada para ${mealName}.`);
  }

  function saveMealAsTemplate(meal: Meal) {
    if (meal.items.length === 0) {
      setLastAction('Adicione alimentos antes de salvar um modelo.');
      return;
    }

    const template: MealTemplate = {
      id: `template-${Date.now()}`,
      name: meal.name,
      items: meal.items.map((item) => ({ ...item, id: `template-item-${Date.now()}-${item.id}` })),
    };

    onMealTemplatesChange([template, ...mealTemplates]);
    setLastAction(`${meal.name} salva como modelo.`);
  }

  function applyMealTemplate(template: MealTemplate) {
    if (!selectedMeal) {
      return;
    }

    onMealsChange(
      meals.map((meal) =>
        meal.id === selectedMeal.id
          ? {
              ...meal,
              items: [
                ...meal.items,
                ...template.items.map((item) => ({
                  ...item,
                  id: `${meal.id}-${item.foodId}-${Date.now()}-${item.id}`,
                })),
              ],
            }
          : meal,
      ),
    );
    setLastAction(`${template.name} aplicado em ${selectedMeal.name}.`);
  }

  async function fetchFoodByBarcode() {
    const barcode = barcodeDraft.trim();

    if (!barcode) {
      return;
    }

    setIsBarcodeLoading(true);
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${barcode}?fields=product_name,categories,nutriments,serving_quantity,serving_size`,
      );
      const payload = await response.json();
      const product = payload.product;

      if (!product || payload.status === 0) {
        setLastAction('Produto nao encontrado na base Open Food Facts.');
        return;
      }

      const nutriments = product.nutriments ?? {};
      const servingGrams = readNumber(String(product.serving_quantity ?? '100')) || 100;
      const foodName = String(product.product_name || `Produto ${barcode}`).trim();
      const newFood: Food = {
        id: `barcode-${barcode}-${Date.now()}`,
        name: foodName,
        category: String(product.categories || 'Barcode').split(',')[0] || 'Barcode',
        barcode,
        caloriesPer100g: Math.round(readNumber(String(nutriments['energy-kcal_100g'] ?? nutriments['energy-kcal'] ?? '0'))),
        proteinPer100g: readNumber(String(nutriments.proteins_100g ?? '0')),
        carbsPer100g: readNumber(String(nutriments.carbohydrates_100g ?? '0')),
        fatPer100g: readNumber(String(nutriments.fat_100g ?? '0')),
        defaultServing: {
          unit: 'g',
          amount: servingGrams,
          grams: servingGrams,
          label: product.serving_size ? String(product.serving_size) : `${servingGrams}g`,
        },
      };

      onFoodsChange([...foods, newFood]);
      setBarcodeDraft('');
      setLastAction(`${newFood.name} importado do Open Food Facts.`);
    } catch {
      setLastAction('Nao foi possivel buscar o produto agora.');
    } finally {
      setIsBarcodeLoading(false);
    }
  }

  function askDeleteMeal(meal: Meal) {
    if (meals.length <= 1) {
      setLastAction('Mantenha pelo menos uma refeicao para adicionar alimentos.');
      return;
    }

    const message = `Apagar ${meal.name} e todos os alimentos dela?`;

    if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
      if (window.confirm(message)) {
        deleteMeal(meal);
      }
      return;
    }

    Alert.alert('Apagar refeicao', message, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: () => deleteMeal(meal) },
    ]);
  }

  function deleteMeal(mealToDelete: Meal) {
    const nextMeals = meals.filter((meal) => meal.id !== mealToDelete.id);
    const nextSelectedMeal = selectedMealId === mealToDelete.id ? nextMeals[0]?.id : selectedMealId;

    onMealsChange(nextMeals);
    setSelectedMealId(nextSelectedMeal ?? '');
    cancelEditingMeal();
    setLastAction(`${mealToDelete.name} apagada.`);
  }

  function addFoodToSelectedMeal(food: Food) {
    if (!selectedMeal) {
      return;
    }

    onMealsChange(
      meals.map((meal) => {
        if (meal.id !== selectedMeal.id) {
          return meal;
        }

        const existingItem = meal.items.find(
          (item) => item.foodId === food.id && item.unit === food.defaultServing.unit,
        );

        if (existingItem) {
          return {
            ...meal,
            items: meal.items.map((item) =>
              item.id === existingItem.id ? { ...item, amount: item.amount + food.defaultServing.amount } : item,
            ),
          };
        }

        return {
          ...meal,
          items: [
            ...meal.items,
            {
              id: `${meal.id}-${food.id}-${Date.now()}`,
              foodId: food.id,
              unit: food.defaultServing.unit,
              amount: food.defaultServing.amount,
            },
          ],
        };
      }),
    );
    setLastAction(`${food.name} adicionado em ${selectedMeal.name}.`);
  }

  function changeMealItemAmount(mealId: string, itemId: string, delta: number) {
    onMealsChange(
      meals.map((meal) => {
        if (meal.id !== mealId) {
          return meal;
        }

        return {
          ...meal,
          items: meal.items
            .map((item) => (item.id === itemId ? { ...item, amount: item.amount + delta } : item))
            .filter((item) => item.amount > 0),
        };
      }),
    );
    setLastAction('Quantidade atualizada.');
  }

  function updateMealItemAmount(mealId: string, itemId: string, amount: number) {
    onMealsChange(
      meals.map((meal) => {
        if (meal.id !== mealId) {
          return meal;
        }

        return {
          ...meal,
          items: meal.items
            .map((item) => (item.id === itemId ? { ...item, amount: Math.max(0, amount) } : item))
            .filter((item) => item.amount > 0),
        };
      }),
    );
    setLastAction('Quantidade atualizada.');
  }

  function createManualFood() {
    const foodName = draftFood.name.trim();

    if (!foodName) {
      return;
    }

    const newFood: Food = {
      id: `custom-${foodName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      name: foodName,
      category: draftFood.category.trim() || 'Manual',
      caloriesPer100g: readNumber(draftFood.caloriesPer100g),
      proteinPer100g: readNumber(draftFood.proteinPer100g),
      carbsPer100g: readNumber(draftFood.carbsPer100g),
      fatPer100g: readNumber(draftFood.fatPer100g),
      defaultServing: {
        unit: draftFood.servingUnit,
        amount: Math.max(1, readNumber(draftFood.servingAmount)),
        grams: Math.max(1, readNumber(draftFood.servingGrams)),
        label: draftFood.servingLabel.trim() || `${draftFood.servingAmount}${draftFood.servingUnit}`,
      },
    };

    onFoodsChange([...foods, newFood]);
    setDraftFood((current) => ({ ...current, name: '' }));
    setShowManualFoodForm(false);
    setLastAction(`${newFood.name} criado na base de alimentos.`);
  }

  return (
    <>
      <View style={styles.nutritionPanel}>
        <Text style={styles.kicker}>Meta diaria</Text>
        <Text style={styles.heroTitle}>
          {nutritionTotals.calories} / {profile.dailyCalorieGoal} kcal
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${calorieProgress}%` }]} />
        </View>
        <Text style={styles.panelText}>
          {isLoaded ? lastAction : 'Carregando dados locais...'}
          {' '}
          {remainingCalories > 0 ? `Faltam ${remainingCalories} kcal.` : 'Meta concluida hoje.'}
        </Text>
      </View>

      <SectionTitle title="Refeicao alvo" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mealChips}>
        {meals.map((meal) => {
          const isSelected = meal.id === selectedMeal?.id;

          return (
            <Pressable
              key={meal.id}
              style={[styles.mealChip, isSelected && styles.activeMealChip]}
              onPress={() => setSelectedMealId(meal.id)}
              accessibilityRole="button"
              accessibilityLabel={`Selecionar ${meal.name}`}
            >
              {isSelected && <Check size={15} color={colors.surface} />}
              <Text style={[styles.mealChipText, isSelected && styles.activeMealChipText]}>
                {meal.name}
              </Text>
            </Pressable>
          );
        })}
        <Pressable
          style={styles.newMealChip}
          onPress={createMeal}
          accessibilityRole="button"
          accessibilityLabel="Criar nova refeicao"
        >
          <Plus size={15} color={colors.primary} />
          <Text style={styles.newMealChipText}>Nova</Text>
        </Pressable>
      </ScrollView>

      <SectionTitle title="Macros" />
      <View style={styles.macroGrid}>
        <MacroCard label="Proteina" value={`${nutritionTotals.protein}g`} target={`${profile.dailyProteinGoal}g`} />
        <MacroCard label="Carbo" value={`${nutritionTotals.carbs}g`} target={`${profile.dailyCarbsGoal}g`} />
        <MacroCard label="Gordura" value={`${nutritionTotals.fat}g`} target={`${profile.dailyFatGoal}g`} />
      </View>

      <SectionTitle title="Refeicoes" />
      {mealsWithTotals.map((meal) => (
        <View key={meal.id} style={styles.mealCard}>
          <View style={styles.mealHeader}>
            <View style={styles.foodIcon}>
              <Utensils size={22} color={colors.secondary} />
            </View>
            <View style={styles.listBody}>
              {editingMealId === meal.id ? (
                <View style={styles.mealEditStack}>
                  <TextInput
                    autoFocus
                    style={styles.mealNameInput}
                    value={mealNameDraft}
                    onChangeText={setMealNameDraft}
                    onSubmitEditing={() => saveMealName(meal.id)}
                  />
                  <TextInput
                    style={styles.mealNameInput}
                    placeholder="Horario, ex: 12:30"
                    placeholderTextColor={colors.muted}
                    value={mealTimeDraft}
                    onChangeText={setMealTimeDraft}
                    onSubmitEditing={() => saveMealName(meal.id)}
                  />
                </View>
              ) : (
                <>
                  <Text style={styles.cardTitle}>{meal.name}</Text>
                  {!!meal.time && <Text style={styles.foodServingHint}>{meal.time}</Text>}
                </>
              )}
              <Text style={styles.cardText}>
                {meal.totals.protein}g prot - {meal.totals.carbs}g carb - {meal.totals.fat}g gord
              </Text>
            </View>
            <View style={styles.mealActions}>
              <Text style={styles.loadText}>{meal.totals.calories}</Text>
              {editingMealId === meal.id ? (
                <View style={styles.actionRow}>
                  <Pressable
                    style={styles.mealActionButton}
                    onPress={() => saveMealName(meal.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Salvar nome de ${meal.name}`}
                  >
                    <Save size={15} color={colors.primary} />
                  </Pressable>
                  <Pressable
                    style={styles.mealActionButton}
                    onPress={cancelEditingMeal}
                    accessibilityRole="button"
                    accessibilityLabel={`Cancelar edicao de ${meal.name}`}
                  >
                    <X size={15} color={colors.primary} />
                  </Pressable>
                </View>
              ) : (
                <View style={styles.actionRow}>
                  <Pressable
                    style={styles.mealActionButton}
                    onPress={() => startEditingMeal(meal)}
                    accessibilityRole="button"
                    accessibilityLabel={`Editar nome de ${meal.name}`}
                  >
                    <Pencil size={15} color={colors.primary} />
                  </Pressable>
                  <Pressable
                    style={styles.deleteMealButton}
                    onPress={() => askDeleteMeal(meal)}
                    accessibilityRole="button"
                    accessibilityLabel={`Apagar ${meal.name}`}
                  >
                    <Trash2 size={15} color={colors.secondary} />
                  </Pressable>
                  <Pressable
                    style={styles.mealActionButton}
                    onPress={() => saveMealAsTemplate(meal)}
                    accessibilityRole="button"
                    accessibilityLabel={`Salvar ${meal.name} como modelo`}
                  >
                    <Copy size={15} color={colors.primary} />
                  </Pressable>
                </View>
              )}
            </View>
          </View>

          <View style={styles.foodRows}>
            {meal.items.map((item) => {
              const itemNutrition = calculateMealItemNutrition(item, foods);

              if (!itemNutrition) {
                return null;
              }

              return (
                <View key={item.id} style={styles.foodRow}>
                  <View style={styles.foodDot} />
                  <View style={styles.foodRowBody}>
                    <Text style={styles.foodName}>{itemNutrition.food.name}</Text>
                    <Text style={styles.foodMeta}>
                      {itemNutrition.label} - {itemNutrition.grams}g calculados
                    </Text>
                  </View>
                  <View style={styles.itemControls}>
                    <Pressable
                      style={styles.quantityButton}
                      onPress={() => changeMealItemAmount(meal.id, item.id, -getAmountStep(item.unit))}
                      accessibilityLabel={`Diminuir ${itemNutrition.food.name}`}
                    >
                      <Minus size={14} color={colors.primary} />
                    </Pressable>
                    <MealAmountInput
                      amount={item.amount}
                      onChange={(amount) => updateMealItemAmount(meal.id, item.id, amount)}
                    />
                    <Pressable
                      style={styles.quantityButton}
                      onPress={() => changeMealItemAmount(meal.id, item.id, getAmountStep(item.unit))}
                      accessibilityLabel={`Aumentar ${itemNutrition.food.name}`}
                    >
                      <Plus size={14} color={colors.primary} />
                    </Pressable>
                  </View>
                  <Text style={styles.foodCalories}>{itemNutrition.totals.calories} kcal</Text>
                </View>
              );
            })}
          </View>
        </View>
      ))}

      <SectionTitle title="Modelos de refeicao" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.templateChips}>
        {mealTemplates.map((template) => (
          <Pressable
            key={template.id}
            style={styles.templateChip}
            onPress={() => applyMealTemplate(template)}
            accessibilityRole="button"
            accessibilityLabel={`Aplicar modelo ${template.name}`}
          >
            <Text style={styles.templateChipTitle}>{template.name}</Text>
            <Text style={styles.templateChipText}>{template.items.length} itens</Text>
          </Pressable>
        ))}
        {mealTemplates.length === 0 && (
          <View style={styles.emptySearch}>
            <Text style={styles.cardTitle}>Nenhum modelo salvo</Text>
            <Text style={styles.cardText}>Use o botao de copiar em uma refeicao para salvar um modelo.</Text>
          </View>
        )}
      </ScrollView>

      <SectionTitle title="Adicionar alimento" />
      <View style={styles.addFoodPanel}>
        <View>
          <Text style={styles.libraryHint}>Destino</Text>
          <Text style={styles.selectedMealText}>{selectedMeal?.name ?? 'Selecione uma refeicao'}</Text>
        </View>
        <Text style={styles.libraryHint}>{filteredFoods.length} alimentos</Text>
      </View>
      <View style={styles.searchBox}>
        <Search size={18} color={colors.primaryMid} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar alimento ou categoria"
          placeholderTextColor={colors.muted}
          value={foodSearch}
          onChangeText={setFoodSearch}
        />
      </View>
      <View style={styles.barcodePanel}>
        <Barcode size={20} color={colors.primary} />
        <TextInput
          keyboardType="numeric"
          style={styles.searchInput}
          placeholder="Codigo de barras"
          placeholderTextColor={colors.muted}
          value={barcodeDraft}
          onChangeText={setBarcodeDraft}
        />
        <Pressable style={styles.barcodeButton} onPress={fetchFoodByBarcode}>
          <Text style={styles.barcodeButtonText}>{isBarcodeLoading ? '...' : 'Buscar'}</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryChips}>
        {foodCategories.map((category) => {
          const isSelected = category === selectedCategory;

          return (
            <Pressable
              key={category}
              style={[styles.categoryChip, isSelected && styles.activeCategoryChip]}
              onPress={() => setSelectedCategory(category)}
              accessibilityRole="button"
              accessibilityLabel={`Filtrar ${category}`}
            >
              <Text style={[styles.categoryChipText, isSelected && styles.activeCategoryChipText]}>
                {category}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <Pressable
        style={styles.manualFoodToggle}
        onPress={() => setShowManualFoodForm((current) => !current)}
      >
        <Text style={styles.manualFoodToggleText}>Criar alimento manual</Text>
        {showManualFoodForm ? (
          <ChevronUp size={19} color={colors.primary} />
        ) : (
          <ChevronDown size={19} color={colors.primary} />
        )}
      </Pressable>
      {showManualFoodForm && (
        <View style={styles.manualFoodPanel}>
          <TextInput
            style={styles.textInput}
            placeholder="Nome do alimento"
            placeholderTextColor={colors.muted}
            value={draftFood.name}
            onChangeText={(name) => setDraftFood((current) => ({ ...current, name }))}
          />
          <TextInput
            style={[styles.textInput, styles.spacedInput]}
            placeholder="Categoria"
            placeholderTextColor={colors.muted}
            value={draftFood.category}
            onChangeText={(category) => setDraftFood((current) => ({ ...current, category }))}
          />
          <View style={styles.inputGrid}>
            <MacroInput
              label="kcal"
              value={draftFood.caloriesPer100g}
              onChangeText={(caloriesPer100g) =>
                setDraftFood((current) => ({ ...current, caloriesPer100g }))
              }
            />
            <MacroInput
              label="prot"
              value={draftFood.proteinPer100g}
              onChangeText={(proteinPer100g) =>
                setDraftFood((current) => ({ ...current, proteinPer100g }))
              }
            />
            <MacroInput
              label="carb"
              value={draftFood.carbsPer100g}
              onChangeText={(carbsPer100g) => setDraftFood((current) => ({ ...current, carbsPer100g }))}
            />
            <MacroInput
              label="gord"
              value={draftFood.fatPer100g}
              onChangeText={(fatPer100g) => setDraftFood((current) => ({ ...current, fatPer100g }))}
            />
          </View>
          <View style={styles.inputGrid}>
            <MacroInput
              label="porcao"
              value={draftFood.servingAmount}
              onChangeText={(servingAmount) =>
                setDraftFood((current) => ({ ...current, servingAmount }))
              }
            />
            <MacroInput
              label="gramas"
              value={draftFood.servingGrams}
              onChangeText={(servingGrams) => setDraftFood((current) => ({ ...current, servingGrams }))}
            />
            <MacroInput
              label="rotulo"
              value={draftFood.servingLabel}
              onChangeText={(servingLabel) => setDraftFood((current) => ({ ...current, servingLabel }))}
            />
          </View>
          <View style={styles.unitRow}>
            {(['g', 'unit', 'portion'] as NutritionUnit[]).map((unit) => {
              const isActive = draftFood.servingUnit === unit;

              return (
                <Pressable
                  key={unit}
                  style={[styles.unitChip, isActive && styles.activeUnitChip]}
                  onPress={() => setDraftFood((current) => ({ ...current, servingUnit: unit }))}
                >
                  <Text style={[styles.unitChipText, isActive && styles.activeUnitChipText]}>{unit}</Text>
                </Pressable>
              );
            })}
          </View>
          <Pressable style={styles.createFoodButton} onPress={createManualFood}>
            <Plus size={18} color={colors.surface} />
            <Text style={styles.createFoodButtonText}>Salvar alimento</Text>
          </Pressable>
        </View>
      )}
      <View style={styles.foodLibrary}>
        {filteredFoods.map((food) => (
          <View key={food.id} style={styles.libraryCard}>
            <View style={styles.libraryIcon}>
              <Apple size={21} color={colors.primary} />
            </View>
            <View style={styles.listBody}>
              <Text style={styles.cardTitle}>{food.name}</Text>
              <Text style={styles.cardText}>
                {food.category} - {food.caloriesPer100g} kcal/100g - {food.defaultServing.label}
              </Text>
              <Text style={styles.foodServingHint}>
                Vai entrar como {food.defaultServing.label} em {selectedMeal?.name ?? 'uma refeicao'}
              </Text>
            </View>
            <Pressable
              style={styles.addButton}
              onPress={() => addFoodToSelectedMeal(food)}
              accessibilityRole="button"
              accessibilityLabel={`Adicionar ${food.name}`}
            >
              <Plus size={18} color={colors.primary} />
            </Pressable>
          </View>
        ))}
        {filteredFoods.length === 0 && (
          <View style={styles.emptySearch}>
            <Text style={styles.cardTitle}>Nenhum alimento encontrado</Text>
            <Text style={styles.cardText}>Crie um alimento manual ou limpe a busca.</Text>
          </View>
        )}
      </View>
    </>
  );
}

function MacroInput({
  label,
  onChangeText,
  value,
}: {
  label: string;
  onChangeText: (value: string) => void;
  value: string;
}) {
  return (
    <View style={styles.macroInputBox}>
      <Text style={styles.macroInputLabel}>{label}/100g</Text>
      <TextInput
        keyboardType="numeric"
        style={styles.macroTextInput}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

function readNumber(value: string) {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function getAmountStep(unit: string) {
  return unit === 'g' ? 10 : 1;
}

function MealAmountInput({ amount, onChange }: { amount: number; onChange: (amount: number) => void }) {
  const [draftAmount, setDraftAmount] = useState(String(amount));

  useEffect(() => {
    setDraftAmount(String(amount));
  }, [amount]);

  function commitDraft() {
    const nextAmount = readNumber(draftAmount);
    onChange(nextAmount);
    setDraftAmount(String(Math.max(0, nextAmount)));
  }

  return (
    <TextInput
      keyboardType="numeric"
      style={styles.amountInput}
      value={draftAmount}
      onBlur={commitDraft}
      onChangeText={setDraftAmount}
      onSubmitEditing={commitDraft}
    />
  );
}

function MacroCard({ label, value, target }: { label: string; value: string; target: string }) {
  return (
    <View style={styles.macroCard}>
      <Text style={styles.macroValue}>{value}</Text>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroTarget}>Meta {target}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  nutritionPanel: {
    backgroundColor: colors.secondary,
    borderRadius: radii.md,
    padding: 20,
  },
  kicker: {
    color: colors.yellowSoft,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#f8fbf8',
    fontSize: 28,
    fontWeight: '800',
  },
  progressTrack: {
    backgroundColor: '#a4574d',
    borderRadius: radii.md,
    height: 12,
    marginTop: 18,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.yellowSoft,
    borderRadius: radii.md,
    height: '100%',
  },
  panelText: {
    color: '#f4ded7',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  macroGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  mealChips: {
    gap: 8,
    paddingRight: 20,
  },
  mealChip: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: 6,
    minHeight: 40,
    paddingHorizontal: 12,
  },
  activeMealChip: {
    backgroundColor: colors.primary,
  },
  mealChipText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  activeMealChipText: {
    color: colors.surface,
  },
  newMealChip: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: 6,
    minHeight: 40,
    paddingHorizontal: 12,
  },
  newMealChipText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  macroCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    flex: 1,
    padding: 12,
  },
  macroValue: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  macroLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 5,
  },
  macroTarget: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 4,
  },
  mealCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    marginBottom: 10,
    padding: 12,
  },
  mealHeader: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  mealActions: {
    alignItems: 'flex-end',
    gap: 7,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 6,
  },
  mealActionButton: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radii.sm,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  deleteMealButton: {
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
    borderRadius: radii.sm,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  mealNameInput: {
    backgroundColor: colors.background,
    borderRadius: radii.sm,
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    minHeight: 36,
    paddingHorizontal: 10,
  },
  mealEditStack: {
    gap: 7,
  },
  foodIcon: {
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
    borderRadius: radii.md,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  listBody: {
    flex: 1,
    paddingHorizontal: 12,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  cardText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  loadText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  foodRows: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
  },
  foodRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 9,
  },
  foodDot: {
    backgroundColor: colors.secondarySoft,
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  foodRowBody: {
    flex: 1,
  },
  foodName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  foodMeta: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  foodCalories: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    minWidth: 54,
    textAlign: 'right',
  },
  itemControls: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  quantityButton: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radii.sm,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  amountInput: {
    backgroundColor: colors.background,
    borderRadius: radii.sm,
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    height: 28,
    minWidth: 42,
    paddingHorizontal: 6,
    paddingVertical: 0,
    textAlign: 'center',
  },
  foodLibrary: {
    gap: 10,
  },
  addFoodPanel: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    padding: 12,
  },
  libraryHint: {
    color: colors.primaryMid,
    fontSize: 13,
    fontWeight: '800',
  },
  selectedMealText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 3,
  },
  manualFoodPanel: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    marginBottom: 10,
    padding: 12,
  },
  manualFoodToggle: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    minHeight: 46,
    paddingHorizontal: 12,
  },
  manualFoodToggleText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
  },
  searchBox: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    minHeight: 46,
    paddingHorizontal: 12,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
  },
  barcodePanel: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    minHeight: 46,
    paddingHorizontal: 12,
  },
  barcodeButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  barcodeButtonText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '800',
  },
  templateChips: {
    gap: 8,
    paddingRight: 20,
  },
  templateChip: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    minHeight: 60,
    padding: 12,
    width: 150,
  },
  templateChipTitle: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  templateChipText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  categoryChips: {
    gap: 8,
    marginBottom: 10,
    paddingRight: 20,
  },
  categoryChip: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  activeCategoryChip: {
    backgroundColor: colors.primary,
  },
  categoryChipText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  activeCategoryChipText: {
    color: colors.surface,
  },
  textInput: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    color: colors.text,
    fontSize: 14,
    minHeight: 42,
    paddingHorizontal: 12,
  },
  spacedInput: {
    marginTop: 8,
  },
  inputGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  macroInputBox: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    flexGrow: 1,
    minWidth: '47%',
    padding: 10,
  },
  macroInputLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  macroTextInput: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 4,
    padding: 0,
  },
  createFoodButton: {
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
    minHeight: 46,
  },
  createFoodButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '800',
  },
  unitRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  unitChip: {
    backgroundColor: colors.background,
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  activeUnitChip: {
    backgroundColor: colors.primary,
  },
  unitChipText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  activeUnitChipText: {
    color: colors.surface,
  },
  libraryCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    flexDirection: 'row',
    padding: 12,
  },
  libraryIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radii.md,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radii.md,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  foodServingHint: {
    color: colors.primaryMid,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
  emptySearch: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: 14,
  },
});
