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
