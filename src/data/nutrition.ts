import type { Food, Meal } from '../types';
import { calculateMealTotals, calculateNutritionTotals } from '../utils/nutrition';

export const dailyNutritionGoal = {
  calories: 2300,
  protein: 160,
  carbs: 240,
  fat: 70,
};

export const foods: Food[] = [
  {
    id: 'rice-cooked',
    name: 'Arroz branco cozido',
    category: 'Carboidrato',
    caloriesPer100g: 128,
    proteinPer100g: 2.5,
    carbsPer100g: 28.1,
    fatPer100g: 0.2,
    defaultServing: { unit: 'g', amount: 100, grams: 100, label: '100g' },
  },
  {
    id: 'beans-cooked',
    name: 'Feijao carioca cozido',
    category: 'Carboidrato',
    caloriesPer100g: 76,
    proteinPer100g: 4.8,
    carbsPer100g: 13.6,
    fatPer100g: 0.5,
    defaultServing: { unit: 'g', amount: 100, grams: 100, label: '100g' },
  },
  {
    id: 'chicken-breast',
    name: 'Frango grelhado',
    category: 'Proteina',
    caloriesPer100g: 165,
    proteinPer100g: 31,
    carbsPer100g: 0,
    fatPer100g: 3.6,
    defaultServing: { unit: 'g', amount: 120, grams: 120, label: '120g' },
  },
  {
    id: 'egg',
    name: 'Ovo inteiro',
    category: 'Proteina',
    caloriesPer100g: 143,
    proteinPer100g: 12.6,
    carbsPer100g: 0.7,
    fatPer100g: 9.5,
    defaultServing: { unit: 'unit', amount: 1, grams: 50, label: '1 unidade' },
  },
  {
    id: 'banana',
    name: 'Banana prata',
    category: 'Fruta',
    caloriesPer100g: 89,
    proteinPer100g: 1.1,
    carbsPer100g: 22.8,
    fatPer100g: 0.3,
    defaultServing: { unit: 'unit', amount: 1, grams: 86, label: '1 unidade' },
  },
  {
    id: 'oats',
    name: 'Aveia em flocos',
    category: 'Carboidrato',
    caloriesPer100g: 389,
    proteinPer100g: 16.9,
    carbsPer100g: 66.3,
    fatPer100g: 6.9,
    defaultServing: { unit: 'g', amount: 30, grams: 30, label: '30g' },
  },
  {
    id: 'whey',
    name: 'Whey protein',
    category: 'Suplemento',
    caloriesPer100g: 400,
    proteinPer100g: 80,
    carbsPer100g: 8,
    fatPer100g: 6,
    defaultServing: { unit: 'portion', amount: 1, grams: 30, label: '1 scoop' },
  },
  {
    id: 'olive-oil',
    name: 'Azeite',
    category: 'Gordura',
    caloriesPer100g: 884,
    proteinPer100g: 0,
    carbsPer100g: 0,
    fatPer100g: 100,
    defaultServing: { unit: 'portion', amount: 1, grams: 13, label: '1 colher' },
  },
];

export const meals: Meal[] = [
  {
    id: 'breakfast',
    name: 'Cafe da manha',
    items: [
      { id: 'breakfast-egg', foodId: 'egg', unit: 'unit', amount: 2 },
      { id: 'breakfast-banana', foodId: 'banana', unit: 'unit', amount: 1 },
      { id: 'breakfast-oats', foodId: 'oats', unit: 'g', amount: 40 },
    ],
  },
  {
    id: 'lunch',
    name: 'Almoco',
    items: [
      { id: 'lunch-rice', foodId: 'rice-cooked', unit: 'g', amount: 160 },
      { id: 'lunch-beans', foodId: 'beans-cooked', unit: 'g', amount: 120 },
      { id: 'lunch-chicken', foodId: 'chicken-breast', unit: 'g', amount: 180 },
      { id: 'lunch-oil', foodId: 'olive-oil', unit: 'portion', amount: 1 },
    ],
  },
  {
    id: 'snack',
    name: 'Lanche',
    items: [
      { id: 'snack-whey', foodId: 'whey', unit: 'portion', amount: 1 },
      { id: 'snack-banana', foodId: 'banana', unit: 'unit', amount: 1 },
    ],
  },
  {
    id: 'dinner',
    name: 'Jantar',
    items: [
      { id: 'dinner-rice', foodId: 'rice-cooked', unit: 'g', amount: 120 },
      { id: 'dinner-chicken', foodId: 'chicken-breast', unit: 'g', amount: 160 },
      { id: 'dinner-beans', foodId: 'beans-cooked', unit: 'g', amount: 90 },
    ],
  },
];

export const mealsWithTotals = meals.map((meal) => ({
  ...meal,
  totals: calculateMealTotals(meal, foods),
}));

export const nutritionTotals = calculateNutritionTotals(meals, foods);
