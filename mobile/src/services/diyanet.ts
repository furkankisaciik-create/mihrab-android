import { Platform } from 'react-native';

import type {
  DiyanetCity,
  DiyanetDistrict,
  PrayerDaySchedule,
  PrayerLocation,
  PrayerTime,
  PrayerTimesSnapshot,
} from '../types/prayer';

const DIYANET_BASE_URL = 'https://namazvakitleri.diyanet.gov.tr';
const TURKEY_ID = '2';
const REQUEST_TIMEOUT_MS = 15000;

function getWebApiUrl(action: string, params: Record<string, string> = {}) {
  const query = new URLSearchParams({ action, ...params });
  return `/api/diyanet?${query.toString()}`;
}

const PRAYER_FIELDS = [
  { key: 'imsak', variable: '_imsakTime', name: 'İmsak', symbol: '☾' },
  { key: 'gunes', variable: '_gunesTime', name: 'Güneş', symbol: '☀' },
  { key: 'ogle', variable: '_ogleTime', name: 'Öğle', symbol: '◉' },
  { key: 'ikindi', variable: '_ikindiTime', name: 'İkindi', symbol: '◒' },
  { key: 'aksam', variable: '_aksamTime', name: 'Akşam', symbol: '◐' },
  { key: 'yatsi', variable: '_yatsiTime', name: 'Yatsı', symbol: '☽' },
] as const;

type DiyanetRegionResponse = {
  StateList?: { SehirID: string; SehirAdi: string }[] | null;
  StateRegionList?: { IlceID: string; IlceAdi: string; IlceUrl: string }[] | null;
};

let cityCache: DiyanetCity[] | null = null;
const districtCache = new Map<string, DiyanetDistrict[]>();

async function fetchOnce(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json, text/html;q=0.9, */*;q=0.8',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = new Error(`Diyanet servisi ${response.status} yanıtını verdi.`);
      Object.assign(error, { status: response.status });
      throw error;
    }

    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Diyanet servisine bağlanma zaman aşımına uğradı.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchWithTimeout(url: string) {
  try {
    return await fetchOnce(url);
  } catch (error) {
    const status =
      error instanceof Error && 'status' in error ? Number((error as Error & { status: number }).status) : 0;
    if (status >= 400 && status < 500 && status !== 429) {
      throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, 350));
    return fetchOnce(url);
  }
}

export async function getTurkeyCities(): Promise<DiyanetCity[]> {
  if (cityCache) {
    return cityCache;
  }

  const query = new URLSearchParams({
    ChangeType: 'country',
    CountryId: TURKEY_ID,
    Culture: 'tr-TR',
  });
  const url =
    Platform.OS === 'web'
      ? getWebApiUrl('cities')
      : `${DIYANET_BASE_URL}/tr-TR/home/GetRegList?${query.toString()}`;
  const response = await fetchWithTimeout(url);
  const payload = (await response.json()) as DiyanetRegionResponse;

  if (!payload.StateList?.length) {
    throw new Error('Diyanet il listesi alınamadı.');
  }

  cityCache = payload.StateList.map((city) => ({
    id: String(city.SehirID),
    name: city.SehirAdi,
  }));

  return cityCache;
}

export async function getDistricts(cityId: string): Promise<DiyanetDistrict[]> {
  const cached = districtCache.get(cityId);
  if (cached) {
    return cached;
  }

  const query = new URLSearchParams({
    ChangeType: 'state',
    CountryId: TURKEY_ID,
    StateId: cityId,
    Culture: 'tr-TR',
  });
  const url =
    Platform.OS === 'web'
      ? getWebApiUrl('districts', { cityId })
      : `${DIYANET_BASE_URL}/tr-TR/home/GetRegList?${query.toString()}`;
  const response = await fetchWithTimeout(url);
  const payload = (await response.json()) as DiyanetRegionResponse;

  if (!payload.StateRegionList?.length) {
    throw new Error('Diyanet ilçe listesi alınamadı.');
  }

  const districts = payload.StateRegionList.map((district) => ({
    id: String(district.IlceID),
    name: district.IlceAdi,
    path: district.IlceUrl,
  }));
  districtCache.set(cityId, districts);
  return districts;
}

function readJavascriptString(html: string, variable: string) {
  const match = html.match(new RegExp(`var\\s+${variable}\\s*=\\s*"([^"]+)"`));
  return match?.[1] ?? '';
}

function decodeHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function readDatesFromWeeklyTable(html: string) {
  const headerIndex = html.indexOf('Hicri Tarih');
  const bodyIndex = html.indexOf('<tbody', headerIndex);
  const body = bodyIndex >= 0 ? html.slice(bodyIndex) : '';
  const firstRow = body.match(/<tr[^>]*>([\s\S]*?)<\/tr>/i)?.[1] ?? '';
  const cells = [...firstRow.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((match) =>
    decodeHtml(match[1]),
  );

  return {
    gregorianDate: cells[2] ?? '',
    hijriDate: cells[3] ?? '',
  };
}

const TURKISH_MONTHS: Record<string, number> = {
  ocak: 1,
  subat: 2,
  mart: 3,
  nisan: 4,
  mayis: 5,
  haziran: 6,
  temmuz: 7,
  agustos: 8,
  eylul: 9,
  ekim: 10,
  kasim: 11,
  aralik: 12,
};

function normalizeTurkishDate(value: string) {
  return value
    .toLocaleLowerCase('tr-TR')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
}

function readDateKey(value: string) {
  const match = value.match(/^(\d{1,2})\s+([^\s]+)\s+(\d{4})/);
  if (!match) {
    return '';
  }

  const month = TURKISH_MONTHS[normalizeTurkishDate(match[2])];
  if (!month) {
    return '';
  }

  return `${match[3]}-${String(month).padStart(2, '0')}-${match[1].padStart(2, '0')}`;
}

function readScheduleFromTab(html: string, tabNumber: number): PrayerDaySchedule[] {
  const tabStart = html.indexOf(`id="tab-${tabNumber}"`);
  const tabEnd = html.indexOf(`id="tab-${tabNumber + 1}"`, tabStart);
  const tableHtml =
    tabStart >= 0
      ? html.slice(tabStart, tabEnd >= 0 ? tabEnd : undefined)
      : '';
  const body = tableHtml.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/i)?.[1] ?? '';

  const schedule: PrayerDaySchedule[] = [];
  const rows = [...body.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];

  for (const row of rows) {
    const cells = [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((cell) =>
      decodeHtml(cell[1]),
    );
    const dateIndex = cells.length - 8;
    if (dateIndex < 0) {
      continue;
    }

    const dateKey = readDateKey(cells[dateIndex] ?? '');
    const prayers: PrayerTime[] = PRAYER_FIELDS.map((field, index) => ({
      key: field.key,
      name: field.name,
      symbol: field.symbol,
      time: cells[dateIndex + index + 2] ?? '',
    }));

    if (!dateKey || prayers.some((prayer) => !/^\d{2}:\d{2}$/.test(prayer.time))) {
      continue;
    }

    schedule.push({
      dateKey,
      gregorianDate: cells[dateIndex],
      hijriDate: cells[dateIndex + 1] ?? '',
      prayers,
    });
  }

  return schedule;
}

function readPrayerSchedule(html: string) {
  const yearly = readScheduleFromTab(html, 2);
  if (yearly.length >= 300) {
    return yearly;
  }

  const monthly = readScheduleFromTab(html, 1);
  if (monthly.length) {
    return monthly;
  }

  return readScheduleFromTab(html, 0);
}

export function getTurkeyDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function parseDiyanetPrayerPage(
  html: string,
  location: PrayerLocation,
): PrayerTimesSnapshot {
  const prayers: PrayerTime[] = PRAYER_FIELDS.map((field) => ({
    key: field.key,
    name: field.name,
    symbol: field.symbol,
    time: readJavascriptString(html, field.variable),
  }));

  if (prayers.some((prayer) => !/^\d{2}:\d{2}$/.test(prayer.time))) {
    throw new Error('Diyanet vakitleri beklenen biçimde alınamadı.');
  }

  const dates = readDatesFromWeeklyTable(html);
  const schedule = readPrayerSchedule(html);
  const sourceUrl = `${DIYANET_BASE_URL}${location.district.path}`;

  return {
    location,
    prayers,
    gregorianDate: dates.gregorianDate,
    hijriDate: dates.hijriDate,
    dateKey: getTurkeyDateKey(),
    fetchedAt: new Date().toISOString(),
    sourceUrl,
    schedule,
  };
}

export async function getPrayerTimes(
  location: PrayerLocation,
): Promise<PrayerTimesSnapshot> {
  const sourceUrl = `${DIYANET_BASE_URL}${location.district.path}`;
  const requestUrl =
    Platform.OS === 'web'
      ? getWebApiUrl('prayer', { path: location.district.path })
      : sourceUrl;
  const response = await fetchWithTimeout(requestUrl);
  const html = await response.text();
  return parseDiyanetPrayerPage(html, location);
}
