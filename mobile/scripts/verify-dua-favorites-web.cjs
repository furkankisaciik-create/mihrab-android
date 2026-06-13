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

    await page.goto('http://127.0.0.1:8081/duas', {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByText('Dua kütüphanesi', { exact: true }).waitFor();

    const favoritesTab = page.getByRole('tab', { name: /Favorilerim/ });
    await favoritesTab.click();
    await page.getByText('Henüz favori dua yok', { exact: true }).waitFor();

    await page.getByRole('tab', { name: /Tüm dualar/ }).click();
    await page
      .getByRole('button', {
        name: 'Dünya ve ahiret iyiliği duasını favorilere ekle',
        exact: true,
      })
      .click();

    await favoritesTab.click();
    await page.getByText('Favori dualarım', { exact: true }).waitFor();
    await page.getByText('1 dua', { exact: true }).waitFor();
    await page.getByText('Dünya ve ahiret iyiliği', { exact: true }).waitFor();

    await page.screenshot({
      path: path.join(artifactsDirectory, 'favorite-duas.png'),
      fullPage: true,
    });

    await page.reload({ waitUntil: 'networkidle' });
    await page.getByRole('tab', { name: /Favorilerim/ }).click();
    await page.getByText('1 dua', { exact: true }).waitFor();

    await page.goto('http://127.0.0.1:8081', {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    await page.getByText(/1 favori · Ara, kategori seç ve kaydet/).waitFor();

    await page.goto('http://127.0.0.1:8081/duas', {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    await page.getByRole('tab', { name: /Favorilerim/ }).click();
    await page
      .getByRole('button', {
        name: 'Dünya ve ahiret iyiliği duasını favorilerden çıkar',
        exact: true,
      })
      .click();
    await page.getByText('Henüz favori dua yok', { exact: true }).waitFor();

    await page.goto('http://127.0.0.1:8081/explore', {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    await page.getByText('10 / 32 ana hedef', { exact: true }).waitFor();
    await page.getByText('%31', { exact: true }).waitFor();
    await page.getByText('Sıradaki hedef: Kur’an-ı Kerim modülü', { exact: true }).waitFor();
    await page.getByText('Favori dualar', { exact: true }).waitFor();

    await page.screenshot({
      path: path.join(artifactsDirectory, 'roadmap-31-percent.png'),
      fullPage: true,
    });

    console.log('FAVORITE_ADD=PASS');
    console.log('FAVORITE_PERSISTENCE=PASS');
    console.log('FAVORITE_REMOVE=PASS');
    console.log('ROADMAP=10/32 (%31)');
    console.log(`BROWSER_ERRORS=${JSON.stringify(errors)}`);
    console.log(`ARTIFACTS=${artifactsDirectory}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
