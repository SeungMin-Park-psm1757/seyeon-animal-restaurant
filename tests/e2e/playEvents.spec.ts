import { test, expect, type Page } from '@playwright/test';

async function start(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: '놀이 시작' }).tap();
  await expect(page.locator('main')).toHaveAttribute('data-phase', 'ready');
}
test('ten activities integrate without breaking feeding', async ({ page }) => {
  await start(page);
  await page.getByRole('button', { name: '동물과 놀기' }).tap();
  const game = page.locator('[data-play-event]');
  await expect(game).toHaveAttribute('data-play-mode', 'active');
  const eventId = await game.getAttribute('data-play-event');
  expect(['bubbles', 'pet', 'hop', 'clap', 'roll', 'peek', 'wash', 'balloons', 'bedtime', 'gift']).toContain(eventId);
  await expect(page.locator('.food-card').first()).toBeDisabled();
  const targetCount = await page.locator('.mini-caption i').count();
  for (let i = 0; i < targetCount; i++) {
    const selector = eventId === 'bubbles' ? '.mini-bubble' : eventId === 'balloons' ? '.mini-balloon' : '.mini-target';
    if (eventId === 'wash') await page.locator('.face-wash-hit-area').tap();
    else await page.locator(selector).first().tap();
  }
  await expect(game).toHaveAttribute('data-play-mode', 'reward');
  await expect(game).toHaveCount(0, { timeout: 3000 });
  await expect(page.locator('.food-card').first()).toBeEnabled();
  await page.locator('[data-food="carrot"]').tap();
  await expect(page.locator('.progress-flowers')).toHaveAttribute('data-count', '1');
  await expect(page.locator('main')).toHaveAttribute('data-round', '1');
});

test('face wash responds on rabbit, monkey and panda, then clears all stains', async ({ page, context }) => {
  for (const [food, animal] of [['carrot', 'rabbit'], ['banana', 'monkey'], ['bamboo', 'panda']] as const) {
    const run = animal === 'rabbit' ? page : await context.newPage();
    await start(run);
    const previousFoods = animal === 'monkey' ? ['carrot'] : animal === 'panda' ? ['carrot', 'banana'] : [];
    for (const previous of previousFoods) {
      await run.locator(`[data-food="${previous}"]`).tap();
      await expect(run.locator('main')).toHaveAttribute('data-phase', 'ready');
    }
    await expect(run.locator(`.animal-${animal}`)).toBeVisible();
    await run.evaluate(() => { Math.random = () => .51; });
    await run.getByRole('button', { name: '동물과 놀기' }).tap();
    await expect(run.locator('[data-play-event]')).toHaveAttribute('data-play-event', 'wash');
    expect(await run.locator(`.animal-${animal} .food-stain`).count()).toBe(2);
    for (const remaining of [1, 0]) {
      await run.locator('.face-wash-hit-area').tap();
      await expect(run.locator(`.animal-${animal} .food-stain`)).toHaveCount(remaining);
    }
    await expect(run.locator('[data-play-event]')).toHaveAttribute('data-play-mode', 'reward');
    await run.waitForTimeout(1300);
    if (run !== page) await run.close();
  }
});

test('balloon hit areas stay in place as each balloon floats away', async ({ page }) => {
  await start(page);
  await page.evaluate(() => { Math.random = () => .64; });
  await page.getByRole('button', { name: '동물과 놀기' }).tap();
  await expect(page.locator('[data-play-event]')).toHaveAttribute('data-play-event', 'balloons');
  const before = await page.locator('.mini-balloon').evaluateAll(nodes => nodes.map(node => {
    const box = node.getBoundingClientRect(); return [box.x, box.y, box.width, box.height];
  }));
  await page.getByRole('button', { name: '풍선 2 띄우기' }).tap();
  const remaining = await page.locator('.mini-balloon').evaluateAll(nodes => nodes.map(node => {
    const box = node.getBoundingClientRect(); return [box.x, box.y, box.width, box.height];
  }));
  expect(remaining).toEqual([before[0], before[2]]);
  await page.getByRole('button', { name: '풍선 1 띄우기' }).tap();
  await page.getByRole('button', { name: '풍선 3 띄우기' }).tap();
  await expect(page.locator('.animal-art')).toHaveClass(/play-balloons/);
  await expect(page.locator('[data-play-event]')).toHaveAttribute('data-play-mode', 'reward');
});

test('bedtime covers the friend and wakes on the next touch', async ({ page }) => {
  await start(page);
  await page.evaluate(() => { Math.random = () => .76; });
  await page.getByRole('button', { name: '동물과 놀기' }).tap();
  await expect(page.locator('[data-play-event]')).toHaveAttribute('data-play-event', 'bedtime');
  await expect(page.locator('.animal-art')).toHaveClass(/play-bedtime/);
  await page.getByRole('button', { name: '이불 덮고 깨우기' }).tap();
  await expect(page.locator('.animal-art')).toHaveClass(/mood-sleepy/);
  await expect(page.locator('.animal-blanket')).toBeVisible();
  await page.getByRole('button', { name: '이불 덮고 깨우기' }).tap();
  await expect(page.locator('[data-play-event]')).toHaveAttribute('data-play-mode', 'reward');
});

test('bedtime keeps its progress through background and restores the friend when closed', async ({ page }) => {
  await start(page);
  await page.evaluate(() => { Math.random = () => .76; });
  await page.getByRole('button', { name: '동물과 놀기' }).tap();
  await page.getByRole('button', { name: '이불 덮고 깨우기' }).tap();
  const game = page.locator('[data-play-event]');
  await expect(game).toHaveAttribute('data-play-step', '1');

  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
  });

  await expect(game).toHaveAttribute('data-play-step', '1');
  await page.getByRole('button', { name: '이불 덮고 깨우기' }).tap();
  await expect(game).toHaveAttribute('data-play-mode', 'reward');
  await page.waitForTimeout(1300);
  await expect(page.locator('[data-play-event]')).toHaveCount(0);
  await expect(page.locator('.animal-blanket')).toHaveCount(0);
  await expect(page.locator('.food-card').first()).toBeEnabled();
});

test('opening the sticker album pauses automatic play and restarts the 20-second idle clock', async ({ page }) => {
  await page.clock.install();
  await start(page);
  await page.getByRole('button', { name: '스티커 앨범, 0개' }).tap();
  await page.clock.fastForward(21000);
  await expect(page.locator('[data-play-event]')).toHaveCount(0);
  await page.getByRole('button', { name: '앨범 닫기' }).tap();
  await page.clock.fastForward(5000);
  await expect(page.locator('[data-play-event]')).toHaveCount(0);
  await page.clock.fastForward(16000);
  await expect(page.locator('[data-play-event]')).toHaveAttribute('data-play-mode', 'active');
});

test('gift gives a saved sticker, handles duplicates and works without storage', async ({ page }) => {
  await start(page);
  await page.evaluate(() => { Math.random = () => .9; });
  await page.getByRole('button', { name: '동물과 놀기' }).tap();
  await expect(page.locator('[data-play-event]')).toHaveAttribute('data-play-event', 'gift');
  await page.getByRole('button', { name: '선물상자 열기' }).tap();
  await page.getByRole('button', { name: '선물상자 열기' }).tap();
  await expect(page.locator('.gift-reward strong')).toHaveText('새 스티커야!');
  await page.setViewportSize({ width: 320, height: 568 });
  await page.getByRole('button', { name: '앨범 보기' }).tap();
  await expect(page.getByRole('dialog', { name: '스티커 앨범' })).toBeVisible();
  await expect(page.locator('.sticker-card.collected')).toHaveCount(1);
  await page.screenshot({ path: 'qa/v21-after/320-sticker-album.png' });
  expect(await page.locator('.sticker-book-panel').evaluate(panel => panel.getBoundingClientRect().right)).toBeLessThanOrEqual(320);
  await page.getByRole('button', { name: '앨범 닫기' }).tap();
  await page.reload();
  await expect(page.getByRole('button', { name: '스티커 앨범, 1개' })).toBeVisible();

  await page.evaluate(() => localStorage.setItem('seyeon-animal-village-stickers-v1', JSON.stringify({ ids: ['rabbit', 'monkey', 'panda', 'flower', 'star', 'heart'], gifts: 6 })));
  await page.getByRole('button', { name: '놀이 시작' }).tap();
  await page.evaluate(() => { Math.random = () => .9; });
  await page.getByRole('button', { name: '동물과 놀기' }).tap();
  await page.getByRole('button', { name: '선물상자 열기' }).tap();
  await page.getByRole('button', { name: '선물상자 열기' }).tap();
  await expect(page.locator('.gift-reward strong')).toHaveText('또 만나 반가워!');

  const blocked = await page.context().newPage();
  await blocked.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } }));
  await start(blocked);
  await blocked.evaluate(() => { Math.random = () => .9; });
  await blocked.getByRole('button', { name: '동물과 놀기' }).tap();
  await blocked.getByRole('button', { name: '선물상자 열기' }).tap();
  await blocked.getByRole('button', { name: '선물상자 열기' }).tap();
  await expect(blocked.locator('.gift-reward strong')).toHaveText('새 스티커야!');
  await blocked.close();
});
test('activity can be dismissed safely and restarted without trapping controls', async ({ page }) => {
  await start(page);
  await page.getByRole('button', { name: '동물과 놀기' }).tap();
  await expect(page.locator('[data-play-event]')).toBeVisible();
  await page.getByRole('button', { name: '놀이 그만하고 밥 주기' }).tap();
  await expect(page.locator('[data-play-event]')).toHaveCount(0);
  await expect(page.locator('.food-card').first()).toBeEnabled();
  await page.getByRole('button', { name: '동물과 놀기' }).tap();
  await expect(page.locator('[data-play-event]')).toBeVisible();
});
test('party offers free continuation without a forced end', async ({ page }) => {
  await start(page);
  for (const food of ['carrot', 'banana', 'bamboo', 'carrot', 'banana', 'bamboo']) {
    await expect(page.locator('main')).toHaveAttribute('data-phase', 'ready');
    await page.locator(`[data-food="${food}"]`).tap();
  }
  await expect(page.locator('main')).toHaveAttribute('data-phase', 'finished');
  await page.getByRole('button', { name: '계속 놀기' }).tap();
  await expect(page.locator('main')).toHaveAttribute('data-phase', 'ready');
  await expect(page.locator('.progress-flowers')).toHaveAttribute('data-count', '0');
  await page.getByRole('button', { name: '동물과 놀기' }).tap();
  await expect(page.locator('[data-play-event]')).toBeVisible();
});

test('real child interactions postpone the 20-second surprise invitation', async ({ page }) => {
  await page.clock.install();
  await start(page);
  await page.clock.fastForward(18000);
  // The child is still playing, even if the selected food is not correct.
  await page.locator('[data-food="banana"]').tap();
  await page.clock.fastForward(3000);
  await expect(page.locator('[data-play-event]')).toHaveCount(0);
  await expect(page.locator('main')).toHaveAttribute('data-phase', 'ready');
  await page.clock.fastForward(18000);
  await expect(page.locator('[data-play-event]')).toHaveAttribute('data-play-mode', 'active');
});

test('feeding idle hint timer stays suspended during an active mini-game', async ({ page }) => {
  await page.clock.install();
  await start(page);
  await page.getByRole('button', { name: '동물과 놀기' }).tap();
  await page.clock.fastForward(9000);
  await expect(page.locator('[data-play-event]')).toHaveAttribute('data-play-mode', 'active');
  await expect(page.locator('.food-card.hint')).toHaveCount(0);
  await page.getByRole('button', { name: '놀이 그만하고 밥 주기' }).tap();
  await expect(page.locator('.food-card.hint')).toHaveCount(0);
});

test('the touched bubble disappears, cancel resets bubbles, keyboard closes play', async ({ page }) => {
  await start(page);
  await page.evaluate(() => { Math.random = () => 0; });
  await page.getByRole('button', { name: '동물과 놀기' }).tap();
  const bubble = (await page.locator('.bubble-1').boundingBox())!;
  await page.touchscreen.tap(bubble.x + bubble.width / 2, bubble.y + bubble.height / 2);
  await expect(page.locator('.bubble-1')).toHaveCount(0);
  await expect(page.locator('.bubble-0, .bubble-2')).toHaveCount(2);
  await expect(page.locator('.play-burst i')).toHaveCount(7);
  await page.getByRole('button', { name: '놀이 그만하고 밥 주기' }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: '동물과 놀기' }).tap();
  await expect(page.locator('.mini-bubble')).toHaveCount(3);
});

test('idle motion completes within one second and cannot follow the next animal', async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 0; });
  await start(page);
  await expect(page.locator('.animal-rabbit')).toHaveClass(/motion-sniff/, { timeout: 7000 });
  const durations = await page.locator('.animal-rabbit').evaluate(element => element.getAnimations({ subtree: true })
    .filter(animation => animation.effect?.getTiming().iterations !== Infinity)
    .map(animation => Number(animation.effect?.getComputedTiming().endTime)));
  expect(durations.length).toBeGreaterThan(0);
  expect(durations.every(duration => duration <= 1000)).toBe(true);
  await page.locator('[data-food="carrot"]').tap();
  await expect(page.locator('main')).toHaveAttribute('data-round', '1');
  await expect(page.locator('main')).toHaveAttribute('data-phase', 'ready');
  await expect(page.locator('.animal-monkey')).not.toHaveClass(/motion-sniff/);
});

test('reduced motion reveals hidden friend and repeated reward input stays locked', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await start(page);
  await page.evaluate(() => { Math.random = () => .49; });
  await page.getByRole('button', { name: '동물과 놀기' }).tap();
  await page.getByRole('button', { name: '꽃 뒤의 친구 찾기' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.peek-left')).toHaveCSS('opacity', '0');
  await expect(page.locator('.target-peek')).toBeDisabled();
  await expect(page.locator('.target-peek strong')).toBeHidden();
  await expect(page.locator('.mini-reward strong')).toHaveText('까꿍!');
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toHaveAttribute('data-round', '0');
  await expect(page.locator('.progress-flowers')).toHaveAttribute('data-count', '0');
  await expect(page.locator('[data-play-event]')).toHaveCount(0, { timeout: 3000 });
});
