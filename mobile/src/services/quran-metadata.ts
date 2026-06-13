import type { QuranSurah } from '@/types/quran';

const SURAH_NAMES = [
  'Fâtiha', 'Bakara', 'Âl-i İmrân', 'Nisâ', 'Mâide', 'En‘âm', 'A‘râf', 'Enfâl',
  'Tevbe', 'Yûnus', 'Hûd', 'Yûsuf', 'Ra‘d', 'İbrâhîm', 'Hicr', 'Nahl', 'İsrâ',
  'Kehf', 'Meryem', 'Tâhâ', 'Enbiyâ', 'Hac', 'Mü’minûn', 'Nûr', 'Furkân',
  'Şuarâ', 'Neml', 'Kasas', 'Ankebût', 'Rûm', 'Lokmân', 'Secde', 'Ahzâb',
  'Sebe’', 'Fâtır', 'Yâsîn', 'Sâffât', 'Sâd', 'Zümer', 'Mü’min', 'Fussilet',
  'Şûrâ', 'Zuhruf', 'Duhân', 'Câsiye', 'Ahkâf', 'Muhammed', 'Fetih', 'Hucurât',
  'Kâf', 'Zâriyât', 'Tûr', 'Necm', 'Kamer', 'Rahmân', 'Vâkıa', 'Hadîd',
  'Mücâdele', 'Haşr', 'Mümtehine', 'Saf', 'Cum‘a', 'Münâfikûn', 'Tegâbün',
  'Talâk', 'Tahrîm', 'Mülk', 'Kalem', 'Hâkka', 'Meâric', 'Nûh', 'Cin',
  'Müzzemmil', 'Müddessir', 'Kıyâmet', 'İnsan', 'Mürselât', 'Nebe’', 'Nâziât',
  'Abese', 'Tekvîr', 'İnfitâr', 'Mutaffifîn', 'İnşikâk', 'Bürûc', 'Târık',
  'A‘lâ', 'Gâşiye', 'Fecr', 'Beled', 'Şems', 'Leyl', 'Duhâ', 'İnşirâh', 'Tîn',
  'Alak', 'Kadir', 'Beyyine', 'Zilzâl', 'Âdiyât', 'Kâria', 'Tekâsür', 'Asr',
  'Hümeze', 'Fîl', 'Kureyş', 'Mâûn', 'Kevser', 'Kâfirûn', 'Nasr', 'Tebbet',
  'İhlâs', 'Felak', 'Nâs',
] as const;

const VERSE_COUNTS = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128,
  111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73,
  54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60,
  49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52,
  44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19,
  26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3,
  6, 3, 5, 4, 5, 6,
] as const;

const MEDINAN_SURAHS = new Set([
  2, 3, 4, 5, 8, 9, 13, 22, 24, 33, 47, 48, 49, 55, 57, 58, 59, 60, 61, 62,
  63, 64, 65, 66, 76, 98, 99, 110,
]);

export const QURAN_SURAHS: QuranSurah[] = SURAH_NAMES.map((name, index) => ({
  number: index + 1,
  name,
  verseCount: VERSE_COUNTS[index],
  revelationPlace: MEDINAN_SURAHS.has(index + 1) ? 'Medine' : 'Mekke',
}));

export const TOTAL_QURAN_VERSES = VERSE_COUNTS.reduce((total, count) => total + count, 0);

export function getQuranSurah(number: number) {
  return QURAN_SURAHS[number - 1] ?? null;
}

export function normalizeQuranSearch(value: string) {
  return value
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’‘]/g, "'");
}

export function searchQuranSurahs(query: string) {
  const normalized = normalizeQuranSearch(query.trim());
  if (!normalized) {
    return QURAN_SURAHS;
  }

  return QURAN_SURAHS.filter((surah) =>
    normalizeQuranSearch(`${surah.number} ${surah.name}`).includes(normalized),
  );
}
