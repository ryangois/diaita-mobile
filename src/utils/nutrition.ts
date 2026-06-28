import type { Food, Meal, MealItem, NutritionTotals } from '../types';

export function getFoodById(foods: Food[], id: string) {
  return foods.find((food) => food.id === id);
}

export function getItemGrams(item: MealItem, food: Food) {
  if (item.unit === 'g') {
    return item.grams ?? item.amount;
  }

  return item.amount * food.defaultServing.grams;
}

export function calculateFoodNutrition(food: Food, grams: number): NutritionTotals {
  return {
    calories: Math.round((food.caloriesPer100g * grams) / 100),
    protein: roundMacro((food.proteinPer100g * grams) / 100),
    carbs: roundMacro((food.carbsPer100g * grams) / 100),
    fat: roundMacro((food.fatPer100g * grams) / 100),
  };
}

export function calculateMealItemNutrition(item: MealItem, foods: Food[]) {
  const food = getFoodById(foods, item.foodId);

  if (!food) {
    return null;
  }

  const grams = getItemGrams(item, food);
  const totals = calculateFoodNutrition(food, grams);

  return {
    food,
    grams,
    label: formatMealItemAmount(item, food),
    totals,
  };
}

export function calculateMealTotals(meal: Meal, foods: Food[]): NutritionTotals {
  return meal.items.reduce(
    (totals, item) => {
      const itemNutrition = calculateMealItemNutrition(item, foods);

      if (!itemNutrition) {
        return totals;
      }

      return sumNutrition(totals, itemNutrition.totals);
    },
    emptyTotals(),
  );
}

export function calculateNutritionTotals(meals: Meal[], foods: Food[]): NutritionTotals {
  return meals.reduce((totals, meal) => sumNutrition(totals, calculateMealTotals(meal, foods)), emptyTotals());
}

export function formatMealItemAmount(item: MealItem, food: Food) {
  if (item.unit === 'g') {
    return `${item.amount}g`;
  }

  if (item.unit === 'unit') {
    return `${item.amount} un`;
  }

  return item.amount === 1 ? food.defaultServing.label : `${item.amount} porcoes`;
}

function emptyTotals(): NutritionTotals {
  return {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  };
}

function sumNutrition(current: NutritionTotals, next: NutritionTotals): NutritionTotals {
  return {
    calories: current.calories + next.calories,
    protein: roundMacro(current.protein + next.protein),
    carbs: roundMacro(current.carbs + next.carbs),
    fat: roundMacro(current.fat + next.fat),
  };
}

function roundMacro(value: number) {
  return Math.round(value * 10) / 10;
}
