import { StyleSheet, Text } from 'react-native';

import { colors } from '../styles/theme';

type SectionTitleProps = {
  title: string;
};

export function SectionTitle({ title }: SectionTitleProps) {
  return <Text style={styles.title}>{title}</Text>;
}

const styles = StyleSheet.create({
  title: {
    color: colors.primary,
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 12,
    marginTop: 22,
  },
});
