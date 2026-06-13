export type HadithSource = {
  book: string;
  hadithNumbers: string[];
};

export type DailyHadith = {
  dateKey: string;
  id: string;
  title: string;
  text: string;
  arabicText: string;
  attribution: string;
  grade: string;
  explanation: string;
  lessons: string[];
  sources: HadithSource[];
  sourceReferenceArabic: string;
  sourceName: string;
  sourceVersion: string;
  sourceUrl: string;
  fetchedAt: string;
};

export type DisplayedDailyHadith = DailyHadith & {
  isCached?: boolean;
  isFallback?: boolean;
};
