const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

function dateKeyAt(index) {
  const date = new Date('2026-02-19T00:00:00Z');
  date.setUTCDate(date.getUTCDate() + index);
  return date.toISOString().slice(0, 10);
}

function timeAt(startMinutes, endMinutes, index, total) {
  const minutes = Math.round(
    startMinutes + ((endMinutes - startMinutes) * index) / (total - 1),
  );
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(
    minutes % 60,
  ).padStart(2, '0')}`;
}

function createRamadanSchedule() {
  return Array.from({ length: 29 }, (_, index) => {
    const dateKey = dateKeyAt(index);
    const imsak = timeAt(6 * 60 + 6, 5 * 60 + 24, index, 29);
    const iftar = timeAt(18 * 60 + 35, 19 * 60 + 6, index, 29);

    return {
      dateKey,
      gregorianDate: dateKey,
      hijriDate: `${index + 1} Ramazan 1447`,
      prayers: [
        { key: 'imsak', name: 'İmsak', time: imsak, symbol: '☾' },
        { key: 'gunes', name: 'Güneş', time: '07:30', symbol: '☀' },
        { key: 'ogle', name: 'Öğle', time: '13:07', symbol: '◉' },
        { key: 'ikindi', name: 'İkindi', time: '16:06', symbol: '◒' },
        { key: 'aksam', name: 'Akşam', time: iftar, symbol: '◐' },
        { key: 'yatsi', name: 'Yatsı', time: '19:54', symbol: '☽' },
      ],
    };
  });
}

const ramadanSchedule = createRamadanSchedule();
const snapshot = {
  location: {
    city: { id: '506', name: 'ANKARA' },
    district: {
      id: '9206',
      name: 'ANKARA',
      path: '/tr-TR/9206/ankara-icin-namaz-vakti',
    },
  },
  prayers: ramadanSchedule[0].prayers,
  gregorianDate: '08 Haziran 2026 Pazartesi',
  hijriDate: '22 Zilhicce 1447',
  dateKey: '2026-06-08',
  fetchedAt: '2026-06-08T12:00:00.000Z',
  sourceUrl:
    'https://namazvakitleri.diyanet.gov.tr/tr-TR/9206/ankara-icin-namaz-vakti',
  schedule: ramadanSchedule,
};

async function main() {
  const artifactsDirectory = path.resolve(__dirname, '..', 'test-artifacts');
  fs.mkdirSync(artifactsDirectory, { recursive: true });

  const errors = [];
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    headless: true,
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    await context.addInitScript((cachedSnapshot) => {
      localStorage.clear();
      localStorage.setItem(
        '@mihrab/prayer-times-snapshot',
        JSON.stringify(cachedSnapshot),
      );
    }, snapshot);
    const page = await context.newPage();

    page.on('console', (message) => {
      if (message.type() === 'error') {
        errors.push(`console: ${message.text()}`);
      }
    });
    page.on('pageerror', (error) => errors.push(`page: ${error.message}`));

    await page.goto('http://127.0.0.1:8081/ramadan', {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    await page.getByText('Sahurdan iftara bütün ay', { exact: true }).waitFor();
    await page.getByText('Ramazan 1448', { exact: true }).waitFor();
    await page.getByText('245', { exact: true }).waitFor();
    await page.getByText('Ramazan 1447', { exact: true }).waitFor();
    await page.getByText('29', { exact: true }).first().waitFor();
    await page.getByText('06:06', { exact: true }).first().waitFor();
    await page.getByText('18:35', { exact: true }).first().waitFor();
    await page.getByText('12 sa 29 dk', { exact: true }).first().waitFor();

    const refreshButton = page.getByRole('button', {
      name: 'İmsakiye verisini yenile',
      exact: true,
    });
    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes('/api/diyanet?action=prayer') &&
          response.status() === 200,
        { timeout: 60000 },
      ),
      refreshButton.click(),
    ]);
    await refreshButton.waitFor({ timeout: 60000 });
    await page.getByText('29', { exact: true }).first().waitFor();
    await page.getByText('06:06', { exact: true }).first().waitFor();
    await page.getByText('18:35', { exact: true }).first().waitFor();

    await page
      .getByRole('button', { name: 'Ramazan 29. günü göster', exact: true })
      .click();
    await page.getByText('05:24', { exact: true }).first().waitFor();
    await page.getByText('19:06', { exact: true }).first().waitFor();
    await page.getByText('13 sa 42 dk', { exact: true }).first().waitFor();

    await page.screenshot({
      path: path.join(artifactsDirectory, 'ramadan-day-29.png'),
      fullPage: true,
    });

    await page.reload({ waitUntil: 'networkidle' });
    await page.getByText('Sahurdan iftara bütün ay', { exact: true }).waitFor();
    await page.screenshot({
      path: path.join(artifactsDirectory, 'ramadan-imsakiye.png'),
    });

    await page.goto('http://127.0.0.1:8081', {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    const preview = page.getByRole('button', {
      name: 'Ramazan imsakiyesini aç',
      exact: true,
    });
    await preview.waitFor();
    await preview
      .getByText('1448 Ramazan’a 245 gün', { exact: true })
      .waitFor();

    await page.goto('http://127.0.0.1:8081/explore', {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    await page.getByText('14 / 32 ana hedef', { exact: true }).waitFor();
    await page.getByText('%44', { exact: true }).waitFor();
    await page
      .getByText('Sıradaki hedef: Yakındaki camiler', { exact: true })
      .waitFor();
    await page.getByText('Ramazan imsakiyesi', { exact: true }).waitFor();
    await page.screenshot({
      path: path.join(artifactsDirectory, 'roadmap-live-44.png'),
      fullPage: true,
    });

    if (errors.length > 0) {
      throw new Error(`Browser errors: ${JSON.stringify(errors)}`);
    }

    console.log('RAMADAN_1447_DAYS=29');
    console.log('FIRST_DAY=06:06/18:35 (12 sa 29 dk)');
    console.log('LAST_DAY=05:24/19:06 (13 sa 42 dk)');
    console.log('UPCOMING_RAMADAN_1448=245 days');
    console.log('HOME_PREVIEW=PASS');
    console.log('ROADMAP=14/32 (%44)');
    console.log(`ARTIFACTS=${artifactsDirectory}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
