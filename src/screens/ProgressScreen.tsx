import { Plus, Scale } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SectionTitle } from '../components/SectionTitle';
import { loadChart, progressInsights } from '../data/progress';
import { colors, radii } from '../styles/theme';
import type { BodyMetric, Food, Meal, UserProfile, WorkoutSession } from '../types';
import { calculateNutritionTotals } from '../utils/nutrition';
import { calculateSessionVolume, countCompletedSets } from '../utils/workoutSession';

type ProgressScreenProps = {
  bodyMetrics: BodyMetric[];
  foods: Food[];
  meals: Meal[];
  onBodyMetricsChange: (metrics: BodyMetric[]) => void;
  profile: UserProfile;
  workoutHistory: WorkoutSession[];
};

export function ProgressScreen({
  bodyMetrics,
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
    </>
  );
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
