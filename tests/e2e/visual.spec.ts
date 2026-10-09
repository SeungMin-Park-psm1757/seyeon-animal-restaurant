import { test, expect } from '@playwright/test';

const stage = process.env.QA_STAGE === 'before' ? 'before' : 'after';
const activities = [
  ['bubbles', 0, 0], ['pet', .26, 0], ['hop', .51, 0],
  ['clap', .51, 1], ['roll', .51, 2], ['peek', .99, 0]
] as const;

for (const [width, height] of [[320, 568], [360, 800], [390, 844], [412, 915], [1280, 900]]) {
  test(`visual activities ${width}x${height}`, async ({ page }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width, height });
    for (const [id, roll, round] of activities) {
      await page.goto('/');
      if (id === 'bubbles') await page.screenshot({ path: `qa/v2-${stage}/${width}-welcome.png` });
      await page.getByRole('button', { name: '놀이 시작' }).click();
      for (let i = 0; i < round; i++) {
        await expect(page.locator('main')).toHaveAttribute('data-phase', 'ready');
        await page.locator(`[data-food="${['carrot', 'banana'][i]}"]`).click();
        await expect(page.locator('main')).toHaveAttribute('data-round', String(i + 1));
      }
      await expect(page.locator('main')).toHaveAttribute('data-phase', 'ready');
      await page.waitForTimeout(320);
      if (id === 'bubbles') await page.screenshot({ path: `qa/v2-${stage}/${width}-feeding.png` });
      await page.evaluate(value => { Math.random = () => value; }, roll);
      await page.getByRole('button', { name: '동물과 놀기' }).click();
      const event = page.locator('[data-play-event]');
      await expect(event).toHaveAttribute('data-play-event', id);
      await page.screenshot({ path: `qa/v2-${stage}/${width}-${id}.png` });
      if (stage === 'after') {
        const issues = await page.evaluate(() => {
          const errors: string[] = [];
          const elements = [...document.querySelectorAll<HTMLElement>('.mini-caption, .mini-close, .mini-target, .mini-bubble, .play-launch, .friend-caption, .order-bubble')];
          for (const element of elements) {
            const r = element.getBoundingClientRect();
            if (r.left < 0 || r.right > innerWidth || r.top < 0 || r.bottom > innerHeight) errors.push(`outside: ${element.className}`);
            if (element.matches('button') && (r.width < 44 || r.height < 44)) errors.push(`small target: ${element.className}`);
            for (const text of element.querySelectorAll('strong')) {
              const range = document.createRange(); range.selectNodeContents(text);
              for (const rect of range.getClientRects()) if (rect.left < r.left || rect.right > r.right + 1 || rect.bottom > r.bottom + 1) errors.push(`clipped text: ${text.textContent}`);
            }
          }
          const caption = document.querySelector('.mini-caption')!.getBoundingClientRect();
          const close = document.querySelector('.mini-close')!.getBoundingClientRect();
          if (caption.right > close.left && caption.bottom > close.top) errors.push('caption overlaps close');
          const order = document.querySelector('.order-bubble')!.getBoundingClientRect();
          const launch = document.querySelector('.play-launch')!.getBoundingClientRect();
          if (order.right > launch.left) errors.push('order overlaps play button');
          return errors;
        });
        expect(issues).toEqual([]);
      }
      const taps = await page.locator('.mini-caption i').count();
      for (let i = 0; i < taps; i++) {
        // Floating targets intentionally never settle; hit their visible center.
        const target = (await page.locator('.mini-target, .mini-bubble').first().boundingBox())!;
        await page.touchscreen.tap(target.x + target.width / 2, target.y + target.height / 2);
        if (i === 0 && width === 390) {
          await page.waitForTimeout(330);
          await page.screenshot({ path: `qa/v2-${stage}/${width}-${id}-reaction.png` });
        }
      }
      await expect(event).toHaveAttribute('data-play-mode', 'reward');
      await expect(event).toHaveCount(0, { timeout: 3000 });
      await expect(page.locator('.food-card').first()).toBeEnabled();
      if (stage === 'after') expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
  });
}
