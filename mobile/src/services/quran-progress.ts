import AsyncStorage from '@react-native-async-storage/async-storage';

import { getQuranSurah } from '@/services/quran-metadata';
import type { QuranProgressState } from '@/types/quran';

const STORAGE_KEY = '@mihrab/quran-progress-v1';
const DEFAULT_FONT_SIZE = 28;

export function createDefaultQuranProgressState(): QuranProgressState {
  return {
    version: 1,
    lastRead: null,
    arabicFontSize: DEFAULT_FONT_SIZE,
    updatedAt: new Date().toISOString(),
  };
}

export function sanitizeQuranProgressState(value: unknown): QuranProgressState {
  const fallback = createDefaultQuranProgressState();
  if (!value || typeof value !== 'object') {
    return fallback;
  }

  const candidate = value as Partial<QuranProgressState>;
  const lastReadCandidate = candidate.lastRead;
  const surah =
    lastReadCandidate && typeof lastReadCandidate.surahNumber === 'number'
      ? getQuranSurah(lastReadCandidate.surahNumber)
      : null;
  const verseNumber = Math.floor(Number(lastReadCandidate?.verseNumber));
  const lastRead =
    surah && verseNumber >= 1 && verseNumber <= surah.verseCount
      ? {
          surahNumber: surah.number,
          verseNumber,
          updatedAt:
            typeof lastReadCandidate?.updatedAt === 'string'
              ? lastReadCandidate.updatedAt
              : new Date().toISOString(),
        }
      : null;
  const fontSize = Math.round(Number(candidate.arabicFontSize));

  return {
    version: 1,
    lastRead,
    arabicFontSize:
      Number.isFinite(fontSize) && fontSize >= 22 && fontSize <= 40
        ? fontSize
        : DEFAULT_FONT_SIZE,
    updatedAt:
      typeof candidate.updatedAt === 'string' ? candidate.updatedAt : new Date().toISOString(),
  };
}

export function setQuranLastRead(
  state: QuranProgressState,
  surahNumber: number,
  verseNumber: number,
) {
  const surah = getQuranSurah(surahNumber);
  if (!surah || verseNumber < 1 || verseNumber > surah.verseCount) {
    return state;
  }
  const updatedAt = new Date().toISOString();
  return {
    ...state,
    lastRead: { surahNumber, verseNumber, updatedAt },
    updatedAt,
  };
}

export function setQuranArabicFontSize(state: QuranProgressState, fontSize: number) {
  const next = Math.min(40, Math.max(22, Math.round(fontSize)));
  if (next === state.arabicFontSize) {
    return state;
  }
  return { ...state, arabicFontSize: next, updatedAt: new Date().toISOString() };
}

export async function loadQuranProgressState() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createDefaultQuranProgressState();
  }
  try {
    return sanitizeQuranProgressState(JSON.parse(raw));
  } catch {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return createDefaultQuranProgressState();
  }
}

export async function saveQuranProgressState(state: QuranProgressState) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
