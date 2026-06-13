import AsyncStorage from '@react-native-async-storage/async-storage';

import type { DailyVerse } from '@/types/verse';

const CACHE_KEY = '@mihrab/daily-verses-v1';
const MAX_CACHE_ENTRIES = 14;

type DailyVerseCache = Record<string, DailyVerse>;

let writeQueue = Promise.resolve();

async function loadCache(): Promise<DailyVerseCache> {
  const raw = await AsyncStorage.getItem(CACHE_KEY);
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as DailyVerseCache;
  } catch {
    await AsyncStorage.removeItem(CACHE_KEY);
    return {};
  }
}

export async function loadDailyVerse(dateKey: string) {
  const cache = await loadCache();
  return cache[dateKey] ?? null;
}

export async function saveDailyVerse(verse: DailyVerse) {
  const operation = writeQueue.catch(() => undefined).then(async () => {
    const cache = await loadCache();
    cache[verse.dateKey] = verse;

    const entries = Object.entries(cache)
      .sort(([left], [right]) => right.localeCompare(left))
      .slice(0, MAX_CACHE_ENTRIES);

    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(entries)));
  });

  writeQueue = operation.catch(() => undefined);
  await operation;
}
