import { Cuboid, Dumbbell, Video } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radii } from '../styles/theme';
import type { Exercise } from '../types';

type ExerciseMediaProps = {
  exercise: Pick<Exercise, 'mediaType' | 'muscleGroup'>;
  size?: 'sm' | 'lg';
};

export function ExerciseMedia({ exercise, size = 'sm' }: ExerciseMediaProps) {
  const Icon = exercise.mediaType === '3D' ? Cuboid : Video;

  return (
    <View style={[styles.box, size === 'lg' && styles.largeBox]}>
      <Icon size={size === 'lg' ? 34 : 22} color={colors.primary} strokeWidth={2.2} />
      <Text style={styles.mediaType}>{exercise.mediaType}</Text>
      {size === 'lg' && <Text style={styles.muscle}>{exercise.muscleGroup}</Text>}
    </View>
  );
}

export function ExerciseFallbackMedia() {
  return (
    <View style={[styles.box, styles.largeBox]}>
      <Dumbbell size={34} color={colors.primary} />
      <Text style={styles.mediaType}>GIF/3D</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radii.md,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  largeBox: {
    height: 112,
    width: 112,
  },
  mediaType: {
    color: colors.primaryMid,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 5,
  },
  muscle: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
});
