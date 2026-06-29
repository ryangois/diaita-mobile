import type { ComponentType } from 'react';

export type AppIcon = ComponentType<{
  color?: string;
  size?: number;
  strokeWidth?: number;
}>;

export type TabKey = 'today' | 'training' | 'diet' | 'progress' | 'profile';

export type TabItem = {
  key: TabKey;
  label: string;
  icon: AppIcon;
};

export type Exercise = {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  difficulty: 'Iniciante' | 'Intermediario' | 'Avancado';
  mediaType: 'GIF' | '3D';
  executionCue: string;
};

export type WorkoutExercise = {
  exerciseId: string;
  sets: number;
  reps: number;
  targetLoadKg: number;
  restSeconds: number;
};

export type CalorieSource = 'manual' | 'harris_benedict' | 'workout_estimate' | 'wearable';

export type WorkoutCalorieEntry = {
  source: CalorieSource;
  label: string;
  calories: number;
  note: string;
};

export type WorkoutDay = {
  id: string;
  label: string;
  title: string;
  focus: string;
  estimatedMinutes: number;
  effortLevel: 'leve' | 'moderado' | 'intenso' | 'muito_intenso';
  selectedCalorieSource: CalorieSource;
  manualCalories?: number;
  wearableCalories?: number;
  exercises: WorkoutExercise[];
};

export type WorkoutSetLog = {
  id: string;
  exerciseId: string;
  setNumber: number;
  targetReps: number;
  targetLoadKg: number;
  actualReps: number;
  actualLoadKg: number;
  completed: boolean;
};

export type WorkoutSessionStatus = 'active' | 'finished';

export type WorkoutSession = {
  id: string;
  workoutId: string;
  startedAt: string;
  finishedAt?: string;
  status: WorkoutSessionStatus;
  currentExerciseIndex: number;
  currentSetIndex: number;
  setLogs: WorkoutSetLog[];
};

export type UserProfile = {
  name: string;
  age: number;
  sex: 'male' | 'female';
  weightKg: number;
  heightCm: number;
  level: string;
  goal: string;
  trainingDaysPerWeek: number;
  equipment: string;
  dailyCalorieGoal: number;
  dailyProteinGoal: number;
  dailyCarbsGoal: number;
  dailyFatGoal: number;
};

export type BodyMetric = {
  id: string;
  measuredAt: string;
  weightKg: number;
  waistCm: number;
  chestCm: number;
  armCm: number;
  legCm: number;
};

export type Meal = {
  id: string;
  name: string;
  items: MealItem[];
};

export type NutritionUnit = 'g' | 'unit' | 'portion';

export type Food = {
  id: string;
  name: string;
  category: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  defaultServing: {
    unit: NutritionUnit;
    amount: number;
    grams: number;
    label: string;
  };
};

export type DraftFood = {
  name: string;
  category: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
};

export type MealItem = {
  id: string;
  foodId: string;
  unit: NutritionUnit;
  amount: number;
  grams?: number;
};

export type NutritionTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type ProgressInsight = {
  id: string;
  label: string;
  value: string;
  note: string;
};

export type AppData = {
  bodyMetrics: BodyMetric[];
  customExercises: Exercise[];
  foods: Food[];
  meals: Meal[];
  profile: UserProfile;
  workoutDays: WorkoutDay[];
  workoutHistory: WorkoutSession[];
};
