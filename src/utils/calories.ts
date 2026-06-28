import type { CalorieSource, WorkoutCalorieEntry, WorkoutDay } from '../types';

type UserProfileForCalories = {
  age: number;
  sex: string;
  weightKg: number;
  heightCm: number;
};

const metByEffort = {
  leve: 3.5,
  moderado: 5,
  intenso: 6,
  muito_intenso: 7,
};

export const calorieSourceLabels: Record<CalorieSource, string> = {
  manual: 'Manual',
  harris_benedict: 'Harris-Benedict',
  workout_estimate: 'Esforco do treino',
  wearable: 'Wearable',
};

export function calculateWorkoutVolume(workout: WorkoutDay) {
  return workout.exercises.reduce((total, exercise) => {
    return total + exercise.sets * exercise.reps * exercise.targetLoadKg;
  }, 0);
}

export function calculateHarrisBenedictBmr(profile: UserProfileForCalories) {
  const { age, heightCm, sex, weightKg } = profile;

  if (sex === 'female') {
    return 655.1 + 9.563 * weightKg + 1.85 * heightCm - 4.676 * age;
  }

  return 66.47 + 13.75 * weightKg + 5.003 * heightCm - 6.755 * age;
}

export function calculateWorkoutCalories(workout: WorkoutDay, profile: UserProfileForCalories) {
  const met = metByEffort[workout.effortLevel];
  const volume = calculateWorkoutVolume(workout);
  const volumeIntensity = volume / Math.max(profile.weightKg, 1);
  const intensityAdjustment = Math.min(1.18, Math.max(0.92, 1 + (volumeIntensity - 35) / 1000));

  return Math.round(workout.estimatedMinutes * met * profile.weightKg * 0.0175 * intensityAdjustment);
}

export function calculateWorkoutHarrisBenedictShare(
  workout: WorkoutDay,
  profile: UserProfileForCalories,
) {
  const bmr = calculateHarrisBenedictBmr(profile);
  return Math.round((bmr / 1440) * workout.estimatedMinutes);
}

export function getWorkoutCalorieOptions(
  workout: WorkoutDay,
  profile: UserProfileForCalories,
): WorkoutCalorieEntry[] {
  return [
    {
      source: 'workout_estimate',
      label: calorieSourceLabels.workout_estimate,
      calories: calculateWorkoutCalories(workout, profile),
      note: 'Calculado por carga, series, reps, duracao e esforco.',
    },
    {
      source: 'harris_benedict',
      label: calorieSourceLabels.harris_benedict,
      calories: calculateWorkoutHarrisBenedictShare(workout, profile),
      note: 'Parcela proporcional da TMB no tempo do treino.',
    },
    {
      source: 'manual',
      label: calorieSourceLabels.manual,
      calories: workout.manualCalories ?? calculateWorkoutCalories(workout, profile),
      note: 'Numero livre informado pelo usuario.',
    },
    {
      source: 'wearable',
      label: calorieSourceLabels.wearable,
      calories: workout.wearableCalories ?? calculateWorkoutCalories(workout, profile),
      note: 'Valor vindo de relogio ou app externo.',
    },
  ];
}

export function getSelectedWorkoutCalories(workout: WorkoutDay, profile: UserProfileForCalories) {
  const options = getWorkoutCalorieOptions(workout, profile);
  return options.find((option) => option.source === workout.selectedCalorieSource) ?? options[0];
}
