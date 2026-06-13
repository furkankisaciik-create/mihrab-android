import AsyncStorage from '@react-native-async-storage/async-storage';

import type { PrayerTimesSnapshot } from '@/types/prayer';

const SNAPSHOT_KEY = '@mihrab/prayer-times-snapshot';

export async function savePrayerSnapshot(snapshot: PrayerTimesSnapshot) {
  await AsyncStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
}

export async function loadPrayerSnapshot(): Promise<PrayerTimesSnapshot | null> {
  const raw = await AsyncStorage.getItem(SNAPSHOT_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PrayerTimesSnapshot;
  } catch {
    await AsyncStorage.removeItem(SNAPSHOT_KEY);
    return null;
  }
}
