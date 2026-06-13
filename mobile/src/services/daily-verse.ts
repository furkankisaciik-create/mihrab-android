import {
  formatDailyContentDate,
  getIstanbulDateKey,
  getNextDateKey,
} from '@/services/daily-content-date';
import type { DailyVerse, DailyVerseReference } from '@/types/verse';

const QURANENC_API_URL = 'https://quranenc.com/api/v1';
const TRANSLATION_KEY = 'turkish_rwwad';
const REQUEST_TIMEOUT_MS = 12000;
const DAY_IN_MS = 86_400_000;

const VERSE_REFERENCES: DailyVerseReference[] = [
  { surahNumber: 2, verseNumber: 152, surahName: 'Bakara' },
  { surahNumber: 2, verseNumber: 153, surahName: 'Bakara' },
  { surahNumber: 2, verseNumber: 186, surahName: 'Bakara' },
  { surahNumber: 2, verseNumber: 286, surahName: 'Bakara' },
  { surahNumber: 3, verseNumber: 8, surahName: 'Âl-i İmrân' },
  { surahNumber: 3, verseNumber: 139, surahName: 'Âl-i İmrân' },
  { surahNumber: 3, verseNumber: 159, surahName: 'Âl-i İmrân' },
  { surahNumber: 8, verseNumber: 46, surahName: 'Enfâl' },
  { surahNumber: 9, verseNumber: 51, surahName: 'Tevbe' },
  { surahNumber: 12, verseNumber: 87, surahName: 'Yûsuf' },
  { surahNumber: 13, verseNumber: 11, surahName: 'Ra‘d' },
  { surahNumber: 13, verseNumber: 28, surahName: 'Ra‘d' },
  { surahNumber: 14, verseNumber: 7, surahName: 'İbrâhîm' },
  { surahNumber: 16, verseNumber: 97, surahName: 'Nahl' },
  { surahNumber: 17, verseNumber: 23, surahName: 'İsrâ' },
  { surahNumber: 18, verseNumber: 10, surahName: 'Kehf' },
  { surahNumber: 20, verseNumber: 46, surahName: 'Tâhâ' },
  { surahNumber: 20, verseNumber: 114, surahName: 'Tâhâ' },
  { surahNumber: 21, verseNumber: 83, surahName: 'Enbiyâ' },
  { surahNumber: 24, verseNumber: 35, surahName: 'Nûr' },
  { surahNumber: 29, verseNumber: 69, surahName: 'Ankebût' },
  { surahNumber: 33, verseNumber: 41, surahName: 'Ahzâb' },
  { surahNumber: 39, verseNumber: 10, surahName: 'Zümer' },
  { surahNumber: 39, verseNumber: 53, surahName: 'Zümer' },
  { surahNumber: 40, verseNumber: 60, surahName: 'Mü’min' },
  { surahNumber: 49, verseNumber: 13, surahName: 'Hucurât' },
  { surahNumber: 51, verseNumber: 56, surahName: 'Zâriyât' },
  { surahNumber: 57, verseNumber: 4, surahName: 'Hadîd' },
  { surahNumber: 65, verseNumber: 3, surahName: 'Talâk' },
  { surahNumber: 94, verseNumber: 5, surahName: 'İnşirâh' },
];

const FALLBACK_VERSE = {
  arabicText:
    'ٱلَّذِينَ ءَامَنُواْ وَتَطۡمَئِنُّ قُلُوبُهُم بِذِكۡرِ ٱللَّهِۗ أَلَا بِذِكۡرِ ٱللَّهِ تَطۡمَئِنُّ ٱلۡقُلُوبُ',
  translation:
    "Bunlar, iman edenler ve gönülleri Allah'ın zikriyle sükûnete erenlerdir. Bilesiniz ki, kalpler ancak Allah'ı zikretmekle huzur bulur.",
  footnotes: '',
  translationKey: TRANSLATION_KEY,
  translationTitle: 'Türkçe Tercüme - Rowad Tercüme Merkezi',
  translationVersion: '1.0.4',
  sourceUrl: 'https://quranenc.com/tr/browse/turkish_rwwad/13/28',
} as const;

type QuranEncVerseResponse = {
  result?: {
    sura?: string;
    aya?: string;
    arabic_text?: string;
    translation?: string;
    footnotes?: string;
  };
};

type QuranEncTranslationsResponse = {
  translations?: {
    key?: string;
    title?: string;
    version?: string;
  }[];
};

let metadataPromise:
  | Promise<{ title: string; version: string }>
  | null = null;

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Kur'an Mealleri Ansiklopedisi ${response.status} yanıtını verdi.`);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Günlük ayet kaynağına bağlanma zaman aşımına uğradı.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function getTranslationMetadata() {
  if (!metadataPromise) {
    metadataPromise = fetchJson<QuranEncTranslationsResponse>(
      `${QURANENC_API_URL}/translations/list/tr?localization=tr`,
    )
      .then((payload) => {
        const translation = payload.translations?.find(
          (item) => item.key === TRANSLATION_KEY,
        );
        if (!translation?.title || !translation.version) {
          throw new Error('Türkçe meal kaynak bilgisi alınamadı.');
        }
        return {
          title: translation.title,
          version: translation.version,
        };
      })
      .catch((error) => {
        metadataPromise = null;
        throw error;
      });
  }

  return metadataPromise;
}

export function getDailyVerseReference(dateKey: string) {
  const dayNumber = Math.floor(Date.parse(`${dateKey}T00:00:00Z`) / DAY_IN_MS);
  const index = ((dayNumber % VERSE_REFERENCES.length) + VERSE_REFERENCES.length) %
    VERSE_REFERENCES.length;
  return VERSE_REFERENCES[index];
}

export function getFallbackDailyVerse(dateKey = getIstanbulDateKey()): DailyVerse {
  return {
    dateKey,
    surahNumber: 13,
    verseNumber: 28,
    surahName: 'Ra‘d',
    ...FALLBACK_VERSE,
    fetchedAt: new Date().toISOString(),
  };
}

export async function fetchDailyVerse(dateKey = getIstanbulDateKey()): Promise<DailyVerse> {
  const reference = getDailyVerseReference(dateKey);
  const [payload, metadata] = await Promise.all([
    fetchJson<QuranEncVerseResponse>(
      `${QURANENC_API_URL}/translation/aya/${TRANSLATION_KEY}/${reference.surahNumber}/${reference.verseNumber}`,
    ),
    getTranslationMetadata(),
  ]);
  const result = payload.result;

  if (
    !result?.arabic_text ||
    !result.translation ||
    Number(result.sura) !== reference.surahNumber ||
    Number(result.aya) !== reference.verseNumber
  ) {
    throw new Error('Günlük ayet beklenen biçimde alınamadı.');
  }

  return {
    ...reference,
    dateKey,
    arabicText: result.arabic_text,
    translation: result.translation,
    footnotes: result.footnotes ?? '',
    translationKey: TRANSLATION_KEY,
    translationTitle: metadata.title,
    translationVersion: metadata.version,
    sourceUrl: `https://quranenc.com/tr/browse/${TRANSLATION_KEY}/${reference.surahNumber}/${reference.verseNumber}`,
    fetchedAt: new Date().toISOString(),
  };
}

export function formatDailyVerseDate(dateKey: string) {
  return formatDailyContentDate(dateKey);
}

export { getIstanbulDateKey, getNextDateKey };
