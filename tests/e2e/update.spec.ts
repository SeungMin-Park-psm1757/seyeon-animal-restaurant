import { test, expect, type Page } from '@playwright/test';
import { createServer, type Server } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import type { AddressInfo } from 'node:net';

let server: Server;
let origin: string;
let version = 0;
const root = resolve('dist');
const mime: Record<string, string> = { '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
test.beforeAll(async () => {
  server = createServer(async (req, res) => {
    const pathname = new URL(req.url ?? '/', 'http://localhost').pathname;
    const filename = resolve(root, pathname === '/' ? 'index.html' : '.' + pathname);
    if (!filename.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    try {
      let body: Buffer | string = await readFile(filename);
      if (pathname === '/sw.js' && version) {
        // Hold activation long enough to reproduce tapping Start before controlling.
        body = body.toString().replaceAll('self.skipWaiting()', 'setTimeout(()=>self.skipWaiting(),1800)') + `\n// qa version ${version}`;
      }
      res.writeHead(200, { 'Content-Type': mime[extname(filename)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(body);
    } catch { res.writeHead(404).end(); }
  });
  await new Promise<void>(done => server.listen(0, '127.0.0.1', done));
  origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
test.afterAll(async () => { await new Promise<void>(done => server.close(() => done())); });

async function prepare(page: Page) {
  version = 0; await page.goto(origin);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise<void>(done => navigator.serviceWorker.addEventListener('controllerchange', () => done(), { once: true }));
  });
  await page.reload();
  await expect(page.getByRole('button', { name: '놀이 시작' })).toBeVisible();
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
}
async function installUpdate(page: Page) {
  version = 1;
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    const installed = new Promise<void>(done => registration.addEventListener('updatefound', () => {
      const worker = registration.installing!;
      worker.addEventListener('statechange', () => { if (worker.state === 'installed') done(); });
    }, { once: true }));
    await registration.update(); await installed;
  });
}
async function finishAndReload(page: Page) {
  for (const [i, food] of ['carrot', 'banana', 'bamboo', 'carrot', 'banana', 'bamboo'].entries()) {
    await expect(page.locator('main')).toHaveAttribute('data-round', String(i));
    await expect(page.locator('main')).toHaveAttribute('data-phase', 'ready');
    await page.locator(`[data-food="${food}"]`).tap();
  }
  await expect(page.locator('main')).toHaveAttribute('data-phase', 'welcome', { timeout: 10000 });
}
test('waiting update stays waiting throughout play and applies at completion', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await prepare(page); await page.getByRole('button', { name: '놀이 시작' }).tap();
  await installUpdate(page); await page.waitForTimeout(2200);
  expect(await page.evaluate(async () => !!(await navigator.serviceWorker.ready).waiting)).toBe(true);
  await expect(page.locator('main')).toHaveAttribute('data-phase', 'ready');
  await finishAndReload(page); expect(errors).toEqual([]);
});
test('late activation after Start defers reload until the game finishes', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await prepare(page); await installUpdate(page); await page.waitForTimeout(200);
  await page.getByRole('button', { name: '놀이 시작' }).tap();
  await page.waitForTimeout(2400);
  await expect(page.locator('main')).toHaveAttribute('data-phase', 'ready');
  await expect(page.locator('main')).toHaveAttribute('data-round', '0');
  await finishAndReload(page); expect(errors).toEqual([]);
});
