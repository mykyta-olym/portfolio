import { expect, test } from '@playwright/test';
import { horizontalOverflow, waitForStage } from './helpers';

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the loader leaves quickly and text is shown without motion', async ({ page }) => {
    await page.goto('./');
    await waitForStage(page);
    const title = page.getByRole('heading', { level: 1 });
    await expect(title).toBeVisible();
    // No split lines are left behind: the original text is in place.
    await expect(title.locator('.line-slide')).toHaveCount(0);
    const video = page.locator('[data-hero-video]');
    await expect.poll(() => video.evaluate((element) => (element as HTMLVideoElement).paused)).toBe(true);
  });

  test('pinned and orbiting sections fall back to static layouts', async ({ page }) => {
    await page.goto('./');
    await waitForStage(page);
    await expect(page.locator('[data-module="showcase"]')).toHaveClass(/is-static/);
    await expect(page.locator('[data-module="orbit-gallery"]')).toHaveClass(/is-static/);
  });

  test('the menu keeps its video still with reduced motion', async ({ page }) => {
    await page.goto('./');
    await waitForStage(page);
    await page.locator('[data-menu-toggle]').click();
    await expect(page.getByRole('dialog')).toBeVisible();
    expect(await page.locator('[data-menu-video]').evaluate((element) => (element as HTMLVideoElement).paused)).toBe(true);
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('content is readable and the loader never shows', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('[data-preloader]')).toBeHidden();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'relayq' })).toBeVisible();
    await expect(page.locator('.nav__fallback a')).toHaveCount(3);
  });

  test('case studies show every section', async ({ page }) => {
    await page.goto('work/stockroom/');
    await expect(page.locator('.case__tabpanel')).toHaveCount(3);
    for (const panel of await page.locator('.case__tabpanel').all()) await expect(panel).toBeVisible();
  });
});

for (const [width, height] of [
  [375, 812],
  [390, 844],
  [768, 1024],
  [1024, 768],
  [1440, 900],
  [1920, 1080],
  [2560, 1440],
  [844, 390],
] as const) {
  test(`no horizontal overflow at ${width} by ${height}`, async ({ page, isMobile }) => {
    test.skip(isMobile, 'viewport sizes are set explicitly');
    await page.setViewportSize({ width, height });
    for (const path of ['./', 'work/', 'work/relayq/', 'about/', 'contact/']) {
      await page.goto(path);
      await waitForStage(page);
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight / 2));
      await page.waitForTimeout(200);
      expect(await horizontalOverflow(page), `${path} at ${width}`).toBeLessThanOrEqual(0);
    }
  });
}

test('the sticky disciplines fit a short landscape viewport', async ({ page, isMobile }) => {
  test.skip(isMobile, 'viewport sizes are set explicitly');
  for (const width of [844, 1920]) {
    await page.setViewportSize({ width, height: 390 });
    await page.goto('./');
    await waitForStage(page);
    await page.locator('.disciplines').evaluate((element) => window.scrollTo(0, (element as HTMLElement).offsetTop));
    for (const selector of ['.disciplines__list', '.disciplines__media']) {
      const box = await page.locator(selector).boundingBox();
      expect(box?.y).toBeGreaterThanOrEqual(85);
      expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(390);
    }
  }
});
