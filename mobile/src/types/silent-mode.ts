import type { PrayerKey } from '@/types/prayer';

export type SilentModePrayerSetting = {
  enabled: boolean;
};

export type SilentModeSettings = {
  enabled: boolean;
  remindersEnabled: boolean;
  startBeforeMinutes: number;
  endAfterMinutes: number;
  prayers: Record<PrayerKey, SilentModePrayerSetting>;
};

export type SilentModeWindow = {
  id: string;
  prayerKey: PrayerKey;
  prayerName: string;
  prayerTime: string;
  dateKey: string;
  startsAt: string;
  endsAt: string;
};

export type SilentModeScheduleSummary = {
  count: number;
  scheduledUntil: string | null;
  updatedAt: string | null;
};
