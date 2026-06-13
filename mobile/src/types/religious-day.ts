export type ReligiousDayCategory =
  | 'kandil'
  | 'bayram'
  | 'baslangic'
  | 'onemli';

export type ReligiousDay = {
  id: string;
  name: string;
  shortName: string;
  dateKey: string;
  hijriDate: string;
  category: ReligiousDayCategory;
  categoryLabel: string;
  summary: string;
  suggestion: string;
  beginsAtSunset?: boolean;
  officialYear: number;
  sourceUrl: string;
};

export type ReligiousDayGroup = {
  monthKey: string;
  monthLabel: string;
  days: ReligiousDay[];
};
