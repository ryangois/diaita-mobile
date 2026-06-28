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
  reps: string;
  targetLoadKg: number;
  restSeconds: number;
};

export type WorkoutDay = {
  id: string;
  label: string;
  title: string;
  focus: string;
  estimatedMinutes: number;
  exercises: WorkoutExercise[];
};

export type Meal = {
  id: string;
  name: string;
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
