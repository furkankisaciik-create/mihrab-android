import type { PrayerKey } from '@/types/prayer';

export type HomeWidgetPrayer = {
  key: PrayerKey;
  name: string;
  time: string;
  dateTime: string;
  isNext: boolean;
};

export type HomeWidgetSnapshot = {
  location: string;
  dateLabel: string;
  hijriDate: string;
  nextPrayerName: string;
  nextPrayerTime: string;
  nextPrayerAt: string;
  remainingLabel: string;
  prayers: HomeWidgetPrayer[];
  updatedAt: string;
  source: 'diyanet';
};

export type HomeWidgetSyncResult = {
  snapshot: HomeWidgetSnapshot;
  nativeAvailable: boolean;
};
