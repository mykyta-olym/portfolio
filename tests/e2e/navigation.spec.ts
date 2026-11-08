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

test('menu, project rows and the back button navigate between pages', async ({ page, isMobile }) => {
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
  if (!isMobile) await expect(page.locator('[data-page-cover]')).not.toBeInViewport();
});

test('a nested page survives a reload', async ({ page }) => {
  await page.goto('work/gitpulse/');
  await waitForStage(page);
  await page.reload();
  await waitForStage(page);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('GitPulse');
});

test('page navigation uses all four source slices with a white backdrop @native', async ({ page }) => {
  await page.addInitScript(() => {
    window.addEventListener('pagereveal', (event) => {
      const transition = (event as Event & { viewTransition?: ViewTransition }).viewTransition;
      if (!transition) return;
      void transition.ready
        .then(() => {
          const audit = {
            names: document.getAnimations().flatMap((animation) => (animation instanceof CSSAnimation ? [animation.animationName] : [])),
            background: getComputedStyle(document.documentElement, '::view-transition').backgroundColor,
          };
          (window as Window & { slicesAudit?: typeof audit }).slicesAudit = audit;
        })
        .catch(() => undefined);
    });
  });
  await page.goto('about/');
  test.skip(!(await page.evaluate(() => 'CSSViewTransitionRule' in window)), 'browser does not support cross-document transitions');
  await waitForStage(page);
  await expect(page.locator('.field')).toHaveClass(/has-webgl/);
  await page.bringToFront();
  await page.getByRole('button', { name: 'Open menu' }).click();
  await expect(page.locator('[data-menu-media]')).toHaveCSS('clip-path', /^inset\(0%(?: 0%){0,3}\)$/);
  await page.getByRole('dialog').getByRole('link', { name: 'Contact' }).click();
  await expect(page).toHaveURL(/\/contact\/$/);
  await expect
    .poll(() => page.evaluate(() => (window as Window & { slicesAudit?: { names: string[] } }).slicesAudit?.names))
    .toEqual(expect.arrayContaining(['gm-out-1', 'gm-out-2', 'gm-out-3', 'gm-out-4', 'gm-in-1', 'gm-in-2', 'gm-in-3', 'gm-in-4']));
  expect(await page.evaluate(() => (window as Window & { slicesAudit?: { background: string } }).slicesAudit?.background)).toBe(
    'rgb(255, 255, 255)',
  );
  await waitForStage(page);
});

test('home CTA transitions and the logo returns home without another loader @native', async ({ page }) => {
  await page.addInitScript(() => {
    window.addEventListener('pagereveal', (event) => {
      const transition = (event as Event & { viewTransition?: ViewTransition }).viewTransition;
      if (!transition) return;
      void transition.ready
        .then(() => {
          const animations = document
            .getAnimations()
            .filter((animation) => animation instanceof CSSAnimation && animation.animationName.startsWith('gm-'));
          (window as Window & { homeTransitionAudit?: number }).homeTransitionAudit = animations.length;
        })
        .catch(() => undefined);
    });
  });
  await page.goto('./');
  test.skip(!(await page.evaluate(() => 'CSSViewTransitionRule' in window)), 'browser does not support cross-document transitions');
  await waitForStage(page);
  await page.bringToFront();
  await page.getByRole('link', { name: 'See the Work' }).click();
  await expect(page).toHaveURL(/\/work\/$/);
  await expect.poll(() => page.evaluate(() => (window as Window & { homeTransitionAudit?: number }).homeTransitionAudit)).toBe(8);
  await waitForStage(page);
  await page.locator('.nav__logo').click();
  await expect(page).toHaveURL(/\/portfolio\/$/);
  await expect.poll(() => page.evaluate(() => (window as Window & { homeTransitionAudit?: number }).homeTransitionAudit)).toBe(8);
  await expect(page.locator('[data-preloader]')).toHaveCount(0);
  await waitForStage(page);
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
