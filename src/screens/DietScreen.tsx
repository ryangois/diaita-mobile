import { Utensils } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { SectionTitle } from '../components/SectionTitle';
import { dailyNutritionGoal, meals, nutritionTotals } from '../data/nutrition';
import { colors, radii } from '../styles/theme';

export function DietScreen() {
  const calorieProgress = Math.min(
    100,
    Math.round((nutritionTotals.calories / dailyNutritionGoal.calories) * 100),
  );
  const remainingCalories = dailyNutritionGoal.calories - nutritionTotals.calories;

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
      {meals.map((meal) => (
        <View key={meal.id} style={styles.listCard}>
          <View style={styles.foodIcon}>
            <Utensils size={22} color={colors.secondary} />
          </View>
          <View style={styles.listBody}>
            <Text style={styles.cardTitle}>{meal.name}</Text>
            <Text style={styles.cardText}>
              {meal.protein}g prot - {meal.carbs}g carb - {meal.fat}g gord
            </Text>
          </View>
          <Text style={styles.loadText}>{meal.calories}</Text>
        </View>
      ))}
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
  listCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    flexDirection: 'row',
    marginBottom: 10,
    padding: 12,
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
});
