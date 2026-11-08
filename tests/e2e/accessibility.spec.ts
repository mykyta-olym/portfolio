import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { pages, waitForStage } from './helpers';

for (const path of [...pages, 'no-such-page/']) {
  test(`/${path} has no WCAG 2.2 AA violations`, async ({ page }) => {
    await page.goto(path);
    if (path !== 'no-such-page/') await waitForStage(page);
    // Let entrance motion finish so text is measured at its final colour and position.
    await page.waitForTimeout(2200);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    const summary = results.violations.map((v) => `${v.id}: ${v.nodes.length} node(s), e.g. ${v.nodes[0]?.target.join(' ')}`);
    expect(summary).toEqual([]);
  });
}

test('the menu dialog has no violations while open', async ({ page }) => {
  await page.goto('work/');
  await waitForStage(page);
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.waitForTimeout(1600);
  const results = await new AxeBuilder({ page }).include('#site-menu').withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
  expect(results.violations.map((v) => v.id)).toEqual([]);
});

test('navigation over light project media and the open image viewer remain accessible', async ({ page }) => {
  await page.goto('work/gitpulse/');
  await waitForStage(page);
  const image = page.locator('[data-gallery-image]').first();
  await image.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  const nav = await new AxeBuilder({ page }).include('[data-nav]').withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
  expect(nav.violations.map((violation) => violation.id)).toEqual([]);
  await image.click();
  const viewer = page.locator('[data-gallery-dialog]');
  await expect(viewer).toBeVisible();
  const result = await new AxeBuilder({ page }).include('[data-gallery-dialog]').withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
  expect(result.violations.map((violation) => violation.id)).toEqual([]);
});
