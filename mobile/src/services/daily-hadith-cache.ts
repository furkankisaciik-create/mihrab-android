import AsyncStorage from '@react-native-async-storage/async-storage';

import type { DailyHadith } from '@/types/hadith';

const CACHE_KEY = '@mihrab/daily-hadiths-v1';
const MAX_CACHE_ENTRIES = 14;

type DailyHadithCache = Record<string, DailyHadith>;

let writeQueue = Promise.resolve();

async function loadCache(): Promise<DailyHadithCache> {
  const raw = await AsyncStorage.getItem(CACHE_KEY);
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as DailyHadithCache;
  } catch {
    await AsyncStorage.removeItem(CACHE_KEY);
    return {};
  }
}

export async function loadDailyHadith(dateKey: string) {
  const cache = await loadCache();
  return cache[dateKey] ?? null;
}

export async function saveDailyHadith(hadith: DailyHadith) {
  const operation = writeQueue.catch(() => undefined).then(async () => {
    const cache = await loadCache();
    cache[hadith.dateKey] = hadith;

    const entries = Object.entries(cache)
      .sort(([left], [right]) => right.localeCompare(left))
      .slice(0, MAX_CACHE_ENTRIES);

    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(entries)));
  });

  writeQueue = operation.catch(() => undefined);
  await operation;
}
