import { useState } from 'react';

import { AppShell } from './src/components/AppShell';
import { usePersistentAppData } from './src/hooks/usePersistentAppData';
import { DietScreen } from './src/screens/DietScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { ProgressScreen } from './src/screens/ProgressScreen';
import { TodayScreen } from './src/screens/TodayScreen';
import { TrainingScreen } from './src/screens/TrainingScreen';
import type { TabKey } from './src/types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('today');
  const { data, isLoaded, setData } = usePersistentAppData();

  return (
    <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'today' && (
        <TodayScreen
          foods={data.foods}
          meals={data.meals}
          profile={data.profile}
          workoutDays={data.workoutDays}
          workoutHistory={data.workoutHistory}
        />
      )}
      {activeTab === 'training' && (
        <TrainingScreen
          profile={data.profile}
          workoutDays={data.workoutDays}
          workoutHistory={data.workoutHistory}
          onWorkoutDaysChange={(workoutDays) => setData((current) => ({ ...current, workoutDays }))}
          onWorkoutHistoryChange={(workoutHistory) =>
            setData((current) => ({ ...current, workoutHistory }))
          }
        />
      )}
      {activeTab === 'diet' && (
        <DietScreen
          foods={data.foods}
          isLoaded={isLoaded}
          meals={data.meals}
          profile={data.profile}
          onFoodsChange={(foods) => setData((current) => ({ ...current, foods }))}
          onMealsChange={(meals) => setData((current) => ({ ...current, meals }))}
        />
      )}
      {activeTab === 'progress' && (
        <ProgressScreen
          foods={data.foods}
          bodyMetrics={data.bodyMetrics}
          meals={data.meals}
          onBodyMetricsChange={(bodyMetrics) => setData((current) => ({ ...current, bodyMetrics }))}
          profile={data.profile}
          workoutHistory={data.workoutHistory}
        />
      )}
      {activeTab === 'profile' && (
        <ProfileScreen
          bodyMetrics={data.bodyMetrics}
          onProfileChange={(profile) => setData((current) => ({ ...current, profile }))}
          onResetData={() =>
            setData((current) => ({
              ...current,
              bodyMetrics: [],
              workoutHistory: [],
            }))
          }
          profile={data.profile}
        />
      )}
    </AppShell>
  );
}
