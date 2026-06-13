const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const snapshot = {
  location: {
    city: { id: '506', name: 'ANKARA' },
    district: {
      id: '9206',
      name: 'ANKARA',
      path: '/tr-TR/9206/ankara-icin-namaz-vakti',
    },
  },
  prayers: [
    { key: 'imsak', name: 'İmsak', time: '03:19', symbol: '☾' },
    { key: 'gunes', name: 'Güneş', time: '05:13', symbol: '☀' },
    { key: 'ogle', name: 'Öğle', time: '12:53', symbol: '◉' },
    { key: 'ikindi', name: 'İkindi', time: '16:50', symbol: '◒' },
    { key: 'aksam', name: 'Akşam', time: '20:22', symbol: '◐' },
    { key: 'yatsi', name: 'Yatsı', time: '22:08', symbol: '☽' },
  ],
  gregorianDate: '08 Haziran 2026 Pazartesi',
  hijriDate: '22 Zilhicce 1447',
  dateKey: '2026-06-08',
  fetchedAt: '2026-06-08T12:00:00.000Z',
  sourceUrl:
    'https://namazvakitleri.diyanet.gov.tr/tr-TR/9206/ankara-icin-namaz-vakti',
  schedule: [
    {
      dateKey: '2026-06-08',
      gregorianDate: '08 Haziran 2026 Pazartesi',
      hijriDate: '22 Zilhicce 1447',
      prayers: [
        { key: 'imsak', name: 'İmsak', time: '03:19', symbol: '☾' },
        { key: 'gunes', name: 'Güneş', time: '05:13', symbol: '☀' },
        { key: 'ogle', name: 'Öğle', time: '12:53', symbol: '◉' },
        { key: 'ikindi', name: 'İkindi', time: '16:50', symbol: '◒' },
        { key: 'aksam', name: 'Akşam', time: '20:22', symbol: '◐' },
        { key: 'yatsi', name: 'Yatsı', time: '22:08', symbol: '☽' },
      ],
    },
  ],
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

    await page.goto('http://127.0.0.1:8081/calendar', {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    await page.getByText('Günü iki takvimle yaşa', { exact: true }).waitFor();
    await page.getByText('22 Zilhicce 1447', { exact: true }).first().waitFor();
    await page.getByText('Zilhicce 1447', { exact: true }).waitFor();
    await page.getByText('03:19', { exact: true }).waitFor();
    await page.getByText('20:22', { exact: true }).waitFor();

    await page.screenshot({
      path: path.join(artifactsDirectory, 'hijri-calendar.png'),
      fullPage: true,
    });

    await page
      .getByRole('button', { name: 'Sonraki Hicri ay', exact: true })
      .click();
    await page.getByText('Muharrem 1448', { exact: true }).waitFor();
    await page
      .getByRole('button', { name: 'Önceki Hicri ay', exact: true })
      .click();
    await page.getByText('Zilhicce 1447', { exact: true }).waitFor();

    await page.goto('http://127.0.0.1:8081', {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    const calendarPreview = page.getByRole('button', {
      name: 'Hicri takvimi aç',
      exact: true,
    });
    await calendarPreview.waitFor();
    await calendarPreview
      .getByText('22 Zilhicce 1447', { exact: true })
      .waitFor();

    await page.goto('http://127.0.0.1:8081/explore', {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    await page.getByText('12 / 32 ana hedef', { exact: true }).waitFor();
    await page.getByText('%38', { exact: true }).waitFor();
    await page
      .getByText('Sıradaki hedef: Dini günler ve geceler', { exact: true })
      .waitFor();
    await page.getByText('Hicri takvim', { exact: true }).waitFor();
    await page.screenshot({
      path: path.join(artifactsDirectory, 'roadmap-live-38.png'),
      fullPage: true,
    });

    if (errors.length > 0) {
      throw new Error(`Browser errors: ${JSON.stringify(errors)}`);
    }

    console.log('HIJRI_TODAY=22 Zilhicce 1447');
    console.log('DIYANET_SCHEDULE=PASS');
    console.log('HIJRI_MONTH_NAVIGATION=PASS');
    console.log('HOME_PREVIEW=PASS');
    console.log('ROADMAP=12/32 (%38)');
    console.log(`ARTIFACTS=${artifactsDirectory}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
