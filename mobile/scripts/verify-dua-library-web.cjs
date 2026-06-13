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
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

    page.on('console', (message) => {
      if (message.type() === 'error') {
        errors.push(`console: ${message.text()}`);
      }
    });
    page.on('pageerror', (error) => errors.push(`page: ${error.message}`));

    await page.goto('http://127.0.0.1:8081', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    const libraryPreview = page.getByRole('button', {
      name: 'Dua kütüphanesini aç',
      exact: true,
    });
    await libraryPreview.waitFor();
    await libraryPreview.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    await libraryPreview.click();
    await page.waitForURL(/\/duas$/, { timeout: 30000, waitUntil: 'domcontentloaded' });
    await page.getByText('Dua kütüphanesi', { exact: true }).waitFor();
    await page.getByText('kaynaklı dua', { exact: true }).waitFor();
    await page.getByText('Dünya ve ahiret iyiliği', { exact: true }).waitFor();
    await page.getByText('Bakara Suresi, 2:201', { exact: true }).waitFor();

    const searchInput = page.getByLabel('Dua ara', { exact: true });
    await searchInput.fill('sınav');
    await page.getByText('2 dua', { exact: true }).waitFor();
    await searchInput.fill('');

    await page.getByRole('button', { name: 'Aile', exact: true }).click();
    await page.getByText('2 dua', { exact: true }).waitFor();
    await page
      .getByRole('button', { name: 'Huzurlu aile duasını aç', exact: true })
      .click();
    await page
      .getByText(
        'Ey Rabbimiz! Eşlerimizi ve çocuklarımızı bize göz aydınlığı kıl ve bizi Allah’a karşı gelmekten sakınanlara önder eyle!',
        { exact: true },
      )
      .waitFor();

    await page.screenshot({
      path: path.join(artifactsDirectory, 'dua-library.png'),
      fullPage: true,
    });

    await page.goto('http://127.0.0.1:8081/explore', {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    await page.getByText('9 / 32 ana hedef', { exact: true }).waitFor();
    await page.getByText('%28', { exact: true }).waitFor();
    await page.getByText('Sıradaki hedef: Favori dualar', { exact: true }).waitFor();
    await page.getByText('Dua kütüphanesi', { exact: true }).waitFor();

    await page.screenshot({
      path: path.join(artifactsDirectory, 'roadmap-28-percent.png'),
      fullPage: true,
    });

    console.log('DUA_LIBRARY=PASS');
    console.log('SEARCH=sınav -> 2');
    console.log('CATEGORY=Aile -> 2');
    console.log('ROADMAP=9/32 (%28)');
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
