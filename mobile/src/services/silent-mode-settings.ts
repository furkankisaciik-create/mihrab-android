import AsyncStorage from '@react-native-async-storage/async-storage';

import type { PrayerKey } from '@/types/prayer';
import type {
  SilentModePrayerSetting,
  SilentModeSettings,
} from '@/types/silent-mode';

const SETTINGS_KEY = '@mihrab/silent-mode-settings-v1';

export const SILENT_START_OPTIONS = [0, 5, 10, 15] as const;
export const SILENT_END_OPTIONS = [15, 20, 30, 45, 60] as const;

const PRAYER_KEYS: PrayerKey[] = [
  'imsak',
  'gunes',
  'ogle',
  'ikindi',
  'aksam',
  'yatsi',
];

function prayerSetting(enabled: boolean): SilentModePrayerSetting {
  return { enabled };
}

export function createDefaultSilentModeSettings(): SilentModeSettings {
  return {
    enabled: false,
    remindersEnabled: true,
    startBeforeMinutes: 5,
    endAfterMinutes: 30,
    prayers: {
      imsak: prayerSetting(true),
      gunes: prayerSetting(false),
      ogle: prayerSetting(true),
      ikindi: prayerSetting(true),
      aksam: prayerSetting(true),
      yatsi: prayerSetting(true),
    },
  };
}

function validOption(
  value: unknown,
  options: readonly number[],
  fallback: number,
) {
  return typeof value === 'number' && options.includes(value)
    ? value
    : fallback;
}

export async function loadSilentModeSettings(): Promise<SilentModeSettings> {
  const fallback = createDefaultSilentModeSettings();
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SilentModeSettings>;
    return {
      enabled: parsed.enabled === true,
      remindersEnabled: parsed.remindersEnabled !== false,
      startBeforeMinutes: validOption(
        parsed.startBeforeMinutes,
        SILENT_START_OPTIONS,
        fallback.startBeforeMinutes,
      ),
      endAfterMinutes: validOption(
        parsed.endAfterMinutes,
        SILENT_END_OPTIONS,
        fallback.endAfterMinutes,
      ),
      prayers: Object.fromEntries(
        PRAYER_KEYS.map((key) => [
          key,
          {
            enabled:
              typeof parsed.prayers?.[key]?.enabled === 'boolean'
                ? parsed.prayers[key].enabled
                : fallback.prayers[key].enabled,
          },
        ]),
      ) as Record<PrayerKey, SilentModePrayerSetting>,
    };
  } catch {
    await AsyncStorage.removeItem(SETTINGS_KEY);
    return fallback;
  }
}

export async function saveSilentModeSettings(settings: SilentModeSettings) {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
