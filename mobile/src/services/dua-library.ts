import type { Dua, DuaCategory } from '@/types/dua';

export const DUA_CATEGORIES: DuaCategory[] = [
  { key: 'general', label: 'Genel' },
  { key: 'forgiveness', label: 'Bağışlanma' },
  { key: 'worship', label: 'İbadet' },
  { key: 'ease', label: 'Kolaylık' },
  { key: 'knowledge', label: 'İlim' },
  { key: 'healing', label: 'Şifa ve sıkıntı' },
  { key: 'family', label: 'Aile' },
  { key: 'sustenance', label: 'Rızık' },
];

export const DUAS: Dua[] = [
  {
    id: 'world-and-hereafter',
    title: 'Dünya ve ahiret iyiliği',
    summary: 'Dünya ve ahirette iyilik, ateş azabından korunma duası.',
    category: 'general',
    arabicText:
      'رَبَّنَآ ءَاتِنَا فِي ٱلدُّنۡيَا حَسَنَةٗ وَفِي ٱلۡأٓخِرَةِ حَسَنَةٗ وَقِنَا عَذَابَ ٱلنَّارِ',
    transliteration:
      'Rabbenâ âtinâ fid-dünyâ haseneten ve fil-âhireti haseneten ve kınâ azâben-nâr.',
    meaning:
      'Rabbimiz! Bize bu dünyada da iyilik ver, ahirette de iyilik ver ve bizi ateşin azabından koru!',
    source: 'Bakara Suresi, 2:201',
    sourceUrl: 'https://quranenc.com/tr/browse/turkish_rwwad/2/201',
    tags: ['iyilik', 'ahiret', 'korunma', 'rabbena'],
  },
  {
    id: 'steadfast-heart',
    title: 'Kalbin doğrulukta kalması',
    summary: 'Hidayetten sonra kalbin eğrilmemesi ve rahmet için dua.',
    category: 'general',
    arabicText:
      'رَبَّنَا لَا تُزِغۡ قُلُوبَنَا بَعۡدَ إِذۡ هَدَيۡتَنَا وَهَبۡ لَنَا مِن لَّدُنكَ رَحۡمَةًۚ إِنَّكَ أَنتَ ٱلۡوَهَّابُ',
    transliteration:
      'Rabbenâ lâ tuziğ kulûbenâ ba‘de iz hedeytenâ ve heb lenâ min ledünke rahmeh. İnneke entel-Vehhâb.',
    meaning:
      'Rabbimiz! Bizi doğru yola ilettikten sonra kalplerimizi eğriltme. Bize katından rahmet bahşet! Şüphesiz sen bol bol bahşedensin.',
    source: 'Âl-i İmrân Suresi, 3:8',
    sourceUrl: 'https://quranenc.com/tr/browse/turkish_rwwad/3/8',
    tags: ['hidayet', 'kalp', 'rahmet', 'iman'],
  },
  {
    id: 'repentance',
    title: 'Tevbe ve bağışlanma',
    summary: 'Hatayı kabul edip Allah’ın bağışlamasını ve merhametini isteme duası.',
    category: 'forgiveness',
    arabicText:
      'رَبَّنَا ظَلَمۡنَآ أَنفُسَنَا وَإِن لَّمۡ تَغۡفِرۡ لَنَا وَتَرۡحَمۡنَا لَنَكُونَنَّ مِنَ ٱلۡخَٰسِرِينَ',
    transliteration:
      'Rabbenâ zalemnâ enfüsenâ ve illem tağfir lenâ ve terhamnâ le-nekûnenne minel-hâsirîn.',
    meaning:
      'Rabbimiz! Biz kendimize zulmettik. Eğer bizi bağışlamaz ve bize merhamet etmezsen elbette hüsrana uğrayanlardan oluruz.',
    source: 'A‘râf Suresi, 7:23',
    sourceUrl: 'https://quranenc.com/tr/browse/turkish_rwwad/7/23',
    tags: ['tevbe', 'af', 'merhamet', 'bağışlanma'],
  },
  {
    id: 'prayer-and-parents',
    title: 'Namaz, aile ve müminler',
    summary: 'Namaza devam, duanın kabulü ve anne-baba için bağışlanma duası.',
    category: 'worship',
    arabicText:
      'رَبِّ ٱجۡعَلۡنِي مُقِيمَ ٱلصَّلَوٰةِ وَمِن ذُرِّيَّتِيۚ رَبَّنَا وَتَقَبَّلۡ دُعَآءِ ۝ رَبَّنَا ٱغۡفِرۡ لِي وَلِوَٰلِدَيَّ وَلِلۡمُؤۡمِنِينَ يَوۡمَ يَقُومُ ٱلۡحِسَابُ',
    transliteration:
      'Rabbic‘alnî mukîmes-salâti ve min zürriyyetî, rabbenâ ve tekabbel duâ. Rabbenağfir lî ve li-vâlideyye ve lil-mü’minîne yevme yekûmul-hisâb.',
    meaning:
      'Rabbim! Beni ve soyumu namazı ikame edenlerden eyle. Rabbimiz! Duamı kabul buyur. Rabbimiz! Hesap görülecek günde beni, ana babamı ve inananları bağışla.',
    source: 'İbrâhîm Suresi, 14:40-41',
    sourceUrl: 'https://quranenc.com/tr/browse/turkish_rwwad/14/40',
    tags: ['namaz', 'anne', 'baba', 'çocuk', 'dua'],
  },
  {
    id: 'right-guidance',
    title: 'Rahmet ve doğru yol',
    summary: 'Zor bir durumda rahmet ve doğru karar isteme duası.',
    category: 'ease',
    arabicText:
      'رَبَّنَآ ءَاتِنَا مِن لَّدُنكَ رَحۡمَةٗ وَهَيِّئۡ لَنَا مِنۡ أَمۡرِنَا رَشَدٗا',
    transliteration:
      'Rabbenâ âtinâ min ledünke rahmeten ve heyyi’ lenâ min emrinâ raşedâ.',
    meaning:
      'Rabbimiz! Bize katından bir rahmet ver ve bu işimizde doğruyu bize nasip et!',
    source: 'Kehf Suresi, 18:10',
    sourceUrl: 'https://quranenc.com/tr/browse/turkish_rwwad/18/10',
    tags: ['karar', 'doğru yol', 'rahmet', 'gençlik'],
  },
  {
    id: 'ease-and-expression',
    title: 'İşlerin kolaylaşması',
    summary: 'Gönül ferahlığı, kolaylık ve doğru ifade için Hz. Mûsâ’nın duası.',
    category: 'ease',
    arabicText:
      'رَبِّ ٱشۡرَحۡ لِي صَدۡرِي ۝ وَيَسِّرۡ لِيٓ أَمۡرِي ۝ وَٱحۡلُلۡ عُقۡدَةٗ مِّن لِّسَانِي ۝ يَفۡقَهُواْ قَوۡلِي',
    transliteration:
      'Rabbişrah lî sadrî. Ve yessir lî emrî. Vahlul ukdeten min lisânî. Yefkahû kavlî.',
    meaning:
      'Rabbim! Gönlüme ferahlık ver. İşimi kolaylaştır. Dilimdeki düğümü çöz ki sözümü iyi anlasınlar.',
    source: 'Tâhâ Suresi, 20:25-28',
    sourceUrl: 'https://quranenc.com/tr/browse/turkish_rwwad/20/25',
    tags: ['kolaylık', 'konuşma', 'sınav', 'iş', 'ferahlık'],
  },
  {
    id: 'increase-knowledge',
    title: 'İlmin artması',
    summary: 'Bilgi ve anlayışın artması için kısa Kur’an duası.',
    category: 'knowledge',
    arabicText: 'رَّبِّ زِدۡنِي عِلۡمٗا',
    transliteration: 'Rabbi zidnî ilmâ.',
    meaning: 'Rabbim! İlmimi artır.',
    source: 'Tâhâ Suresi, 20:114',
    sourceUrl: 'https://quranenc.com/tr/browse/turkish_rwwad/20/114',
    tags: ['ilim', 'okul', 'ders', 'sınav', 'öğrenme'],
  },
  {
    id: 'illness-and-mercy',
    title: 'Hastalık ve şifa',
    summary: 'Dert ve hastalık anında Allah’ın merhametine sığınma duası.',
    category: 'healing',
    arabicText: 'أَنِّي مَسَّنِيَ ٱلضُّرُّ وَأَنتَ أَرۡحَمُ ٱلرَّٰحِمِينَ',
    transliteration: 'Ennî messeniyed-durru ve ente erhamur-râhimîn.',
    meaning:
      'Şüphesiz ki ben derde uğradım; sen ise merhametlilerin en merhametlisisin.',
    source: 'Enbiyâ Suresi, 21:83',
    sourceUrl: 'https://quranenc.com/tr/browse/turkish_rwwad/21/83',
    tags: ['şifa', 'hastalık', 'dert', 'sabır', 'eyyub'],
  },
  {
    id: 'yunus-prayer',
    title: 'Sıkıntı anında Hz. Yûnus’un duası',
    summary: 'Darlıkta tevhid, tesbih ve hatayı kabul etme duası.',
    category: 'healing',
    arabicText:
      'لَّآ إِلَٰهَ إِلَّآ أَنتَ سُبۡحَٰنَكَ إِنِّي كُنتُ مِنَ ٱلظَّٰلِمِينَ',
    transliteration: 'Lâ ilâhe illâ ente sübhâneke innî küntü minez-zâlimîn.',
    meaning:
      'Senden başka hak ilâh yoktur. Seni eksikliklerden uzak tutarım. Ben gerçekten nefsine zulmedenlerden oldum.',
    source: 'Enbiyâ Suresi, 21:87',
    sourceUrl: 'https://quranenc.com/tr/browse/turkish_rwwad/21/87',
    tags: ['sıkıntı', 'yunus', 'tevhid', 'tesbih', 'darlık'],
  },
  {
    id: 'not-alone',
    title: 'Yalnız bırakılmama duası',
    summary: 'Hz. Zekeriyyâ’nın yalnız kalmamak için yaptığı dua.',
    category: 'family',
    arabicText: 'رَبِّ لَا تَذَرۡنِي فَرۡدٗا وَأَنتَ خَيۡرُ ٱلۡوَٰرِثِينَ',
    transliteration: 'Rabbi lâ tezernî ferden ve ente hayrul-vârisîn.',
    meaning: 'Rabbim! Beni tek başıma bırakma. Sen varislerin en hayırlısısın.',
    source: 'Enbiyâ Suresi, 21:89',
    sourceUrl: 'https://quranenc.com/tr/browse/turkish_rwwad/21/89',
    tags: ['aile', 'evlat', 'yalnızlık', 'zekeriyya'],
  },
  {
    id: 'faith-and-mercy',
    title: 'İman, mağfiret ve rahmet',
    summary: 'İmanın ardından bağışlanma ve merhamet isteme duası.',
    category: 'forgiveness',
    arabicText:
      'رَبَّنَآ ءَامَنَّا فَٱغۡفِرۡ لَنَا وَٱرۡحَمۡنَا وَأَنتَ خَيۡرُ ٱلرَّٰحِمِينَ',
    transliteration:
      'Rabbenâ âmennâ fağfir lenâ verhamnâ ve ente hayrur-râhimîn.',
    meaning:
      'Rabbimiz! İman ettik; bize mağfiret ve rahmet buyur. Sen merhamet edenlerin en hayırlısısın.',
    source: 'Mü’minûn Suresi, 23:109',
    sourceUrl: 'https://quranenc.com/tr/browse/turkish_rwwad/23/109',
    tags: ['iman', 'mağfiret', 'rahmet', 'af'],
  },
  {
    id: 'family-peace',
    title: 'Huzurlu aile',
    summary: 'Eş ve çocukların göz aydınlığı olması için dua.',
    category: 'family',
    arabicText:
      'رَبَّنَا هَبۡ لَنَا مِنۡ أَزۡوَٰجِنَا وَذُرِّيَّٰتِنَا قُرَّةَ أَعۡيُنٖ وَٱجۡعَلۡنَا لِلۡمُتَّقِينَ إِمَامًا',
    transliteration:
      'Rabbenâ heb lenâ min ezvâcinâ ve zürriyyâtinâ kurrate a‘yunin vec‘alnâ lil-muttakîne imâmâ.',
    meaning:
      'Ey Rabbimiz! Eşlerimizi ve çocuklarımızı bize göz aydınlığı kıl ve bizi Allah’a karşı gelmekten sakınanlara önder eyle!',
    source: 'Furkân Suresi, 25:74',
    sourceUrl: 'https://quranenc.com/tr/browse/turkish_rwwad/25/74',
    tags: ['aile', 'eş', 'çocuk', 'huzur', 'takva'],
  },
  {
    id: 'need-for-good',
    title: 'Hayır ve rızık isteme',
    summary: 'Allah’tan gelecek her türlü hayra muhtaç olduğunu bildirme duası.',
    category: 'sustenance',
    arabicText: 'رَبِّ إِنِّي لِمَآ أَنزَلۡتَ إِلَيَّ مِنۡ خَيۡرٖ فَقِيرٞ',
    transliteration: 'Rabbi innî limâ enzelte ileyye min hayrin fakîr.',
    meaning: 'Rabbim! Doğrusu bana indireceğin hayra muhtacım.',
    source: 'Kasas Suresi, 28:24',
    sourceUrl: 'https://quranenc.com/tr/browse/turkish_rwwad/28/24',
    tags: ['rızık', 'iş', 'hayır', 'ihtiyaç', 'musa'],
  },
];

export function getDuaCategoryLabel(key: Dua['category']) {
  return DUA_CATEGORIES.find((category) => category.key === key)?.label ?? 'Dua';
}

export function normalizeDuaSearch(value: string) {
  return value
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’‘]/g, "'");
}

export function searchDuas(query: string, category?: Dua['category']) {
  const normalizedQuery = normalizeDuaSearch(query.trim());

  return DUAS.filter((dua) => {
    if (category && dua.category !== category) {
      return false;
    }
    if (!normalizedQuery) {
      return true;
    }

    const searchable = normalizeDuaSearch(
      [
        dua.title,
        dua.summary,
        dua.transliteration,
        dua.meaning,
        dua.source,
        ...dua.tags,
      ].join(' '),
    );
    return searchable.includes(normalizedQuery);
  });
}
