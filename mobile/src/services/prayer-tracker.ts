import AsyncStorage from '@react-native-async-storage/async-storage';

import { getIstanbulDateKey, getNextDateKey } from '@/services/daily-content-date';
import type {
  PrayerTrackerState,
  PrayerTrackingDay,
  TrackedPrayer,
  TrackedPrayerKey,
} from '@/types/prayer-tracker';

const STORAGE_KEY = '@mihrab/prayer-tracker-v1';
const MAX_HISTORY_DAYS = 365;

export const TRACKED_PRAYERS: TrackedPrayer[] = [
  { key: 'sabah', name: 'Sabah', scheduleKey: 'imsak', symbol: '☾' },
  { key: 'ogle', name: 'Öğle', scheduleKey: 'ogle', symbol: '◉' },
  { key: 'ikindi', name: 'İkindi', scheduleKey: 'ikindi', symbol: '◒' },
  { key: 'aksam', name: 'Akşam', scheduleKey: 'aksam', symbol: '◐' },
  { key: 'yatsi', name: 'Yatsı', scheduleKey: 'yatsi', symbol: '☽' },
];

const TRACKED_PRAYER_KEYS = TRACKED_PRAYERS.map((prayer) => prayer.key);

function emptyDay(): PrayerTrackingDay {
  return { prayers: {} };
}

function pruneDays(days: Record<string, PrayerTrackingDay>) {
  return Object.fromEntries(
    Object.entries(days)
      .sort(([left], [right]) => right.localeCompare(left))
      .slice(0, MAX_HISTORY_DAYS),
  );
}

function sanitizeDay(value: unknown): PrayerTrackingDay {
  if (!value || typeof value !== 'object') {
    return emptyDay();
  }

  const candidate = value as Partial<PrayerTrackingDay>;
  const prayers = Object.fromEntries(
    TRACKED_PRAYER_KEYS.flatMap((key) => {
      const completedAt = candidate.prayers?.[key]?.completedAt;
      return typeof completedAt === 'string' && !Number.isNaN(Date.parse(completedAt))
        ? [[key, { completedAt }]]
        : [];
    }),
  ) as PrayerTrackingDay['prayers'];

  return { prayers };
}

export function createDefaultPrayerTrackerState(
  dateKey = getIstanbulDateKey(),
): PrayerTrackerState {
  return {
    version: 1,
    currentDateKey: dateKey,
    days: { [dateKey]: emptyDay() },
    updatedAt: new Date().toISOString(),
  };
}

export function ensurePrayerTrackerDate(
  state: PrayerTrackerState,
  dateKey = getIstanbulDateKey(),
): PrayerTrackerState {
  if (state.currentDateKey === dateKey && state.days[dateKey]) {
    return state;
  }

  return {
    ...state,
    currentDateKey: dateKey,
    days: pruneDays({
      ...state.days,
      [dateKey]: state.days[dateKey] ?? emptyDay(),
    }),
    updatedAt: new Date().toISOString(),
  };
}

export function sanitizePrayerTrackerState(
  value: unknown,
  dateKey = getIstanbulDateKey(),
): PrayerTrackerState {
  if (!value || typeof value !== 'object') {
    return createDefaultPrayerTrackerState(dateKey);
  }

  const candidate = value as Partial<PrayerTrackerState>;
  const days = Object.fromEntries(
    Object.entries(candidate.days ?? {}).map(([key, day]) => [key, sanitizeDay(day)]),
  );

  return ensurePrayerTrackerDate(
    {
      version: 1,
      currentDateKey: candidate.currentDateKey ?? dateKey,
      days: pruneDays(days),
      updatedAt: candidate.updatedAt ?? new Date().toISOString(),
    },
    dateKey,
  );
}

export function toggleTrackedPrayer(
  state: PrayerTrackerState,
  prayerKey: TrackedPrayerKey,
  dateKey = getIstanbulDateKey(),
) {
  const current = ensurePrayerTrackerDate(state, dateKey);
  const day = current.days[dateKey] ?? emptyDay();
  const prayers = { ...day.prayers };
  const completed = Boolean(prayers[prayerKey]);

  if (completed) {
    delete prayers[prayerKey];
  } else {
    prayers[prayerKey] = { completedAt: new Date().toISOString() };
  }

  return {
    state: {
      ...current,
      days: {
        ...current.days,
        [dateKey]: { prayers },
      },
      updatedAt: new Date().toISOString(),
    } satisfies PrayerTrackerState,
    completed: !completed,
  };
}

export function getCompletedPrayerCount(day?: PrayerTrackingDay) {
  return TRACKED_PRAYER_KEYS.filter((key) => Boolean(day?.prayers[key])).length;
}

export function getPrayerTrackerSummary(
  state: PrayerTrackerState,
  dateKey = getIstanbulDateKey(),
) {
  const current = ensurePrayerTrackerDate(state, dateKey);
  const week = Array.from({ length: 7 }, (_, index) => {
    const key = getNextDateKey(dateKey, index - 6);
    return {
      dateKey: key,
      completed: getCompletedPrayerCount(current.days[key]),
    };
  });
  const todayCompleted = getCompletedPrayerCount(current.days[dateKey]);
  const lastSevenCompleted = week.reduce((total, day) => total + day.completed, 0);
  const fullDays = week.filter((day) => day.completed === TRACKED_PRAYERS.length).length;

  let streak = 0;
  let cursor =
    todayCompleted === TRACKED_PRAYERS.length ? dateKey : getNextDateKey(dateKey, -1);
  while (getCompletedPrayerCount(current.days[cursor]) === TRACKED_PRAYERS.length) {
    streak += 1;
    cursor = getNextDateKey(cursor, -1);
  }

  return {
    todayCompleted,
    lastSevenCompleted,
    fullDays,
    streak,
    week,
  };
}

export async function loadPrayerTrackerState() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createDefaultPrayerTrackerState();
  }

  try {
    const state = sanitizePrayerTrackerState(JSON.parse(raw));
    const normalized = JSON.stringify(state);
    if (normalized !== raw) {
      await AsyncStorage.setItem(STORAGE_KEY, normalized);
    }
    return state;
  } catch {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return createDefaultPrayerTrackerState();
  }
}

export async function savePrayerTrackerState(state: PrayerTrackerState) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
