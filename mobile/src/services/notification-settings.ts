import AsyncStorage from '@react-native-async-storage/async-storage';

import type { PrayerKey } from '@/types/prayer';

const SETTINGS_KEY = '@mihrab/notification-settings';

export const REMINDER_OFFSETS = [60, 45, 15, 0] as const;
export type ReminderOffset = (typeof REMINDER_OFFSETS)[number];

export type PrayerNotificationSetting = {
  enabled: boolean;
  soundEnabled: boolean;
  reminders: ReminderOffset[];
};

export type NotificationSettings = {
  enabled: boolean;
  prayers: Record<PrayerKey, PrayerNotificationSetting>;
};

export type NotificationPermissionState = 'granted' | 'denied' | 'undetermined' | 'unsupported';

export type NotificationScheduleSummary = {
  count: number;
  scheduledUntil: string | null;
  updatedAt: string | null;
};

const PRAYER_KEYS: PrayerKey[] = ['imsak', 'gunes', 'ogle', 'ikindi', 'aksam', 'yatsi'];

function createPrayerSetting(): PrayerNotificationSetting {
  return {
    enabled: true,
    soundEnabled: false,
    reminders: [...REMINDER_OFFSETS],
  };
}

export function createDefaultNotificationSettings(): NotificationSettings {
  return {
    enabled: false,
    prayers: {
      imsak: createPrayerSetting(),
      gunes: createPrayerSetting(),
      ogle: createPrayerSetting(),
      ikindi: createPrayerSetting(),
      aksam: createPrayerSetting(),
      yatsi: createPrayerSetting(),
    },
  };
}

function sanitizePrayerSetting(value: unknown): PrayerNotificationSetting {
  const fallback = createPrayerSetting();
  if (!value || typeof value !== 'object') {
    return fallback;
  }

  const candidate = value as Partial<PrayerNotificationSetting>;
  const reminders = Array.isArray(candidate.reminders)
    ? candidate.reminders.filter((offset): offset is ReminderOffset =>
        REMINDER_OFFSETS.includes(offset as ReminderOffset),
      )
    : fallback.reminders;

  return {
    enabled: candidate.enabled !== false,
    soundEnabled: candidate.soundEnabled === true,
    reminders: [...new Set(reminders)].sort((left, right) => right - left),
  };
}

export async function loadNotificationSettings(): Promise<NotificationSettings> {
  const fallback = createDefaultNotificationSettings();
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<NotificationSettings>;
    return {
      enabled: parsed.enabled === true,
      prayers: Object.fromEntries(
        PRAYER_KEYS.map((key) => [key, sanitizePrayerSetting(parsed.prayers?.[key])]),
      ) as Record<PrayerKey, PrayerNotificationSetting>,
    };
  } catch {
    await AsyncStorage.removeItem(SETTINGS_KEY);
    return fallback;
  }
}

export async function saveNotificationSettings(settings: NotificationSettings) {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
