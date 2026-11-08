import { expect, test } from '@playwright/test';
import { waitForStage } from './helpers';

test('FAQ items open and close', async ({ page }) => {
  await page.goto('work/');
  await waitForStage(page);
  const item = page.locator('details.faq__item').first();
  const summary = item.locator('summary');
  await summary.scrollIntoViewIfNeeded();
  await summary.click();
  await expect(item).toHaveAttribute('open', '');
  await expect(item.locator('[data-faq-body]')).toBeVisible();
  await summary.click();
  await expect(item).not.toHaveAttribute('open', '');
});

test('reversing a moving FAQ keeps its visible height and follows the last click', async ({ page }) => {
  await page.goto('work/');
  await waitForStage(page);
  const item = page.locator('details.faq__item').first();
  const summary = item.locator('summary');
  await summary.scrollIntoViewIfNeeded();
  await summary.click();
  for (let i = 0; i < 2; i += 1) {
    await page.waitForTimeout(120);
    const jump = await item.evaluate((element) => {
      const before = element.getBoundingClientRect().height;
      element.querySelector('summary')?.click();
      return Math.abs(element.getBoundingClientRect().height - before);
    });
    expect(jump).toBeLessThan(1);
  }
  await page.waitForTimeout(500);
  await expect(item).toHaveAttribute('open', '');
  await expect(item.locator('[data-faq-body]')).toBeVisible();
});

test('case study tabs switch with the mouse and the arrow keys', async ({ page }) => {
  await page.goto('work/relayq/');
  await waitForStage(page);
  const tabs = page.getByRole('tab');
  await expect(tabs).toHaveCount(3);
  await expect(page.getByRole('tabpanel')).toHaveCount(1);
  await tabs.nth(1).click();
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toContainText('Lua script');
  await tabs.nth(1).focus();
  await page.keyboard.press('ArrowRight');
  await expect(tabs.nth(2)).toBeFocused();
  await expect(page.getByRole('tabpanel')).toContainText('mutants');
  await page.keyboard.press('Home');
  await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
});

test('the email address fits one line and can be copied on the contact page', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'clipboard permissions are Chromium only');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('contact/');
  await waitForStage(page);
  const address = page.locator('.contact__mail a');
  expect(
    await address.evaluate((element) => element.getBoundingClientRect().height / parseFloat(getComputedStyle(element).lineHeight)),
  ).toBeLessThan(1.1);
  const button = page.getByRole('button', { name: 'Copy the email address' });
  await button.click();
  await expect(button).toHaveClass(/is-copied/);
  await expect(page.locator('[data-copy-status]')).toHaveText('Email address copied');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('mykyta.olym.work@gmail.com');
});

test('contact hover labels slide inside their link without changing its destination', async ({ page, isMobile }) => {
  test.skip(isMobile, 'hover is a mouse interaction');
  await page.goto('contact/');
  await waitForStage(page);
  const link = page.locator('.contact__card--social a').first();
  const destination = await link.getAttribute('href');
  // Hover after the delayed card entrance has finished, as an actual visitor can.
  await expect(page.locator('.contact__card--social')).toHaveCSS('opacity', '1');
  await link.hover();
  await expect
    .poll(() =>
      link.evaluate((element) => {
        const inner = element.querySelector('span');
        return inner ? inner.getBoundingClientRect().top >= element.getBoundingClientRect().bottom - 1 : false;
      }),
    )
    .toBe(true);
  await expect(link).toHaveAttribute('href', destination ?? '');
  await expect(link).toHaveAttribute('aria-label', '[GitHub]');
  await link.focus();
  await expect(link).toBeFocused();
});

test('back to top returns to the top of the page', async ({ page }) => {
  await page.goto('work/');
  await waitForStage(page);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.getByRole('button', { name: /Back to top/ }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 5000 }).toBeLessThan(5);
});

test('image strips scroll sideways by dragging without opening the project', async ({ page, isMobile }) => {
  test.skip(isMobile, 'mouse dragging is a desktop interaction');
  await page.goto('work/');
  await waitForStage(page);
  const strip = page.getByRole('region', { name: 'relayq images' });
  await strip.scrollIntoViewIfNeeded();
  const box = await strip.boundingBox();
  if (!box) throw new Error('strip has no box');
  const image = strip.locator('li').first();
  const before = await image.evaluate((element) => element.getBoundingClientRect().x);
  const y = box.y + box.height / 2;
  await page.mouse.move(box.x + box.width - 40, y);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width - 340, y, { steps: 12 });
  await page.mouse.up();
  await expect.poll(() => image.evaluate((element) => element.getBoundingClientRect().x)).toBeLessThan(before - 100);
  await expect(page).toHaveURL(/\/work\/$/);
});

test('the about field moves when dragged', async ({ page, isMobile }) => {
  test.skip(isMobile, 'mouse dragging is a desktop interaction');
  await page.goto('about/');
  await waitForStage(page);
  await expect(page.locator('.field')).toHaveClass(/has-webgl/);
  const canvas = page.locator('[data-field-canvas]');
  const before = await canvas.screenshot();
  await page.mouse.move(700, 450);
  await page.mouse.down();
  await page.mouse.move(400, 300, { steps: 10 });
  await page.mouse.up();
  await expect.poll(async () => (await canvas.screenshot()).equals(before)).toBe(false);
});

test('the typed phrase in the navigation types the home words', async ({ page }) => {
  await page.goto('./');
  await waitForStage(page);
  await expect(page.locator('[data-typewriter-text]')).toHaveText('WORK', { timeout: 8000 });
});
