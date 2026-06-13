import { useCallback, useEffect, useState } from 'react';

import { loadCachedQuranSurah, saveCachedQuranSurah } from '@/services/quran-cache';
import { fetchQuranSurah } from '@/services/quran';
import type { DisplayedQuranSurah } from '@/types/quran';

type QuranSurahState = {
  content: DisplayedQuranSurah | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  notice: string | null;
};

function getMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Sure içeriği alınamadı.';
}

export function useQuranSurah(surahNumber: number | null) {
  const [state, setState] = useState<QuranSurahState>({
    content: null,
    loading: false,
    refreshing: false,
    error: null,
    notice: null,
  });

  const load = useCallback(
    async (forceRefresh = false) => {
      if (!surahNumber) {
        setState({
          content: null,
          loading: false,
          refreshing: false,
          error: null,
          notice: null,
        });
        return;
      }

      setState((current) => ({
        ...current,
        content:
          current.content?.surah.number === surahNumber ? current.content : null,
        loading: current.content?.surah.number !== surahNumber,
        refreshing:
          forceRefresh && current.content?.surah.number === surahNumber,
        error: null,
        notice: null,
      }));

      if (!forceRefresh) {
        const cached = await loadCachedQuranSurah(surahNumber);
        if (cached) {
          setState({
            content: { ...cached, isCached: true },
            loading: false,
            refreshing: false,
            error: null,
            notice: 'Bu sure cihazdaki kayıtlı kopyadan açıldı.',
          });
          return;
        }
      }

      try {
        const content = await fetchQuranSurah(surahNumber);
        await saveCachedQuranSurah(content);
        setState({
          content,
          loading: false,
          refreshing: false,
          error: null,
          notice: null,
        });
      } catch (error) {
        const cached = await loadCachedQuranSurah(surahNumber);
        setState({
          content: cached ? { ...cached, isCached: true } : null,
          loading: false,
          refreshing: false,
          error: cached ? null : getMessage(error),
          notice: cached
            ? 'Bağlantı kurulamadı. Cihazdaki kayıtlı sure gösteriliyor.'
            : null,
        });
      }
    },
    [surahNumber],
  );

  useEffect(() => {
    void load();
  }, [load]);

  return {
    ...state,
    refresh: () => load(true),
  };
}
