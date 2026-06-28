import { Clock3, Dumbbell, Target } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ExerciseMedia } from '../components/ExerciseMedia';
import { SectionTitle } from '../components/SectionTitle';
import { exercises, getExerciseById, workoutDays } from '../data/training';
import { colors, radii } from '../styles/theme';

export function TrainingScreen() {
  const [activeWorkoutId, setActiveWorkoutId] = useState(workoutDays[0].id);

  const activeWorkout = useMemo(() => {
    return workoutDays.find((workout) => workout.id === activeWorkoutId) ?? workoutDays[0];
  }, [activeWorkoutId]);

  const totalSets = activeWorkout.exercises.reduce((sum, item) => sum + item.sets, 0);

  return (
    <>
      <SectionTitle title="Planilha da semana" />
      <View style={styles.weekPlan}>
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
            </Pressable>
          );
        })}
      </View>

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
        </View>
      </View>

      <SectionTitle title={`Treino ${activeWorkout.label}`} />
      {activeWorkout.exercises.map((plannedExercise) => {
        const exercise = getExerciseById(plannedExercise.exerciseId);

        if (!exercise) {
          return null;
        }

        return (
          <View key={plannedExercise.exerciseId} style={styles.listCard}>
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
            <Text style={styles.loadText}>{plannedExercise.targetLoadKg} kg</Text>
          </View>
        );
      })}

      <SectionTitle title="Biblioteca" />
      <View style={styles.libraryGrid}>
        {exercises.map((exercise) => (
          <View key={exercise.id} style={styles.libraryCard}>
            <ExerciseMedia exercise={exercise} size="lg" />
            <View style={styles.libraryBody}>
              <Text style={styles.cardTitle}>{exercise.name}</Text>
              <Text style={styles.cardText}>
                {exercise.equipment} - {exercise.difficulty}
              </Text>
              <Text style={styles.executionCue}>{exercise.executionCue}</Text>
            </View>
          </View>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  weekPlan: {
    flexDirection: 'row',
    gap: 10,
  },
  dayBox: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    flex: 1,
    justifyContent: 'center',
    minHeight: 76,
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
  listCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    flexDirection: 'row',
    marginBottom: 10,
    padding: 12,
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
  libraryGrid: {
    gap: 10,
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
  executionCue: {
    color: colors.primaryMid,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 8,
  },
});
