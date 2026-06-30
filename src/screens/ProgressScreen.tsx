import { Dumbbell, Plus, Scale, Trophy } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SectionTitle } from '../components/SectionTitle';
import { exercises as baseExercises } from '../data/training';
import { loadChart, progressInsights } from '../data/progress';
import { colors, radii } from '../styles/theme';
import type { BodyMetric, Exercise, Food, Meal, UserProfile, WorkoutSession } from '../types';
import { calculateNutritionTotals } from '../utils/nutrition';
import { calculateSessionVolume, countCompletedSets } from '../utils/workoutSession';

type ProgressScreenProps = {
  bodyMetrics: BodyMetric[];
  customExercises: Exercise[];
  foods: Food[];
  meals: Meal[];
  onBodyMetricsChange: (metrics: BodyMetric[]) => void;
  profile: UserProfile;
  workoutHistory: WorkoutSession[];
};

export function ProgressScreen({
  bodyMetrics,
  customExercises,
  foods,
  meals,
  onBodyMetricsChange,
  profile,
  workoutHistory,
}: ProgressScreenProps) {
  const nutritionTotals = calculateNutritionTotals(meals, foods);
  const latestMetric = bodyMetrics[0];
  const previousMetric = bodyMetrics[1];
  const weightDelta =
    latestMetric && previousMetric ? latestMetric.weightKg - previousMetric.weightKg : 0;
  const totalWorkoutVolume = workoutHistory.reduce(
    (total, session) => total + calculateSessionVolume(session),
    0,
  );
  const completedSets = workoutHistory.reduce(
    (total, session) => total + countCompletedSets(session),
    0,
  );
  const exerciseLibrary = [...baseExercises, ...customExercises];
  const now = Date.now();
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
  const currentWeekSessions = workoutHistory.filter(
    (session) => now - new Date(session.startedAt).getTime() <= oneWeekMs,
  );
  const previousWeekSessions = workoutHistory.filter((session) => {
    const age = now - new Date(session.startedAt).getTime();
    return age > oneWeekMs && age <= oneWeekMs * 2;
  });
  const currentWeekVolume = sumSessionVolume(currentWeekSessions);
  const previousWeekVolume = sumSessionVolume(previousWeekSessions);
  const exercisePrs = getExercisePrs(workoutHistory, exerciseLibrary);
  const muscleVolumes = getMuscleVolumes(currentWeekSessions, exerciseLibrary);
  const progressionAlerts = getProgressionAlerts(workoutHistory, exerciseLibrary);
  const dynamicInsights = [
    {
      id: 'history-count',
      label: 'Treinos salvos',
      note: 'persistidos localmente',
      value: `${workoutHistory.length}`,
    },
    {
      id: 'history-volume',
      label: 'Volume registrado',
      note: `${completedSets} series concluidas`,
      value: `${Math.round(totalWorkoutVolume).toLocaleString('pt-BR')} kg`,
    },
    {
      id: 'nutrition-today',
      label: 'Calorias de hoje',
      note: `${nutritionTotals.protein}g proteina`,
      value: `${nutritionTotals.calories}`,
    },
    {
      id: 'weight-delta',
      label: 'Peso',
      note: previousMetric ? 'comparado ao registro anterior' : 'primeiro registro',
      value: latestMetric ? `${weightDelta >= 0 ? '+' : ''}${weightDelta.toFixed(1)} kg` : '--',
    },
  ];

  function addBodyMetric() {
    const base = latestMetric ?? {
      weightKg: profile.weightKg,
      waistCm: 84,
      chestCm: 102,
      armCm: 36,
      legCm: 58,
    };

    const nextMetric: BodyMetric = {
      id: `metric-${Date.now()}`,
      measuredAt: new Date().toISOString(),
      weightKg: Math.round((base.weightKg - 0.2) * 10) / 10,
      waistCm: Math.max(0, Math.round((base.waistCm - 0.3) * 10) / 10),
      chestCm: base.chestCm,
      armCm: Math.round((base.armCm + 0.1) * 10) / 10,
      legCm: base.legCm,
    };

    onBodyMetricsChange([nextMetric, ...bodyMetrics]);
  }

  return (
    <>
      <SectionTitle title="Evolucao" />
      <View style={styles.chartCard}>
        <View style={styles.chartBars}>
          {(bodyMetrics.length > 1 ? bodyMetrics.slice(0, 7).reverse().map((metric) => metric.weightKg) : loadChart).map(
            (value, index, values) => {
              const min = Math.min(...values);
              const max = Math.max(...values);
              const height = values.length > 1 ? 36 + ((value - min) / Math.max(max - min, 1)) * 58 : value;

              return (
                <View key={`${value}-${index}`} style={styles.barColumn}>
                  <View style={[styles.bar, { height }]} />
                </View>
              );
            },
          )}
        </View>
        <Text style={styles.cardTitle}>Peso, volume e dieta conectados</Text>
        <Text style={styles.cardText}>
          O painel usa treinos finalizados, dieta atual e medidas corporais salvas.
        </Text>
      </View>

      <View style={styles.metricPanel}>
        <View style={styles.metricIcon}>
          <Scale size={22} color={colors.primary} />
        </View>
        <View style={styles.insightBody}>
          <Text style={styles.cardTitle}>
            {latestMetric ? `${latestMetric.weightKg} kg` : `${profile.weightKg} kg`}
          </Text>
          <Text style={styles.cardText}>
            {latestMetric
              ? `Cintura ${latestMetric.waistCm} cm - braco ${latestMetric.armCm} cm`
              : 'Sem medida corporal registrada'}
          </Text>
        </View>
        <Pressable style={styles.addMetricButton} onPress={addBodyMetric}>
          <Plus size={18} color={colors.primary} />
        </Pressable>
      </View>

      {[...dynamicInsights, ...progressInsights].map((row) => (
        <View key={row.id} style={styles.insightRow}>
          <View style={styles.insightBody}>
            <Text style={styles.cardTitle}>{row.label}</Text>
            <Text style={styles.cardText}>{row.note}</Text>
          </View>
          <Text style={styles.insightValue}>{row.value}</Text>
        </View>
      ))}

      <SectionTitle title="Historico de treinos" />
      {workoutHistory.length === 0 ? (
        <View style={styles.emptyHistory}>
          <Text style={styles.cardTitle}>Nenhum treino salvo ainda</Text>
          <Text style={styles.cardText}>Finalize um treino para alimentar este painel.</Text>
        </View>
      ) : (
        workoutHistory.slice(0, 5).map((session) => (
          <View key={session.id} style={styles.historyRow}>
            <View style={styles.insightBody}>
              <Text style={styles.cardTitle}>
                {new Date(session.startedAt).toLocaleDateString('pt-BR')}
              </Text>
              <Text style={styles.cardText}>
                {countCompletedSets(session)} series -{' '}
                {Math.round(calculateSessionVolume(session)).toLocaleString('pt-BR')} kg
              </Text>
            </View>
            <Text style={styles.insightValue}>OK</Text>
          </View>
        ))
      )}

      <SectionTitle title="PRs pessoais" />
      {exercisePrs.length === 0 ? (
        <View style={styles.emptyHistory}>
          <Text style={styles.cardTitle}>Sem PRs ainda</Text>
          <Text style={styles.cardText}>Finalize treinos para registrar maiores cargas por exercicio.</Text>
        </View>
      ) : (
        exercisePrs.slice(0, 5).map((pr) => (
          <View key={pr.exerciseId} style={styles.historyRow}>
            <View style={styles.metricIcon}>
              <Trophy size={20} color={colors.primary} />
            </View>
            <View style={styles.insightBody}>
              <Text style={styles.cardTitle}>{pr.name}</Text>
              <Text style={styles.cardText}>{pr.reps} reps no melhor set</Text>
            </View>
            <Text style={styles.insightValue}>{pr.loadKg} kg</Text>
          </View>
        ))
      )}

      <SectionTitle title="Volume semanal por musculo" />
      {muscleVolumes.map((row) => (
        <View key={row.muscle} style={styles.historyRow}>
          <View style={styles.metricIcon}>
            <Dumbbell size={20} color={colors.primary} />
          </View>
          <View style={styles.insightBody}>
            <Text style={styles.cardTitle}>{row.muscle}</Text>
            <Text style={styles.cardText}>ultimos 7 dias</Text>
          </View>
          <Text style={styles.insightValue}>{Math.round(row.volume).toLocaleString('pt-BR')} kg</Text>
        </View>
      ))}

      <SectionTitle title="Comparacao semanal" />
      <View style={styles.insightRow}>
        <View style={styles.insightBody}>
          <Text style={styles.cardTitle}>Semana atual vs anterior</Text>
          <Text style={styles.cardText}>
            {Math.round(currentWeekVolume).toLocaleString('pt-BR')} kg contra{' '}
            {Math.round(previousWeekVolume).toLocaleString('pt-BR')} kg
          </Text>
        </View>
        <Text style={styles.insightValue}>
          {currentWeekVolume - previousWeekVolume >= 0 ? '+' : ''}
          {Math.round(currentWeekVolume - previousWeekVolume).toLocaleString('pt-BR')}
        </Text>
      </View>

      <SectionTitle title="Alertas de progressao" />
      {progressionAlerts.length === 0 ? (
        <View style={styles.emptyHistory}>
          <Text style={styles.cardTitle}>Nenhum alerta ainda</Text>
          <Text style={styles.cardText}>Quando voce repetir reps com boa carga, o app sugere subir peso.</Text>
        </View>
      ) : (
        progressionAlerts.slice(0, 4).map((alert) => (
          <View key={alert.id} style={styles.insightRow}>
            <View style={styles.insightBody}>
              <Text style={styles.cardTitle}>{alert.name}</Text>
              <Text style={styles.cardText}>Aumente 2,5kg no proximo treino.</Text>
            </View>
            <Text style={styles.insightValue}>{alert.loadKg} kg</Text>
          </View>
        ))
      )}
    </>
  );
}

function sumSessionVolume(sessions: WorkoutSession[]) {
  return sessions.reduce((total, session) => total + calculateSessionVolume(session), 0);
}

function getExercisePrs(workoutHistory: WorkoutSession[], exerciseLibrary: Exercise[]) {
  const prs = new Map<string, { exerciseId: string; loadKg: number; name: string; reps: number }>();

  workoutHistory.forEach((session) => {
    session.setLogs.forEach((setLog) => {
      if (!setLog.completed) {
        return;
      }

      const current = prs.get(setLog.exerciseId);
      if (!current || setLog.actualLoadKg > current.loadKg) {
        prs.set(setLog.exerciseId, {
          exerciseId: setLog.exerciseId,
          loadKg: setLog.actualLoadKg,
          name: findExerciseName(setLog.exerciseId, exerciseLibrary),
          reps: setLog.actualReps,
        });
      }
    });
  });

  return Array.from(prs.values()).sort((first, second) => second.loadKg - first.loadKg);
}

function getMuscleVolumes(sessions: WorkoutSession[], exerciseLibrary: Exercise[]) {
  const volumes = new Map<string, number>();

  sessions.forEach((session) => {
    session.setLogs.forEach((setLog) => {
      if (!setLog.completed) {
        return;
      }

      const exercise = exerciseLibrary.find((item) => item.id === setLog.exerciseId);
      const muscle = exercise?.muscleGroup ?? 'Outros';
      volumes.set(muscle, (volumes.get(muscle) ?? 0) + setLog.actualReps * setLog.actualLoadKg);
    });
  });

  return Array.from(volumes.entries())
    .map(([muscle, volume]) => ({ muscle, volume }))
    .sort((first, second) => second.volume - first.volume);
}

function getProgressionAlerts(workoutHistory: WorkoutSession[], exerciseLibrary: Exercise[]) {
  const latestSession = workoutHistory[0];

  if (!latestSession) {
    return [];
  }

  return latestSession.setLogs
    .filter((setLog) => setLog.completed && setLog.actualReps >= setLog.targetReps && setLog.actualLoadKg >= setLog.targetLoadKg)
    .map((setLog) => ({
      id: setLog.id,
      loadKg: setLog.actualLoadKg,
      name: findExerciseName(setLog.exerciseId, exerciseLibrary),
    }));
}

function findExerciseName(exerciseId: string, exerciseLibrary: Exercise[]) {
  return exerciseLibrary.find((exercise) => exercise.id === exerciseId)?.name ?? 'Exercicio';
}

const styles = StyleSheet.create({
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: 16,
  },
  chartBars: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 9,
    height: 112,
    marginBottom: 18,
  },
  barColumn: {
    backgroundColor: '#edf1ee',
    borderRadius: radii.md,
    flex: 1,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    backgroundColor: colors.primaryMid,
    borderRadius: radii.md,
    width: '100%',
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
  metricPanel: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    padding: 14,
  },
  metricIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radii.md,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  addMetricButton: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radii.md,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  insightRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    padding: 16,
  },
  insightBody: {
    flex: 1,
    paddingRight: 12,
  },
  insightValue: {
    color: colors.primaryMid,
    fontSize: 18,
    fontWeight: '800',
  },
  emptyHistory: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: 16,
  },
  historyRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    padding: 16,
  },
});
