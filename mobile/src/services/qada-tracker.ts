import AsyncStorage from '@react-native-async-storage/async-storage';

import { getIstanbulDateKey, getNextDateKey } from '@/services/daily-content-date';
import type {
  QadaActivity,
  QadaPrayer,
  QadaPrayerKey,
  QadaTrackerState,
} from '@/types/qada';

const STORAGE_KEY = '@mihrab/qada-tracker-v1';
const MAX_COUNT = 1_000_000;
const MAX_ACTIVITY_HISTORY = 500;
const DEFAULT_DAILY_TARGET = 3;

export const QADA_PRAYERS: QadaPrayer[] = [
  { key: 'sabah', name: 'Sabah', detail: '2 rekât farz', symbol: 'S' },
  { key: 'ogle', name: 'Öğle', detail: '4 rekât farz', symbol: 'Ö' },
  { key: 'ikindi', name: 'İkindi', detail: '4 rekât farz', symbol: 'İ' },
  { key: 'aksam', name: 'Akşam', detail: '3 rekât farz', symbol: 'A' },
  { key: 'yatsi', name: 'Yatsı', detail: '4 rekât farz', symbol: 'Y' },
  { key: 'vitir', name: 'Vitir', detail: '3 rekât vacip', symbol: 'V' },
];

const QADA_KEYS = QADA_PRAYERS.map((prayer) => prayer.key);

function emptyCounts(): Record<QadaPrayerKey, number> {
  return {
    sabah: 0,
    ogle: 0,
    ikindi: 0,
    aksam: 0,
    yatsi: 0,
    vitir: 0,
  };
}

function sanitizeCount(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0;
  }
  return Math.min(MAX_COUNT, Math.max(0, Math.floor(value)));
}

function sanitizeCounts(value: unknown) {
  const candidate = value && typeof value === 'object'
    ? value as Partial<Record<QadaPrayerKey, unknown>>
    : {};

  return Object.fromEntries(
    QADA_KEYS.map((key) => [key, sanitizeCount(candidate[key])]),
  ) as Record<QadaPrayerKey, number>;
}

function isQadaKey(value: unknown): value is QadaPrayerKey {
  return typeof value === 'string' && QADA_KEYS.includes(value as QadaPrayerKey);
}

function sanitizeActivity(value: unknown): QadaActivity | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Partial<QadaActivity>;
  const type = candidate.type;
  const validType =
    type === 'completed' ||
    type === 'added' ||
    type === 'adjusted';

  if (
    typeof candidate.id !== 'string' ||
    !validType ||
    !isQadaKey(candidate.prayerKey) ||
    typeof candidate.occurredAt !== 'string' ||
    Number.isNaN(Date.parse(candidate.occurredAt))
  ) {
    return null;
  }

  return {
    id: candidate.id,
    type,
    prayerKey: candidate.prayerKey,
    quantity: sanitizeCount(candidate.quantity),
    previousRemaining:
      type === 'adjusted'
        ? sanitizeCount(candidate.previousRemaining)
        : undefined,
    occurredAt: candidate.occurredAt,
  };
}

function createActivity(
  type: QadaActivity['type'],
  prayerKey: QadaPrayerKey,
  quantity: number,
  previousRemaining?: number,
): QadaActivity {
  const occurredAt = new Date().toISOString();
  return {
    id: `${occurredAt}-${prayerKey}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    prayerKey,
    quantity,
    previousRemaining,
    occurredAt,
  };
}

function addActivity(state: QadaTrackerState, activity: QadaActivity) {
  return [activity, ...state.activities].slice(0, MAX_ACTIVITY_HISTORY);
}

export function createDefaultQadaTrackerState(): QadaTrackerState {
  return {
    version: 1,
    remaining: emptyCounts(),
    completed: emptyCounts(),
    dailyTarget: DEFAULT_DAILY_TARGET,
    activities: [],
    updatedAt: new Date().toISOString(),
  };
}

export function sanitizeQadaTrackerState(value: unknown): QadaTrackerState {
  if (!value || typeof value !== 'object') {
    return createDefaultQadaTrackerState();
  }

  const candidate = value as Partial<QadaTrackerState>;
  const activities = Array.isArray(candidate.activities)
    ? candidate.activities
        .map(sanitizeActivity)
        .filter((activity): activity is QadaActivity => Boolean(activity))
        .slice(0, MAX_ACTIVITY_HISTORY)
    : [];

  return {
    version: 1,
    remaining: sanitizeCounts(candidate.remaining),
    completed: sanitizeCounts(candidate.completed),
    dailyTarget: Math.min(50, Math.max(1, sanitizeCount(candidate.dailyTarget) || DEFAULT_DAILY_TARGET)),
    activities,
    updatedAt:
      typeof candidate.updatedAt === 'string' && !Number.isNaN(Date.parse(candidate.updatedAt))
        ? candidate.updatedAt
        : new Date().toISOString(),
  };
}

export function recordQadaCompleted(
  state: QadaTrackerState,
  prayerKey: QadaPrayerKey,
  quantity = 1,
) {
  const requested = Math.max(1, sanitizeCount(quantity));
  const completedQuantity = Math.min(state.remaining[prayerKey], requested);
  if (!completedQuantity) {
    return state;
  }

  return {
    ...state,
    remaining: {
      ...state.remaining,
      [prayerKey]: state.remaining[prayerKey] - completedQuantity,
    },
    completed: {
      ...state.completed,
      [prayerKey]: Math.min(MAX_COUNT, state.completed[prayerKey] + completedQuantity),
    },
    activities: addActivity(
      state,
      createActivity('completed', prayerKey, completedQuantity),
    ),
    updatedAt: new Date().toISOString(),
  };
}

export function addQadaDebt(
  state: QadaTrackerState,
  prayerKey: QadaPrayerKey,
  quantity = 1,
) {
  const addedQuantity = Math.max(1, sanitizeCount(quantity));
  const nextRemaining = Math.min(MAX_COUNT, state.remaining[prayerKey] + addedQuantity);
  const appliedQuantity = nextRemaining - state.remaining[prayerKey];
  if (!appliedQuantity) {
    return state;
  }

  return {
    ...state,
    remaining: {
      ...state.remaining,
      [prayerKey]: nextRemaining,
    },
    activities: addActivity(
      state,
      createActivity('added', prayerKey, appliedQuantity),
    ),
    updatedAt: new Date().toISOString(),
  };
}

export function setQadaBalance(
  state: QadaTrackerState,
  prayerKey: QadaPrayerKey,
  value: number,
) {
  const nextRemaining = sanitizeCount(value);
  const previousRemaining = state.remaining[prayerKey];
  if (nextRemaining === previousRemaining) {
    return state;
  }

  return {
    ...state,
    remaining: {
      ...state.remaining,
      [prayerKey]: nextRemaining,
    },
    activities: addActivity(
      state,
      createActivity('adjusted', prayerKey, nextRemaining, previousRemaining),
    ),
    updatedAt: new Date().toISOString(),
  };
}

export function setQadaDailyTarget(state: QadaTrackerState, target: number) {
  const dailyTarget = Math.min(50, Math.max(1, sanitizeCount(target)));
  if (dailyTarget === state.dailyTarget) {
    return state;
  }
  return {
    ...state,
    dailyTarget,
    updatedAt: new Date().toISOString(),
  };
}

export function undoLatestQadaActivity(state: QadaTrackerState) {
  const [latest, ...activities] = state.activities;
  if (!latest) {
    return state;
  }

  const remaining = { ...state.remaining };
  const completed = { ...state.completed };

  if (latest.type === 'completed') {
    remaining[latest.prayerKey] = Math.min(
      MAX_COUNT,
      remaining[latest.prayerKey] + latest.quantity,
    );
    completed[latest.prayerKey] = Math.max(
      0,
      completed[latest.prayerKey] - latest.quantity,
    );
  } else if (latest.type === 'added') {
    remaining[latest.prayerKey] = Math.max(
      0,
      remaining[latest.prayerKey] - latest.quantity,
    );
  } else {
    remaining[latest.prayerKey] = latest.previousRemaining ?? 0;
  }

  return {
    ...state,
    remaining,
    completed,
    activities,
    updatedAt: new Date().toISOString(),
  };
}

export function getQadaTrackerSummary(state: QadaTrackerState) {
  const todayKey = getIstanbulDateKey();
  const completedActivities = state.activities.filter(
    (activity) => activity.type === 'completed',
  );
  const todayCompleted = completedActivities
    .filter((activity) => getIstanbulDateKey(new Date(activity.occurredAt)) === todayKey)
    .reduce((total, activity) => total + activity.quantity, 0);
  const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
    const dateKey = getNextDateKey(todayKey, index - 6);
    const completed = completedActivities
      .filter((activity) => getIstanbulDateKey(new Date(activity.occurredAt)) === dateKey)
      .reduce((total, activity) => total + activity.quantity, 0);
    return { dateKey, completed };
  });

  return {
    totalRemaining: QADA_KEYS.reduce((total, key) => total + state.remaining[key], 0),
    totalCompleted: QADA_KEYS.reduce((total, key) => total + state.completed[key], 0),
    todayCompleted,
    dailyTarget: state.dailyTarget,
    targetProgress: Math.min(100, (todayCompleted / state.dailyTarget) * 100),
    lastSevenDays,
    lastSevenCompleted: lastSevenDays.reduce((total, day) => total + day.completed, 0),
  };
}

export async function loadQadaTrackerState() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createDefaultQadaTrackerState();
  }

  try {
    const state = sanitizeQadaTrackerState(JSON.parse(raw));
    const normalized = JSON.stringify(state);
    if (normalized !== raw) {
      await AsyncStorage.setItem(STORAGE_KEY, normalized);
    }
    return state;
  } catch {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return createDefaultQadaTrackerState();
  }
}

export async function saveQadaTrackerState(state: QadaTrackerState) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
