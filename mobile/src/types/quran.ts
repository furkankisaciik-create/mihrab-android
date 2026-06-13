export type QuranRevelationPlace = 'Mekke' | 'Medine';

export type QuranSurah = {
  number: number;
  name: string;
  verseCount: number;
  revelationPlace: QuranRevelationPlace;
};

export type QuranVerse = {
  id: number;
  surahNumber: number;
  verseNumber: number;
  arabicText: string;
  translation: string;
  footnotes: string;
};

export type QuranSurahContent = {
  surah: QuranSurah;
  verses: QuranVerse[];
  translationKey: string;
  translationTitle: string;
  translationVersion: string;
  sourceUrl: string;
  fetchedAt: string;
};

export type DisplayedQuranSurah = QuranSurahContent & {
  isCached?: boolean;
};

export type QuranLastRead = {
  surahNumber: number;
  verseNumber: number;
  updatedAt: string;
};

export type QuranProgressState = {
  version: 1;
  lastRead: QuranLastRead | null;
  arabicFontSize: number;
  updatedAt: string;
};
