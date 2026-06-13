import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import AppTabs from '@/components/app-tabs';
import { DhikrProvider } from '@/hooks/use-dhikr-counter';
import { DuaFavoritesProvider } from '@/hooks/use-dua-favorites';
import { PrayerTrackerProvider } from '@/hooks/use-prayer-tracker';
import { QadaTrackerProvider } from '@/hooks/use-qada-tracker';
import { QuranProgressProvider } from '@/hooks/use-quran-progress';
import { initializeNotificationRuntime } from '@/services/prayer-notifications';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    initializeNotificationRuntime().catch((error) => {
      console.warn('MIHRAB notification runtime could not start.', error);
    });
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <PrayerTrackerProvider>
        <QadaTrackerProvider>
          <DuaFavoritesProvider>
            <QuranProgressProvider>
              <DhikrProvider>
                <AppTabs />
              </DhikrProvider>
            </QuranProgressProvider>
          </DuaFavoritesProvider>
        </QadaTrackerProvider>
      </PrayerTrackerProvider>
    </ThemeProvider>
  );
}
