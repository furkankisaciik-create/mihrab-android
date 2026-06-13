import { getIstanbulDateKey } from '@/services/daily-content-date';
import type {
  PrayerDaySchedule,
  PrayerKey,
  PrayerTimesSnapshot,
} from '@/types/prayer';
import type {
  SilentModeSettings,
  SilentModeWindow,
} from '@/types/silent-mode';

export const SILENT_MODE_PRAYERS: {
  key: PrayerKey;
  name: string;
  symbol: string;
}[] = [
  { key: 'imsak', name: 'Sabah', symbol: '☾' },
  { key: 'ogle', name: 'Öğle', symbol: '◉' },
  { key: 'ikindi', name: 'İkindi', symbol: '◒' },
  { key: 'aksam', name: 'Akşam', symbol: '◐' },
  { key: 'yatsi', name: 'Yatsı', symbol: '☽' },
];

function snapshotSchedule(snapshot: PrayerTimesSnapshot): PrayerDaySchedule[] {
  return snapshot.schedule?.length
    ? snapshot.schedule
    : [
        {
          dateKey: snapshot.dateKey,
          gregorianDate: snapshot.gregorianDate,
          hijriDate: snapshot.hijriDate,
          prayers: snapshot.prayers,
        },
      ];
}

function createPrayerDate(dateKey: string, time: string) {
  return new Date(`${dateKey}T${time}:00+03:00`);
}

export function buildSilentModeWindows(
  snapshot: PrayerTimesSnapshot,
  settings: SilentModeSettings,
) {
  if (!settings.enabled) {
    return [];
  }

  return snapshotSchedule(snapshot)
    .flatMap((day) =>
      SILENT_MODE_PRAYERS.flatMap((configuredPrayer) => {
        if (!settings.prayers[configuredPrayer.key].enabled) {
          return [];
        }

        const prayer = day.prayers.find(
          (item) => item.key === configuredPrayer.key,
        );
        if (!prayer || !/^\d{2}:\d{2}$/.test(prayer.time)) {
          return [];
        }

        const prayerDate = createPrayerDate(day.dateKey, prayer.time);
        const startsAt = new Date(
          prayerDate.getTime() - settings.startBeforeMinutes * 60_000,
        );
        const endsAt = new Date(
          prayerDate.getTime() + settings.endAfterMinutes * 60_000,
        );

        return [
          {
            id: `${day.dateKey}-${configuredPrayer.key}`,
            prayerKey: configuredPrayer.key,
            prayerName: configuredPrayer.name,
            prayerTime: prayer.time,
            dateKey: day.dateKey,
            startsAt: startsAt.toISOString(),
            endsAt: endsAt.toISOString(),
          } satisfies SilentModeWindow,
        ];
      }),
    )
    .sort((left, right) => left.startsAt.localeCompare(right.startsAt));
}

export function getActiveSilentModeWindow(
  windows: SilentModeWindow[],
  now = new Date(),
) {
  const timestamp = now.getTime();
  return (
    windows.find(
      (window) =>
        new Date(window.startsAt).getTime() <= timestamp &&
        new Date(window.endsAt).getTime() > timestamp,
    ) ?? null
  );
}

export function getNextSilentModeWindow(
  windows: SilentModeWindow[],
  now = new Date(),
) {
  const timestamp = now.getTime();
  return (
    windows.find(
      (window) => new Date(window.startsAt).getTime() > timestamp,
    ) ?? null
  );
}

export function getTodaySilentModeWindows(
  windows: SilentModeWindow[],
  now = new Date(),
) {
  const todayKey = getIstanbulDateKey(now);
  return windows.filter((window) => window.dateKey === todayKey);
}

export function formatSilentWindowRange(window: SilentModeWindow) {
  const formatter = new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${formatter.format(new Date(window.startsAt))} – ${formatter.format(
    new Date(window.endsAt),
  )}`;
}

export function formatSilentWindowDate(window: SilentModeWindow) {
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  }).format(new Date(window.startsAt));
}

export function formatRemainingTime(milliseconds: number) {
  const totalMinutes = Math.max(0, Math.ceil(milliseconds / 60_000));
  if (totalMinutes < 60) {
    return `${totalMinutes} dk`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes ? `${hours} sa ${minutes} dk` : `${hours} saat`;
}
