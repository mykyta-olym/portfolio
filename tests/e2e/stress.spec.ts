import { expect, test } from '@playwright/test';
import { waitForStage, watchErrors } from './helpers';

test('fast scrolling down and back leaves every section in a consistent state', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('./');
  await waitForStage(page);
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 700) await page.evaluate((top) => window.scrollTo(0, top), y);
  for (let y = height; y >= 0; y -= 900) await page.evaluate((top) => window.scrollTo(0, top), y);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  await expect(page.getByRole('heading', { level: 1 })).toBeInViewport();
  // The showcase frame returns to full size once the scrub smoothing settles.
  const frame = page.locator('[data-showcase-frame]');
  await expect
    .poll(() => frame.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).a), { timeout: 4000 })
    .toBeGreaterThan(0.9995);
  expect(errors).toEqual([]);
});

test('navigating repeatedly does not leave a page covered', async ({ page }) => {
  const errors = watchErrors(page);
  const route = ['work/', 'about/', 'contact/', 'work/stockroom/', 'work/'];
  await page.goto('about/');
  await waitForStage(page);
  for (const path of route) {
    await page.goto(path);
    await waitForStage(page);
    await expect(page.locator('html')).not.toHaveClass(/is-arriving|is-departing/);
  }
  expect(errors).toEqual([]);
});

test('a double click on a link starts only one transition', async ({ page }) => {
  await page.goto('work/');
  await waitForStage(page);
  const link = page.getByRole('link', { name: 'stockroom', exact: true });
  await link.dblclick();
  await expect(page).toHaveURL(/\/work\/stockroom\/$/);
  await waitForStage(page);
});

test('resizing during the loader and after it keeps the layout intact', async ({ page, isMobile }) => {
  test.skip(isMobile, 'resizing is a desktop scenario');
  const errors = watchErrors(page);
  await page.goto('./');
  await page.setViewportSize({ width: 900, height: 700 });
  await page.setViewportSize({ width: 1440, height: 900 });
  await waitForStage(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  expect(errors).toEqual([]);
});

test('a hero video that fails to load does not keep the loader up', async ({ page }) => {
  await page.route('**/media/hero/*.{webm,mp4}', (route) => route.abort());
  await page.goto('./');
  await waitForStage(page);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('a background tab finishes loading when it comes to the front', async ({ page, context }) => {
  const other = await context.newPage();
  await other.goto('about/');
  await page.goto('./');
  await page.bringToFront();
  await waitForStage(page);
  await other.close();
});
