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
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(`console: ${message.text()}`);
    }
  });
  page.on('pageerror', (error) => errors.push(`page: ${error.message}`));

  await page.goto('http://127.0.0.1:8081/qada', {
    waitUntil: 'networkidle',
    timeout: 60000,
  });
  await page.getByText('Kaza namazı takibi', { exact: true }).waitFor();

  await page.getByLabel('Sabah borcunu düzenle', { exact: true }).click();
  const balanceInput = page.getByLabel('Sabah kaza borcu', { exact: true });
  await balanceInput.fill('12');
  await page.getByText('Kaydet', { exact: true }).click();
  await page.getByText('12', { exact: true }).first().waitFor();

  await page.getByLabel('Bir Sabah kazası kılındı', { exact: true }).click();
  await page.getByText('11', { exact: true }).first().waitFor();
  await page.getByText('Son işlemi geri al', { exact: true }).click();
  await page.getByText('12', { exact: true }).first().waitFor();

  await page.screenshot({
    path: path.join(artifactsDirectory, 'qada-tracker.png'),
    fullPage: true,
  });

  await page.goto('http://127.0.0.1:8081/explore', {
    waitUntil: 'networkidle',
    timeout: 60000,
  });
  await page.getByText('8 / 32 ana hedef', { exact: true }).waitFor();
  await page.getByText('%25', { exact: true }).waitFor();
  await page.getByText('Sıradaki hedef: Dua kütüphanesi', { exact: true }).waitFor();
  await page.getByText('Kaza namazı takibi', { exact: true }).waitFor();

  await page.screenshot({
    path: path.join(artifactsDirectory, 'roadmap-25-percent.png'),
    fullPage: true,
  });

  console.log('QADA_FLOW=PASS');
  console.log('ROADMAP=8/32 (%25)');
  console.log(`BROWSER_ERRORS=${JSON.stringify(errors)}`);
  console.log(`ARTIFACTS=${artifactsDirectory}`);

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
