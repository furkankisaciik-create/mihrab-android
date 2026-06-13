import {
  getIstanbulDateKey,
  getNextDateKey,
} from '@/services/daily-content-date';
import type { HijriCalendarMonth, HijriDateInfo } from '@/types/hijri';
import type { PrayerDaySchedule } from '@/types/prayer';

const HIJRI_LOCALE = 'tr-TR-u-ca-islamic-civil';
const ISTANBUL_TIME_ZONE = 'Europe/Istanbul';

function createIstanbulDate(dateKey: string) {
  return new Date(`${dateKey}T12:00:00+03:00`);
}

function normalizeMonth(value: string) {
  return value
    .toLocaleLowerCase('tr-TR')
    .replace(/\s+/g, ' ')
    .trim();
}

function createHijriInfo(
  dateKey: string,
  day: number,
  month: string,
  year: number,
  isOfficial: boolean,
): HijriDateInfo {
  return {
    dateKey,
    day,
    month,
    year,
    label: `${day} ${month} ${year}`,
    isOfficial,
  };
}

export function parseDiyanetHijriDate(
  dateKey: string,
  value: string,
): HijriDateInfo | null {
  const match = value.trim().match(/^(\d{1,2})\s+(.+?)\s+(\d{4})$/);
  if (!match) {
    return null;
  }

  return createHijriInfo(
    dateKey,
    Number(match[1]),
    match[2].trim(),
    Number(match[3]),
    true,
  );
}

export function calculateHijriDate(
  dateKey: string,
  calibrationOffset = 0,
): HijriDateInfo {
  const calibratedDateKey = getNextDateKey(dateKey, calibrationOffset);
  const parts = new Intl.DateTimeFormat(HIJRI_LOCALE, {
    timeZone: ISTANBUL_TIME_ZONE,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).formatToParts(createIstanbulDate(calibratedDateKey));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return createHijriInfo(
    dateKey,
    Number(values.day),
    values.month,
    Number(values.year),
    false,
  );
}

function officialDateFor(
  dateKey: string,
  schedule: PrayerDaySchedule[],
) {
  const day = schedule.find((item) => item.dateKey === dateKey);
  return day ? parseDiyanetHijriDate(dateKey, day.hijriDate) : null;
}

export function getHijriCalibrationOffset(schedule: PrayerDaySchedule[]) {
  for (const officialDay of schedule) {
    const official = parseDiyanetHijriDate(
      officialDay.dateKey,
      officialDay.hijriDate,
    );
    if (!official) {
      continue;
    }

    for (let offset = -3; offset <= 3; offset += 1) {
      const calculated = calculateHijriDate(officialDay.dateKey, offset);
      if (
        calculated.day === official.day &&
        calculated.year === official.year &&
        normalizeMonth(calculated.month) === normalizeMonth(official.month)
      ) {
        return offset;
      }
    }
  }

  return 0;
}

export function getHijriDate(
  dateKey: string,
  schedule: PrayerDaySchedule[] = [],
  calibrationOffset = getHijriCalibrationOffset(schedule),
) {
  return (
    officialDateFor(dateKey, schedule) ??
    calculateHijriDate(dateKey, calibrationOffset)
  );
}

function getMondayBasedWeekday(dateKey: string) {
  const day = createIstanbulDate(dateKey).getDay();
  return (day + 6) % 7;
}

export function formatGregorianCalendarDate(dateKey: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: ISTANBUL_TIME_ZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(createIstanbulDate(dateKey));
}

export function formatShortGregorianDate(dateKey: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: ISTANBUL_TIME_ZONE,
    day: 'numeric',
    month: 'short',
  }).format(createIstanbulDate(dateKey));
}

export function buildHijriMonth(
  anchorDateKey: string,
  schedule: PrayerDaySchedule[] = [],
  todayKey = getIstanbulDateKey(),
): HijriCalendarMonth {
  const calibrationOffset = getHijriCalibrationOffset(schedule);
  const anchor = getHijriDate(anchorDateKey, schedule, calibrationOffset);
  const firstDateKey = getNextDateKey(anchorDateKey, 1 - anchor.day);
  const gridStartDateKey = getNextDateKey(
    firstDateKey,
    -getMondayBasedWeekday(firstDateKey),
  );
  const scheduleByDate = new Map(schedule.map((day) => [day.dateKey, day]));
  const monthKey = `${normalizeMonth(anchor.month)}-${anchor.year}`;

  const days = Array.from({ length: 42 }, (_, index) => {
    const dateKey = getNextDateKey(gridStartDateKey, index);
    const hijri = getHijriDate(dateKey, schedule, calibrationOffset);
    const scheduleDay = scheduleByDate.get(dateKey);

    return {
      ...hijri,
      gregorianDay: Number(dateKey.slice(8, 10)),
      gregorianLabel: formatShortGregorianDate(dateKey),
      isInMonth:
        `${normalizeMonth(hijri.month)}-${hijri.year}` === monthKey,
      isToday: dateKey === todayKey,
      prayers: scheduleDay?.prayers ?? [],
    };
  });

  return {
    month: anchor.month,
    year: anchor.year,
    title: `${anchor.month} ${anchor.year}`,
    firstDateKey,
    calibrationOffset,
    days,
  };
}

export function shiftHijriMonth(
  anchorDateKey: string,
  direction: -1 | 1,
  schedule: PrayerDaySchedule[] = [],
) {
  const current = buildHijriMonth(anchorDateKey, schedule);
  const candidateDateKey =
    direction === 1
      ? getNextDateKey(current.firstDateKey, 35)
      : getNextDateKey(current.firstDateKey, -1);
  const candidate = getHijriDate(
    candidateDateKey,
    schedule,
    current.calibrationOffset,
  );

  return getNextDateKey(candidateDateKey, 1 - candidate.day);
}
