import { test, expect, type Page } from '@playwright/test';

async function start(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: '놀이 시작' }).tap();
  await expect(page.locator('main')).toHaveAttribute('data-phase', 'ready');
}
test('six activities integrate without breaking feeding', async ({ page }) => {
  await start(page);
  await page.getByRole('button', { name: '동물과 놀기' }).tap();
  const game = page.locator('[data-play-event]');
  await expect(game).toHaveAttribute('data-play-mode', 'active');
  const eventId = await game.getAttribute('data-play-event');
  expect(['bubbles', 'pet', 'hop', 'peek']).toContain(eventId);
  await expect(page.locator('.food-card').first()).toBeDisabled();
  const targetCount = await page.locator('.mini-caption i').count();
  for (let i = 0; i < targetCount; i++) {
    await page.locator('.mini-target, .mini-bubble').first().tap();
  }
  await expect(game).toHaveAttribute('data-play-mode', 'reward');
  await expect(game).toHaveCount(0, { timeout: 3000 });
  await expect(page.locator('.food-card').first()).toBeEnabled();
  await page.locator('[data-food="carrot"]').tap();
  await expect(page.locator('.progress-flowers')).toHaveAttribute('data-count', '1');
  await expect(page.locator('main')).toHaveAttribute('data-round', '1');
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
  await page.evaluate(() => { Math.random = () => .99; });
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
