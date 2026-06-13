import AsyncStorage from '@react-native-async-storage/async-storage';

import type { NearbyMosquesSnapshot } from '@/types/mosque';

const CACHE_KEY = '@mihrab/nearby-mosques-v1';

export async function loadNearbyMosquesCache(): Promise<NearbyMosquesSnapshot | null> {
  const raw = await AsyncStorage.getItem(CACHE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return {
      ...(JSON.parse(raw) as NearbyMosquesSnapshot),
      isCached: true,
    };
  } catch {
    await AsyncStorage.removeItem(CACHE_KEY);
    return null;
  }
}

export async function saveNearbyMosquesCache(snapshot: NearbyMosquesSnapshot) {
  await AsyncStorage.setItem(
    CACHE_KEY,
    JSON.stringify({ ...snapshot, isCached: false }),
  );
}
