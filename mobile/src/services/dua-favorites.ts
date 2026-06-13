import AsyncStorage from '@react-native-async-storage/async-storage';

import { DUAS } from '@/services/dua-library';
import type { DuaFavoritesState } from '@/types/dua-favorites';

const STORAGE_KEY = '@mihrab/dua-favorites-v1';
const VALID_DUA_IDS = new Set(DUAS.map((dua) => dua.id));

export function createDefaultDuaFavoritesState(): DuaFavoritesState {
  return {
    version: 1,
    ids: [],
    updatedAt: new Date().toISOString(),
  };
}

export function sanitizeDuaFavoritesState(value: unknown): DuaFavoritesState {
  if (!value || typeof value !== 'object') {
    return createDefaultDuaFavoritesState();
  }

  const candidate = value as Partial<DuaFavoritesState>;
  const ids = Array.isArray(candidate.ids)
    ? [
        ...new Set(
          candidate.ids.filter(
            (id): id is string => typeof id === 'string' && VALID_DUA_IDS.has(id),
          ),
        ),
      ]
    : [];

  return {
    version: 1,
    ids,
    updatedAt:
      typeof candidate.updatedAt === 'string' && !Number.isNaN(Date.parse(candidate.updatedAt))
        ? candidate.updatedAt
        : new Date().toISOString(),
  };
}

export function toggleDuaFavorite(state: DuaFavoritesState, id: string) {
  if (!VALID_DUA_IDS.has(id)) {
    return state;
  }

  const favorite = state.ids.includes(id);
  return {
    ...state,
    ids: favorite
      ? state.ids.filter((favoriteId) => favoriteId !== id)
      : [...state.ids, id],
    updatedAt: new Date().toISOString(),
  };
}

export async function loadDuaFavoritesState() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createDefaultDuaFavoritesState();
  }

  try {
    const state = sanitizeDuaFavoritesState(JSON.parse(raw));
    const normalized = JSON.stringify(state);
    if (normalized !== raw) {
      await AsyncStorage.setItem(STORAGE_KEY, normalized);
    }
    return state;
  } catch {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return createDefaultDuaFavoritesState();
  }
}

export async function saveDuaFavoritesState(state: DuaFavoritesState) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
