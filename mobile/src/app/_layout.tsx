import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

import AppTabs from '@/components/app-tabs';
import { initI18n } from '@/i18n';
import { DhikrProvider } from '@/hooks/use-dhikr-counter';
import { DuaFavoritesProvider } from '@/hooks/use-dua-favorites';
import { PrayerTrackerProvider } from '@/hooks/use-prayer-tracker';
import { QadaTrackerProvider } from '@/hooks/use-qada-tracker';
import { QuranProgressProvider } from '@/hooks/use-quran-progress';
import { initializeNotificationRuntime } from '@/services/prayer-notifications';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    initI18n()
      .catch((error) => {
        console.warn('MIHRAB i18n could not initialize.', error);
      })
      .finally(() => {
        setI18nReady(true);
      });
    initializeNotificationRuntime().catch((error) => {
      console.warn('MIHRAB notification runtime could not start.', error);
    });
  }, []);

  if (!i18nReady) return null;

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
