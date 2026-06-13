export type PrayerKey = 'imsak' | 'gunes' | 'ogle' | 'ikindi' | 'aksam' | 'yatsi';

export type PrayerTime = {
  key: PrayerKey;
  name: string;
  time: string;
  symbol: string;
};

export type DiyanetCity = {
  id: string;
  name: string;
};

export type DiyanetDistrict = {
  id: string;
  name: string;
  path: string;
};

export type PrayerLocation = {
  city: DiyanetCity;
  district: DiyanetDistrict;
  detectedDistrict?: string;
  usedCityCenterFallback?: boolean;
};

export type PrayerDaySchedule = {
  dateKey: string;
  gregorianDate: string;
  hijriDate: string;
  prayers: PrayerTime[];
};

export type PrayerTimesSnapshot = {
  location: PrayerLocation;
  prayers: PrayerTime[];
  gregorianDate: string;
  hijriDate: string;
  dateKey: string;
  fetchedAt: string;
  sourceUrl: string;
  schedule: PrayerDaySchedule[];
  isCached?: boolean;
};
