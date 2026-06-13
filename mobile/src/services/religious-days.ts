import type {
  ReligiousDay,
  ReligiousDayCategory,
  ReligiousDayGroup,
} from '@/types/religious-day';

const SOURCE_URLS: Record<number, string> = {
  2026: 'https://vakithesaplama.diyanet.gov.tr/icerik.php?icerik=153',
  2027: 'https://vakithesaplama.diyanet.gov.tr/icerik.php?icerik=154',
};

const CATEGORY_LABELS: Record<ReligiousDayCategory, string> = {
  kandil: 'Kandil gecesi',
  bayram: 'Bayram',
  baslangic: 'Mübarek zaman',
  onemli: 'Önemli gün',
};

const DESCRIPTIONS = {
  mirac: {
    summary:
      'İsrâ ve Miraç hadisesinin hatırlandığı, namazın öneminin yeniden düşünüldüğü mübarek gece.',
    suggestion:
      'Geceyi dua, Kur’an tilaveti, namaz ve iç muhasebeyle değerlendirebilirsin.',
  },
  berat: {
    summary:
      'Şaban ayının on beşinci gecesi; bağışlanma, rahmet ve arınma ümidiyle idrak edilir.',
    suggestion:
      'Tövbe, dua ve kırgınlıkları onarma niyeti için sakin bir vakit ayırabilirsin.',
  },
  ramadanStart: {
    summary:
      'Oruç, Kur’an, paylaşma ve dayanışma ayı Ramazan’ın ilk günü.',
    suggestion:
      'Sahur, iftar ve ibadet düzenini namaz vakitlerine göre planlayabilirsin.',
  },
  qadr: {
    summary:
      'Kur’an’ın indirilmeye başladığı, bin aydan hayırlı olduğu bildirilen mübarek gece.',
    suggestion:
      'Geceyi Kur’an, dua, tövbe ve tefekkürle değerlendirebilirsin.',
  },
  ramadanEve: {
    summary:
      'Ramazan Bayramı’ndan önceki hazırlık ve ziyaret günüdür.',
    suggestion:
      'Bayram hazırlıklarını tamamlayıp yakınlarınla iletişim kurabilirsin.',
  },
  ramadanFeast: {
    summary:
      'Ramazan’ın ardından şükür, sevinç, ziyaret ve paylaşma günüdür.',
    suggestion:
      'Bayram namazı, aile ziyaretleri ve ihtiyaç sahiplerini gözetme için plan yapabilirsin.',
  },
  sacrificeEve: {
    summary:
      'Kurban Bayramı’ndan önceki Arefe günü; hac ibadetinin de önemli günlerindendir.',
    suggestion:
      'Bayram ve kurban hazırlıklarını tamamlayıp dua için vakit ayırabilirsin.',
  },
  sacrificeFeast: {
    summary:
      'Teslimiyet, paylaşma, yardımlaşma ve yakınlaşma bilincinin öne çıktığı bayram günüdür.',
    suggestion:
      'Kurban ve paylaşım planını, aile ziyaretlerini ve namaz vakitlerini düzenleyebilirsin.',
  },
  newYear: {
    summary:
      'Hicri takvimde yeni yılın ve Muharrem ayının ilk günüdür.',
    suggestion:
      'Geçen yılı değerlendirip yeni dönem için iyilik ve ibadet niyetleri belirleyebilirsin.',
  },
  ashura: {
    summary:
      'Muharrem ayının onuncu günü; tarih boyunca önemli hadiselerin hatırlandığı gündür.',
    suggestion:
      'Paylaşma, dua ve tefekkür için vakit ayırabilirsin.',
  },
  mawlid: {
    summary:
      'Hz. Muhammed’in doğumunun ve örnek ahlakının hatırlandığı mübarek gece.',
    suggestion:
      'Siyer okumak, salavat getirmek ve güzel ahlak üzerine düşünmek için vakit ayırabilirsin.',
  },
  sacredMonths: {
    summary:
      'Recep, Şaban ve Ramazan aylarından oluşan manevi hazırlık döneminin başlangıcıdır.',
    suggestion:
      'Ramazan’a uzanan ibadet ve günlük alışkanlık planını bugünden oluşturabilirsin.',
  },
  raghaib: {
    summary:
      'Recep ayının ilk cuma gecesi; rahmet ve bereket ümidiyle idrak edilir.',
    suggestion:
      'Geceyi dua, Kur’an ve iç muhasebeyle değerlendirebilirsin.',
  },
} as const;

type DayInput = Omit<
  ReligiousDay,
  'id' | 'categoryLabel' | 'officialYear' | 'sourceUrl'
>;

function day(year: number, input: DayInput): ReligiousDay {
  return {
    ...input,
    id: `${input.dateKey}-${input.shortName
      .toLocaleLowerCase('tr-TR')
      .replace(/\s+/g, '-')}`,
    categoryLabel: CATEGORY_LABELS[input.category],
    officialYear: year,
    sourceUrl: SOURCE_URLS[year],
  };
}

function feastDays(
  year: number,
  options: {
    name: string;
    shortName: string;
    dates: string[];
    hijriDates: string[];
    description: typeof DESCRIPTIONS.ramadanFeast | typeof DESCRIPTIONS.sacrificeFeast;
  },
) {
  return options.dates.map((dateKey, index) =>
    day(year, {
      name: `${options.name} ${index + 1}. Gün`,
      shortName: `${options.shortName} ${index + 1}`,
      dateKey,
      hijriDate: options.hijriDates[index],
      category: 'bayram',
      ...options.description,
    }),
  );
}

const DAYS_2026: ReligiousDay[] = [
  day(2026, {
    name: 'Miraç Kandili',
    shortName: 'Miraç',
    dateKey: '2026-01-15',
    hijriDate: '26 Receb 1447',
    category: 'kandil',
    beginsAtSunset: true,
    ...DESCRIPTIONS.mirac,
  }),
  day(2026, {
    name: 'Berat Kandili',
    shortName: 'Berat',
    dateKey: '2026-02-02',
    hijriDate: '14 Şaban 1447',
    category: 'kandil',
    beginsAtSunset: true,
    ...DESCRIPTIONS.berat,
  }),
  day(2026, {
    name: 'Ramazan Başlangıcı',
    shortName: 'Ramazan',
    dateKey: '2026-02-19',
    hijriDate: '1 Ramazan 1447',
    category: 'baslangic',
    ...DESCRIPTIONS.ramadanStart,
  }),
  day(2026, {
    name: 'Kadir Gecesi',
    shortName: 'Kadir',
    dateKey: '2026-03-16',
    hijriDate: '26 Ramazan 1447',
    category: 'kandil',
    beginsAtSunset: true,
    ...DESCRIPTIONS.qadr,
  }),
  day(2026, {
    name: 'Ramazan Bayramı Arefesi',
    shortName: 'Ramazan Arefesi',
    dateKey: '2026-03-19',
    hijriDate: '29 Ramazan 1447',
    category: 'bayram',
    ...DESCRIPTIONS.ramadanEve,
  }),
  ...feastDays(2026, {
    name: 'Ramazan Bayramı',
    shortName: 'Ramazan Bayramı',
    dates: ['2026-03-20', '2026-03-21', '2026-03-22'],
    hijriDates: ['1 Şevval 1447', '2 Şevval 1447', '3 Şevval 1447'],
    description: DESCRIPTIONS.ramadanFeast,
  }),
  day(2026, {
    name: 'Kurban Bayramı Arefesi',
    shortName: 'Kurban Arefesi',
    dateKey: '2026-05-26',
    hijriDate: '9 Zilhicce 1447',
    category: 'bayram',
    ...DESCRIPTIONS.sacrificeEve,
  }),
  ...feastDays(2026, {
    name: 'Kurban Bayramı',
    shortName: 'Kurban Bayramı',
    dates: ['2026-05-27', '2026-05-28', '2026-05-29', '2026-05-30'],
    hijriDates: [
      '10 Zilhicce 1447',
      '11 Zilhicce 1447',
      '12 Zilhicce 1447',
      '13 Zilhicce 1447',
    ],
    description: DESCRIPTIONS.sacrificeFeast,
  }),
  day(2026, {
    name: 'Hicri Yılbaşı',
    shortName: 'Hicri Yılbaşı',
    dateKey: '2026-06-16',
    hijriDate: '1 Muharrem 1448',
    category: 'onemli',
    ...DESCRIPTIONS.newYear,
  }),
  day(2026, {
    name: 'Aşure Günü',
    shortName: 'Aşure',
    dateKey: '2026-06-25',
    hijriDate: '10 Muharrem 1448',
    category: 'onemli',
    ...DESCRIPTIONS.ashura,
  }),
  day(2026, {
    name: 'Mevlid Kandili',
    shortName: 'Mevlid',
    dateKey: '2026-08-24',
    hijriDate: '11 Rebiülevvel 1448',
    category: 'kandil',
    beginsAtSunset: true,
    ...DESCRIPTIONS.mawlid,
  }),
  day(2026, {
    name: 'Üç Ayların Başlangıcı',
    shortName: 'Üç Aylar',
    dateKey: '2026-12-10',
    hijriDate: '1 Receb 1448',
    category: 'baslangic',
    ...DESCRIPTIONS.sacredMonths,
  }),
  day(2026, {
    name: 'Regaib Kandili',
    shortName: 'Regaib',
    dateKey: '2026-12-10',
    hijriDate: '1 Receb 1448',
    category: 'kandil',
    beginsAtSunset: true,
    ...DESCRIPTIONS.raghaib,
  }),
];

const DAYS_2027: ReligiousDay[] = [
  day(2027, {
    name: 'Miraç Kandili',
    shortName: 'Miraç',
    dateKey: '2027-01-04',
    hijriDate: '26 Receb 1448',
    category: 'kandil',
    beginsAtSunset: true,
    ...DESCRIPTIONS.mirac,
  }),
  day(2027, {
    name: 'Berat Kandili',
    shortName: 'Berat',
    dateKey: '2027-01-22',
    hijriDate: '14 Şaban 1448',
    category: 'kandil',
    beginsAtSunset: true,
    ...DESCRIPTIONS.berat,
  }),
  day(2027, {
    name: 'Ramazan Başlangıcı',
    shortName: 'Ramazan',
    dateKey: '2027-02-08',
    hijriDate: '1 Ramazan 1448',
    category: 'baslangic',
    ...DESCRIPTIONS.ramadanStart,
  }),
  day(2027, {
    name: 'Kadir Gecesi',
    shortName: 'Kadir',
    dateKey: '2027-03-05',
    hijriDate: '26 Ramazan 1448',
    category: 'kandil',
    beginsAtSunset: true,
    ...DESCRIPTIONS.qadr,
  }),
  day(2027, {
    name: 'Ramazan Bayramı Arefesi',
    shortName: 'Ramazan Arefesi',
    dateKey: '2027-03-08',
    hijriDate: '29 Ramazan 1448',
    category: 'bayram',
    ...DESCRIPTIONS.ramadanEve,
  }),
  ...feastDays(2027, {
    name: 'Ramazan Bayramı',
    shortName: 'Ramazan Bayramı',
    dates: ['2027-03-09', '2027-03-10', '2027-03-11'],
    hijriDates: ['1 Şevval 1448', '2 Şevval 1448', '3 Şevval 1448'],
    description: DESCRIPTIONS.ramadanFeast,
  }),
  day(2027, {
    name: 'Kurban Bayramı Arefesi',
    shortName: 'Kurban Arefesi',
    dateKey: '2027-05-15',
    hijriDate: '9 Zilhicce 1448',
    category: 'bayram',
    ...DESCRIPTIONS.sacrificeEve,
  }),
  ...feastDays(2027, {
    name: 'Kurban Bayramı',
    shortName: 'Kurban Bayramı',
    dates: ['2027-05-16', '2027-05-17', '2027-05-18', '2027-05-19'],
    hijriDates: [
      '10 Zilhicce 1448',
      '11 Zilhicce 1448',
      '12 Zilhicce 1448',
      '13 Zilhicce 1448',
    ],
    description: DESCRIPTIONS.sacrificeFeast,
  }),
  day(2027, {
    name: 'Hicri Yılbaşı',
    shortName: 'Hicri Yılbaşı',
    dateKey: '2027-06-06',
    hijriDate: '1 Muharrem 1449',
    category: 'onemli',
    ...DESCRIPTIONS.newYear,
  }),
  day(2027, {
    name: 'Aşure Günü',
    shortName: 'Aşure',
    dateKey: '2027-06-15',
    hijriDate: '10 Muharrem 1449',
    category: 'onemli',
    ...DESCRIPTIONS.ashura,
  }),
  day(2027, {
    name: 'Mevlid Kandili',
    shortName: 'Mevlid',
    dateKey: '2027-08-13',
    hijriDate: '11 Rebiülevvel 1449',
    category: 'kandil',
    beginsAtSunset: true,
    ...DESCRIPTIONS.mawlid,
  }),
  day(2027, {
    name: 'Üç Ayların Başlangıcı',
    shortName: 'Üç Aylar',
    dateKey: '2027-11-29',
    hijriDate: '1 Receb 1449',
    category: 'baslangic',
    ...DESCRIPTIONS.sacredMonths,
  }),
  day(2027, {
    name: 'Regaib Kandili',
    shortName: 'Regaib',
    dateKey: '2027-12-02',
    hijriDate: '4 Receb 1449',
    category: 'kandil',
    beginsAtSunset: true,
    ...DESCRIPTIONS.raghaib,
  }),
  day(2027, {
    name: 'Miraç Kandili',
    shortName: 'Miraç',
    dateKey: '2027-12-24',
    hijriDate: '26 Receb 1449',
    category: 'kandil',
    beginsAtSunset: true,
    ...DESCRIPTIONS.mirac,
  }),
];

export const RELIGIOUS_DAY_YEARS = [2026, 2027] as const;

export const RELIGIOUS_DAYS = [...DAYS_2026, ...DAYS_2027].sort((left, right) =>
  left.dateKey.localeCompare(right.dateKey),
);

export function getReligiousDaysForYear(year: number) {
  return RELIGIOUS_DAYS.filter((item) => item.officialYear === year);
}

export function getDaysUntil(dateKey: string, fromDateKey: string) {
  const dayInMs = 24 * 60 * 60 * 1000;
  const target = Date.parse(`${dateKey}T00:00:00Z`);
  const from = Date.parse(`${fromDateKey}T00:00:00Z`);
  return Math.round((target - from) / dayInMs);
}

export function getNextReligiousDay(fromDateKey: string) {
  return RELIGIOUS_DAYS.find((item) => item.dateKey >= fromDateKey) ?? null;
}

export function getReligiousDaysOn(dateKey: string) {
  return RELIGIOUS_DAYS.filter((item) => item.dateKey === dateKey);
}

export function formatReligiousDayDate(dateKey: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${dateKey}T12:00:00+03:00`));
}

export function formatReligiousCountdown(days: number) {
  if (days < 0) {
    return `${Math.abs(days)} gün önceydi`;
  }
  if (days === 0) {
    return 'Bugün';
  }
  if (days === 1) {
    return 'Yarın';
  }
  return `${days} gün kaldı`;
}

export function groupReligiousDays(days: ReligiousDay[]): ReligiousDayGroup[] {
  const formatter = new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    month: 'long',
    year: 'numeric',
  });
  const groups = new Map<string, ReligiousDayGroup>();

  for (const item of days) {
    const monthKey = item.dateKey.slice(0, 7);
    const existing = groups.get(monthKey);
    if (existing) {
      existing.days.push(item);
      continue;
    }

    groups.set(monthKey, {
      monthKey,
      monthLabel: formatter.format(
        new Date(`${item.dateKey.slice(0, 7)}-15T12:00:00+03:00`),
      ),
      days: [item],
    });
  }

  return [...groups.values()];
}
