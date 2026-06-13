import type { PrayerTimesSnapshot } from '@/types/prayer';
import type {
  SilentModeScheduleSummary,
  SilentModeSettings,
} from '@/types/silent-mode';

const EMPTY_SUMMARY: SilentModeScheduleSummary = {
  count: 0,
  scheduledUntil: null,
  updatedAt: null,
};

export async function getSilentModeScheduleSummary() {
  return EMPTY_SUMMARY;
}

export async function syncSilentModeNotifications(
  _snapshot?: PrayerTimesSnapshot | null,
  _settings?: SilentModeSettings,
) {
  return EMPTY_SUMMARY;
}
