import type { Meal } from '../types';

export const dailyNutritionGoal = {
  calories: 2300,
  protein: 160,
  carbs: 240,
  fat: 70,
};

export const meals: Meal[] = [
  { id: 'breakfast', name: 'Cafe da manha', calories: 520, protein: 38, carbs: 54, fat: 16 },
  { id: 'lunch', name: 'Almoco', calories: 710, protein: 52, carbs: 76, fat: 21 },
  { id: 'snack', name: 'Lanche', calories: 310, protein: 24, carbs: 33, fat: 9 },
  { id: 'dinner', name: 'Jantar', calories: 640, protein: 46, carbs: 61, fat: 19 },
];

export const nutritionTotals = meals.reduce(
  (totals, meal) => ({
    calories: totals.calories + meal.calories,
    protein: totals.protein + meal.protein,
    carbs: totals.carbs + meal.carbs,
    fat: totals.fat + meal.fat,
  }),
  { calories: 0, protein: 0, carbs: 0, fat: 0 },
);
