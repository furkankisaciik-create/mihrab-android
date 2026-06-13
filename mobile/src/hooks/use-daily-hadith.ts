import { useCallback, useEffect, useState } from 'react';

import { getIstanbulDateKey, getNextDateKey } from '@/services/daily-content-date';
import { loadDailyHadith, saveDailyHadith } from '@/services/daily-hadith-cache';
import {
  fetchDailyHadith,
  fetchDailyHadiths,
  getFallbackDailyHadith,
} from '@/services/daily-hadith';
import type { DisplayedDailyHadith } from '@/types/hadith';

type DailyHadithState = {
  hadith: DisplayedDailyHadith | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  notice: string | null;
};

function getMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Günlük hadis alınamadı.';
}

async function prefetchUpcomingHadiths(dateKey: string) {
  const missingDateKeys: string[] = [];

  for (let offset = 1; offset <= 7; offset += 1) {
    const upcomingDateKey = getNextDateKey(dateKey, offset);
    const cached = await loadDailyHadith(upcomingDateKey);
    if (!cached) {
      missingDateKeys.push(upcomingDateKey);
    }
  }

  if (!missingDateKeys.length) {
    return;
  }

  try {
    const hadiths = await fetchDailyHadiths(missingDateKeys);
    for (const hadith of hadiths) {
      await saveDailyHadith(hadith);
    }
  } catch {
    // Today's content remains usable even if background prefetch fails.
  }
}

export function useDailyHadith() {
  const [dateKey, setDateKey] = useState(getIstanbulDateKey);
  const [state, setState] = useState<DailyHadithState>({
    hadith: null,
    loading: true,
    refreshing: false,
    error: null,
    notice: null,
  });

  const load = useCallback(async (forceRefresh = false) => {
    setState((current) => ({
      ...current,
      hadith: current.hadith?.dateKey === dateKey ? current.hadith : null,
      loading: current.hadith?.dateKey !== dateKey,
      refreshing:
        forceRefresh && current.hadith?.dateKey === dateKey && Boolean(current.hadith),
      error: null,
      notice: null,
    }));

    if (!forceRefresh) {
      const cached = await loadDailyHadith(dateKey);
      if (cached) {
        setState({
          hadith: { ...cached, isCached: true },
          loading: false,
          refreshing: false,
          error: null,
          notice: null,
        });
        void prefetchUpcomingHadiths(dateKey);
        return;
      }
    }

    try {
      const hadith = await fetchDailyHadith(dateKey);
      await saveDailyHadith(hadith);
      setState({
        hadith,
        loading: false,
        refreshing: false,
        error: null,
        notice: null,
      });
      void prefetchUpcomingHadiths(dateKey);
    } catch (error) {
      setState((current) => ({
        hadith: current.hadith?.dateKey === dateKey ? current.hadith : {
          ...getFallbackDailyHadith(dateKey),
          isFallback: true,
        },
        loading: false,
        refreshing: false,
        error: current.hadith?.dateKey === dateKey ? getMessage(error) : null,
        notice: current.hadith?.dateKey === dateKey
          ? 'Bağlantı kurulamadı. Kayıtlı hadis gösterilmeye devam ediyor.'
          : 'Bağlantı kurulamadı. Uygulamadaki çevrimdışı hadis gösteriliyor.',
      }));
    }
  }, [dateKey]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const timer = setInterval(() => {
      const currentDateKey = getIstanbulDateKey();
      setDateKey((current) => current === currentDateKey ? current : currentDateKey);
    }, 60_000);

    return () => clearInterval(timer);
  }, []);

  return {
    ...state,
    dateKey,
    refresh: () => load(true),
  };
}
