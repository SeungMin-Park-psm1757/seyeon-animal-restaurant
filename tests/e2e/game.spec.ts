import { test, expect, type Page } from '@playwright/test';

const sequence = ['carrot', 'banana', 'bamboo', 'carrot', 'banana', 'bamboo'];
const screenshots = 'qa/screenshots';
const game = (page: Page) => page.locator('main');
const card = (page: Page, food: string) => page.locator(`[data-food="${food}"]`);
async function start(page: Page) {
  await page.goto('/'); await page.getByRole('button', { name: '놀이 시작' }).tap();
  await expect(game(page)).toHaveAttribute('data-phase', 'ready');
  await settleEntrance(page);
}
async function settleEntrance(page: Page) {
  await page.locator('.animal-zone').evaluate(async element => {
    await Promise.all(element.getAnimations().map(animation => animation.finished.catch(() => {})));
  });
}
async function complete(page: Page, from = 0) {
  for (let i = from; i < 6; i++) {
    await expect(game(page)).toHaveAttribute('data-round', String(i));
    await expect(game(page)).toHaveAttribute('data-phase', 'ready');
    await card(page, sequence[i]).tap();
    await expect(page.locator('.progress-flowers')).toHaveAttribute('data-count', String(i + 1));
  }
  await expect(game(page)).toHaveAttribute('data-phase', 'finished');
}
async function point(page: Page, food: string) {
  const rect = (await card(page, food).boundingBox())!;
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
}
async function touchDrag(page: Page, food: string, target: { x: number; y: number }, cancel = false) {
  const from = await point(page, food);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...from, id: 1 }] });
  for (let step = 1; step <= 6; step++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: from.x + (target.x - from.x) * step / 6, y: from.y + (target.y - from.y) * step / 6, id: 1 }] });
  }
  await expect(page.locator('.drag-ghost')).toBeVisible();
  await expect.poll(async () => {
    const ghost = (await page.locator('.drag-ghost').boundingBox())!;
    return Math.abs(ghost.y + ghost.height / 2 - (target.y - 42));
  }).toBeLessThan(2);
  await cdp.send('Input.dispatchTouchEvent', { type: cancel ? 'touchCancel' : 'touchEnd', touchPoints: [] });
  await cdp.detach();
}
async function assertLayout(page: Page, width: number, height: number) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(height);
  const cards = await page.locator('.food-card').all();
  const bounds = [];
  for (const button of cards) {
    const rect = (await button.boundingBox())!;
    expect(rect.width).toBeGreaterThanOrEqual(72); expect(rect.height).toBeGreaterThanOrEqual(88);
    expect(rect.x).toBeGreaterThanOrEqual(0); expect(rect.y + rect.height).toBeLessThanOrEqual(height);
    bounds.push(rect);
  }
  for (let i = 1; i < bounds.length; i++) expect(bounds[i].x).toBeGreaterThan(bounds[i - 1].x + bounds[i - 1].width);
  const zone = await page.getByTestId('drop-zone').boundingBox();
  if (zone) { expect(zone.width).toBeGreaterThanOrEqual(120); expect(zone.height).toBeGreaterThanOrEqual(120); }
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('requestfailed', request => { if (!request.failure()?.errorText.includes('ERR_INTERNET_DISCONNECTED')) errors.push(request.failure()?.errorText ?? 'request failed'); });
  (page as Page & { qaErrors: string[] }).qaErrors = errors;
});
test.afterEach(async ({ page }) => {
  expect((page as Page & { qaErrors: string[] }).qaErrors).toEqual([]);
});

for (const [width, height] of [[360, 800], [390, 844], [412, 915], [320, 568], [800, 1280]]) {
  test(`${width}x${height}: welcome, six taps, unique reactions, restart and layout`, async ({ page }) => {
    await page.setViewportSize({ width, height }); await page.goto('/');
    const begin = (await page.getByRole('button', { name: '놀이 시작' }).boundingBox())!;
    expect(begin.height).toBeGreaterThanOrEqual(96); expect(begin.y + begin.height).toBeLessThanOrEqual(height);
    await page.screenshot({ path: `${screenshots}/${width}-welcome.png` });
    await page.getByRole('button', { name: '놀이 시작' }).tap();
    await settleEntrance(page);
    await assertLayout(page, width, height);
    await page.screenshot({ path: `${screenshots}/${width}-rabbit.png` });
    for (let i = 0; i < 6; i++) {
      await expect(game(page)).toHaveAttribute('data-round', String(i));
      await expect(game(page)).toHaveAttribute('data-phase', 'ready');
      await card(page, sequence[i]).tap();
      await expect(game(page)).toHaveAttribute('data-phase', 'feeding');
      if (width === 390 && i === 0) {
        await page.waitForTimeout(325);
        const mouth = (await page.locator('[data-mouth]').boundingBox())!;
        const flying = (await page.locator('.flying-food').boundingBox())!;
        expect(Math.abs(flying.x + flying.width / 2 - (mouth.x + mouth.width / 2))).toBeLessThan(16);
        expect(Math.abs(flying.y + flying.height / 2 - (mouth.y + mouth.height / 2))).toBeLessThan(16);
        await page.screenshot({ path: `${screenshots}/390-feeding-mouth.png` });
      }
      await expect(game(page)).toHaveAttribute('data-phase', 'celebrating');
      if (i < 3) {
        await expect(page.locator(`.animal-${['rabbit', 'monkey', 'panda'][i]}.mood-delighted`)).toBeVisible();
        await page.screenshot({ path: `${screenshots}/${width}-${['rabbit', 'monkey', 'panda'][i]}-delight.png` });
      }
    }
    await expect(game(page)).toHaveAttribute('data-phase', 'finished');
    await expect(page.locator('.progress-flowers')).toHaveAttribute('data-count', '6');
    await expect(page.locator('.friends-together [data-animal]')).toHaveCount(3);
    const restart = (await page.getByRole('button', { name: '다시 놀기' }).boundingBox())!;
    expect(restart.y + restart.height).toBeLessThanOrEqual(height);
    await page.screenshot({ path: `${screenshots}/${width}-finished.png` });
    await page.getByRole('button', { name: '다시 놀기' }).tap();
    await expect(game(page)).toHaveAttribute('data-round', '0');
    await expect(page.locator('.progress-flowers')).toHaveAttribute('data-count', '0');
    await expect(card(page, 'carrot')).toBeEnabled();
    await page.waitForTimeout(2200);
    await expect(game(page)).toHaveAttribute('data-round', '0');
  });
}

test('wrong taps, two-mistake hint, idle hint, no penalty', async ({ page }) => {
  await start(page);
  await card(page, 'banana').tap(); await card(page, 'bamboo').tap();
  await expect(card(page, 'carrot')).toHaveClass(/hint/);
  await expect(game(page)).toHaveAttribute('data-round', '0');
  await expect(page.locator('.progress-flowers')).toHaveAttribute('data-count', '0');
  await page.screenshot({ path: `${screenshots}/390-hint.png` });
  const hintedCard = await point(page, 'carrot');
  await page.touchscreen.tap(hintedCard.x, hintedCard.y);
  await expect(game(page)).toHaveAttribute('data-round', '1');
  await expect(card(page, 'banana')).not.toHaveClass(/hint/);
  await expect(game(page)).toHaveAttribute('data-phase', 'ready');
  await expect(card(page, 'banana')).toHaveClass(/hint/, { timeout: 10000 });
  await expect(game(page)).toHaveAttribute('data-round', '1');
});
test('real touch drag: correct drop, return outside, cancel, wrong drop', async ({ page }) => {
  await start(page);
  const zone = (await page.getByTestId('drop-zone').boundingBox())!;
  const target = { x: zone.x + zone.width / 2, y: zone.y + zone.height * .55 };
  await touchDrag(page, 'carrot', { x: 10, y: 100 });
  await expect(game(page)).toHaveAttribute('data-phase', 'ready');
  await expect(page.locator('.drag-ghost')).toHaveCount(0);
  await touchDrag(page, 'carrot', target, true);
  await expect(game(page)).toHaveAttribute('data-phase', 'ready');
  await expect(page.locator('.drag-ghost')).toHaveCount(0);
  await touchDrag(page, 'banana', target);
  await expect(page.locator('.drag-ghost.returning')).toHaveCount(1);
  await expect(page.locator('.drag-ghost')).toHaveCount(0);
  await expect(game(page)).toHaveAttribute('data-round', '0');
  await expect(page.locator('.progress-flowers')).toHaveAttribute('data-count', '0');
  await touchDrag(page, 'carrot', target);
  await expect(game(page)).toHaveAttribute('data-phase', 'feeding');
  await expect(page.locator('.progress-flowers')).toHaveAttribute('data-count', '1');
  await expect(game(page)).toHaveAttribute('data-round', '1');
  await complete(page, 1);
});
test('tiny finger movement is a tap, duplicate input is locked, feedback skip advances once', async ({ page }) => {
  await start(page); const from = await point(page, 'carrot');
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...from, id: 1 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: from.x + 7, y: from.y + 5, id: 1 }] });
  await expect(page.locator('.drag-ghost')).toHaveCount(0);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.touchscreen.tap(from.x, from.y);
  await expect(page.locator('.progress-flowers')).toHaveAttribute('data-count', '1');
  await expect(game(page)).toHaveAttribute('data-round', '0');
  await page.waitForTimeout(400);
  await page.touchscreen.tap(15, 170); await page.touchscreen.tap(15, 170);
  await expect(game(page)).toHaveAttribute('data-round', '1');
  await page.waitForTimeout(2200);
  await expect(game(page)).toHaveAttribute('data-round', '1');
  await expect(page.locator('.progress-flowers')).toHaveAttribute('data-count', '1');
  await cdp.detach();
});
test('app loses focus mid-drag and safely accepts the next tap', async ({ page }) => {
  await start(page); const from = await point(page, 'carrot');
  await page.mouse.move(from.x, from.y); await page.mouse.down(); await page.mouse.move(from.x, from.y - 90);
  await expect(game(page)).toHaveAttribute('data-phase', 'dragging');
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(page.locator('.drag-ghost')).toHaveCount(0); await page.mouse.up();
  await expect(game(page)).toHaveAttribute('data-phase', 'ready');
  await card(page, 'carrot').tap();
  await expect(page.locator('.progress-flowers')).toHaveAttribute('data-count', '1');
});
test('mute persists; Web Audio starts only with input and plays quiet tones', async ({ page }) => {
  await page.addInitScript(() => {
    const Native = window.AudioContext;
    const audit = { contexts: 0, starts: 0, maxGain: 0 };
    Object.assign(window, { audioAudit: audit });
    window.AudioContext = class extends Native {
      constructor() { super(); audit.contexts++; }
      createOscillator() {
        const node = super.createOscillator(); const nativeStart = node.start.bind(node);
        node.start = (...args) => { audit.starts++; nativeStart(...args); }; return node;
      }
      createGain() {
        const node = super.createGain(); const ramp = node.gain.linearRampToValueAtTime.bind(node.gain);
        node.gain.linearRampToValueAtTime = (value, time) => { audit.maxGain = Math.max(audit.maxGain, value); return ramp(value, time); }; return node;
      }
    };
  });
  await page.goto('/');
  expect(await page.evaluate(() => (window as any).audioAudit.contexts)).toBe(0);
  await page.getByRole('button', { name: '소리 끄기' }).tap();
  await page.reload(); await expect(page.getByRole('button', { name: '소리 켜기' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: '소리 켜기' }).tap();
  await page.getByRole('button', { name: '놀이 시작' }).tap();
  await card(page, 'carrot').tap();
  await expect.poll(() => page.evaluate(() => (window as any).audioAudit.starts)).toBeGreaterThan(0);
  expect(await page.evaluate(() => (window as any).audioAudit.maxGain)).toBeLessThanOrEqual(.055);
  await page.getByRole('button', { name: '소리 끄기' }).tap();
  const starts = await page.evaluate(() => (window as any).audioAudit.starts);
  await page.waitForTimeout(2200);
  expect(await page.evaluate(() => (window as any).audioAudit.starts)).toBe(starts);
});
test('denied storage/audio still permits a six-round run', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked storage'); } });
    window.AudioContext = class { constructor() { throw new Error('blocked audio'); } } as any;
  });
  await start(page); await expect(page.getByRole('button', { name: '소리 켜기' })).toBeVisible();
  await complete(page);
});
test('cached app reloads offline and completes without network or external requests', async ({ page, context }) => {
  const external: string[] = [];
  page.on('request', req => { if (!req.url().startsWith('http://127.0.0.1:4173') && !req.url().startsWith('data:')) external.push(req.url()); });
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise<void>(resolve => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true }));
  });
  await expect.poll(() => page.evaluate(async () => (await caches.keys()).length)).toBeGreaterThan(0);
  await context.setOffline(true); await page.reload();
  await expect(page.getByRole('button', { name: '놀이 시작' })).toBeVisible();
  await page.getByRole('button', { name: '놀이 시작' }).tap(); await complete(page);
  await page.screenshot({ path: `${screenshots}/390-offline-finished.png` });
  expect(external).toEqual([]); await context.setOffline(false);
});
test('reduced motion, keyboard buttons and landscape prompt', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await start(page);
  expect(await page.locator('.eyes').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  await card(page, 'carrot').focus(); await page.keyboard.press('Enter');
  await expect(page.locator('.progress-flowers')).toHaveAttribute('data-count', '1');
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.getByText('세로로 세워 주세요')).toBeVisible();
  await page.screenshot({ path: `${screenshots}/landscape.png` });
});
test.describe('desktop browser', () => {
  test.use({ isMobile: false, hasTouch: false });
  test('landscape windows show the game and accept mouse input', async ({ page }) => {
    for (const [width, height] of [[1280, 900], [1615, 1248]]) {
      await page.setViewportSize({ width, height }); await page.goto('/');
      await expect(page.locator('.rotate-overlay')).toBeHidden();
      await page.screenshot({ path: `${screenshots}/desktop-${width}-welcome.png` });
      await page.getByRole('button', { name: '놀이 시작' }).click();
      await settleEntrance(page); await assertLayout(page, width, height);
      const from = await point(page, 'carrot'); const zone = (await page.getByTestId('drop-zone').boundingBox())!;
      await page.mouse.move(from.x, from.y); await page.mouse.down();
      await page.mouse.move(zone.x + zone.width / 2, zone.y + zone.height / 2, { steps: 10 }); await page.mouse.up();
      await expect(page.locator('.progress-flowers')).toHaveAttribute('data-count', '1');
      await expect(game(page)).toHaveAttribute('data-round', '1');
      await expect(game(page)).toHaveAttribute('data-phase', 'ready');
      await card(page, 'banana').click();
      await expect(page.locator('.progress-flowers')).toHaveAttribute('data-count', '2');
      await page.screenshot({ path: `${screenshots}/desktop-${width}-play.png` });
    }
  });
});
