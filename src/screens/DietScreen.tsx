import { Apple, Minus, Plus, Utensils } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SectionTitle } from '../components/SectionTitle';
import { dailyNutritionGoal, foods, meals as initialMeals } from '../data/nutrition';
import { colors, radii } from '../styles/theme';
import type { Food, Meal } from '../types';
import {
  calculateMealItemNutrition,
  calculateMealTotals,
  calculateNutritionTotals,
} from '../utils/nutrition';

export function DietScreen() {
  const [meals, setMeals] = useState<Meal[]>(initialMeals);
  const [selectedMealId, setSelectedMealId] = useState(initialMeals[0].id);

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
    Math.round((nutritionTotals.calories / dailyNutritionGoal.calories) * 100),
  );
  const remainingCalories = dailyNutritionGoal.calories - nutritionTotals.calories;
  const selectedMeal = meals.find((meal) => meal.id === selectedMealId) ?? meals[0];

  function addFoodToSelectedMeal(food: Food) {
    setMeals((currentMeals) =>
      currentMeals.map((meal) => {
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
  }

  function changeMealItemAmount(mealId: string, itemId: string, delta: number) {
    setMeals((currentMeals) =>
      currentMeals.map((meal) => {
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
  }

  return (
    <>
      <View style={styles.nutritionPanel}>
        <Text style={styles.kicker}>Meta diaria</Text>
        <Text style={styles.heroTitle}>
          {nutritionTotals.calories} / {dailyNutritionGoal.calories} kcal
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${calorieProgress}%` }]} />
        </View>
        <Text style={styles.panelText}>
          {remainingCalories > 0
            ? `Faltam ${remainingCalories} kcal para fechar o dia.`
            : 'Meta de calorias concluida hoje.'}
        </Text>
      </View>

      <SectionTitle title="Macros" />
      <View style={styles.macroGrid}>
        <MacroCard label="Proteina" value={`${nutritionTotals.protein}g`} target={`${dailyNutritionGoal.protein}g`} />
        <MacroCard label="Carbo" value={`${nutritionTotals.carbs}g`} target={`${dailyNutritionGoal.carbs}g`} />
        <MacroCard label="Gordura" value={`${nutritionTotals.fat}g`} target={`${dailyNutritionGoal.fat}g`} />
      </View>

      <SectionTitle title="Refeicoes" />
      {mealsWithTotals.map((meal) => (
        <View key={meal.id} style={styles.mealCard}>
          <View style={styles.mealHeader}>
            <View style={styles.foodIcon}>
              <Utensils size={22} color={colors.secondary} />
            </View>
            <View style={styles.listBody}>
              <Text style={styles.cardTitle}>{meal.name}</Text>
              <Text style={styles.cardText}>
                {meal.totals.protein}g prot - {meal.totals.carbs}g carb - {meal.totals.fat}g gord
              </Text>
            </View>
            <Text style={styles.loadText}>{meal.totals.calories}</Text>
          </View>

          <View style={styles.mealActions}>
            <Pressable
              style={[styles.selectMealButton, selectedMeal.id === meal.id && styles.activeSelectMealButton]}
              onPress={() => setSelectedMealId(meal.id)}
              accessibilityRole="button"
              accessibilityLabel={`Selecionar ${meal.name}`}
            >
              <Text
                style={[
                  styles.selectMealButtonText,
                  selectedMeal.id === meal.id && styles.activeSelectMealButtonText,
                ]}
              >
                {selectedMeal.id === meal.id ? 'Selecionada' : 'Adicionar aqui'}
              </Text>
            </Pressable>
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
                      onPress={() => changeMealItemAmount(meal.id, item.id, -1)}
                      accessibilityLabel={`Diminuir ${itemNutrition.food.name}`}
                    >
                      <Minus size={14} color={colors.primary} />
                    </Pressable>
                    <Pressable
                      style={styles.quantityButton}
                      onPress={() => changeMealItemAmount(meal.id, item.id, 1)}
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

      <SectionTitle title="Base de alimentos" />
      <Text style={styles.libraryHint}>Adicionando em: {selectedMeal.name}</Text>
      <View style={styles.foodLibrary}>
        {foods.map((food) => (
          <View key={food.id} style={styles.libraryCard}>
            <View style={styles.libraryIcon}>
              <Apple size={21} color={colors.primary} />
            </View>
            <View style={styles.listBody}>
              <Text style={styles.cardTitle}>{food.name}</Text>
              <Text style={styles.cardText}>
                {food.caloriesPer100g} kcal/100g - {food.defaultServing.label}
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
      </View>
    </>
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
  mealActions: {
    alignItems: 'flex-start',
    marginTop: 12,
  },
  selectMealButton: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  activeSelectMealButton: {
    backgroundColor: colors.primary,
  },
  selectMealButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  activeSelectMealButtonText: {
    color: colors.surface,
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
  foodLibrary: {
    gap: 10,
  },
  libraryHint: {
    color: colors.primaryMid,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 10,
    marginTop: -4,
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
});
