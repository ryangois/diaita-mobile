import { StyleSheet, Text, View } from 'react-native';

import { colors, radii } from '../styles/theme';
import type { AppIcon } from '../types';

type StatPillProps = {
  icon: AppIcon;
  value: string;
  label: string;
};

export function StatPill({ icon: Icon, value, label }: StatPillProps) {
  return (
    <View style={styles.pill}>
      <Icon size={17} color={colors.primarySoft} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    backgroundColor: '#24483f',
    borderRadius: radii.md,
    flex: 1,
    padding: 10,
  },
  value: {
    color: colors.surface,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 8,
  },
  label: {
    color: '#c3d5cd',
    fontSize: 11,
    marginTop: 2,
  },
});
