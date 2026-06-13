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
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();

    page.on('console', (message) => {
      if (message.type() === 'error') {
        errors.push(`console: ${message.text()}`);
      }
    });
    page.on('pageerror', (error) => errors.push(`page: ${error.message}`));

    await page.goto('http://127.0.0.1:8081/explore', {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    await page.getByText('11 / 32 ana hedef', { exact: true }).waitFor();
    await page.getByText('%34', { exact: true }).waitFor();
    await page.getByText('Sıradaki hedef: Hicri takvim', { exact: true }).waitFor();
    await page.getByText('Kur’an-ı Kerim modülü', { exact: true }).waitFor();
    await page.screenshot({
      path: path.join(artifactsDirectory, 'roadmap-live-34.png'),
      fullPage: true,
    });

    await page.goto('http://127.0.0.1:8081/quran', {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByText('Oku, anla, kaldığın yerden devam et', { exact: true }).waitFor();
    await page.getByText('Kur’an fihristi', { exact: true }).waitFor();
    await page.getByText('114 sure', { exact: true }).waitFor();

    const search = page.getByLabel('Sure ara', { exact: true });
    await search.fill('Bakara');
    await page.getByText('1 sure', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Bakara Suresini aç', exact: true }).waitFor();
    await search.fill('');

    await page
      .getByRole('button', { name: 'Fâtiha Suresini aç', exact: true })
      .click();
    await page.getByText('Fâtiha Suresi', { exact: true }).waitFor({ timeout: 60000 });
    const firstVerseBookmark = page.getByRole('button', {
      name: 'Fâtiha 1. ayette kaldım',
      exact: true,
    });
    await firstVerseBookmark.waitFor({ timeout: 60000 });
    await firstVerseBookmark.click();
    await page.getByText('KALDIĞIM YER', { exact: true }).waitFor();

    await page
      .getByRole('button', { name: 'Sure listesine dön', exact: true })
      .click();
    await page
      .getByRole('button', {
        name: 'Fâtiha Suresi 1. ayetten devam et',
        exact: true,
      })
      .waitFor();
    await page.screenshot({
      path: path.join(artifactsDirectory, 'quran-live.png'),
      fullPage: true,
    });

    await page.reload({ waitUntil: 'networkidle' });
    await page
      .getByRole('button', {
        name: 'Fâtiha Suresi 1. ayetten devam et',
        exact: true,
      })
      .waitFor();

    if (errors.length > 0) {
      throw new Error(`Browser errors: ${JSON.stringify(errors)}`);
    }

    console.log('ROADMAP=11/32 (%34)');
    console.log('QURAN_SEARCH=PASS');
    console.log('QURAN_READER=PASS');
    console.log('QURAN_PROGRESS_PERSISTENCE=PASS');
    console.log(`ARTIFACTS=${artifactsDirectory}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
