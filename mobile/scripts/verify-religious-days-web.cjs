const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

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
    const page = await context.newPage();

    page.on('console', (message) => {
      if (message.type() === 'error') {
        errors.push(`console: ${message.text()}`);
      }
    });
    page.on('pageerror', (error) => errors.push(`page: ${error.message}`));

    await page.goto('http://127.0.0.1:8081/holy-days', {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    await page
      .getByText('Mübarek zamanları kaçırma', { exact: true })
      .waitFor();
    await page.getByText('Hicri Yılbaşı', { exact: true }).first().waitFor();
    await page.getByText('1 Muharrem 1448', { exact: true }).first().waitFor();
    await page.getByText('5 gün', { exact: true }).waitFor();
    await page
      .getByText(
        'Geçen yılı değerlendirip yeni dönem için iyilik ve ibadet niyetleri belirleyebilirsin.',
        { exact: true },
      )
      .waitFor();

    await page.screenshot({
      path: path.join(artifactsDirectory, 'religious-days.png'),
      fullPage: true,
    });

    await page
      .getByRole('button', {
        name: '2027 dini günlerini göster',
        exact: true,
      })
      .click();
    await page.getByText('19 gün', { exact: true }).waitFor();
    await page
      .getByRole('button', { name: 'Kandiller', exact: true })
      .click();
    await page.getByText('6 gün', { exact: true }).waitFor();
    await page.getByText('Miraç Kandili', { exact: true }).first().waitFor();
    await page.getByText('26 Receb 1449', { exact: true }).waitFor();

    await page.goto('http://127.0.0.1:8081', {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    const homePreview = page.getByRole('button', {
      name: 'Dini günler ve geceler takvimini aç',
      exact: true,
    });
    await homePreview.waitFor();
    await homePreview.getByText('Hicri Yılbaşı', { exact: true }).waitFor();
    await homePreview.getByText('8 gün kaldı', { exact: true }).waitFor();

    await page.goto('http://127.0.0.1:8081/calendar', {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    await page
      .getByRole('button', {
        name: 'Dini günler ve geceler takvimini aç',
        exact: true,
      })
      .waitFor();

    await page.goto('http://127.0.0.1:8081/explore', {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    await page.getByText('13 / 32 ana hedef', { exact: true }).waitFor();
    await page.getByText('%41', { exact: true }).waitFor();
    await page
      .getByText('Sıradaki hedef: Ramazan imsakiyesi', { exact: true })
      .waitFor();
    await page.getByText('Dini günler ve geceler', { exact: true }).waitFor();
    await page.screenshot({
      path: path.join(artifactsDirectory, 'roadmap-live-41.png'),
      fullPage: true,
    });

    if (errors.length > 0) {
      throw new Error(`Browser errors: ${JSON.stringify(errors)}`);
    }

    console.log('NEXT_RELIGIOUS_DAY=Hicri Yılbaşı (8 gün)');
    console.log('OFFICIAL_2026_UPCOMING=5');
    console.log('OFFICIAL_2027_TOTAL=19');
    console.log('FILTER_KANDIL_2027=6');
    console.log('HOME_PREVIEW=PASS');
    console.log('HIJRI_CALENDAR_INTEGRATION=PASS');
    console.log('ROADMAP=13/32 (%41)');
    console.log(`ARTIFACTS=${artifactsDirectory}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
