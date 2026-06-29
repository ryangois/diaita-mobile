import { CheckCircle2, Clock3, Dumbbell, Flame, Minus, Pencil, Play, Plus, Target, Trash2 } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ActiveWorkoutSession } from '../components/ActiveWorkoutSession';
import { ExerciseMedia } from '../components/ExerciseMedia';
import { SectionTitle } from '../components/SectionTitle';
import { exercises, getExerciseById } from '../data/training';
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
} from '../utils/workoutSession';
import type { UserProfile, WorkoutDay, WorkoutSession } from '../types';

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
  profile: UserProfile;
  workoutDays: WorkoutDay[];
  workoutHistory: WorkoutSession[];
  onWorkoutDaysChange: (workoutDays: WorkoutDay[]) => void;
  onWorkoutHistoryChange: (workoutHistory: WorkoutSession[]) => void;
};

export function TrainingScreen({
  profile,
  workoutDays,
  workoutHistory,
  onWorkoutDaysChange,
  onWorkoutHistoryChange,
}: TrainingScreenProps) {
  const [activeWorkoutId, setActiveWorkoutId] = useState(workoutDays[0].id);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [finishedSession, setFinishedSession] = useState<WorkoutSession | null>(null);
  const [isEditingPlan, setIsEditingPlan] = useState(false);

  const activeWorkout = useMemo(() => {
    return workoutDays.find((workout) => workout.id === activeWorkoutId) ?? workoutDays[0];
  }, [activeWorkoutId, workoutDays]);

  const totalSets = activeWorkout.exercises.reduce((sum, item) => sum + item.sets, 0);
  const workoutVolume = calculateWorkoutVolume(activeWorkout);
  const selectedCalories = getSelectedWorkoutCalories(activeWorkout, profile);
  const calorieOptions = getWorkoutCalorieOptions(activeWorkout, profile);

  function updateActiveWorkout(update: WorkoutDay) {
    onWorkoutDaysChange(workoutDays.map((workout) => (workout.id === update.id ? update : workout)));
  }

  function applyTemplate(template: TrainingTemplate) {
    const nextDays = template.days.map((day) => ({ ...day, exercises: day.exercises.map((exercise) => ({ ...exercise })) }));
    onWorkoutDaysChange(nextDays);
    setActiveWorkoutId(nextDays[0].id);
    setIsEditingPlan(true);
  }

  function addExerciseToWorkout(exerciseId: string) {
    const exists = activeWorkout.exercises.some((exercise) => exercise.exerciseId === exerciseId);

    if (exists) {
      return;
    }

    updateActiveWorkout({
      ...activeWorkout,
      exercises: [
        ...activeWorkout.exercises,
        { exerciseId, sets: 3, reps: 10, targetLoadKg: 30, restSeconds: 75 },
      ],
    });
  }

  function removeExerciseFromWorkout(exerciseId: string) {
    updateActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.filter((exercise) => exercise.exerciseId !== exerciseId),
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
        style={styles.startButton}
        onPress={() => {
          setFinishedSession(null);
          setActiveSession(createWorkoutSession(activeWorkout));
        }}
        accessibilityRole="button"
        accessibilityLabel={`Iniciar treino ${activeWorkout.label}`}
      >
        <Play size={20} color={colors.surface} fill={colors.surface} />
        <Text style={styles.startButtonText}>Iniciar treino</Text>
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
      {activeWorkout.exercises.map((plannedExercise) => {
        const exercise = getExerciseById(plannedExercise.exerciseId);

        if (!exercise) {
          return null;
        }

        return (
            <View key={plannedExercise.exerciseId} style={[styles.listCard, isEditingPlan && styles.editableListCard]}>
              <ExerciseMedia exercise={exercise} />
              <View style={styles.listBody}>
                <Text style={styles.cardTitle}>{exercise.name}</Text>
              <Text style={styles.cardText}>
                {plannedExercise.sets} series x {plannedExercise.reps} reps
              </Text>
              <Text style={styles.smallSignal}>
                {exercise.muscleGroup} - {plannedExercise.restSeconds}s descanso
              </Text>
            </View>
            {isEditingPlan ? (
              <View style={styles.planControlsWide}>
                <PlanNumberControl
                  label="Series"
                  value={plannedExercise.sets}
                  suffix="x"
                  onDecrease={() => bumpExercisePlan(exercise.id, 'sets', -1)}
                  onIncrease={() => bumpExercisePlan(exercise.id, 'sets', 1)}
                  onChange={(value) => updateExercisePlan(exercise.id, 'sets', value)}
                />
                <PlanNumberControl
                  label="Reps"
                  value={plannedExercise.reps}
                  suffix="rep"
                  onDecrease={() => bumpExercisePlan(exercise.id, 'reps', -1)}
                  onIncrease={() => bumpExercisePlan(exercise.id, 'reps', 1)}
                  onChange={(value) => updateExercisePlan(exercise.id, 'reps', value)}
                />
                <PlanNumberControl
                  label="Carga"
                  value={plannedExercise.targetLoadKg}
                  suffix="kg"
                  onDecrease={() => bumpExercisePlan(exercise.id, 'targetLoadKg', -2.5)}
                  onIncrease={() => bumpExercisePlan(exercise.id, 'targetLoadKg', 2.5)}
                  onChange={(value) => updateExercisePlan(exercise.id, 'targetLoadKg', value)}
                />
                <PlanNumberControl
                  label="Descanso"
                  value={plannedExercise.restSeconds}
                  suffix="s"
                  onDecrease={() => bumpExercisePlan(exercise.id, 'restSeconds', -15)}
                  onIncrease={() => bumpExercisePlan(exercise.id, 'restSeconds', 15)}
                  onChange={(value) => updateExercisePlan(exercise.id, 'restSeconds', value)}
                />
                <IconButton icon={Trash2} onPress={() => removeExerciseFromWorkout(exercise.id)} />
              </View>
            ) : (
              <Text style={styles.loadText}>{plannedExercise.targetLoadKg} kg</Text>
            )}
          </View>
        );
      })}

      <SectionTitle title="Biblioteca" />
      {isEditingPlan && <Text style={styles.libraryHint}>Toque no + para colocar o exercicio no treino {activeWorkout.label}.</Text>}
      <View style={styles.libraryGrid}>
        {exercises.map((exercise) => {
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
                  accessibilityLabel={`Adicionar ${exercise.name}`}
                >
                  <Plus size={18} color={alreadyAdded ? colors.muted : colors.primary} />
                </Pressable>
              )}
            </View>
          );
        })}
      </View>
    </>
  );
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

function IconButton({ icon: Icon, onPress }: { icon: typeof Plus; onPress: () => void }) {
  return (
    <Pressable style={styles.smallIconButton} onPress={onPress}>
      <Icon size={15} color={colors.primary} />
    </Pressable>
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    width: '100%',
  },
  planControlBox: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    flexGrow: 1,
    minWidth: '47%',
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
    fontSize: 16,
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
  libraryGrid: {
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
  libraryBody: {
    flex: 1,
    paddingLeft: 14,
  },
  addExerciseButton: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radii.md,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  addedExerciseButton: {
    backgroundColor: colors.background,
  },
  executionCue: {
    color: colors.primaryMid,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 8,
  },
});
