import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { buildSilentModeWindows } from '@/services/silent-mode';
import { loadSilentModeSettings } from '@/services/silent-mode-settings';
import type { PrayerTimesSnapshot } from '@/types/prayer';
import type {
  SilentModeScheduleSummary,
  SilentModeSettings,
  SilentModeWindow,
} from '@/types/silent-mode';

const CHANNEL_ID = 'mihrab-silent-window-v1';
const SCHEDULED_IDS_KEY = '@mihrab/silent-mode-notification-ids-v1';
const SUMMARY_KEY = '@mihrab/silent-mode-schedule-summary-v1';
const MAX_SCHEDULED_NOTIFICATIONS = 50;
let syncQueue: Promise<void> = Promise.resolve();

type SilentModeCandidate = {
  date: Date;
  kind: 'start' | 'end';
  window: SilentModeWindow;
};

const EMPTY_SUMMARY: SilentModeScheduleSummary = {
  count: 0,
  scheduledUntil: null,
  updatedAt: null,
};

async function ensureChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Sessiz mod planı',
    description: 'Namaz vakitlerindeki sessiz zaman başlangıç ve bitiş hatırlatmaları',
    importance: Notifications.AndroidImportance.LOW,
    sound: null,
    enableVibrate: false,
    vibrationPattern: null,
    showBadge: false,
  });
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

async function cancelSilentModeNotifications() {
  const [storedIds, scheduled] = await Promise.all([
    loadScheduledIds(),
    Notifications.getAllScheduledNotificationsAsync(),
  ]);
  const detectedIds = scheduled
    .filter(
      (notification) =>
        notification.content.data?.mihrabType === 'silent-mode-reminder',
    )
    .map((notification) => notification.identifier);
  const ids = [...new Set([...storedIds, ...detectedIds])];
  await Promise.allSettled(
    ids.map((identifier) =>
      Notifications.cancelScheduledNotificationAsync(identifier),
    ),
  );
  await AsyncStorage.removeItem(SCHEDULED_IDS_KEY);
}

function buildCandidates(
  snapshot: PrayerTimesSnapshot,
  settings: SilentModeSettings,
) {
  const threshold = Date.now() + 30_000;

  return buildSilentModeWindows(snapshot, settings)
    .flatMap((window) => [
      {
        date: new Date(window.startsAt),
        kind: 'start' as const,
        window,
      },
      {
        date: new Date(window.endsAt),
        kind: 'end' as const,
        window,
      },
    ])
    .filter((candidate) => candidate.date.getTime() > threshold)
    .sort((left, right) => left.date.getTime() - right.date.getTime())
    .slice(0, MAX_SCHEDULED_NOTIFICATIONS);
}

function notificationCopy(candidate: SilentModeCandidate) {
  if (candidate.kind === 'start') {
    return {
      title: `${candidate.window.prayerName} sessiz zamanı başladı`,
      body: `Telefonun sessiz veya Rahatsız Etmeyin modunu açın. Plan ${candidate.window.prayerTime} vaktine göre hazırlandı.`,
    };
  }

  return {
    title: `${candidate.window.prayerName} sessiz zamanı tamamlandı`,
    body: 'İsterseniz telefon sesini yeniden açabilirsiniz.',
  };
}

export async function getSilentModeScheduleSummary(): Promise<SilentModeScheduleSummary> {
  const raw = await AsyncStorage.getItem(SUMMARY_KEY);
  if (!raw) {
    return EMPTY_SUMMARY;
  }
  try {
    return JSON.parse(raw) as SilentModeScheduleSummary;
  } catch {
    return EMPTY_SUMMARY;
  }
}

async function performSync(
  snapshot?: PrayerTimesSnapshot | null,
  suppliedSettings?: SilentModeSettings,
) {
  await ensureChannel();
  const settings = suppliedSettings ?? (await loadSilentModeSettings());
  const permission = await Notifications.getPermissionsAsync();
  await cancelSilentModeNotifications();

  if (
    !snapshot ||
    !settings.enabled ||
    !settings.remindersEnabled ||
    !permission.granted
  ) {
    const summary = {
      ...EMPTY_SUMMARY,
      updatedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(SUMMARY_KEY, JSON.stringify(summary));
    return summary;
  }

  const candidates = buildCandidates(snapshot, settings);
  const scheduledIds: string[] = [];

  try {
    for (const candidate of candidates) {
      const copy = notificationCopy(candidate);
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          ...copy,
          sound: false,
          priority: Notifications.AndroidNotificationPriority.LOW,
          interruptionLevel: 'passive',
          data: {
            mihrabType: 'silent-mode-reminder',
            prayerKey: candidate.window.prayerKey,
            dateKey: candidate.window.dateKey,
            kind: candidate.kind,
            soundEnabled: false,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: candidate.date,
          channelId: CHANNEL_ID,
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

  await AsyncStorage.setItem(
    SCHEDULED_IDS_KEY,
    JSON.stringify(scheduledIds),
  );
  const summary = {
    count: scheduledIds.length,
    scheduledUntil: candidates.at(-1)?.date.toISOString() ?? null,
    updatedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(SUMMARY_KEY, JSON.stringify(summary));
  return summary;
}

export function syncSilentModeNotifications(
  snapshot?: PrayerTimesSnapshot | null,
  settings?: SilentModeSettings,
): Promise<SilentModeScheduleSummary> {
  const operation = syncQueue.then(() => performSync(snapshot, settings));
  syncQueue = operation.then(
    () => undefined,
    () => undefined,
  );
  return operation;
}
