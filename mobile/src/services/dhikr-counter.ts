import AsyncStorage from '@react-native-async-storage/async-storage';

import { getIstanbulDateKey, getNextDateKey } from '@/services/daily-content-date';
import type {
  DhikrDailyStats,
  DhikrKey,
  DhikrPreset,
  DhikrSession,
  DhikrState,
} from '@/types/dhikr';

const STORAGE_KEY = '@mihrab/dhikr-counter-v1';
const MAX_HISTORY_DAYS = 30;
const MAX_TARGET = 9999;

export const DHIKR_PRESETS: DhikrPreset[] = [
  {
    key: 'subhanallah',
    title: 'Sübhanallah',
    arabic: 'سُبْحَانَ اللّٰهِ',
    meaning: 'Allah’ı her türlü eksiklikten tenzih ederim.',
    defaultTarget: 33,
  },
  {
    key: 'alhamdulillah',
    title: 'Elhamdülillah',
    arabic: 'الْحَمْدُ لِلّٰهِ',
    meaning: 'Hamd Allah’a mahsustur.',
    defaultTarget: 33,
  },
  {
    key: 'allahu-akbar',
    title: 'Allahu ekber',
    arabic: 'اَللّٰهُ أَكْبَرُ',
    meaning: 'Allah en büyüktür.',
    defaultTarget: 33,
  },
  {
    key: 'la-ilaha-illallah',
    title: 'Lâ ilâhe illallah',
    arabic: 'لَا إِلٰهَ إِلَّا اللّٰهُ',
    meaning: 'Allah’tan başka ilâh yoktur.',
    defaultTarget: 100,
  },
  {
    key: 'astaghfirullah',
    title: 'Estağfirullah',
    arabic: 'أَسْتَغْفِرُ اللّٰهَ',
    meaning: 'Allah’tan bağışlanma dilerim.',
    defaultTarget: 100,
  },
  {
    key: 'salawat',
    title: 'Salavat',
    arabic: 'اَللّٰهُمَّ صَلِّ عَلَى مُحَمَّدٍ',
    meaning: 'Allah’ım, Muhammed’e salât eyle.',
    defaultTarget: 100,
  },
];

export const DHIKR_TARGET_OPTIONS = [33, 99, 100] as const;

const DHIKR_KEYS = DHIKR_PRESETS.map((preset) => preset.key);

function createSessions(): Record<DhikrKey, DhikrSession> {
  return Object.fromEntries(
    DHIKR_PRESETS.map((preset) => [
      preset.key,
      { count: 0, target: preset.defaultTarget },
    ]),
  ) as Record<DhikrKey, DhikrSession>;
}

function emptyDailyStats(): DhikrDailyStats {
  return {
    total: 0,
    completedRounds: 0,
    byDhikr: {},
  };
}

export function createDefaultDhikrState(dateKey = getIstanbulDateKey()): DhikrState {
  return {
    version: 1,
    currentDateKey: dateKey,
    selectedKey: 'subhanallah',
    hapticsEnabled: true,
    sessions: createSessions(),
    daily: { [dateKey]: emptyDailyStats() },
    updatedAt: new Date().toISOString(),
  };
}

function sanitizeTarget(value: unknown, fallback: number) {
  const target = Math.round(Number(value));
  return Number.isFinite(target) && target >= 1 && target <= MAX_TARGET ? target : fallback;
}

function sanitizeCount(value: unknown) {
  const count = Math.floor(Number(value));
  return Number.isFinite(count) && count >= 0 ? count : 0;
}

function sanitizeDailyStats(value: unknown): DhikrDailyStats {
  if (!value || typeof value !== 'object') {
    return emptyDailyStats();
  }

  const candidate = value as Partial<DhikrDailyStats>;
  const byDhikr = Object.fromEntries(
    DHIKR_KEYS.map((key) => [
      key,
      sanitizeCount(candidate.byDhikr?.[key]),
    ]).filter(([, count]) => Number(count) > 0),
  ) as Partial<Record<DhikrKey, number>>;

  return {
    total: sanitizeCount(candidate.total),
    completedRounds: sanitizeCount(candidate.completedRounds),
    byDhikr,
  };
}

function pruneDailyHistory(daily: Record<string, DhikrDailyStats>) {
  return Object.fromEntries(
    Object.entries(daily)
      .sort(([left], [right]) => right.localeCompare(left))
      .slice(0, MAX_HISTORY_DAYS),
  );
}

export function ensureDhikrDate(state: DhikrState, dateKey = getIstanbulDateKey()): DhikrState {
  if (state.currentDateKey === dateKey && state.daily[dateKey]) {
    return state;
  }

  return {
    ...state,
    currentDateKey: dateKey,
    sessions: Object.fromEntries(
      DHIKR_KEYS.map((key) => [key, { ...state.sessions[key], count: 0 }]),
    ) as Record<DhikrKey, DhikrSession>,
    daily: pruneDailyHistory({
      ...state.daily,
      [dateKey]: state.daily[dateKey] ?? emptyDailyStats(),
    }),
    updatedAt: new Date().toISOString(),
  };
}

export function sanitizeDhikrState(value: unknown, dateKey = getIstanbulDateKey()): DhikrState {
  const fallback = createDefaultDhikrState(dateKey);
  if (!value || typeof value !== 'object') {
    return fallback;
  }

  const candidate = value as Partial<DhikrState>;
  const selectedKey = DHIKR_KEYS.includes(candidate.selectedKey as DhikrKey)
    ? candidate.selectedKey as DhikrKey
    : fallback.selectedKey;
  const sessions = Object.fromEntries(
    DHIKR_PRESETS.map((preset) => [
      preset.key,
      {
        count: sanitizeCount(candidate.sessions?.[preset.key]?.count),
        target: sanitizeTarget(
          candidate.sessions?.[preset.key]?.target,
          preset.defaultTarget,
        ),
      },
    ]),
  ) as Record<DhikrKey, DhikrSession>;
  const daily = Object.fromEntries(
    Object.entries(candidate.daily ?? {}).map(([key, stats]) => [
      key,
      sanitizeDailyStats(stats),
    ]),
  );

  return ensureDhikrDate({
    version: 1,
    currentDateKey: candidate.currentDateKey ?? dateKey,
    selectedKey,
    hapticsEnabled: candidate.hapticsEnabled !== false,
    sessions,
    daily: pruneDailyHistory(daily),
    updatedAt: candidate.updatedAt ?? new Date().toISOString(),
  }, dateKey);
}

export function selectDhikr(state: DhikrState, key: DhikrKey) {
  return {
    ...state,
    selectedKey: key,
    updatedAt: new Date().toISOString(),
  };
}

export function setDhikrTarget(state: DhikrState, target: number) {
  const current = ensureDhikrDate(state);
  const selected = current.selectedKey;
  const safeTarget = sanitizeTarget(target, current.sessions[selected].target);
  if (safeTarget === current.sessions[selected].target) {
    return current;
  }

  return {
    ...current,
    sessions: {
      ...current.sessions,
      [selected]: {
        count: 0,
        target: safeTarget,
      },
    },
    updatedAt: new Date().toISOString(),
  };
}

export function setDhikrHaptics(state: DhikrState, enabled: boolean) {
  return {
    ...state,
    hapticsEnabled: enabled,
    updatedAt: new Date().toISOString(),
  };
}

export function incrementDhikr(state: DhikrState, dateKey = getIstanbulDateKey()) {
  const current = ensureDhikrDate(state, dateKey);
  const key = current.selectedKey;
  const session = current.sessions[key];
  const nextCount = session.count + 1;
  const completedTarget = session.count < session.target && nextCount >= session.target;
  const today = current.daily[dateKey] ?? emptyDailyStats();

  return {
    state: {
      ...current,
      sessions: {
        ...current.sessions,
        [key]: { ...session, count: nextCount },
      },
      daily: {
        ...current.daily,
        [dateKey]: {
          total: today.total + 1,
          completedRounds: today.completedRounds + (completedTarget ? 1 : 0),
          byDhikr: {
            ...today.byDhikr,
            [key]: (today.byDhikr[key] ?? 0) + 1,
          },
        },
      },
      updatedAt: new Date().toISOString(),
    } satisfies DhikrState,
    completedTarget,
  };
}

export function undoDhikr(state: DhikrState, dateKey = getIstanbulDateKey()) {
  const current = ensureDhikrDate(state, dateKey);
  const key = current.selectedKey;
  const session = current.sessions[key];
  if (session.count === 0) {
    return current;
  }

  const today = current.daily[dateKey] ?? emptyDailyStats();
  const crossedBelowTarget = session.count === session.target;

  return {
    ...current,
    sessions: {
      ...current.sessions,
      [key]: { ...session, count: session.count - 1 },
    },
    daily: {
      ...current.daily,
      [dateKey]: {
        total: Math.max(0, today.total - 1),
        completedRounds: Math.max(
          0,
          today.completedRounds - (crossedBelowTarget ? 1 : 0),
        ),
        byDhikr: {
          ...today.byDhikr,
          [key]: Math.max(0, (today.byDhikr[key] ?? 0) - 1),
        },
      },
    },
    updatedAt: new Date().toISOString(),
  };
}

export function resetDhikrSession(state: DhikrState) {
  const current = ensureDhikrDate(state);
  const key = current.selectedKey;

  return {
    ...current,
    sessions: {
      ...current.sessions,
      [key]: { ...current.sessions[key], count: 0 },
    },
    updatedAt: new Date().toISOString(),
  };
}

export function getDhikrSummary(state: DhikrState, dateKey = getIstanbulDateKey()) {
  const current = ensureDhikrDate(state, dateKey);
  const today = current.daily[dateKey] ?? emptyDailyStats();
  const lastSevenDates = Array.from({ length: 7 }, (_, index) =>
    getNextDateKey(dateKey, -index),
  );
  const lastSevenStats = lastSevenDates.map((key) => current.daily[key]).filter(Boolean);

  return {
    today,
    lastSevenTotal: lastSevenStats.reduce((total, stats) => total + stats.total, 0),
    activeDays: lastSevenStats.filter((stats) => stats.total > 0).length,
  };
}

export async function loadDhikrState() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createDefaultDhikrState();
  }

  try {
    return sanitizeDhikrState(JSON.parse(raw));
  } catch {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return createDefaultDhikrState();
  }
}

export async function saveDhikrState(state: DhikrState) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
