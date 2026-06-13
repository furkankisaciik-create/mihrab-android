import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import {
  loadNotificationSettings,
  type NotificationPermissionState,
  type NotificationScheduleSummary,
  type NotificationSettings,
  type ReminderOffset,
} from '@/services/notification-settings';
import type { PrayerTime, PrayerTimesSnapshot } from '@/types/prayer';

const SCHEDULED_IDS_KEY = '@mihrab/scheduled-notification-ids';
const SCHEDULE_SUMMARY_KEY = '@mihrab/notification-schedule-summary';
const SOUND_CHANNEL_ID = 'mihrab-prayer-sound-v1';
const SILENT_CHANNEL_ID = 'mihrab-prayer-silent-v1';
const MAX_SCHEDULED_NOTIFICATIONS = 60;
let syncQueue: Promise<void> = Promise.resolve();

type NotificationCandidate = {
  date: Date;
  prayer: PrayerTime;
  dateKey: string;
  offset: ReminderOffset;
  soundEnabled: boolean;
};

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const soundEnabled = notification.request.content.data?.soundEnabled === true;
    return {
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: soundEnabled,
      shouldSetBadge: false,
      priority: soundEnabled
        ? Notifications.AndroidNotificationPriority.HIGH
        : Notifications.AndroidNotificationPriority.DEFAULT,
    };
  },
});

async function ensureNotificationChannels() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Promise.all([
    Notifications.setNotificationChannelAsync(SOUND_CHANNEL_ID, {
      name: 'Sesli vakit hatırlatmaları',
      description: 'Sesli MIHRAB namaz vakti bildirimleri',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      enableVibrate: true,
      vibrationPattern: [0, 250, 180, 250],
      showBadge: false,
    }),
    Notifications.setNotificationChannelAsync(SILENT_CHANNEL_ID, {
      name: 'Sessiz vakit hatırlatmaları',
      description: 'Sessiz MIHRAB namaz vakti bildirimleri',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: null,
      enableVibrate: false,
      vibrationPattern: null,
      showBadge: false,
    }),
  ]);
}

export async function initializeNotificationRuntime() {
  await ensureNotificationChannels();
}

function permissionState(
  permission: Notifications.NotificationPermissionsStatus,
): NotificationPermissionState {
  if (permission.granted) {
    return 'granted';
  }
  return permission.canAskAgain ? 'undetermined' : 'denied';
}

export async function getNotificationPermissionState(): Promise<NotificationPermissionState> {
  return permissionState(await Notifications.getPermissionsAsync());
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  await ensureNotificationChannels();
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return 'granted';
  }
  if (!current.canAskAgain) {
    return 'denied';
  }

  const result = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true,
    },
  });
  return permissionState(result);
}

async function loadScheduledIds() {
  const raw = await AsyncStorage.getItem(SCHEDULED_IDS_KEY);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

async function cancelMihrabNotifications() {
  const [storedIds, scheduled] = await Promise.all([
    loadScheduledIds(),
    Notifications.getAllScheduledNotificationsAsync(),
  ]);
  const detectedIds = scheduled
    .filter((notification) => notification.content.data?.mihrabType === 'prayer-reminder')
    .map((notification) => notification.identifier);
  const ids = [...new Set([...storedIds, ...detectedIds])];
  await Promise.allSettled(
    ids.map((identifier) => Notifications.cancelScheduledNotificationAsync(identifier)),
  );
  await AsyncStorage.removeItem(SCHEDULED_IDS_KEY);
}

function reminderLabel(offset: ReminderOffset) {
  if (offset === 60) {
    return '1 saat';
  }
  return `${offset} dakika`;
}

function createCandidateDate(dateKey: string, time: string, offset: ReminderOffset) {
  const prayerDate = new Date(`${dateKey}T${time}:00+03:00`);
  return new Date(prayerDate.getTime() - offset * 60 * 1000);
}

function buildCandidates(
  snapshot: PrayerTimesSnapshot,
  settings: NotificationSettings,
): NotificationCandidate[] {
  const schedule = snapshot.schedule?.length
    ? snapshot.schedule
    : [
        {
          dateKey: snapshot.dateKey,
          gregorianDate: snapshot.gregorianDate,
          hijriDate: snapshot.hijriDate,
          prayers: snapshot.prayers,
        },
      ];
  const threshold = Date.now() + 30 * 1000;

  return schedule
    .flatMap((day) =>
      day.prayers.flatMap((prayer) => {
        const prayerSetting = settings.prayers[prayer.key];
        if (!prayerSetting.enabled) {
          return [];
        }

        return prayerSetting.reminders.map((offset) => ({
          date: createCandidateDate(day.dateKey, prayer.time, offset),
          prayer,
          dateKey: day.dateKey,
          offset,
          soundEnabled: prayerSetting.soundEnabled,
        }));
      }),
    )
    .filter((candidate) => candidate.date.getTime() > threshold)
    .sort((left, right) => left.date.getTime() - right.date.getTime())
    .slice(0, MAX_SCHEDULED_NOTIFICATIONS);
}

function notificationTitle(candidate: NotificationCandidate) {
  return candidate.offset === 0
    ? `${candidate.prayer.name} vakti girdi`
    : `${candidate.prayer.name} vaktine ${reminderLabel(candidate.offset)} kaldı`;
}

export async function getNotificationScheduleSummary(): Promise<NotificationScheduleSummary> {
  const raw = await AsyncStorage.getItem(SCHEDULE_SUMMARY_KEY);
  if (!raw) {
    return { count: 0, scheduledUntil: null, updatedAt: null };
  }
  try {
    return JSON.parse(raw) as NotificationScheduleSummary;
  } catch {
    return { count: 0, scheduledUntil: null, updatedAt: null };
  }
}

async function performSync(
  snapshot?: PrayerTimesSnapshot | null,
  suppliedSettings?: NotificationSettings,
): Promise<NotificationScheduleSummary> {
  await ensureNotificationChannels();
  const settings = suppliedSettings ?? (await loadNotificationSettings());
  const permission = await getNotificationPermissionState();

  await cancelMihrabNotifications();

  if (!settings.enabled || permission !== 'granted' || !snapshot) {
    const emptySummary = {
      count: 0,
      scheduledUntil: null,
      updatedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(SCHEDULE_SUMMARY_KEY, JSON.stringify(emptySummary));
    return emptySummary;
  }

  const candidates = buildCandidates(snapshot, settings);
  const scheduledIds: string[] = [];

  try {
    for (const candidate of candidates) {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationTitle(candidate),
          body: `${snapshot.location.district.name}, ${snapshot.location.city.name} • ${candidate.prayer.time}`,
          sound: candidate.soundEnabled ? 'default' : false,
          priority: candidate.soundEnabled
            ? Notifications.AndroidNotificationPriority.HIGH
            : Notifications.AndroidNotificationPriority.DEFAULT,
          interruptionLevel: 'active',
          data: {
            mihrabType: 'prayer-reminder',
            prayerKey: candidate.prayer.key,
            dateKey: candidate.dateKey,
            offset: candidate.offset,
            soundEnabled: candidate.soundEnabled,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: candidate.date,
          channelId: candidate.soundEnabled ? SOUND_CHANNEL_ID : SILENT_CHANNEL_ID,
        },
      });
      scheduledIds.push(identifier);
    }
  } catch (error) {
    await Promise.allSettled(
      scheduledIds.map((identifier) =>
        Notifications.cancelScheduledNotificationAsync(identifier),
      ),
    );
    throw error;
  }

  await AsyncStorage.setItem(SCHEDULED_IDS_KEY, JSON.stringify(scheduledIds));
  const summary = {
    count: scheduledIds.length,
    scheduledUntil: candidates.at(-1)?.date.toISOString() ?? null,
    updatedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(SCHEDULE_SUMMARY_KEY, JSON.stringify(summary));
  return summary;
}

export function syncPrayerNotifications(
  snapshot?: PrayerTimesSnapshot | null,
  suppliedSettings?: NotificationSettings,
): Promise<NotificationScheduleSummary> {
  const operation = syncQueue.then(() => performSync(snapshot, suppliedSettings));
  syncQueue = operation.then(
    () => undefined,
    () => undefined,
  );
  return operation;
}
