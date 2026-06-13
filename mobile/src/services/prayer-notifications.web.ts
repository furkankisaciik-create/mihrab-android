import type {
  NotificationPermissionState,
  NotificationScheduleSummary,
  NotificationSettings,
} from '@/services/notification-settings';
import type { PrayerTimesSnapshot } from '@/types/prayer';

const EMPTY_SUMMARY: NotificationScheduleSummary = {
  count: 0,
  scheduledUntil: null,
  updatedAt: null,
};

export async function initializeNotificationRuntime() {}

export async function getNotificationPermissionState(): Promise<NotificationPermissionState> {
  return 'unsupported';
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  return 'unsupported';
}

export async function getNotificationScheduleSummary() {
  return EMPTY_SUMMARY;
}

export async function syncPrayerNotifications(
  _snapshot?: PrayerTimesSnapshot | null,
  _settings?: NotificationSettings,
) {
  return EMPTY_SUMMARY;
}
