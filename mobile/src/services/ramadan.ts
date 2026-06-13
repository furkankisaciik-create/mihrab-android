import { getDaysUntil } from '@/services/religious-days';
import type {
  RamadanDay,
  RamadanSchedule,
  UpcomingRamadan,
} from '@/types/ramadan';
import type {
  PrayerDaySchedule,
  PrayerTime,
} from '@/types/prayer';

function prayerTime(prayers: PrayerTime[], key: PrayerTime['key']) {
  return prayers.find((prayer) => prayer.key === key)?.time ?? '--:--';
}

function minutesFromTime(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  return Number.isFinite(hours) && Number.isFinite(minutes)
    ? hours * 60 + minutes
    : 0;
}

export function getFastingMinutes(imsak: string, iftar: string) {
  const start = minutesFromTime(imsak);
  const end = minutesFromTime(iftar);
  return start && end ? Math.max(0, end - start) : 0;
}

function parseRamadanDay(day: PrayerDaySchedule): RamadanDay | null {
  const match = day.hijriDate.match(/^(\d{1,2})\s+Ramazan\s+(\d{4})$/i);
  if (!match) {
    return null;
  }

  const imsak = prayerTime(day.prayers, 'imsak');
  const iftar = prayerTime(day.prayers, 'aksam');

  return {
    ...day,
    ramadanDay: Number(match[1]),
    imsak,
    iftar,
    fastingMinutes: getFastingMinutes(imsak, iftar),
  };
}

export function buildRamadanSchedules(schedule: PrayerDaySchedule[]) {
  const groups = new Map<number, RamadanDay[]>();

  for (const day of schedule) {
    const ramadanDay = parseRamadanDay(day);
    if (!ramadanDay) {
      continue;
    }

    const hijriYear = Number(
      ramadanDay.hijriDate.match(/(\d{4})$/)?.[1] ?? 0,
    );
    if (!hijriYear) {
      continue;
    }

    const existing = groups.get(hijriYear) ?? [];
    existing.push(ramadanDay);
    groups.set(hijriYear, existing);
  }

  return [...groups.entries()]
    .map(([hijriYear, days]): RamadanSchedule => {
      const sortedDays = [...days].sort(
        (left, right) => left.ramadanDay - right.ramadanDay,
      );
      const startDateKey = sortedDays[0].dateKey;
      const endDateKey = sortedDays.at(-1)?.dateKey ?? startDateKey;

      return {
        hijriYear,
        gregorianYear: Number(startDateKey.slice(0, 4)),
        title: `Ramazan ${hijriYear}`,
        startDateKey,
        endDateKey,
        days: sortedDays,
      };
    })
    .sort((left, right) => left.startDateKey.localeCompare(right.startDateKey));
}

export function formatFastingDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${hours} sa ${String(remainder).padStart(2, '0')} dk`;
}

export function formatRamadanDate(dateKey: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${dateKey}T12:00:00+03:00`));
}

export function formatRamadanShortDate(dateKey: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    day: 'numeric',
    month: 'short',
  }).format(new Date(`${dateKey}T12:00:00+03:00`));
}

export function getRamadanSummary(schedule: RamadanSchedule) {
  const shortest = schedule.days.reduce((current, day) =>
    day.fastingMinutes < current.fastingMinutes ? day : current,
  );
  const longest = schedule.days.reduce((current, day) =>
    day.fastingMinutes > current.fastingMinutes ? day : current,
  );

  return {
    dayCount: schedule.days.length,
    shortest,
    longest,
  };
}

export function getUpcomingRamadan(
  todayKey: string,
  schedules: RamadanSchedule[],
): UpcomingRamadan {
  const officialUpcoming = schedules.find(
    (schedule) => schedule.endDateKey >= todayKey,
  );
  if (officialUpcoming) {
    return {
      gregorianYear: officialUpcoming.gregorianYear,
      hijriYear: officialUpcoming.hijriYear,
      startDateKey: officialUpcoming.startDateKey,
      daysUntil: getDaysUntil(officialUpcoming.startDateKey, todayKey),
      hasOfficialTimes: true,
    };
  }

  const fallbackStart = todayKey < '2027-02-08'
    ? {
        gregorianYear: 2027,
        hijriYear: 1448,
        startDateKey: '2027-02-08',
      }
    : {
        gregorianYear: 2028,
        hijriYear: 1449,
        startDateKey: '2028-01-28',
      };

  return {
    ...fallbackStart,
    daysUntil: getDaysUntil(fallbackStart.startDateKey, todayKey),
    hasOfficialTimes: schedules.some(
      (schedule) => schedule.startDateKey === fallbackStart.startDateKey,
    ),
  };
}
