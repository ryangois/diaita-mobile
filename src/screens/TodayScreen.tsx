import { Activity, Apple, BarChart3, Dumbbell, Flame, Scale, Timer } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { ExerciseFallbackMedia } from '../components/ExerciseMedia';
import { MetricCard } from '../components/MetricCard';
import { SectionTitle } from '../components/SectionTitle';
import { StatPill } from '../components/StatPill';
import { nutritionTotals } from '../data/nutrition';
import { getExerciseById, workoutDays } from '../data/training';
import { colors, radii } from '../styles/theme';

export function TodayScreen() {
  const todayWorkout = workoutDays[0];
  const firstWorkoutExercise = todayWorkout.exercises[0];
  const firstExercise = getExerciseById(firstWorkoutExercise.exerciseId);

  return (
    <>
      <View style={styles.heroPanel}>
        <Text style={styles.kicker}>Plano de hoje</Text>
        <Text style={styles.heroTitle}>Treino A + 2.300 kcal</Text>
        <Text style={styles.heroText}>
          Foco em peito, costas e ombros. Proteina esta quase na meta diaria.
        </Text>
        <View style={styles.heroStats}>
          <StatPill icon={Dumbbell} value={`${todayWorkout.exercises.length}`} label="exercicios" />
          <StatPill icon={Flame} value={`${nutritionTotals.calories}`} label="kcal usadas" />
          <StatPill icon={Timer} value={`${todayWorkout.estimatedMinutes}m`} label="estimado" />
        </View>
      </View>

      <SectionTitle title="Resumo" />
      <View style={styles.metricGrid}>
        <MetricCard icon={Activity} label="Treinos" value="4/5" tone="green" />
        <MetricCard icon={Apple} label="Proteina" value={`${nutritionTotals.protein}g`} tone="red" />
        <MetricCard icon={Scale} label="Peso" value="82,4kg" tone="blue" />
        <MetricCard icon={BarChart3} label="Volume" value="+18%" tone="yellow" />
      </View>

      <SectionTitle title="Proxima acao" />
      <View style={styles.actionCard}>
        <ExerciseFallbackMedia />
        <View style={styles.actionBody}>
          <Text style={styles.cardTitle}>{firstExercise?.name ?? 'Exercicio'}</Text>
          <Text style={styles.cardText}>
            {firstWorkoutExercise.sets} series de {firstWorkoutExercise.reps} reps com{' '}
            {firstWorkoutExercise.targetLoadKg} kg
          </Text>
          <Text style={styles.smallSignal}>
            Descanso sugerido: {firstWorkoutExercise.restSeconds} segundos
          </Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  heroPanel: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    padding: 20,
  },
  kicker: {
    color: '#6cae8f',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#f8fbf8',
    fontSize: 28,
    fontWeight: '800',
  },
  heroText: {
    color: colors.primarySoft,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  heroStats: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    flexDirection: 'row',
    padding: 12,
  },
  actionBody: {
    flex: 1,
    paddingLeft: 14,
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
});
