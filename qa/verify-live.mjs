import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';

const [url, commit] = process.argv.slice(2);
assert(url && commit, 'Usage: node qa/verify-live.mjs GAME_URL DEPLOYED_COMMIT');
const browser = await chromium.launch();
const errors = [];
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  const response = await page.goto(url);
  assert.equal(response.status(), 200);
  const info = await context.request.get(new URL('build-info.json', url).href);
  assert.equal((await info.json()).commit, commit);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise(done => navigator.serviceWorker.addEventListener('controllerchange', done, { once: true }));
  });
  const scope = await page.evaluate(async () => (await navigator.serviceWorker.ready).scope);
  assert.equal(scope, url);
  const sizes = await page.locator('.brand strong').evaluate(el => getComputedStyle(el).fontSize);
  assert.equal(sizes, '22px');
  const music = page.locator('audio');
  async function finish() {
    await page.getByRole('button', { name: '놀이 시작' }).tap();
    await expect.poll(() => music.evaluate(audio => !audio.paused)).toBe(true);
    await expect.poll(() => music.evaluate(audio => audio.currentTime)).toBeGreaterThan(0);
    for (const [round, food] of ['carrot', 'banana', 'bamboo', 'carrot', 'banana', 'bamboo'].entries()) {
      await expect(page.locator('main')).toHaveAttribute('data-round', String(round));
      await expect(page.locator('main')).toHaveAttribute('data-phase', 'ready');
      if (!round) {
        await expect(page.locator('.animal-zone')).toHaveCSS('opacity', '1');
        await page.screenshot({ path: 'qa/screenshots/live-390-play.png' });
      }
      await page.locator(`[data-food="${food}"]`).tap();
    }
    await expect(page.getByRole('button', { name: '다시 놀기' })).toBeVisible();
    await expect(page.locator('.friends-together [data-animal]')).toHaveCount(3);
  }
  await page.getByRole('button', { name: '배경음악 끄기', exact: true }).tap();
  await expect.poll(() => music.evaluate(audio => audio.paused)).toBe(true);
  await page.getByRole('button', { name: '배경음악 켜기', exact: true }).tap();
  await expect.poll(() => music.evaluate(audio => !audio.paused)).toBe(true);
  await finish();
  await page.getByRole('button', { name: '다시 놀기' }).tap();
  await expect(page.locator('main')).toHaveAttribute('data-round', '0');
  await context.setOffline(true);
  await page.reload();
  await finish();
  await page.screenshot({ path: 'qa/screenshots/live-390-offline-finished.png' });
  await context.close();
  const desktop = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await desktop.goto(url);
  await expect(desktop.locator('.rotate-overlay')).toBeHidden();
  await desktop.getByRole('button', { name: '놀이 시작' }).click();
  await expect(desktop.locator('main')).toHaveAttribute('data-phase', 'ready');
  await expect(desktop.locator('.animal-zone')).toHaveCSS('opacity', '1');
  await desktop.screenshot({ path: 'qa/screenshots/live-desktop-play.png' });
  assert.deepEqual(errors, []);
  const result = { testedAt: new Date().toISOString(), url, commit, status: 'PASS', serviceWorkerScope: scope, titleFont: sizes, backgroundMusic: true, musicOnlyMute: true, onlineSixFeeds: true, restart: true, offlineReloadAndSixFeeds: true, desktopStart: true, errors };
  await writeFile('qa/live-result.json', JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result));
} finally { await browser.close(); }
