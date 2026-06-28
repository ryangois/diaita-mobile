import { useState } from 'react';

import { AppShell } from './src/components/AppShell';
import { DietScreen } from './src/screens/DietScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { ProgressScreen } from './src/screens/ProgressScreen';
import { TodayScreen } from './src/screens/TodayScreen';
import { TrainingScreen } from './src/screens/TrainingScreen';
import type { TabKey } from './src/types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('today');

  return (
    <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'today' && <TodayScreen />}
      {activeTab === 'training' && <TrainingScreen />}
      {activeTab === 'diet' && <DietScreen />}
      {activeTab === 'progress' && <ProgressScreen />}
      {activeTab === 'profile' && <ProfileScreen />}
    </AppShell>
  );
}
