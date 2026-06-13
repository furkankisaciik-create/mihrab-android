import { getQuranSurah } from '@/services/quran-metadata';
import type { QuranSurahContent } from '@/types/quran';

const QURANENC_API_URL = 'https://quranenc.com/api/v1';
export const QURAN_TRANSLATION_KEY = 'turkish_rwwad';
export const QURAN_TRANSLATION_TITLE = 'Türkçe Tercüme - Rowad Tercüme Merkezi';
export const QURAN_TRANSLATION_VERSION = '1.0.4';
export const QURANENC_BISMILLAH =
  '\u0628\u0650\u0633\u06E1\u0645\u0650 \u0671\u0644\u0644\u0651\u064E\u0647\u0650 \u0671\u0644\u0631\u0651\u064E\u062D\u06E1\u0645\u064E\u0670\u0646\u0650 \u0671\u0644\u0631\u0651\u064E\u062D\u0650\u064A\u0645\u0650';
export const QURANENC_BISMILLAH_TRANSLATION =
  'Bismill\u00E2hirrahm\u00E2nirrah\u00EEm';
const REQUEST_TIMEOUT_MS = 15000;

type QuranEncSurahResponse = {
  result?: {
    id?: string;
    sura?: string;
    aya?: string;
    arabic_text?: string;
    translation?: string;
    footnotes?: string;
  }[];
};

export async function fetchQuranSurah(surahNumber: number): Promise<QuranSurahContent> {
  const surah = getQuranSurah(surahNumber);
  if (!surah) {
    throw new Error('Geçerli bir sure seçilmedi.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${QURANENC_API_URL}/translation/sura/${QURAN_TRANSLATION_KEY}/${surahNumber}`,
      {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      throw new Error(`Kur’an kaynağı ${response.status} yanıtını verdi.`);
    }

    const payload = (await response.json()) as QuranEncSurahResponse;
    if (!Array.isArray(payload.result) || payload.result.length !== surah.verseCount) {
      throw new Error('Sure içeriği beklenen ayet sayısıyla alınamadı.');
    }

    const verses = payload.result.map((item, index) => {
      const verseNumber = index + 1;
      if (
        Number(item.sura) !== surahNumber ||
        Number(item.aya) !== verseNumber ||
        !item.arabic_text ||
        !item.translation
      ) {
        throw new Error(`${verseNumber}. ayet beklenen biçimde alınamadı.`);
      }

      return {
        id: Number(item.id) || verseNumber,
        surahNumber,
        verseNumber,
        arabicText: item.arabic_text,
        translation: item.translation,
        footnotes: item.footnotes ?? '',
      };
    });

    return {
      surah,
      verses,
      translationKey: QURAN_TRANSLATION_KEY,
      translationTitle: QURAN_TRANSLATION_TITLE,
      translationVersion: QURAN_TRANSLATION_VERSION,
      sourceUrl: `https://quranenc.com/tr/browse/${QURAN_TRANSLATION_KEY}/${surahNumber}`,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Kur’an kaynağına bağlantı zaman aşımına uğradı.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
