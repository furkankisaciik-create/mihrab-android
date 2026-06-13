import { useCallback, useEffect, useState } from 'react';

import { loadDailyVerse, saveDailyVerse } from '@/services/daily-verse-cache';
import {
  fetchDailyVerse,
  getFallbackDailyVerse,
  getIstanbulDateKey,
  getNextDateKey,
} from '@/services/daily-verse';
import type { DisplayedDailyVerse } from '@/types/verse';

type DailyVerseState = {
  verse: DisplayedDailyVerse | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  notice: string | null;
};

function getMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Günlük ayet alınamadı.';
}

async function prefetchUpcomingVerses(dateKey: string) {
  for (let offset = 1; offset <= 7; offset += 1) {
    const upcomingDateKey = getNextDateKey(dateKey, offset);
    const cached = await loadDailyVerse(upcomingDateKey);
    if (cached) {
      continue;
    }

    try {
      const verse = await fetchDailyVerse(upcomingDateKey);
      await saveDailyVerse(verse);
    } catch {
      return;
    }
  }
}

export function useDailyVerse() {
  const [dateKey, setDateKey] = useState(getIstanbulDateKey);
  const [state, setState] = useState<DailyVerseState>({
    verse: null,
    loading: true,
    refreshing: false,
    error: null,
    notice: null,
  });

  const load = useCallback(async (forceRefresh = false) => {
    setState((current) => ({
      ...current,
      verse: current.verse?.dateKey === dateKey ? current.verse : null,
      loading: current.verse?.dateKey !== dateKey,
      refreshing:
        forceRefresh && current.verse?.dateKey === dateKey && Boolean(current.verse),
      error: null,
      notice: null,
    }));

    if (!forceRefresh) {
      const cached = await loadDailyVerse(dateKey);
      if (cached) {
        setState({
          verse: { ...cached, isCached: true },
          loading: false,
          refreshing: false,
          error: null,
          notice: null,
        });
        void prefetchUpcomingVerses(dateKey);
        return;
      }
    }

    try {
      const verse = await fetchDailyVerse(dateKey);
      await saveDailyVerse(verse);
      setState({
        verse,
        loading: false,
        refreshing: false,
        error: null,
        notice: null,
      });
      void prefetchUpcomingVerses(dateKey);
    } catch (error) {
      setState((current) => ({
        verse: current.verse?.dateKey === dateKey ? current.verse : {
          ...getFallbackDailyVerse(dateKey),
          isFallback: true,
        },
        loading: false,
        refreshing: false,
        error: current.verse?.dateKey === dateKey ? getMessage(error) : null,
        notice: current.verse?.dateKey === dateKey
          ? 'Bağlantı kurulamadı. Kayıtlı ayet gösterilmeye devam ediyor.'
          : 'Bağlantı kurulamadı. Uygulamadaki çevrimdışı ayet gösteriliyor.',
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
