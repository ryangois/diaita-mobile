import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Activity,
  Apple,
  BarChart3,
  CalendarCheck2,
  Dumbbell,
  Flame,
  Home,
  LineChart,
  Plus,
  Scale,
  Timer,
  UserRound,
  Utensils,
} from 'lucide-react-native';

type TabKey = 'today' | 'training' | 'diet' | 'progress' | 'profile';

type TabItem = {
  key: TabKey;
  label: string;
  icon: typeof Home;
};

const tabs: TabItem[] = [
  { key: 'today', label: 'Hoje', icon: Home },
  { key: 'training', label: 'Treino', icon: Dumbbell },
  { key: 'diet', label: 'Dieta', icon: Utensils },
  { key: 'progress', label: 'Progresso', icon: LineChart },
  { key: 'profile', label: 'Perfil', icon: UserRound },
];

const workoutPlan = [
  {
    name: 'Supino reto',
    detail: '4 series x 8 reps',
    load: '72 kg',
    muscle: 'Peito',
  },
  {
    name: 'Remada curvada',
    detail: '4 series x 10 reps',
    load: '64 kg',
    muscle: 'Costas',
  },
  {
    name: 'Desenvolvimento',
    detail: '3 series x 10 reps',
    load: '32 kg',
    muscle: 'Ombros',
  },
];

const meals = [
  { name: 'Cafe da manha', kcal: 520, macro: '38g prot' },
  { name: 'Almoco', kcal: 710, macro: '52g prot' },
  { name: 'Lanche', kcal: 310, macro: '24g prot' },
  { name: 'Jantar', kcal: 640, macro: '46g prot' },
];

const progressRows = [
  { label: 'Supino reto', value: '+7,5 kg', note: 'ultimas 4 semanas' },
  { label: 'Volume semanal', value: '+18%', note: 'comparado ao mes anterior' },
  { label: 'Peso corporal', value: '-1,2 kg', note: 'em 21 dias' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('today');

  const activeTitle = useMemo(() => {
    return tabs.find((tab) => tab.key === activeTab)?.label ?? 'Diaita';
  }, [activeTab]);

  return (
    <View style={styles.app}>
      <StatusBar style="dark" />
      <View style={styles.shell}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Diaita</Text>
            <Text style={styles.headerSubtitle}>{activeTitle}</Text>
          </View>
          <Pressable style={styles.iconButton} accessibilityLabel="Adicionar">
            <Plus size={22} color="#16302b" strokeWidth={2.4} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'today' && <TodayScreen />}
          {activeTab === 'training' && <TrainingScreen />}
          {activeTab === 'diet' && <DietScreen />}
          {activeTab === 'progress' && <ProgressScreen />}
          {activeTab === 'profile' && <ProfileScreen />}
        </ScrollView>

        <View style={styles.tabBar}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;

            return (
              <Pressable
                key={tab.key}
                style={[styles.tabItem, isActive && styles.activeTabItem]}
                onPress={() => setActiveTab(tab.key)}
                accessibilityRole="button"
                accessibilityLabel={tab.label}
              >
                <Icon
                  size={21}
                  color={isActive ? '#16302b' : '#6f7975'}
                  strokeWidth={2.2}
                />
                <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function TodayScreen() {
  return (
    <>
      <View style={styles.heroPanel}>
        <Text style={styles.kicker}>Plano de hoje</Text>
        <Text style={styles.heroTitle}>Treino A + 2.300 kcal</Text>
        <Text style={styles.heroText}>
          Foco em peito, costas e ombros. Proteina esta quase na meta diaria.
        </Text>
        <View style={styles.heroStats}>
          <StatPill icon={Dumbbell} value="6" label="exercicios" />
          <StatPill icon={Flame} value="1.840" label="kcal usadas" />
          <StatPill icon={Timer} value="62m" label="estimado" />
        </View>
      </View>

      <SectionTitle title="Resumo" />
      <View style={styles.metricGrid}>
        <MetricCard icon={Activity} label="Treinos" value="4/5" tone="green" />
        <MetricCard icon={Apple} label="Proteina" value="128g" tone="red" />
        <MetricCard icon={Scale} label="Peso" value="82,4kg" tone="blue" />
        <MetricCard icon={BarChart3} label="Volume" value="+18%" tone="yellow" />
      </View>

      <SectionTitle title="Proxima acao" />
      <View style={styles.actionCard}>
        <View style={styles.mediaMock}>
          <Dumbbell size={34} color="#16302b" />
          <Text style={styles.mediaText}>GIF/3D</Text>
        </View>
        <View style={styles.actionBody}>
          <Text style={styles.cardTitle}>Supino reto</Text>
          <Text style={styles.cardText}>4 series de 8 reps com 72 kg</Text>
          <Text style={styles.smallSignal}>Descanso sugerido: 90 segundos</Text>
        </View>
      </View>
    </>
  );
}

function TrainingScreen() {
  return (
    <>
      <SectionTitle title="Planilha da semana" />
      <View style={styles.weekPlan}>
        {['A', 'B', 'C', 'D'].map((day, index) => (
          <View key={day} style={[styles.dayBox, index === 0 && styles.activeDayBox]}>
            <Text style={[styles.dayLetter, index === 0 && styles.activeDayLetter]}>
              {day}
            </Text>
            <Text style={styles.dayText}>{index === 0 ? 'Hoje' : `${index + 2}a`}</Text>
          </View>
        ))}
      </View>

      <SectionTitle title="Treino A" />
      {workoutPlan.map((exercise) => (
        <View key={exercise.name} style={styles.listCard}>
          <View style={styles.exerciseVisual}>
            <Dumbbell size={24} color="#16302b" />
          </View>
          <View style={styles.listBody}>
            <Text style={styles.cardTitle}>{exercise.name}</Text>
            <Text style={styles.cardText}>{exercise.detail}</Text>
            <Text style={styles.smallSignal}>{exercise.muscle}</Text>
          </View>
          <Text style={styles.loadText}>{exercise.load}</Text>
        </View>
      ))}
    </>
  );
}

function DietScreen() {
  const totalCalories = meals.reduce((sum, meal) => sum + meal.kcal, 0);

  return (
    <>
      <View style={styles.nutritionPanel}>
        <Text style={styles.kicker}>Meta diaria</Text>
        <Text style={styles.heroTitle}>{totalCalories} / 2300 kcal</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: '94%' }]} />
        </View>
        <Text style={styles.cardText}>Faltam 120 kcal para fechar o dia.</Text>
      </View>

      <SectionTitle title="Refeicoes" />
      {meals.map((meal) => (
        <View key={meal.name} style={styles.listCard}>
          <View style={styles.foodIcon}>
            <Utensils size={22} color="#7d2d2b" />
          </View>
          <View style={styles.listBody}>
            <Text style={styles.cardTitle}>{meal.name}</Text>
            <Text style={styles.cardText}>{meal.macro}</Text>
          </View>
          <Text style={styles.loadText}>{meal.kcal}</Text>
        </View>
      ))}
    </>
  );
}

function ProgressScreen() {
  return (
    <>
      <SectionTitle title="Evolucao" />
      <View style={styles.chartCard}>
        <View style={styles.chartBars}>
          {[42, 58, 52, 71, 68, 86, 92].map((height, index) => (
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

      {progressRows.map((row) => (
        <View key={row.label} style={styles.insightRow}>
          <View>
            <Text style={styles.cardTitle}>{row.label}</Text>
            <Text style={styles.cardText}>{row.note}</Text>
          </View>
          <Text style={styles.insightValue}>{row.value}</Text>
        </View>
      ))}
    </>
  );
}

function ProfileScreen() {
  const preferences = [
    'Objetivo: ganho de massa',
    'Treina 5 dias por semana',
    'Academia completa',
    'Meta: 2300 kcal e 160g proteina',
  ];

  return (
    <>
      <View style={styles.profilePanel}>
        <View style={styles.avatar}>
          <UserRound size={34} color="#16302b" />
        </View>
        <Text style={styles.profileName}>Ryan</Text>
        <Text style={styles.cardText}>82,4 kg · 178 cm · Intermediario</Text>
      </View>

      <SectionTitle title="Preferencias" />
      <FlatList
        data={preferences}
        keyExtractor={(item) => item}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.preferenceRow}>
            <CalendarCheck2 size={20} color="#315c52" />
            <Text style={styles.preferenceText}>{item}</Text>
          </View>
        )}
      />
    </>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function MetricCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Home;
  label: string;
  value: string;
  tone: 'green' | 'red' | 'blue' | 'yellow';
}) {
  return (
    <View style={[styles.metricCard, styles[tone]]}>
      <Icon size={22} color="#16302b" strokeWidth={2.2} />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function StatPill({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Home;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.statPill}>
      <Icon size={17} color="#dbe9e3" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: '#f4f1ea',
  },
  shell: {
    flex: 1,
    paddingTop: 54,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  brand: {
    color: '#16302b',
    fontSize: 30,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#68726d',
    fontSize: 14,
    marginTop: 2,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: '#dbe9e3',
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  content: {
    paddingBottom: 112,
    paddingHorizontal: 20,
  },
  heroPanel: {
    backgroundColor: '#16302b',
    borderRadius: 8,
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
    color: '#dbe9e3',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  heroStats: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
  },
  statPill: {
    backgroundColor: '#24483f',
    borderRadius: 8,
    flex: 1,
    padding: 10,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 8,
  },
  statLabel: {
    color: '#c3d5cd',
    fontSize: 11,
    marginTop: 2,
  },
  sectionTitle: {
    color: '#16302b',
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 12,
    marginTop: 22,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    borderRadius: 8,
    minHeight: 112,
    padding: 14,
    width: '48%',
  },
  green: {
    backgroundColor: '#dbe9e3',
  },
  red: {
    backgroundColor: '#f0d7d1',
  },
  blue: {
    backgroundColor: '#d7e3f3',
  },
  yellow: {
    backgroundColor: '#f3df9a',
  },
  metricValue: {
    color: '#16302b',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 16,
  },
  metricLabel: {
    color: '#56615c',
    fontSize: 13,
    marginTop: 4,
  },
  actionCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    flexDirection: 'row',
    padding: 12,
  },
  mediaMock: {
    alignItems: 'center',
    backgroundColor: '#dbe9e3',
    borderRadius: 8,
    height: 92,
    justifyContent: 'center',
    width: 92,
  },
  mediaText: {
    color: '#315c52',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 8,
  },
  actionBody: {
    flex: 1,
    paddingLeft: 14,
  },
  cardTitle: {
    color: '#1c2825',
    fontSize: 16,
    fontWeight: '800',
  },
  cardText: {
    color: '#64706b',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  smallSignal: {
    color: '#315c52',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
  },
  weekPlan: {
    flexDirection: 'row',
    gap: 10,
  },
  dayBox: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    flex: 1,
    minHeight: 76,
    justifyContent: 'center',
  },
  activeDayBox: {
    backgroundColor: '#16302b',
  },
  dayLetter: {
    color: '#16302b',
    fontSize: 22,
    fontWeight: '800',
  },
  activeDayLetter: {
    color: '#ffffff',
  },
  dayText: {
    color: '#7a837f',
    fontSize: 12,
    marginTop: 4,
  },
  listCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 10,
    padding: 12,
  },
  exerciseVisual: {
    alignItems: 'center',
    backgroundColor: '#dbe9e3',
    borderRadius: 8,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  foodIcon: {
    alignItems: 'center',
    backgroundColor: '#f0d7d1',
    borderRadius: 8,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  listBody: {
    flex: 1,
    paddingHorizontal: 12,
  },
  loadText: {
    color: '#16302b',
    fontSize: 16,
    fontWeight: '800',
  },
  nutritionPanel: {
    backgroundColor: '#7d2d2b',
    borderRadius: 8,
    padding: 20,
  },
  progressTrack: {
    backgroundColor: '#a4574d',
    borderRadius: 8,
    height: 12,
    marginTop: 18,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: '#f3df9a',
    borderRadius: 8,
    height: '100%',
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
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
    borderRadius: 8,
    flex: 1,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    backgroundColor: '#315c52',
    borderRadius: 8,
    width: '100%',
  },
  insightRow: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    padding: 16,
  },
  insightValue: {
    color: '#315c52',
    fontSize: 18,
    fontWeight: '800',
  },
  profilePanel: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 22,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#dbe9e3',
    borderRadius: 8,
    height: 74,
    justifyContent: 'center',
    marginBottom: 12,
    width: 74,
  },
  profileName: {
    color: '#16302b',
    fontSize: 24,
    fontWeight: '800',
  },
  preferenceRow: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
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
  tabBar: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderTopColor: '#e2e0d9',
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'space-between',
    left: 0,
    paddingBottom: 22,
    paddingHorizontal: 10,
    paddingTop: 10,
    position: 'absolute',
    right: 0,
  },
  tabItem: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    minHeight: 58,
    justifyContent: 'center',
  },
  activeTabItem: {
    backgroundColor: '#dbe9e3',
  },
  tabLabel: {
    color: '#6f7975',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 5,
  },
  activeTabLabel: {
    color: '#16302b',
  },
});
