import { expect, test } from '@playwright/test';
import { pages, waitForStage, watchErrors } from './helpers';

test('home loads, the loader leaves and the hero is on stage', async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(() => {
    const audit = { layers: 0, values: [] as string[] };
    (window as Window & { loaderAudit?: typeof audit }).loaderAudit = audit;
    const observer = new MutationObserver((records) => {
      const digits = document.querySelector('[data-loader-digits]');
      audit.layers = Math.max(audit.layers, digits?.childElementCount ?? 0);
      for (const record of records)
        for (const node of record.addedNodes) {
          if (node instanceof HTMLElement && node.matches('[data-digit]')) audit.values.push(node.textContent?.trim() ?? '');
        }
      if (audit.values.includes('99') && !document.querySelector('[data-preloader]')) observer.disconnect();
    });
    observer.observe(document, { childList: true, subtree: true });
  });
  await page.goto('./');
  await waitForStage(page);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Software That\s+Holds Up/);
  await expect(page.locator('html')).not.toHaveClass(/is-locked/);
  const audit = await page.evaluate(() => (window as Window & { loaderAudit?: { layers: number; values: string[] } }).loaderAudit);
  expect(audit?.layers).toBeLessThanOrEqual(2);
  expect(audit?.values.filter((value) => value !== '00')).toEqual(['36', '78', '99']);
  expect(errors).toEqual([]);
});

for (const path of pages) {
  test(`/${path} renders one h1, a title and no errors`, async ({ page }) => {
    const errors = watchErrors(page);
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await waitForStage(page);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page).toHaveTitle(/Mykyta Olym/);
    expect(errors).toEqual([]);
  });
}

test('menu, project rows and the back button navigate between pages', async ({ page }) => {
  await page.goto('./');
  await waitForStage(page);
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.getByRole('dialog', { name: 'Site menu' }).getByRole('link', { name: 'Work' }).click();
  await expect(page).toHaveURL(/\/work\/$/);
  await waitForStage(page);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('All Projects');

  await page.getByRole('link', { name: 'phishlens', exact: true }).click();
  await expect(page).toHaveURL(/\/work\/phishlens\/$/);
  await waitForStage(page);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('phishlens');
  await expect(page.getByRole('link', { name: /View code/ })).toHaveAttribute('href', 'https://github.com/mykyta-olym/phishlens');

  await page.goBack();
  await expect(page).toHaveURL(/\/work\/$/);
  // A page restored from the back-forward cache must not stay covered.
  await expect(page.locator('html')).not.toHaveClass(/is-departing/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('[data-page-cover]')).toHaveCSS('visibility', 'hidden');
  await expect(page.locator('[data-page-cover]')).toHaveCSS('pointer-events', 'none');
  await expect(page.locator('.row__name').filter({ hasText: 'phishlens' })).toHaveCSS('opacity', '1');
});

test('a nested page survives a reload', async ({ page }) => {
  await page.goto('work/gitpulse/');
  await waitForStage(page);
  await page.reload();
  await waitForStage(page);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('GitPulse');
});

test('page navigation covers the live document with four white bands @transition', async ({ page }) => {
  await page.goto('about/');
  await waitForStage(page);
  await expect(page.locator('.field')).toHaveClass(/has-webgl/);
  await page.bringToFront();
  await page.getByRole('button', { name: 'Open menu' }).click();
  await expect(page.locator('[data-menu-media]')).toHaveCSS('clip-path', /^inset\(0%(?: 0%){0,3}\)$/);
  await page.getByRole('dialog').getByRole('link', { name: 'Contact' }).click({ noWaitAfter: true });
  await expect(page.locator('html')).toHaveClass(/is-departing/);
  expect(
    await page
      .locator('.menu__nav')
      .evaluate((element) =>
        element
          .getAnimations()
          .some((animation) => (animation.effect as KeyframeEffect).getKeyframes().some((frame) => frame.opacity === '0')),
      ),
  ).toBe(true);
  await expect(page.locator('.cover__slice')).toHaveCount(4);
  for (const slice of await page.locator('.cover__slice').all()) await expect(slice).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(page).toHaveURL(/\/contact\/$/);
  await waitForStage(page);
  await expect(page.locator('[data-page-cover]')).toHaveCSS('visibility', 'hidden');
});

test('entrances start while the bands are still leaving @transition', async ({ page }) => {
  await page.goto('work/');
  await waitForStage(page);
  await page.bringToFront();
  await page.locator('.row__link').first().click({ noWaitAfter: true });
  await expect(page).toHaveURL(/\/work\/[a-z-]+\/$/);
  // The page must not open empty: its content is already moving under the leaving bands.
  await page.waitForFunction(
    () => {
      const root = document.documentElement.classList;
      return root.contains('is-uncovering') && root.contains('is-stage-ready');
    },
    null,
    { polling: 'raf', timeout: 15_000 },
  );
  await expect(page.locator('[data-page-cover]')).toHaveCSS('visibility', 'hidden');
  await expect(page.locator('.case-hero__kind')).toHaveCSS('opacity', '1');
});

test('first-screen content finishes its entrance on every page', async ({ page }) => {
  for (const path of [...pages, 'no-such-page/']) {
    await page.goto(path);
    await waitForStage(page);
    await page.waitForTimeout(1600);
    const hidden = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('[data-reveal], [data-scroll-rise] p, .line-slide, .field__hint')]
        .filter((element) => !element.closest('[data-module="menu"], .case__tabpanel, .footer'))
        .filter((element) => {
          const style = getComputedStyle(element);
          const box = element.getBoundingClientRect();
          if (style.display === 'none' || box.width * box.height === 0 || box.bottom <= 0 || box.top >= innerHeight) return false;
          return style.visibility === 'hidden' || Number(style.opacity) < 0.89 || Math.abs(new DOMMatrix(style.transform).m42) > 1;
        })
        .map((element) => `${element.className} ${(element.textContent ?? '').trim().slice(0, 24)}`),
    );
    expect(hidden, path).toEqual([]);
  }
});

test('the hero keeps playing during departure and home returns without another loader @transition', async ({ page }) => {
  await page.goto('./');
  await waitForStage(page);
  await page.bringToFront();
  const video = page.locator('[data-hero-video]');
  await expect.poll(() => video.evaluate((e: HTMLVideoElement) => !e.paused && e.currentTime > 0)).toBe(true);
  const before = await video.evaluate((e: HTMLVideoElement) => e.currentTime);
  await page.getByRole('link', { name: 'See the Work' }).click({ noWaitAfter: true });
  await page.waitForTimeout(300);
  const playing = await video.evaluate((e: HTMLVideoElement) => ({ time: e.currentTime, duration: e.duration, paused: e.paused }));
  expect(playing.paused).toBe(false);
  expect((playing.time - before + playing.duration) % playing.duration).toBeGreaterThan(0.15);
  expect(await page.locator('.hero__title').evaluate((element) => Number(getComputedStyle(element).opacity))).toBeLessThan(0.35);
  await expect(page).toHaveURL(/\/work\/$/);
  await waitForStage(page);
  await expect(page.locator('[data-page-cover]')).toHaveCSS('visibility', 'hidden');
  await page.locator('.nav__logo').click();
  await expect(page).toHaveURL(/\/portfolio\/$/);
  await expect(page.locator('[data-preloader]')).toHaveCount(0);
  await waitForStage(page);
  await expect(page.locator('[data-page-cover]')).toHaveCSS('visibility', 'hidden');
  await expect(page.locator('html')).not.toHaveClass(/is-locked/);
});

test('unknown addresses show the 404 page', async ({ page }) => {
  const response = await page.goto('no-such-page/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('This page does not exist');
  await page.getByRole('link', { name: 'Back Home' }).click();
  await expect(page).toHaveURL(/\/portfolio\/$/);
});

test('the skip link moves focus to the main content', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keyboard navigation is checked on desktop');
  await page.goto('about/');
  await waitForStage(page);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
});
