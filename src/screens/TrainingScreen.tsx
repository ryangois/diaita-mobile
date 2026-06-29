import { ArrowDown, ArrowUp, CheckCircle2, Clock3, Copy, Dumbbell, Flame, Minus, Pencil, Play, Plus, Search, Target, Trash2 } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ActiveWorkoutSession } from '../components/ActiveWorkoutSession';
import { ExerciseMedia } from '../components/ExerciseMedia';
import { SectionTitle } from '../components/SectionTitle';
import { exercises as baseExercises, getExerciseById } from '../data/training';
import { colors, radii } from '../styles/theme';
import {
  calculateWorkoutVolume,
  getSelectedWorkoutCalories,
  getWorkoutCalorieOptions,
} from '../utils/calories';
import {
  calculateSessionVolume,
  countCompletedSets,
  createWorkoutSession,
  getWorkoutExercisePlannedSets,
} from '../utils/workoutSession';
import type { Exercise, UserProfile, WorkoutDay, WorkoutPlannedSet, WorkoutSession } from '../types';

type TrainingTemplate = {
  key: string;
  name: string;
  description: string;
  days: WorkoutDay[];
};

const trainingTemplates: TrainingTemplate[] = [
  {
    key: 'abc',
    name: 'ABC',
    description: '3 treinos para repetir na semana',
    days: [
      createWorkoutDay('a', 'A', 'Push superior', 'Peito, ombros e triceps', 60, 'intenso', [
        ['bench-press', 4, 8, 72, 90],
        ['shoulder-press', 3, 10, 32, 75],
        ['lat-pulldown', 3, 12, 52, 75],
      ]),
      createWorkoutDay('b', 'B', 'Pernas completas', 'Quadriceps e posterior', 70, 'muito_intenso', [
        ['squat', 5, 5, 96, 120],
        ['romanian-deadlift', 4, 8, 88, 100],
        ['bench-press', 2, 12, 52, 60],
      ]),
      createWorkoutDay('c', 'C', 'Pull superior', 'Costas e bracos', 58, 'moderado', [
        ['bent-row', 4, 10, 64, 90],
        ['lat-pulldown', 4, 12, 58, 75],
        ['shoulder-press', 3, 12, 28, 70],
      ]),
    ],
  },
  {
    key: 'abcd',
    name: 'ABCD',
    description: '4 dias com foco mais separado',
    days: [
      createWorkoutDay('a', 'A', 'Peito e ombros', 'Empurrar pesado', 62, 'intenso', [
        ['bench-press', 4, 8, 72, 90],
        ['shoulder-press', 4, 8, 34, 90],
      ]),
      createWorkoutDay('b', 'B', 'Costas', 'Puxadas e remadas', 58, 'intenso', [
        ['bent-row', 4, 8, 66, 90],
        ['lat-pulldown', 4, 10, 60, 75],
      ]),
      createWorkoutDay('c', 'C', 'Pernas', 'Forca de base', 72, 'muito_intenso', [
        ['squat', 5, 5, 96, 120],
        ['romanian-deadlift', 4, 8, 88, 100],
      ]),
      createWorkoutDay('d', 'D', 'Full body tecnico', 'Volume controlado', 50, 'moderado', [
        ['bench-press', 3, 10, 62, 75],
        ['squat', 3, 8, 82, 100],
        ['lat-pulldown', 3, 12, 54, 70],
      ]),
    ],
  },
  {
    key: 'abcde',
    name: 'ABCDE',
    description: '5 dias para hipertrofia',
    days: [
      createWorkoutDay('a', 'A', 'Peito', 'Volume de press', 54, 'moderado', [['bench-press', 5, 8, 72, 90]]),
      createWorkoutDay('b', 'B', 'Costas', 'Remadas e puxadas', 58, 'intenso', [
        ['bent-row', 4, 10, 64, 90],
        ['lat-pulldown', 4, 12, 58, 75],
      ]),
      createWorkoutDay('c', 'C', 'Pernas', 'Quadriceps e posterior', 70, 'muito_intenso', [
        ['squat', 5, 6, 90, 120],
        ['romanian-deadlift', 4, 8, 86, 100],
      ]),
      createWorkoutDay('d', 'D', 'Ombros', 'Estabilidade e press', 48, 'moderado', [['shoulder-press', 5, 10, 30, 75]]),
      createWorkoutDay('e', 'E', 'Bracos e core', 'Acabamento semanal', 45, 'leve', [
        ['lat-pulldown', 3, 12, 50, 60],
        ['bench-press', 3, 12, 50, 60],
      ]),
    ],
  },
  {
    key: 'upper-lower',
    name: 'Upper/Lower',
    description: 'Superior e inferior alternados',
    days: [
      createWorkoutDay('a', 'Upper 1', 'Superior pesado', 'Press e remada', 62, 'intenso', [
        ['bench-press', 4, 6, 76, 100],
        ['bent-row', 4, 8, 66, 90],
        ['shoulder-press', 3, 8, 34, 80],
      ]),
      createWorkoutDay('b', 'Lower 1', 'Inferior pesado', 'Agachar e puxar', 70, 'muito_intenso', [
        ['squat', 5, 5, 96, 120],
        ['romanian-deadlift', 4, 8, 88, 100],
      ]),
      createWorkoutDay('c', 'Upper 2', 'Superior volume', 'Repeticoes controladas', 56, 'moderado', [
        ['lat-pulldown', 4, 12, 58, 75],
        ['bench-press', 3, 10, 64, 75],
        ['shoulder-press', 3, 12, 28, 70],
      ]),
      createWorkoutDay('d', 'Lower 2', 'Inferior posterior', 'Quadril e estabilidade', 64, 'intenso', [
        ['romanian-deadlift', 5, 6, 90, 110],
        ['squat', 3, 10, 76, 90],
      ]),
    ],
  },
];

type TrainingScreenProps = {
  customExercises: Exercise[];
  profile: UserProfile;
  workoutDays: WorkoutDay[];
  workoutHistory: WorkoutSession[];
  onCustomExercisesChange: (exercises: Exercise[]) => void;
  onWorkoutDaysChange: (workoutDays: WorkoutDay[]) => void;
  onWorkoutHistoryChange: (workoutHistory: WorkoutSession[]) => void;
};

export function TrainingScreen({
  customExercises,
  profile,
  workoutDays,
  workoutHistory,
  onCustomExercisesChange,
  onWorkoutDaysChange,
  onWorkoutHistoryChange,
}: TrainingScreenProps) {
  const [activeWorkoutId, setActiveWorkoutId] = useState(workoutDays[0].id);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [finishedSession, setFinishedSession] = useState<WorkoutSession | null>(null);
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('Todos');
  const [draftWorkout, setDraftWorkout] = useState({
    label: '',
    title: '',
    focus: '',
    estimatedMinutes: '55',
  });
  const [draftExercise, setDraftExercise] = useState({
    name: '',
    muscleGroup: '',
    equipment: '',
    difficulty: 'Iniciante' as Exercise['difficulty'],
    mediaType: 'GIF' as Exercise['mediaType'],
    executionCue: '',
  });

  const activeWorkout = useMemo(() => {
    return workoutDays.find((workout) => workout.id === activeWorkoutId) ?? workoutDays[0];
  }, [activeWorkoutId, workoutDays]);
  const exerciseLibrary = useMemo(() => [...baseExercises, ...customExercises], [customExercises]);
  const muscleGroupFilters = useMemo(
    () => ['Todos', ...Array.from(new Set(exerciseLibrary.map((exercise) => exercise.muscleGroup)))],
    [exerciseLibrary],
  );
  const filteredExerciseLibrary = useMemo(() => {
    const search = exerciseSearch.trim().toLowerCase();

    return exerciseLibrary.filter((exercise) => {
      const matchesGroup = selectedMuscleGroup === 'Todos' || exercise.muscleGroup === selectedMuscleGroup;
      const matchesSearch =
        !search ||
        exercise.name.toLowerCase().includes(search) ||
        exercise.muscleGroup.toLowerCase().includes(search) ||
        exercise.equipment.toLowerCase().includes(search);

      return matchesGroup && matchesSearch;
    });
  }, [exerciseLibrary, exerciseSearch, selectedMuscleGroup]);

  const totalSets = activeWorkout.exercises.reduce((sum, item) => sum + getWorkoutExercisePlannedSets(item).length, 0);
  const workoutVolume = calculateWorkoutVolume(activeWorkout);
  const selectedCalories = getSelectedWorkoutCalories(activeWorkout, profile);
  const calorieOptions = getWorkoutCalorieOptions(activeWorkout, profile);
  const canStartWorkout = activeWorkout.exercises.length > 0;

  function updateActiveWorkout(update: WorkoutDay) {
    onWorkoutDaysChange(workoutDays.map((workout) => (workout.id === update.id ? update : workout)));
  }

  function updateActiveWorkoutField<Key extends keyof WorkoutDay>(field: Key, value: WorkoutDay[Key]) {
    updateActiveWorkout({
      ...activeWorkout,
      [field]: value,
    });
  }

  function applyTemplate(template: TrainingTemplate) {
    const nextDays = template.days.map((day) => ({ ...day, exercises: day.exercises.map((exercise) => ({ ...exercise })) }));
    onWorkoutDaysChange(nextDays);
    setActiveWorkoutId(nextDays[0].id);
    setIsEditingPlan(true);
  }

  function addExerciseToWorkout(exerciseId: string) {
    const existingExercise = activeWorkout.exercises.find((exercise) => exercise.exerciseId === exerciseId);

    if (existingExercise) {
      addPlannedSet(getWorkoutExerciseKey(existingExercise));
      return;
    }

    const defaultSet = {
      id: `set-${Date.now()}`,
      reps: 10,
      targetLoadKg: 30,
      restSeconds: 75,
    };

    updateActiveWorkout({
      ...activeWorkout,
      exercises: [
        ...activeWorkout.exercises,
        {
          id: `workout-exercise-${Date.now()}`,
          exerciseId,
          sets: 1,
          reps: defaultSet.reps,
          targetLoadKg: defaultSet.targetLoadKg,
          restSeconds: defaultSet.restSeconds,
          plannedSets: [defaultSet],
        },
      ],
    });
  }

  function duplicateExercise(workoutExerciseKey: string) {
    const exerciseToCopy = activeWorkout.exercises.find(
      (exercise) => getWorkoutExerciseKey(exercise) === workoutExerciseKey,
    );

    if (!exerciseToCopy) {
      return;
    }

    const copiedExercise = {
      ...exerciseToCopy,
      id: `workout-exercise-${Date.now()}`,
      plannedSets: getWorkoutExercisePlannedSets(exerciseToCopy).map((set, index) => ({
        ...set,
        id: `set-${Date.now()}-${index}`,
      })),
    };

    const sourceIndex = activeWorkout.exercises.findIndex(
      (exercise) => getWorkoutExerciseKey(exercise) === workoutExerciseKey,
    );
    const nextExercises = [...activeWorkout.exercises];
    nextExercises.splice(sourceIndex + 1, 0, copiedExercise);
    updateActiveWorkout({ ...activeWorkout, exercises: nextExercises });
  }

  function moveExercise(workoutExerciseKey: string, direction: -1 | 1) {
    const sourceIndex = activeWorkout.exercises.findIndex(
      (exercise) => getWorkoutExerciseKey(exercise) === workoutExerciseKey,
    );
    const targetIndex = sourceIndex + direction;

    if (sourceIndex < 0 || targetIndex < 0 || targetIndex >= activeWorkout.exercises.length) {
      return;
    }

    const nextExercises = [...activeWorkout.exercises];
    const [movedExercise] = nextExercises.splice(sourceIndex, 1);
    nextExercises.splice(targetIndex, 0, movedExercise);
    updateActiveWorkout({ ...activeWorkout, exercises: nextExercises });
  }

  function createBlankWorkout() {
    const workoutTitle = draftWorkout.title.trim();

    if (!workoutTitle) {
      return;
    }

    const workoutLabel = draftWorkout.label.trim() || nextWorkoutLabel(workoutDays.length);
    const workoutFocus = draftWorkout.focus.trim() || 'Novo foco';
    const estimatedMinutes = Math.max(10, Math.round(readNumber(draftWorkout.estimatedMinutes)));
    const newWorkout: WorkoutDay = {
      id: `custom-workout-${Date.now()}`,
      label: workoutLabel,
      title: workoutTitle,
      focus: workoutFocus,
      estimatedMinutes,
      effortLevel: 'moderado',
      selectedCalorieSource: 'workout_estimate',
      manualCalories: Math.round(estimatedMinutes * 7),
      exercises: [],
    };

    onWorkoutDaysChange([...workoutDays, newWorkout]);
    setActiveWorkoutId(newWorkout.id);
    setIsEditingPlan(true);
    setDraftWorkout({
      label: '',
      title: '',
      focus: '',
      estimatedMinutes: '55',
    });
  }

  function createCustomExercise() {
    const exerciseName = draftExercise.name.trim();

    if (!exerciseName) {
      return;
    }

    const newExercise: Exercise = {
      id: `custom-exercise-${exerciseName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      name: exerciseName,
      muscleGroup: draftExercise.muscleGroup.trim() || 'Personalizado',
      equipment: draftExercise.equipment.trim() || 'Livre',
      difficulty: draftExercise.difficulty,
      mediaType: draftExercise.mediaType,
      executionCue: draftExercise.executionCue.trim() || 'Execute com controle, amplitude segura e postura estavel.',
    };

    onCustomExercisesChange([...customExercises, newExercise]);
    addExerciseToWorkout(newExercise.id);
    setDraftExercise({
      name: '',
      muscleGroup: '',
      equipment: '',
      difficulty: 'Iniciante',
      mediaType: 'GIF',
      executionCue: '',
    });
  }

  function askRemoveExercise(workoutExerciseKey: string, exerciseName: string) {
    confirmAction(
      'Apagar exercicio',
      `Apagar ${exerciseName} e todas as series dele?`,
      () => removeExerciseFromWorkout(workoutExerciseKey),
    );
  }

  function removeExerciseFromWorkout(workoutExerciseKey: string) {
    updateActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.filter(
        (exercise) => getWorkoutExerciseKey(exercise) !== workoutExerciseKey,
      ),
    });
  }

  function updateExercisePlan(
    exerciseId: string,
    field: 'sets' | 'reps' | 'targetLoadKg' | 'restSeconds',
    value: number,
  ) {
    updateActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.map((exercise) => {
        if (exercise.exerciseId !== exerciseId) {
          return exercise;
        }

        return {
          ...exercise,
          [field]: clampExerciseValue(field, value),
        };
      }),
    });
  }

  function syncExerciseFromPlannedSets(plannedSets: WorkoutPlannedSet[]) {
    const firstSet = plannedSets[0];

    return {
      sets: plannedSets.length,
      reps: firstSet?.reps ?? 1,
      targetLoadKg: firstSet?.targetLoadKg ?? 0,
      restSeconds: firstSet?.restSeconds ?? 60,
      plannedSets,
    };
  }

  function updatePlannedSet(
    workoutExerciseKey: string,
    setId: string,
    field: 'reps' | 'targetLoadKg' | 'restSeconds',
    value: number,
  ) {
    updateActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.map((exercise) => {
        if (getWorkoutExerciseKey(exercise) !== workoutExerciseKey) {
          return exercise;
        }

        const plannedSets = getWorkoutExercisePlannedSets(exercise).map((set) => {
          if (set.id !== setId) {
            return set;
          }

          const clampField = field === 'targetLoadKg' ? 'targetLoadKg' : field === 'restSeconds' ? 'restSeconds' : 'reps';
          return { ...set, [field]: clampExerciseValue(clampField, value) };
        });

        return {
          ...exercise,
          ...syncExerciseFromPlannedSets(plannedSets),
        };
      }),
    });
  }

  function bumpPlannedSet(
    workoutExerciseKey: string,
    setId: string,
    field: 'reps' | 'targetLoadKg' | 'restSeconds',
    delta: number,
  ) {
    const exercise = activeWorkout.exercises.find((item) => getWorkoutExerciseKey(item) === workoutExerciseKey);
    const plannedSet = exercise ? getWorkoutExercisePlannedSets(exercise).find((set) => set.id === setId) : null;

    if (!plannedSet) {
      return;
    }

    updatePlannedSet(workoutExerciseKey, setId, field, plannedSet[field] + delta);
  }

  function addPlannedSet(workoutExerciseKey: string) {
    updateActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.map((exercise) => {
        if (getWorkoutExerciseKey(exercise) !== workoutExerciseKey) {
          return exercise;
        }

        const currentSets = getWorkoutExercisePlannedSets(exercise);
        const previousSet = currentSets[currentSets.length - 1];
        const nextSet: WorkoutPlannedSet = {
          id: `set-${Date.now()}`,
          reps: previousSet?.reps ?? exercise.reps,
          targetLoadKg: previousSet?.targetLoadKg ?? exercise.targetLoadKg,
          restSeconds: previousSet?.restSeconds ?? exercise.restSeconds,
        };
        const plannedSets = [...currentSets, nextSet];

        return {
          ...exercise,
          ...syncExerciseFromPlannedSets(plannedSets),
        };
      }),
    });
  }

  function duplicatePlannedSet(workoutExerciseKey: string, setId: string) {
    updateActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.map((exercise) => {
        if (getWorkoutExerciseKey(exercise) !== workoutExerciseKey) {
          return exercise;
        }

        const currentSets = getWorkoutExercisePlannedSets(exercise);
        const sourceIndex = currentSets.findIndex((set) => set.id === setId);

        if (sourceIndex < 0) {
          return exercise;
        }

        const copiedSet: WorkoutPlannedSet = {
          ...currentSets[sourceIndex],
          id: `set-${Date.now()}`,
        };
        const plannedSets = [...currentSets];
        plannedSets.splice(sourceIndex + 1, 0, copiedSet);

        return {
          ...exercise,
          ...syncExerciseFromPlannedSets(plannedSets),
        };
      }),
    });
  }

  function movePlannedSet(workoutExerciseKey: string, setId: string, direction: -1 | 1) {
    updateActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.map((exercise) => {
        if (getWorkoutExerciseKey(exercise) !== workoutExerciseKey) {
          return exercise;
        }

        const currentSets = getWorkoutExercisePlannedSets(exercise);
        const sourceIndex = currentSets.findIndex((set) => set.id === setId);
        const targetIndex = sourceIndex + direction;

        if (sourceIndex < 0 || targetIndex < 0 || targetIndex >= currentSets.length) {
          return exercise;
        }

        const plannedSets = [...currentSets];
        const [movedSet] = plannedSets.splice(sourceIndex, 1);
        plannedSets.splice(targetIndex, 0, movedSet);

        return {
          ...exercise,
          ...syncExerciseFromPlannedSets(plannedSets),
        };
      }),
    });
  }

  function askRemovePlannedSet(workoutExerciseKey: string, setId: string) {
    confirmAction('Apagar serie', 'Apagar esta serie do exercicio?', () =>
      removePlannedSet(workoutExerciseKey, setId),
    );
  }

  function removePlannedSet(workoutExerciseKey: string, setId: string) {
    updateActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.map((exercise) => {
        if (getWorkoutExerciseKey(exercise) !== workoutExerciseKey) {
          return exercise;
        }

        const currentSets = getWorkoutExercisePlannedSets(exercise);
        const plannedSets = currentSets.length > 1 ? currentSets.filter((set) => set.id !== setId) : currentSets;

        return {
          ...exercise,
          ...syncExerciseFromPlannedSets(plannedSets),
        };
      }),
    });
  }

  function bumpExercisePlan(
    exerciseId: string,
    field: 'sets' | 'reps' | 'targetLoadKg' | 'restSeconds',
    delta: number,
  ) {
    const plannedExercise = activeWorkout.exercises.find((exercise) => exercise.exerciseId === exerciseId);

    if (!plannedExercise) {
      return;
    }

    updateExercisePlan(exerciseId, field, plannedExercise[field] + delta);
  }

  if (activeSession) {
    return (
      <ActiveWorkoutSession
        exerciseLibrary={exerciseLibrary}
        session={activeSession}
        workout={activeWorkout}
        onCancel={() => setActiveSession(null)}
        onFinish={(session) => {
          setFinishedSession(session);
          onWorkoutHistoryChange([session, ...workoutHistory]);
          setActiveSession(null);
        }}
        onUpdateSession={setActiveSession}
      />
    );
  }

  return (
    <>
      <SectionTitle title="Planilha da semana" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weekPlan}>
        {workoutDays.map((day, index) => {
          const isActive = activeWorkout.id === day.id;

          return (
            <Pressable
              key={day.id}
              style={[styles.dayBox, isActive && styles.activeDayBox]}
              onPress={() => setActiveWorkoutId(day.id)}
              accessibilityRole="button"
              accessibilityLabel={`Abrir treino ${day.label}`}
            >
              <Text style={[styles.dayLetter, isActive && styles.activeDayLetter]}>{day.label}</Text>
              <Text style={[styles.dayText, isActive && styles.activeDayText]}>
                {index === 0 ? 'Hoje' : `${index + 2}a`}
              </Text>
              <Text style={[styles.dayFocus, isActive && styles.activeDayText]} numberOfLines={1}>
                {day.title}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.workoutSummary}>
        <Text style={styles.summaryKicker}>{activeWorkout.focus}</Text>
        <Text style={styles.summaryTitle}>{activeWorkout.title}</Text>
        <View style={styles.summaryStats}>
          <View style={styles.summaryStat}>
            <Dumbbell size={18} color={colors.primary} />
            <Text style={styles.summaryStatText}>{activeWorkout.exercises.length} exercicios</Text>
          </View>
          <View style={styles.summaryStat}>
            <Target size={18} color={colors.primary} />
            <Text style={styles.summaryStatText}>{totalSets} series</Text>
          </View>
          <View style={styles.summaryStat}>
            <Clock3 size={18} color={colors.primary} />
            <Text style={styles.summaryStatText}>{activeWorkout.estimatedMinutes} min</Text>
          </View>
          <View style={styles.summaryStat}>
            <Flame size={18} color={colors.primary} />
            <Text style={styles.summaryStatText}>{selectedCalories.calories} kcal</Text>
          </View>
        </View>
      </View>

      <Pressable
        style={[styles.startButton, !canStartWorkout && styles.disabledStartButton]}
        onPress={() => {
          if (!canStartWorkout) {
            return;
          }

          setFinishedSession(null);
          setActiveSession(createWorkoutSession(activeWorkout));
        }}
        accessibilityRole="button"
        accessibilityLabel={`Iniciar treino ${activeWorkout.label}`}
      >
        <Play size={20} color={colors.surface} fill={colors.surface} />
        <Text style={styles.startButtonText}>{canStartWorkout ? 'Iniciar treino' : 'Adicione exercicios para iniciar'}</Text>
      </Pressable>

      {finishedSession && (
        <View style={styles.finishedPanel}>
          <CheckCircle2 size={22} color={colors.primary} />
          <View style={styles.finishedBody}>
            <Text style={styles.cardTitle}>Treino finalizado</Text>
            <Text style={styles.cardText}>
              {countCompletedSets(finishedSession)} series -{' '}
              {calculateSessionVolume(finishedSession).toLocaleString('pt-BR')} kg volume
            </Text>
          </View>
        </View>
      )}

      <Pressable
        style={[styles.editPlanButton, isEditingPlan && styles.activeEditPlanButton]}
        onPress={() => setIsEditingPlan((current) => !current)}
        accessibilityRole="button"
        accessibilityLabel="Editar planilha"
      >
        <Pencil size={18} color={isEditingPlan ? colors.surface : colors.primary} />
        <Text style={[styles.editPlanButtonText, isEditingPlan && styles.activeEditPlanButtonText]}>
          {isEditingPlan ? 'Concluir edicao da planilha' : 'Editar planilha'}
        </Text>
      </Pressable>

      {isEditingPlan && (
        <>
          <SectionTitle title="Modelos de treino" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.templateRail}>
            {trainingTemplates.map((template) => (
              <Pressable
                key={template.key}
                style={styles.templateCard}
                onPress={() => applyTemplate(template)}
                accessibilityRole="button"
                accessibilityLabel={`Aplicar modelo ${template.name}`}
              >
                <Text style={styles.templateName}>{template.name}</Text>
                <Text style={styles.templateDescription}>{template.description}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <SectionTitle title="Criar treino" />
          <View style={styles.creationPanel}>
            <View style={styles.inputGrid}>
              <TextField
                label="Letra"
                value={draftWorkout.label}
                placeholder={nextWorkoutLabel(workoutDays.length)}
                onChangeText={(label) => setDraftWorkout((current) => ({ ...current, label }))}
              />
              <TextField
                label="Duracao"
                value={draftWorkout.estimatedMinutes}
                keyboardType="numeric"
                suffix="min"
                onChangeText={(estimatedMinutes) =>
                  setDraftWorkout((current) => ({ ...current, estimatedMinutes }))
                }
              />
            </View>
            <TextField
              label="Nome do treino"
              value={draftWorkout.title}
              placeholder="Peito e triceps"
              onChangeText={(title) => setDraftWorkout((current) => ({ ...current, title }))}
            />
            <TextField
              label="Foco"
              value={draftWorkout.focus}
              placeholder="Hipertrofia superior"
              onChangeText={(focus) => setDraftWorkout((current) => ({ ...current, focus }))}
            />
            <Pressable
              style={styles.createButton}
              onPress={createBlankWorkout}
              accessibilityRole="button"
              accessibilityLabel="Criar treino novo"
            >
              <Plus size={18} color={colors.surface} />
              <Text style={styles.createButtonText}>Criar treino vazio</Text>
            </Pressable>
          </View>

          <SectionTitle title="Editar treino atual" />
          <View style={styles.creationPanel}>
            <View style={styles.inputGrid}>
              <TextField
                label="Etiqueta"
                value={activeWorkout.label}
                onChangeText={(label) => updateActiveWorkoutField('label', label)}
              />
              <TextField
                label="Duracao"
                value={String(activeWorkout.estimatedMinutes)}
                keyboardType="numeric"
                suffix="min"
                onChangeText={(estimatedMinutes) =>
                  updateActiveWorkoutField('estimatedMinutes', Math.max(10, Math.round(readNumber(estimatedMinutes))))
                }
              />
            </View>
            <TextField
              label="Nome"
              value={activeWorkout.title}
              onChangeText={(title) => updateActiveWorkoutField('title', title)}
            />
            <TextField
              label="Foco"
              value={activeWorkout.focus}
              onChangeText={(focus) => updateActiveWorkoutField('focus', focus)}
            />
            <Text style={styles.fieldLabel}>Intensidade</Text>
            <View style={styles.segmentedRow}>
              {(['leve', 'moderado', 'intenso', 'muito_intenso'] as WorkoutDay['effortLevel'][]).map((level) => {
                const isActive = activeWorkout.effortLevel === level;

                return (
                  <Pressable
                    key={level}
                    style={[styles.segmentChip, isActive && styles.activeSegmentChip]}
                    onPress={() => updateActiveWorkoutField('effortLevel', level)}
                    accessibilityRole="button"
                    accessibilityLabel={`Definir intensidade ${level}`}
                  >
                    <Text style={[styles.segmentChipText, isActive && styles.activeSegmentChipText]}>
                      {level.replace('_', ' ')}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </>
      )}

      <SectionTitle title="Gasto calorico" />
      <View style={styles.caloriePanel}>
        <View>
          <Text style={styles.calorieKicker}>Selecionado</Text>
          <Text style={styles.calorieTitle}>
            {selectedCalories.calories} kcal - {selectedCalories.label}
          </Text>
          <Text style={styles.cardText}>{selectedCalories.note}</Text>
        </View>
        <Text style={styles.volumeText}>{workoutVolume.toLocaleString('pt-BR')} kg volume</Text>
      </View>

      <View style={styles.calorieOptions}>
        {calorieOptions.map((option) => {
          const isActive = option.source === activeWorkout.selectedCalorieSource;

          return (
            <View key={option.source} style={[styles.calorieOption, isActive && styles.activeCalorieOption]}>
              <Text style={[styles.optionCalories, isActive && styles.activeOptionText]}>
                {option.calories}
              </Text>
              <Text style={[styles.optionLabel, isActive && styles.activeOptionText]}>
                {option.label}
              </Text>
            </View>
          );
        })}
      </View>

      <SectionTitle title={`Treino ${activeWorkout.label}`} />
      {activeWorkout.exercises.map((plannedExercise, exerciseIndex) => {
        const exercise = findExerciseById(plannedExercise.exerciseId, exerciseLibrary);
        const plannedSets = getWorkoutExercisePlannedSets(plannedExercise);
        const workoutExerciseKey = getWorkoutExerciseKey(plannedExercise);

        if (!exercise) {
          return null;
        }

        return (
            <View key={workoutExerciseKey} style={[styles.listCard, isEditingPlan && styles.editableListCard]}>
              <ExerciseMedia exercise={exercise} />
              <View style={styles.listBody}>
                <Text style={styles.cardTitle}>{exercise.name}</Text>
              <Text style={styles.cardText}>
                {plannedSets.length} series planejadas
              </Text>
              <Text style={styles.smallSignal}>
                {exercise.muscleGroup} - {plannedExercise.targetLoadKg} kg base
              </Text>
            </View>
            {isEditingPlan ? (
              <View style={styles.planControlsWide}>
                <View style={styles.seriesHeader}>
                  <Text style={styles.seriesTitle}>Series do exercicio</Text>
                  <View style={styles.actionRow}>
                    <IconButton icon={ArrowUp} onPress={() => moveExercise(workoutExerciseKey, -1)} disabled={exerciseIndex === 0} />
                    <IconButton
                      icon={ArrowDown}
                      onPress={() => moveExercise(workoutExerciseKey, 1)}
                      disabled={exerciseIndex === activeWorkout.exercises.length - 1}
                    />
                    <IconButton icon={Copy} onPress={() => duplicateExercise(workoutExerciseKey)} />
                    <Pressable
                      style={styles.addSeriesButton}
                      onPress={() => addPlannedSet(workoutExerciseKey)}
                      accessibilityRole="button"
                      accessibilityLabel={`Adicionar serie em ${exercise.name}`}
                    >
                      <Plus size={15} color={colors.primary} />
                      <Text style={styles.addSeriesText}>Serie</Text>
                    </Pressable>
                    <IconButton icon={Trash2} onPress={() => askRemoveExercise(workoutExerciseKey, exercise.name)} />
                  </View>
                </View>
                {plannedSets.map((plannedSet, index) => (
                  <View key={plannedSet.id} style={styles.seriesRow}>
                    <Text style={styles.seriesNumber}>{index + 1}</Text>
                    <PlanNumberControl
                      label="Reps"
                      value={plannedSet.reps}
                      suffix="rep"
                      onDecrease={() => bumpPlannedSet(workoutExerciseKey, plannedSet.id, 'reps', -1)}
                      onIncrease={() => bumpPlannedSet(workoutExerciseKey, plannedSet.id, 'reps', 1)}
                      onChange={(value) => updatePlannedSet(workoutExerciseKey, plannedSet.id, 'reps', value)}
                    />
                    <PlanNumberControl
                      label="Carga"
                      value={plannedSet.targetLoadKg}
                      suffix="kg"
                      onDecrease={() => bumpPlannedSet(workoutExerciseKey, plannedSet.id, 'targetLoadKg', -2.5)}
                      onIncrease={() => bumpPlannedSet(workoutExerciseKey, plannedSet.id, 'targetLoadKg', 2.5)}
                      onChange={(value) => updatePlannedSet(workoutExerciseKey, plannedSet.id, 'targetLoadKg', value)}
                    />
                    <PlanNumberControl
                      label="Descanso"
                      value={plannedSet.restSeconds}
                      suffix="s"
                      onDecrease={() => bumpPlannedSet(workoutExerciseKey, plannedSet.id, 'restSeconds', -15)}
                      onIncrease={() => bumpPlannedSet(workoutExerciseKey, plannedSet.id, 'restSeconds', 15)}
                      onChange={(value) => updatePlannedSet(workoutExerciseKey, plannedSet.id, 'restSeconds', value)}
                    />
                    <View style={styles.setActionGroup}>
                      <IconButton icon={ArrowUp} onPress={() => movePlannedSet(workoutExerciseKey, plannedSet.id, -1)} disabled={index === 0} />
                      <IconButton
                        icon={ArrowDown}
                        onPress={() => movePlannedSet(workoutExerciseKey, plannedSet.id, 1)}
                        disabled={index === plannedSets.length - 1}
                      />
                      <IconButton icon={Copy} onPress={() => duplicatePlannedSet(workoutExerciseKey, plannedSet.id)} />
                      <IconButton icon={Trash2} onPress={() => askRemovePlannedSet(workoutExerciseKey, plannedSet.id)} disabled={plannedSets.length <= 1} />
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.loadText}>{plannedSets.length} series</Text>
            )}
            {!isEditingPlan && (
              <View style={styles.seriesPreview}>
                {plannedSets.map((plannedSet, index) => (
                  <View key={plannedSet.id} style={styles.seriesPreviewChip}>
                    <Text style={styles.seriesPreviewText}>
                      {index + 1}. {plannedSet.reps} rep - {plannedSet.targetLoadKg} kg
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}

      <SectionTitle title="Biblioteca" />
      {isEditingPlan && <Text style={styles.libraryHint}>Toque no + para adicionar o exercicio. Se ele ja estiver no treino, o + adiciona uma nova serie.</Text>}
      {isEditingPlan && (
        <View style={styles.creationPanel}>
          <Text style={styles.creationTitle}>Criar exercicio</Text>
          <TextField
            label="Nome"
            value={draftExercise.name}
            placeholder="Rosca direta"
            onChangeText={(name) => setDraftExercise((current) => ({ ...current, name }))}
          />
          <View style={styles.inputGrid}>
            <TextField
              label="Grupo"
              value={draftExercise.muscleGroup}
              placeholder="Biceps"
              onChangeText={(muscleGroup) => setDraftExercise((current) => ({ ...current, muscleGroup }))}
            />
            <TextField
              label="Equipamento"
              value={draftExercise.equipment}
              placeholder="Barra"
              onChangeText={(equipment) => setDraftExercise((current) => ({ ...current, equipment }))}
            />
          </View>
          <Text style={styles.fieldLabel}>Dificuldade</Text>
          <View style={styles.segmentedRow}>
            {(['Iniciante', 'Intermediario', 'Avancado'] as Exercise['difficulty'][]).map((difficulty) => {
              const isActive = draftExercise.difficulty === difficulty;

              return (
                <Pressable
                  key={difficulty}
                  style={[styles.segmentChip, isActive && styles.activeSegmentChip]}
                  onPress={() => setDraftExercise((current) => ({ ...current, difficulty }))}
                  accessibilityRole="button"
                  accessibilityLabel={`Definir dificuldade ${difficulty}`}
                >
                  <Text style={[styles.segmentChipText, isActive && styles.activeSegmentChipText]}>
                    {difficulty}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.fieldLabel}>Midia</Text>
          <View style={styles.segmentedRow}>
            {(['GIF', '3D'] as Exercise['mediaType'][]).map((mediaType) => {
              const isActive = draftExercise.mediaType === mediaType;

              return (
                <Pressable
                  key={mediaType}
                  style={[styles.segmentChip, isActive && styles.activeSegmentChip]}
                  onPress={() => setDraftExercise((current) => ({ ...current, mediaType }))}
                  accessibilityRole="button"
                  accessibilityLabel={`Definir midia ${mediaType}`}
                >
                  <Text style={[styles.segmentChipText, isActive && styles.activeSegmentChipText]}>
                    {mediaType}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <TextField
            label="Dica de execucao"
            value={draftExercise.executionCue}
            placeholder="Cotovelos fixos e movimento controlado."
            onChangeText={(executionCue) => setDraftExercise((current) => ({ ...current, executionCue }))}
          />
          <Pressable
            style={styles.createButton}
            onPress={createCustomExercise}
            accessibilityRole="button"
            accessibilityLabel="Criar exercicio personalizado"
          >
            <Plus size={18} color={colors.surface} />
            <Text style={styles.createButtonText}>Criar e adicionar ao treino</Text>
          </Pressable>
        </View>
      )}
      {isEditingPlan && (
        <View style={styles.libraryTools}>
          <View style={styles.searchBox}>
            <Search size={18} color={colors.primaryMid} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar exercicio, musculo ou equipamento"
              placeholderTextColor={colors.muted}
              value={exerciseSearch}
              onChangeText={setExerciseSearch}
            />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChips}>
            {muscleGroupFilters.map((muscleGroup) => {
              const isSelected = muscleGroup === selectedMuscleGroup;

              return (
                <Pressable
                  key={muscleGroup}
                  style={[styles.filterChip, isSelected && styles.activeFilterChip]}
                  onPress={() => setSelectedMuscleGroup(muscleGroup)}
                  accessibilityRole="button"
                  accessibilityLabel={`Filtrar ${muscleGroup}`}
                >
                  <Text style={[styles.filterChipText, isSelected && styles.activeFilterChipText]}>
                    {muscleGroup}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}
      <View style={styles.libraryGrid}>
        {filteredExerciseLibrary.map((exercise) => {
          const alreadyAdded = activeWorkout.exercises.some((plannedExercise) => plannedExercise.exerciseId === exercise.id);

          return (
            <View key={exercise.id} style={styles.libraryCard}>
              <ExerciseMedia exercise={exercise} size="lg" />
              <View style={styles.libraryBody}>
                <Text style={styles.cardTitle}>{exercise.name}</Text>
                <Text style={styles.cardText}>
                  {exercise.equipment} - {exercise.difficulty}
                </Text>
                <Text style={styles.executionCue}>{exercise.executionCue}</Text>
              </View>
              {isEditingPlan && (
                <Pressable
                  style={[styles.addExerciseButton, alreadyAdded && styles.addedExerciseButton]}
                  onPress={() => addExerciseToWorkout(exercise.id)}
                  accessibilityRole="button"
                  accessibilityLabel={alreadyAdded ? `Adicionar serie em ${exercise.name}` : `Adicionar ${exercise.name}`}
                >
                  <Plus size={18} color={alreadyAdded ? colors.muted : colors.primary} />
                  {alreadyAdded && <Text style={styles.addedExerciseText}>Serie</Text>}
                </Pressable>
              )}
            </View>
          );
        })}
        {filteredExerciseLibrary.length === 0 && (
          <View style={styles.emptyLibrary}>
            <Text style={styles.cardTitle}>Nenhum exercicio encontrado</Text>
            <Text style={styles.cardText}>Limpe a busca ou crie um exercicio personalizado acima.</Text>
          </View>
        )}
      </View>
    </>
  );
}

function findExerciseById(exerciseId: string, exerciseLibrary: Exercise[]) {
  return exerciseLibrary.find((exercise) => exercise.id === exerciseId) ?? getExerciseById(exerciseId);
}

function getWorkoutExerciseKey(exercise: WorkoutDay['exercises'][number]) {
  return exercise.id ?? exercise.exerciseId;
}

function confirmAction(title: string, message: string, onConfirm: () => void) {
  if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
    if (window.confirm(message)) {
      onConfirm();
    }
    return;
  }

  Alert.alert(title, message, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Apagar', style: 'destructive', onPress: onConfirm },
  ]);
}

function nextWorkoutLabel(workoutCount: number) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return letters[workoutCount] ?? `${workoutCount + 1}`;
}

function readNumber(value: string) {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function createWorkoutDay(
  id: string,
  label: string,
  title: string,
  focus: string,
  estimatedMinutes: number,
  effortLevel: WorkoutDay['effortLevel'],
  exerciseRows: [string, number, number, number, number][],
): WorkoutDay {
  return {
    id,
    label,
    title,
    focus,
    estimatedMinutes,
    effortLevel,
    selectedCalorieSource: 'workout_estimate',
    manualCalories: Math.round(estimatedMinutes * 7),
    exercises: exerciseRows.map(([exerciseId, sets, reps, targetLoadKg, restSeconds]) => ({
      exerciseId,
      sets,
      reps,
      targetLoadKg,
      restSeconds,
    })),
  };
}

function clampExerciseValue(field: 'sets' | 'reps' | 'targetLoadKg' | 'restSeconds', value: number) {
  if (!Number.isFinite(value)) {
    return field === 'targetLoadKg' ? 0 : 1;
  }

  if (field === 'targetLoadKg') {
    return Math.max(0, Math.round(value * 2) / 2);
  }

  if (field === 'restSeconds') {
    return Math.max(15, Math.round(value));
  }

  return Math.max(1, Math.round(value));
}

function IconButton({
  disabled = false,
  icon: Icon,
  onPress,
}: {
  disabled?: boolean;
  icon: typeof Plus;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.smallIconButton, disabled && styles.disabledIconButton]}
      onPress={disabled ? undefined : onPress}
    >
      <Icon size={15} color={disabled ? colors.muted : colors.primary} />
    </Pressable>
  );
}

function TextField({
  keyboardType,
  label,
  onChangeText,
  placeholder,
  suffix,
  value,
}: {
  keyboardType?: 'default' | 'numeric';
  label: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  suffix?: string;
  value: string;
}) {
  return (
    <View style={styles.fieldBox}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldInputRow}>
        <TextInput
          keyboardType={keyboardType}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          style={styles.fieldInput}
          value={value}
          onChangeText={onChangeText}
        />
        {suffix && <Text style={styles.fieldSuffix}>{suffix}</Text>}
      </View>
    </View>
  );
}

function PlanNumberControl({
  label,
  onChange,
  onDecrease,
  onIncrease,
  suffix,
  value,
}: {
  label: string;
  onChange: (value: number) => void;
  onDecrease: () => void;
  onIncrease: () => void;
  suffix: string;
  value: number;
}) {
  const [draftValue, setDraftValue] = useState(String(value));

  useEffect(() => {
    setDraftValue(String(value));
  }, [value]);

  function commitDraft() {
    const parsed = Number(draftValue.replace(',', '.'));
    onChange(parsed);
    setDraftValue(String(clampExerciseValue(label === 'Carga' ? 'targetLoadKg' : label === 'Descanso' ? 'restSeconds' : label === 'Reps' ? 'reps' : 'sets', parsed)));
  }

  return (
    <View style={styles.planControlBox}>
      <Text style={styles.planControlLabel}>{label}</Text>
      <View style={styles.planControlRow}>
        <IconButton icon={Minus} onPress={onDecrease} />
        <TextInput
          keyboardType="numeric"
          style={styles.planControlInput}
          value={draftValue}
          onBlur={commitDraft}
          onChangeText={setDraftValue}
          onSubmitEditing={commitDraft}
        />
        <Text style={styles.planControlSuffix}>{suffix}</Text>
        <IconButton icon={Plus} onPress={onIncrease} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  weekPlan: {
    gap: 10,
    paddingRight: 20,
  },
  dayBox: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    justifyContent: 'center',
    minHeight: 76,
    paddingHorizontal: 12,
    width: 104,
  },
  activeDayBox: {
    backgroundColor: colors.primary,
  },
  dayLetter: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '800',
  },
  activeDayLetter: {
    color: colors.surface,
  },
  dayText: {
    color: '#7a837f',
    fontSize: 12,
    marginTop: 4,
  },
  dayFocus: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
    maxWidth: 82,
  },
  activeDayText: {
    color: '#c3d5cd',
  },
  workoutSummary: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.md,
    marginTop: 14,
    padding: 16,
  },
  summaryKicker: {
    color: colors.primaryMid,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  summaryTitle: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 5,
  },
  summaryStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  summaryStat: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  summaryStatText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  startButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 12,
    minHeight: 52,
  },
  disabledStartButton: {
    backgroundColor: colors.muted,
  },
  startButtonText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '800',
  },
  finishedPanel: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    padding: 14,
  },
  finishedBody: {
    flex: 1,
  },
  editPlanButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 12,
    minHeight: 48,
  },
  activeEditPlanButton: {
    backgroundColor: colors.secondary,
  },
  editPlanButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  activeEditPlanButtonText: {
    color: colors.surface,
  },
  templateRail: {
    gap: 10,
    paddingRight: 20,
  },
  templateCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    minHeight: 94,
    padding: 14,
    width: 162,
  },
  templateName: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '800',
  },
  templateDescription: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    marginTop: 6,
  },
  creationPanel: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    gap: 10,
    padding: 12,
  },
  creationTitle: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  inputGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  fieldBox: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    flexGrow: 1,
    minWidth: '47%',
    padding: 10,
  },
  fieldLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  fieldInputRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 5,
  },
  fieldInput: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    minHeight: 30,
    padding: 0,
  },
  fieldSuffix: {
    color: colors.primaryMid,
    fontSize: 12,
    fontWeight: '800',
  },
  segmentedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  segmentChip: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: 11,
  },
  activeSegmentChip: {
    backgroundColor: colors.primary,
  },
  segmentChipText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  activeSegmentChipText: {
    color: colors.surface,
  },
  createButton: {
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 46,
  },
  createButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '800',
  },
  caloriePanel: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: 16,
  },
  calorieKicker: {
    color: colors.primaryMid,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  calorieTitle: {
    color: colors.primary,
    fontSize: 21,
    fontWeight: '800',
    marginTop: 5,
  },
  volumeText: {
    color: colors.primaryMid,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 12,
  },
  calorieOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  calorieOption: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    flexGrow: 1,
    minWidth: '47%',
    padding: 12,
  },
  activeCalorieOption: {
    backgroundColor: colors.primary,
  },
  optionCalories: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  optionLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  activeOptionText: {
    color: colors.surface,
  },
  listCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    padding: 12,
  },
  editableListCard: {
    alignItems: 'flex-start',
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
  smallSignal: {
    color: colors.primaryMid,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
  },
  loadText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  planControlsWide: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    width: '100%',
  },
  seriesHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  seriesTitle: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  actionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  addSeriesButton: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radii.sm,
    flexDirection: 'row',
    gap: 4,
    minHeight: 28,
    paddingHorizontal: 8,
  },
  addSeriesText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  seriesRow: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radii.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    padding: 8,
    width: '100%',
  },
  setActionGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  seriesNumber: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
    minWidth: 18,
    textAlign: 'center',
  },
  seriesPreview: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    width: '100%',
  },
  seriesPreviewChip: {
    backgroundColor: colors.background,
    borderRadius: radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  seriesPreviewText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  planControlBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    flexGrow: 1,
    minWidth: 92,
    padding: 8,
  },
  planControlRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  planControlLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  planControlInput: {
    color: colors.primary,
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    minHeight: 26,
    padding: 0,
    textAlign: 'center',
  },
  planControlSuffix: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
    minWidth: 24,
  },
  smallIconButton: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radii.sm,
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
  disabledIconButton: {
    backgroundColor: colors.background,
  },
  libraryGrid: {
    gap: 10,
  },
  libraryTools: {
    gap: 10,
    marginBottom: 10,
  },
  searchBox: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: 8,
    minHeight: 46,
    paddingHorizontal: 12,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
  },
  filterChips: {
    gap: 8,
    paddingRight: 20,
  },
  filterChip: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: 12,
  },
  activeFilterChip: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  activeFilterChipText: {
    color: colors.surface,
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
  libraryBody: {
    flex: 1,
    paddingLeft: 14,
  },
  addExerciseButton: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: 4,
    height: 36,
    justifyContent: 'center',
    minWidth: 36,
    paddingHorizontal: 9,
  },
  addedExerciseButton: {
    backgroundColor: colors.background,
  },
  addedExerciseText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  executionCue: {
    color: colors.primaryMid,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 8,
  },
  emptyLibrary: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: 14,
  },
});
