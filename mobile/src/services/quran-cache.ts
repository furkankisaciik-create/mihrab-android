import AsyncStorage from '@react-native-async-storage/async-storage';

import type { QuranSurahContent } from '@/types/quran';

const CACHE_KEY = '@mihrab/quran-surahs-v1';
const MAX_CACHED_SURAHS = 8;

type QuranCache = Record<string, QuranSurahContent>;
let writeQueue = Promise.resolve();

async function loadCache(): Promise<QuranCache> {
  const raw = await AsyncStorage.getItem(CACHE_KEY);
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as QuranCache;
  } catch {
    await AsyncStorage.removeItem(CACHE_KEY);
    return {};
  }
}

export async function loadCachedQuranSurah(surahNumber: number) {
  const cache = await loadCache();
  return cache[String(surahNumber)] ?? null;
}

export async function saveCachedQuranSurah(content: QuranSurahContent) {
  const operation = writeQueue.catch(() => undefined).then(async () => {
    const cache = await loadCache();
    cache[String(content.surah.number)] = content;
    const entries = Object.entries(cache)
      .sort(([, left], [, right]) => right.fetchedAt.localeCompare(left.fetchedAt))
      .slice(0, MAX_CACHED_SURAHS);
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(entries)));
  });

  writeQueue = operation.catch(() => undefined);
  await operation;
}
