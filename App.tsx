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
      {activeTab === 'today' && <TodayScreen />}
      {activeTab === 'training' && (
        <TrainingScreen
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
          onFoodsChange={(foods) => setData((current) => ({ ...current, foods }))}
          onMealsChange={(meals) => setData((current) => ({ ...current, meals }))}
        />
      )}
      {activeTab === 'progress' && (
        <ProgressScreen
          foods={data.foods}
          meals={data.meals}
          workoutHistory={data.workoutHistory}
        />
      )}
      {activeTab === 'profile' && <ProfileScreen />}
    </AppShell>
  );
}
