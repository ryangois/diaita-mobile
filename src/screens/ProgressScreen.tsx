import { StyleSheet, Text, View } from 'react-native';

import { SectionTitle } from '../components/SectionTitle';
import { loadChart, progressInsights } from '../data/progress';
import { colors, radii } from '../styles/theme';

export function ProgressScreen() {
  return (
    <>
      <SectionTitle title="Evolucao" />
      <View style={styles.chartCard}>
        <View style={styles.chartBars}>
          {loadChart.map((height, index) => (
            <View key={`${height}-${index}`} style={styles.barColumn}>
              <View style={[styles.bar, { height }]} />
            </View>
          ))}
        </View>
        <Text style={styles.cardTitle}>Carga e volume subindo</Text>
        <Text style={styles.cardText}>
          Sua consistencia nos ultimos 30 dias esta gerando progresso mensuravel.
        </Text>
      </View>

      {progressInsights.map((row) => (
        <View key={row.id} style={styles.insightRow}>
          <View style={styles.insightBody}>
            <Text style={styles.cardTitle}>{row.label}</Text>
            <Text style={styles.cardText}>{row.note}</Text>
          </View>
          <Text style={styles.insightValue}>{row.value}</Text>
        </View>
      ))}
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
});
