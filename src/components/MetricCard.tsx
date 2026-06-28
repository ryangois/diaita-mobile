import { StyleSheet, Text, View } from 'react-native';

import { colors, radii } from '../styles/theme';
import type { AppIcon } from '../types';

type MetricCardProps = {
  icon: AppIcon;
  label: string;
  value: string;
  tone: 'green' | 'red' | 'blue' | 'yellow';
};

export function MetricCard({ icon: Icon, label, value, tone }: MetricCardProps) {
  return (
    <View style={[styles.card, styles[tone]]}>
      <Icon size={22} color={colors.primary} strokeWidth={2.2} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.md,
    minHeight: 112,
    padding: 14,
    width: '48%',
  },
  green: {
    backgroundColor: colors.primarySoft,
  },
  red: {
    backgroundColor: colors.secondarySoft,
  },
  blue: {
    backgroundColor: colors.blueSoft,
  },
  yellow: {
    backgroundColor: colors.yellowSoft,
  },
  value: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 16,
  },
  label: {
    color: '#56615c',
    fontSize: 13,
    marginTop: 4,
  },
});
