import { Dumbbell, Home, LineChart, UserRound, Utensils } from 'lucide-react-native';

import type { TabItem } from '../types';

export const tabs: TabItem[] = [
  { key: 'today', label: 'Hoje', icon: Home },
  { key: 'training', label: 'Treino', icon: Dumbbell },
  { key: 'diet', label: 'Dieta', icon: Utensils },
  { key: 'progress', label: 'Progresso', icon: LineChart },
  { key: 'profile', label: 'Perfil', icon: UserRound },
];
