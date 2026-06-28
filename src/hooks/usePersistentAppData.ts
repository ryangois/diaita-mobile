import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import { foods, meals } from '../data/nutrition';
import { workoutDays } from '../data/training';
import type { AppData } from '../types';

const STORAGE_KEY = '@diaita/app-data/v1';

const initialData: AppData = {
  foods,
  meals,
  workoutDays,
  workoutHistory: [],
};

export function usePersistentAppData() {
  const [data, setData] = useState<AppData>(initialData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);

        if (stored && isMounted) {
          setData({ ...initialData, ...JSON.parse(stored) });
        }
      } finally {
        if (isMounted) {
          setIsLoaded(true);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, isLoaded]);

  function resetData() {
    setData(initialData);
    AsyncStorage.removeItem(STORAGE_KEY);
  }

  return {
    data,
    isLoaded,
    resetData,
    setData,
  };
}
