export type DailyVerseReference = {
  surahNumber: number;
  verseNumber: number;
  surahName: string;
};

export type DailyVerse = DailyVerseReference & {
  dateKey: string;
  arabicText: string;
  translation: string;
  footnotes: string;
  translationKey: string;
  translationTitle: string;
  translationVersion: string;
  sourceUrl: string;
  fetchedAt: string;
};

export type DisplayedDailyVerse = DailyVerse & {
  isCached?: boolean;
  isFallback?: boolean;
};
