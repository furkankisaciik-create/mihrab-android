import AsyncStorage from '@react-native-async-storage/async-storage';

import { setNativeHomeWidgetSnapshot } from '@/services/home-widget-native';
import type {
  HomeWidgetPrayer,
  HomeWidgetSnapshot,
  HomeWidgetSyncResult,
} from '@/types/home-widget';
import type {
  PrayerDaySchedule,
  PrayerTime,
  PrayerTimesSnapshot,
} from '@/types/prayer';

const HOME_WIDGET_KEY = '@mihrab/home-widget-snapshot-v1';
const VALID_TIME_PATTERN = /^\d{2}:\d{2}$/;

type PrayerEntry = {
  prayer: PrayerTime;
  date: Date;
};

function formatLocation(snapshot: PrayerTimesSnapshot) {
  const { city, district } = snapshot.location;
  if (city.name === district.name) {
    return city.name;
  }
  return `${district.name}, ${city.name}`;
}

function getFallbackDate(now: Date, dayIndex: number) {
  const fallback = new Date(now);
  fallback.setHours(0, 0, 0, 0);
  fallback.setDate(fallback.getDate() + dayIndex);
  return fallback;
}

function getDayBaseDate(
  day: Pick<PrayerDaySchedule, 'dateKey'>,
  dayIndex: number,
  now: Date,
) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(day.dateKey)) {
    return new Date(`${day.dateKey}T00:00:00`);
  }
  return getFallbackDate(now, dayIndex);
}

function getPrayerDate(baseDate: Date, prayer: PrayerTime) {
  const [hours, minutes] = prayer.time.split(':').map(Number);
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function collectPrayerEntries(snapshot: PrayerTimesSnapshot, now: Date) {
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

  return schedule
    .flatMap((day, dayIndex) => {
      const baseDate = getDayBaseDate(day, dayIndex, now);
      return day.prayers
        .filter((prayer) => VALID_TIME_PATTERN.test(prayer.time))
        .map((prayer) => ({
          prayer,
          date: getPrayerDate(baseDate, prayer),
        }));
    })
    .sort((left, right) => left.date.getTime() - right.date.getTime());
}

export function formatWidgetRemaining(milliseconds: number) {
  const totalMinutes = Math.max(0, Math.ceil(milliseconds / 60_000));

  if (totalMinutes <= 0) {
    return 'Vakit geldi';
  }
  if (totalMinutes < 60) {
    return `${totalMinutes} dk kaldı`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes ? `${hours} sa ${minutes} dk kaldı` : `${hours} sa kaldı`;
}

function toWidgetPrayer(entry: PrayerEntry, nextEntry: PrayerEntry): HomeWidgetPrayer {
  return {
    key: entry.prayer.key,
    name: entry.prayer.name,
    time: entry.prayer.time,
    dateTime: entry.date.toISOString(),
    isNext:
      entry.prayer.key === nextEntry.prayer.key &&
      entry.date.getTime() === nextEntry.date.getTime(),
  };
}

export function buildHomeWidgetSnapshot(
  snapshot: PrayerTimesSnapshot,
  now = new Date(),
): HomeWidgetSnapshot {
  const entries = collectPrayerEntries(snapshot, now);
  const nextEntry = entries.find((entry) => entry.date > now) ?? entries[0];
  const upcomingEntries = entries
    .filter((entry) => entry.date.getTime() >= now.getTime() - 60_000)
    .slice(0, 4);

  if (!nextEntry) {
    return {
      location: formatLocation(snapshot),
      dateLabel: snapshot.gregorianDate,
      hijriDate: snapshot.hijriDate,
      nextPrayerName: 'Vakit bekleniyor',
      nextPrayerTime: '--:--',
      nextPrayerAt: now.toISOString(),
      remainingLabel: 'Diyanet verisi bekleniyor',
      prayers: [],
      updatedAt: now.toISOString(),
      source: 'diyanet',
    };
  }

  return {
    location: formatLocation(snapshot),
    dateLabel: snapshot.gregorianDate,
    hijriDate: snapshot.hijriDate,
    nextPrayerName: nextEntry.prayer.name,
    nextPrayerTime: nextEntry.prayer.time,
    nextPrayerAt: nextEntry.date.toISOString(),
    remainingLabel: formatWidgetRemaining(
      nextEntry.date.getTime() - now.getTime(),
    ),
    prayers: upcomingEntries.map((entry) => toWidgetPrayer(entry, nextEntry)),
    updatedAt: now.toISOString(),
    source: 'diyanet',
  };
}

export async function saveHomeWidgetSnapshot(snapshot: HomeWidgetSnapshot) {
  await AsyncStorage.setItem(HOME_WIDGET_KEY, JSON.stringify(snapshot));
}

export async function loadHomeWidgetSnapshot() {
  const raw = await AsyncStorage.getItem(HOME_WIDGET_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as HomeWidgetSnapshot;
  } catch {
    await AsyncStorage.removeItem(HOME_WIDGET_KEY);
    return null;
  }
}

export async function syncHomeWidget(
  prayerSnapshot?: PrayerTimesSnapshot | null,
): Promise<HomeWidgetSyncResult | null> {
  if (!prayerSnapshot) {
    return null;
  }

  const widgetSnapshot = buildHomeWidgetSnapshot(prayerSnapshot);
  await saveHomeWidgetSnapshot(widgetSnapshot);
  const nativeAvailable = await setNativeHomeWidgetSnapshot(widgetSnapshot);

  return {
    snapshot: widgetSnapshot,
    nativeAvailable,
  };
}
