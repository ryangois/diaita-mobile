import type { Exercise, WorkoutDay } from '../types';

export const exercises: Exercise[] = [
  {
    id: 'bench-press',
    name: 'Supino reto',
    muscleGroup: 'Peito',
    equipment: 'Barra',
    difficulty: 'Intermediario',
    mediaType: '3D',
    executionCue: 'Escapulas firmes, pe no chao e barra descendo controlada.',
  },
  {
    id: 'bent-row',
    name: 'Remada curvada',
    muscleGroup: 'Costas',
    equipment: 'Barra',
    difficulty: 'Intermediario',
    mediaType: 'GIF',
    executionCue: 'Tronco estavel, cotovelos para tras e lombar neutra.',
  },
  {
    id: 'shoulder-press',
    name: 'Desenvolvimento',
    muscleGroup: 'Ombros',
    equipment: 'Halteres',
    difficulty: 'Intermediario',
    mediaType: 'GIF',
    executionCue: 'Evite arquear a lombar e finalize com controle.',
  },
  {
    id: 'squat',
    name: 'Agachamento livre',
    muscleGroup: 'Pernas',
    equipment: 'Barra',
    difficulty: 'Avancado',
    mediaType: '3D',
    executionCue: 'Joelhos acompanham a ponta dos pes e quadril desce firme.',
  },
  {
    id: 'lat-pulldown',
    name: 'Puxada alta',
    muscleGroup: 'Costas',
    equipment: 'Polia',
    difficulty: 'Iniciante',
    mediaType: 'GIF',
    executionCue: 'Puxe com os cotovelos e mantenha o peito aberto.',
  },
  {
    id: 'romanian-deadlift',
    name: 'Terra romeno',
    muscleGroup: 'Posterior',
    equipment: 'Barra',
    difficulty: 'Intermediario',
    mediaType: '3D',
    executionCue: 'Quadril vai para tras, coluna neutra e barra perto do corpo.',
  },
];

export const workoutDays: WorkoutDay[] = [
  {
    id: 'a',
    label: 'A',
    title: 'Peito, costas e ombros',
    focus: 'Forca superior',
    estimatedMinutes: 62,
    exercises: [
      { exerciseId: 'bench-press', sets: 4, reps: '8', targetLoadKg: 72, restSeconds: 90 },
      { exerciseId: 'bent-row', sets: 4, reps: '10', targetLoadKg: 64, restSeconds: 90 },
      { exerciseId: 'shoulder-press', sets: 3, reps: '10', targetLoadKg: 32, restSeconds: 75 },
    ],
  },
  {
    id: 'b',
    label: 'B',
    title: 'Pernas e posterior',
    focus: 'Base e estabilidade',
    estimatedMinutes: 70,
    exercises: [
      { exerciseId: 'squat', sets: 5, reps: '5', targetLoadKg: 96, restSeconds: 120 },
      { exerciseId: 'romanian-deadlift', sets: 4, reps: '8', targetLoadKg: 88, restSeconds: 100 },
    ],
  },
  {
    id: 'c',
    label: 'C',
    title: 'Costas e bracos',
    focus: 'Hipertrofia',
    estimatedMinutes: 58,
    exercises: [
      { exerciseId: 'lat-pulldown', sets: 4, reps: '12', targetLoadKg: 58, restSeconds: 75 },
      { exerciseId: 'bent-row', sets: 3, reps: '10', targetLoadKg: 60, restSeconds: 90 },
    ],
  },
  {
    id: 'd',
    label: 'D',
    title: 'Full body tecnico',
    focus: 'Volume moderado',
    estimatedMinutes: 50,
    exercises: [
      { exerciseId: 'bench-press', sets: 3, reps: '8', targetLoadKg: 68, restSeconds: 90 },
      { exerciseId: 'squat', sets: 3, reps: '8', targetLoadKg: 82, restSeconds: 100 },
    ],
  },
];

export function getExerciseById(id: string) {
  return exercises.find((exercise) => exercise.id === id);
}
