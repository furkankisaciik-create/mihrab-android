export type TrackedPrayerKey = 'sabah' | 'ogle' | 'ikindi' | 'aksam' | 'yatsi';

export type TrackedPrayer = {
  key: TrackedPrayerKey;
  name: string;
  scheduleKey: 'imsak' | 'ogle' | 'ikindi' | 'aksam' | 'yatsi';
  symbol: string;
};

export type PrayerCompletion = {
  completedAt: string;
};

export type PrayerTrackingDay = {
  prayers: Partial<Record<TrackedPrayerKey, PrayerCompletion>>;
};

export type PrayerTrackerState = {
  version: 1;
  currentDateKey: string;
  days: Record<string, PrayerTrackingDay>;
  updatedAt: string;
};
