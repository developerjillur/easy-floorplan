/** Download through the real card, reopen the actual file, and save visual evidence. */
import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createServer } from 'vite';
import { chromium } from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(process.argv[2] ?? resolve(root, '.claude/line-art-export'));
await mkdir(output, { recursive: true });
const server = await createServer({ root, server: { host: '127.0.0.1', port: 0 } });
await server.listen();
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 980 }, acceptDownloads: true });
  page.setDefaultTimeout(10000);
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  assert(server.resolvedUrls?.local[0]);
  await page.goto(`${server.resolvedUrls.local[0]}docker/line-art-preview.html`);
  const card = page.locator('easy-floorplan-card');
  const button = card.getByRole('button', { name: 'Export SVG', exact: true });
  await button.waitFor();
  const stage = await card.locator('.stage').boundingBox();
  const exportBox = await button.boundingBox();
  assert(stage && exportBox && exportBox.y >= stage.y + stage.height, 'Export belongs below the canvas');
  const download = async name => {
    const before = await card.locator('.plan-zoom').getAttribute('style');
    const saved = page.waitForEvent('download');
    await button.click();
    const file = await saved;
    assert.equal(file.suggestedFilename(), name);
    const path = resolve(output, name);
    await file.saveAs(path);
    assert.equal(await file.failure(), null);
    assert.equal(await card.locator('.plan-zoom').getAttribute('style'), before);
    const xml = await readFile(path, 'utf8');
    assert(!/var\(|data-entity|<script|<image|<foreignObject|<!--/.test(xml));
    return { xml, path };
  };
  const first = await download('floorplan-Ground-floor-3d.svg');
  // Entity changes still render normally, and do not leak into the illustration.
  const lit = await card.locator('.fp-glow').count();
  assert(lit > 0, 'The example light should initially illuminate the card');
  await page.getByRole('button', { name: 'Toggle light', exact: true }).click();
  assert.equal(await card.locator('.fp-glow').count(), 0);
  assert.equal((await download('floorplan-Ground-floor-3d.svg')).xml, first.xml);
  // A real room tap zooms the card but must not crop the downloaded document.
  await card.locator('.area-tap-target').first().click();
  await card.getByRole('button', { name: 'Zoom out', exact: true }).waitFor();
  assert.equal((await download('floorplan-Ground-floor-3d.svg')).xml, first.xml);
  await card.getByRole('button', { name: 'Zoom out', exact: true }).click();
  await page.screenshot({ path: resolve(output, 'export-card.png'), fullPage: true });
  const preview = await browser.newPage({ viewport: { width: 1100, height: 730 } });
  await preview.goto(pathToFileURL(first.path).href);
  assert.equal(await preview.locator('parsererror').count(), 0);
  assert.equal(await preview.locator('svg').count(), 1);
  assert((await preview.locator('.fp-iso-face').count()) > 0);
  await preview.screenshot({ path: resolve(output, 'ground-floor-3d.png') });
  // Floor changes are taken from the live selection, not the first config floor.
  await card.getByRole('button', { name: '1', exact: true }).click();
  const upper = await download('floorplan-Upper-floor-3d.svg');
  assert(upper.xml.includes('Bedroom') && !upper.xml.includes('Living room'));
  await card.getByRole('button', { name: 'G', exact: true }).click();
  await page.locator('#view').selectOption('2d');
  const flat = await download('floorplan-Ground-floor-2d.svg');
  assert(!flat.xml.includes('fp-iso-face'));
  await preview.goto(pathToFileURL(flat.path).href);
  await preview.screenshot({ path: resolve(output, 'ground-floor-2d.png') });
  await page.locator('#rotation').selectOption('90');
  const rotated = await download('floorplan-Ground-floor-2d.svg');
  assert(rotated.xml.includes('translate(480 0) rotate(90)'));
  // Restore the unrotated example as the deliverable.
  await page.locator('#rotation').selectOption('0');
  await download('floorplan-Ground-floor-2d.svg');
  await page.setViewportSize({ width: 390, height: 844 });
  await button.scrollIntoViewIfNeeded();
  const box = await button.boundingBox();
  assert(box && box.x >= 0 && box.x + box.width <= 390);
  const mobileStage = await card.locator('.stage').boundingBox();
  assert(mobileStage && box.y >= mobileStage.y + mobileStage.height);
  await page.screenshot({ path: resolve(output, 'export-mobile.png'), fullPage: true });
  assert.deepEqual(errors, []);
  console.log(`Verified downloads, XML reopening, floors, rotation, zoom, lighting and mobile control. Artifacts: ${output}`);
} catch (error) {
  const page = browser.contexts()[0]?.pages()[0];
  if (page) await page.screenshot({ path: resolve(output, 'verification-failure.png'), fullPage: true });
  throw error;
} finally {
  await browser.close();
  await server.close();
}
