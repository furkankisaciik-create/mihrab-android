import { getIstanbulDateKey } from '@/services/daily-content-date';
import type { DailyHadith, HadithSource } from '@/types/hadith';

const HADEETHENC_API_URL = 'https://hadeethenc.com/api/v1';
const SOURCE_NAME = 'Hadis Tercüme Ansiklopedisi (HadeethEnc)';
const SOURCE_VERSION = '1.54.0';
const REQUEST_TIMEOUT_MS = 12000;
const DAY_IN_MS = 86_400_000;

const HADITH_IDS = [
  '4560',
  '5866',
  '8289',
  '5439',
  '5348',
  '5351',
  '5437',
  '5346',
  '5354',
  '4965',
  '3017',
  '3135',
  '3701',
  '3716',
  '3753',
  '4302',
  '4555',
  '4709',
  '4939',
  '5332',
  '5365',
  '5372',
  '5382',
  '3567',
  '3591',
  '3706',
  '66519',
  '66520',
  '66524',
  '66538',
] as const;

const SOURCE_BOOKS = [
  { arabic: 'صحيح البخاري', turkish: 'Sahîh-i Buhârî' },
  { arabic: 'صحيح مسلم', turkish: 'Sahîh-i Müslim' },
  { arabic: 'سنن أبي داود', turkish: 'Sünen-i Ebû Dâvûd' },
  { arabic: 'سنن الترمذي', turkish: 'Sünen-i Tirmizî' },
  { arabic: 'سنن النسائي', turkish: 'Sünen-i Nesâî' },
  { arabic: 'سنن ابن ماجه', turkish: 'Sünen-i İbn Mâce' },
  { arabic: 'مسند أحمد', turkish: 'Müsned-i Ahmed' },
  { arabic: 'السنن الكبرى للبيهقي', turkish: 'Sünenü’l-Kübrâ, Beyhakî' },
] as const;

const FALLBACK_HADITH: Omit<DailyHadith, 'dateKey' | 'fetchedAt'> = {
  id: '5346',
  title: 'Her iyilik bir sadakadır',
  text:
    "Câbir b. Abdullah -radıyallahu anhuma-'dan rivayet edildiğine göre Nebi -sallallahu aleyhi ve sellem- şöyle buyurmuştur: «Her iyilik bir sadakadır.»",
  arabicText:
    'عن جابر بن عبد الله رضي الله عنهما عن النبي صلى الله عليه وسلم قال: «كُلُّ مَعْرُوفٍ صَدَقَةٌ».',
  attribution:
    'Buhârî bunu Câbir hadisinden, Müslim ise Huzeyfe hadisinden rivayet etmiştir',
  grade: 'Sahih Hadis',
  explanation:
    'Nebi -sallallahu aleyhi ve sellem- diğer insanlara söylenen veya yapılan her iyilik ve faydanın sadaka olduğunu ve bunun karşılığında bir sevap ve mükâfat verileceğini haber vermiştir.',
  lessons: [
    'Sadaka, kişinin kendi malından verdiği şeylerle sınırlı değildir. Yaptığı, söylediği ve başkalarına sağladığı her türlü iyiliği kapsar.',
    'İyilik yapma ve başkalarına her konuda faydalı olma hususunda teşvik edilmiştir.',
    'Az dahi olsa hiçbir iyilik küçümsenmemelidir.',
  ],
  sources: [
    { book: 'Sahîh-i Buhârî', hadithNumbers: ['6021'] },
    { book: 'Sahîh-i Müslim', hadithNumbers: ['1005'] },
  ],
  sourceReferenceArabic:
    'صحيح البخاري (8/ 11) (6021).\nصحيح مسلم (2/ 697) (1005).',
  sourceName: SOURCE_NAME,
  sourceVersion: SOURCE_VERSION,
  sourceUrl: 'https://hadeethenc.com/tr/browse/hadith/5346',
};

type HadeethEncResponse = {
  id?: string;
  title?: string;
  hadeeth?: string;
  hadeeth_ar?: string;
  attribution?: string;
  grade?: string;
  explanation?: string;
  hints?: string[];
  reference?: string;
};

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Hadis Tercüme Ansiklopedisi ${response.status} yanıtını verdi.`);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Günlük hadis kaynağına bağlanma zaman aşımına uğradı.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function cleanText(value: string) {
  return value.replace(/\r/g, '').trim();
}

export function parseHadithSources(reference: string): HadithSource[] {
  const sources: HadithSource[] = [];

  for (const line of reference.split('\n')) {
    const book = SOURCE_BOOKS.find((item) => line.includes(item.arabic));
    if (!book) {
      continue;
    }

    const hadithNumbers = [...line.matchAll(/\((\d+)\)/g)].map((match) => match[1]);
    if (!hadithNumbers.length) {
      continue;
    }

    sources.push({
      book: book.turkish,
      hadithNumbers: [...new Set(hadithNumbers)],
    });
  }

  return sources;
}

export function getDailyHadithId(dateKey: string) {
  const dayNumber = Math.floor(Date.parse(`${dateKey}T00:00:00Z`) / DAY_IN_MS);
  const index = ((dayNumber % HADITH_IDS.length) + HADITH_IDS.length) % HADITH_IDS.length;
  return HADITH_IDS[index];
}

function buildDailyHadith(
  dateKey: string,
  id: string,
  translated: HadeethEncResponse,
  arabic: HadeethEncResponse,
): DailyHadith {
  if (
    translated.id !== id ||
    arabic.id !== id ||
    !translated.title ||
    !translated.hadeeth ||
    !translated.hadeeth_ar ||
    !translated.attribution ||
    !translated.grade ||
    !translated.explanation ||
    !arabic.reference
  ) {
    throw new Error('Günlük hadis beklenen biçimde alınamadı.');
  }

  const sources = parseHadithSources(arabic.reference);
  if (!sources.length) {
    throw new Error('Hadisin eser ve numara bilgisi alınamadı.');
  }

  return {
    dateKey,
    id,
    title: cleanText(translated.title),
    text: cleanText(translated.hadeeth),
    arabicText: cleanText(translated.hadeeth_ar),
    attribution: cleanText(translated.attribution),
    grade: cleanText(translated.grade),
    explanation: cleanText(translated.explanation),
    lessons: (translated.hints ?? []).map(cleanText).filter(Boolean),
    sources,
    sourceReferenceArabic: cleanText(arabic.reference),
    sourceName: SOURCE_NAME,
    sourceVersion: SOURCE_VERSION,
    sourceUrl: `https://hadeethenc.com/tr/browse/hadith/${id}`,
    fetchedAt: new Date().toISOString(),
  };
}

export function getFallbackDailyHadith(dateKey = getIstanbulDateKey()): DailyHadith {
  return {
    dateKey,
    ...FALLBACK_HADITH,
    fetchedAt: new Date().toISOString(),
  };
}

export async function fetchDailyHadiths(dateKeys: string[]): Promise<DailyHadith[]> {
  if (!dateKeys.length) {
    return [];
  }

  const ids = dateKeys.map(getDailyHadithId);
  const uniqueIds = [...new Set(ids)];
  const query = encodeURIComponent(uniqueIds.join(','));
  const [translated, arabic] = await Promise.all([
    fetchJson<HadeethEncResponse[]>(
      `${HADEETHENC_API_URL}/hadeeths/multiple/?language=tr&ids=${query}`,
    ),
    fetchJson<HadeethEncResponse[]>(
      `${HADEETHENC_API_URL}/hadeeths/multiple/?language=ar&ids=${query}`,
    ),
  ]);
  const translatedById = new Map(translated.map((item) => [item.id, item]));
  const arabicById = new Map(arabic.map((item) => [item.id, item]));

  return dateKeys.map((dateKey, index) => {
    const id = ids[index];
    return buildDailyHadith(
      dateKey,
      id,
      translatedById.get(id) ?? {},
      arabicById.get(id) ?? {},
    );
  });
}

export async function fetchDailyHadith(dateKey = getIstanbulDateKey()) {
  const [hadith] = await fetchDailyHadiths([dateKey]);
  return hadith;
}
