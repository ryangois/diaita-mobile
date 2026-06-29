import { CalendarCheck2, RotateCcw, Save, UserRound } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { SectionTitle } from '../components/SectionTitle';
import { colors, radii } from '../styles/theme';
import type { BodyMetric, UserProfile } from '../types';

type ProfileScreenProps = {
  bodyMetrics: BodyMetric[];
  onProfileChange: (profile: UserProfile) => void;
  onResetData: () => void;
  profile: UserProfile;
};

export function ProfileScreen({ bodyMetrics, onProfileChange, onResetData, profile }: ProfileScreenProps) {
  const latestMetric = bodyMetrics[0];
  const preferences = [
    `Objetivo: ${profile.goal}`,
    `Treina ${profile.trainingDaysPerWeek} dias por semana`,
    profile.equipment,
    `Meta: ${profile.dailyCalorieGoal} kcal e ${profile.dailyProteinGoal}g proteina`,
  ];

  function updateProfile(update: Partial<UserProfile>) {
    onProfileChange({ ...profile, ...update });
  }

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

      <SectionTitle title="Dados pessoais" />
      <View style={styles.formPanel}>
        <TextField label="Nome" value={profile.name} onChangeText={(name) => updateProfile({ name })} />
        <View style={styles.inputRow}>
          <NumberField label="Idade" value={profile.age} onChangeNumber={(age) => updateProfile({ age })} />
          <NumberField label="Peso kg" value={profile.weightKg} onChangeNumber={(weightKg) => updateProfile({ weightKg })} />
        </View>
        <View style={styles.inputRow}>
          <NumberField label="Altura cm" value={profile.heightCm} onChangeNumber={(heightCm) => updateProfile({ heightCm })} />
          <NumberField label="Dias treino" value={profile.trainingDaysPerWeek} onChangeNumber={(trainingDaysPerWeek) => updateProfile({ trainingDaysPerWeek })} />
        </View>
        <TextField label="Objetivo" value={profile.goal} onChangeText={(goal) => updateProfile({ goal })} />
        <TextField label="Equipamento" value={profile.equipment} onChangeText={(equipment) => updateProfile({ equipment })} />
      </View>

      <SectionTitle title="Metas diarias" />
      <View style={styles.formPanel}>
        <View style={styles.inputRow}>
          <NumberField label="Kcal" value={profile.dailyCalorieGoal} onChangeNumber={(dailyCalorieGoal) => updateProfile({ dailyCalorieGoal })} />
          <NumberField label="Proteina" value={profile.dailyProteinGoal} onChangeNumber={(dailyProteinGoal) => updateProfile({ dailyProteinGoal })} />
        </View>
        <View style={styles.inputRow}>
          <NumberField label="Carbo" value={profile.dailyCarbsGoal} onChangeNumber={(dailyCarbsGoal) => updateProfile({ dailyCarbsGoal })} />
          <NumberField label="Gordura" value={profile.dailyFatGoal} onChangeNumber={(dailyFatGoal) => updateProfile({ dailyFatGoal })} />
        </View>
        <View style={styles.savedHint}>
          <Save size={18} color={colors.primaryMid} />
          <Text style={styles.savedHintText}>Alteracoes salvas automaticamente no aparelho.</Text>
        </View>
      </View>

      <SectionTitle title="Preferencias" />
      {preferences.map((item) => (
        <View key={item} style={styles.preferenceRow}>
          <CalendarCheck2 size={20} color={colors.primaryMid} />
          <Text style={styles.preferenceText}>{item}</Text>
        </View>
      ))}

      <SectionTitle title="Ultima medida" />
      <View style={styles.preferenceRow}>
        <CalendarCheck2 size={20} color={colors.primaryMid} />
        <Text style={styles.preferenceText}>
          {latestMetric
            ? `${latestMetric.weightKg} kg - cintura ${latestMetric.waistCm} cm`
            : 'Nenhuma medida registrada'}
        </Text>
      </View>

      <Pressable style={styles.resetButton} onPress={onResetData}>
        <RotateCcw size={18} color={colors.secondary} />
        <Text style={styles.resetButtonText}>Limpar historico e medidas</Text>
      </Pressable>
    </>
  );
}

function TextField({
  label,
  onChangeText,
  value,
}: {
  label: string;
  onChangeText: (value: string) => void;
  value: string;
}) {
  return (
    <View style={styles.inputBox}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput style={styles.textInput} value={value} onChangeText={onChangeText} />
    </View>
  );
}

function NumberField({
  label,
  onChangeNumber,
  value,
}: {
  label: string;
  onChangeNumber: (value: number) => void;
  value: number;
}) {
  return (
    <View style={styles.inputBox}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        keyboardType="numeric"
        style={styles.textInput}
        value={formatNumber(value)}
        onChangeText={(text) => onChangeNumber(readNumber(text))}
      />
    </View>
  );
}

function readNumber(value: string) {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? `${value}` : `${value.toFixed(1)}`;
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
  formPanel: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    gap: 10,
    padding: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputBox: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    flex: 1,
    padding: 10,
  },
  inputLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  textInput: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 5,
    padding: 0,
  },
  savedHint: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: 8,
    padding: 10,
  },
  savedHintText: {
    color: colors.primary,
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
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
  resetButton: {
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 12,
    minHeight: 48,
  },
  resetButtonText: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: '800',
  },
});
