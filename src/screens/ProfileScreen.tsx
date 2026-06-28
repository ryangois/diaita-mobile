import { CalendarCheck2, UserRound } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { SectionTitle } from '../components/SectionTitle';
import { profile, profilePreferences } from '../data/profile';
import { colors, radii } from '../styles/theme';

export function ProfileScreen() {
  return (
    <>
      <View style={styles.profilePanel}>
        <View style={styles.avatar}>
          <UserRound size={34} color={colors.primary} />
        </View>
        <Text style={styles.profileName}>{profile.name}</Text>
        <Text style={styles.cardText}>
          {profile.weightKg.toLocaleString('pt-BR')} kg - {profile.heightCm} cm - {profile.level}
        </Text>
      </View>

      <SectionTitle title="Preferencias" />
      {profilePreferences.map((item) => (
        <View key={item} style={styles.preferenceRow}>
          <CalendarCheck2 size={20} color={colors.primaryMid} />
          <Text style={styles.preferenceText}>{item}</Text>
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  profilePanel: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: 22,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radii.md,
    height: 74,
    justifyContent: 'center',
    marginBottom: 12,
    width: 74,
  },
  profileName: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: '800',
  },
  cardText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  preferenceRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
    padding: 14,
  },
  preferenceText: {
    color: '#26332f',
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
});
