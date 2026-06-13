import type { PrayerTime } from '@/types/prayer';

export type HijriDateInfo = {
  dateKey: string;
  day: number;
  month: string;
  year: number;
  label: string;
  isOfficial: boolean;
};

export type HijriCalendarDay = HijriDateInfo & {
  gregorianDay: number;
  gregorianLabel: string;
  isInMonth: boolean;
  isToday: boolean;
  prayers: PrayerTime[];
};

export type HijriCalendarMonth = {
  month: string;
  year: number;
  title: string;
  firstDateKey: string;
  calibrationOffset: number;
  days: HijriCalendarDay[];
};
