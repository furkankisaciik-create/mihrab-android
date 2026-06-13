import type { PrayerTime } from '@/types/prayer';

export type RamadanDay = {
  dateKey: string;
  gregorianDate: string;
  hijriDate: string;
  ramadanDay: number;
  imsak: string;
  iftar: string;
  fastingMinutes: number;
  prayers: PrayerTime[];
};

export type RamadanSchedule = {
  hijriYear: number;
  gregorianYear: number;
  title: string;
  startDateKey: string;
  endDateKey: string;
  days: RamadanDay[];
};

export type UpcomingRamadan = {
  gregorianYear: number;
  hijriYear: number;
  startDateKey: string;
  daysUntil: number;
  hasOfficialTimes: boolean;
};
