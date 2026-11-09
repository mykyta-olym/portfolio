import { expect, test } from '@playwright/test';
import { waitForStage } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('about/');
  await waitForStage(page);
});

test('opens with focus inside and closes with Escape, returning focus', async ({ page }) => {
  const toggle = page.locator('[data-menu-toggle]');
  const dialog = page.getByRole('dialog', { name: 'Site menu' });
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  // The close control must be available immediately, before the panel finishes expanding.
  await expect(page.getByRole('button', { name: 'Close menu' })).toBeInViewport();
  await expect(dialog).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('button', { name: 'Close menu' })).toBeFocused();
  await expect(page.locator('html')).toHaveClass(/is-locked/);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(toggle).toBeFocused();
  await expect(page.locator('html')).not.toHaveClass(/is-locked/);
});

test('keeps keyboard focus inside while open', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keyboard focus is checked on desktop');
  await page.getByRole('button', { name: 'Open menu' }).click();
  const dialog = page.getByRole('dialog', { name: 'Site menu' });
  await expect(page.locator('[data-menu-surface]')).not.toHaveAttribute('inert');
  for (let i = 0; i < 12; i += 1) {
    await page.keyboard.press('Tab');
    const inside = await dialog.evaluate((element) => element.contains(document.activeElement));
    expect(inside).toBe(true);
  }
});

test('closes with the close button and the backdrop, and survives fast toggling', async ({ page }) => {
  const toggle = page.locator('[data-menu-toggle]');
  const dialog = page.getByRole('dialog', { name: 'Site menu' });
  await toggle.click();
  await page.getByRole('button', { name: 'Close menu' }).click();
  await expect(dialog).toBeHidden();
  await toggle.click();
  await page.mouse.click(10, 400);
  await expect(dialog).toBeHidden();
  const visibleControl = page.locator('.nav:not(.is-menu-active) [data-menu-toggle], .menu:not([hidden]) [data-menu-close]');
  for (let i = 0; i < 6; i += 1) {
    await visibleControl.click({ force: true });
    await page.waitForTimeout(60);
  }
  await expect(dialog).toBeHidden();
  await expect(page.locator('html')).not.toHaveClass(/is-locked/);
  await toggle.click();
  await expect(dialog).toBeVisible();
  await expect(page.getByRole('dialog').getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'page');
});
