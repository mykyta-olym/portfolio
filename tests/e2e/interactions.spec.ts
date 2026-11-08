import { expect, test } from '@playwright/test';
import { waitForStage, watchErrors } from './helpers';

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
        const inner = element.querySelector('.hover-link__inner');
        const next = element.querySelector('.hover-link__next');
        return inner && next
          ? inner.getBoundingClientRect().bottom <= element.getBoundingClientRect().top + 1 &&
              Math.abs(next.getBoundingClientRect().top - element.getBoundingClientRect().top) < 1
          : false;
      }),
    )
    .toBe(true);
  await expect(link).toHaveAttribute('href', destination ?? '');
  await expect(link).toHaveAttribute('aria-label', '[GitHub]');
  await expect(link.locator('.hover-link__next')).toHaveText('Read the code');
  await link.focus();
  await expect(link).toBeFocused();
});

test('back to top returns to the top of the page', async ({ page }) => {
  await page.goto('work/');
  await waitForStage(page);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.getByRole('button', { name: /Back to top/ }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 5000 }).toBeLessThan(5);
  await expect(page.locator('#main')).toBeFocused();
  await expect(page.locator('[data-module="back-to-top"]')).not.toHaveClass(/is-returning/);
});

test('a manual scroll interrupts the return to top without stealing focus', async ({ page }) => {
  await page.goto('work/');
  await waitForStage(page);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  const button = page.getByRole('button', { name: /Back to top/ });
  await button.click();
  await page.waitForTimeout(250);
  await page.mouse.wheel(0, 300);
  await expect(button).not.toHaveClass(/is-returning/);
  await page.waitForTimeout(250);
  const top = await page.evaluate(() => window.scrollY);
  await page.waitForTimeout(500);
  expect(Math.abs((await page.evaluate(() => window.scrollY)) - top)).toBeLessThan(2);
  expect(top).toBeGreaterThan(300);
  await expect(page.locator('#main')).not.toBeFocused();
});

test('process cards turn to explanations and stay still while being read', async ({ page }) => {
  await page.goto('./');
  await waitForStage(page);
  await page.locator('.orbit').evaluate((element) => window.scrollTo(0, (element as HTMLElement).offsetTop));
  await page.waitForTimeout(4200);
  const card = page.locator('[data-orbit-card]').first();
  await card.click({ force: true });
  await expect(card).toHaveAttribute('aria-expanded', 'true');
  await page.waitForTimeout(800);
  const before = await card.boundingBox();
  await page.waitForTimeout(350);
  const after = await card.boundingBox();
  expect(Math.abs((before?.x ?? 0) - (after?.x ?? 0))).toBeLessThan(1);
  expect(Math.abs((before?.y ?? 0) - (after?.y ?? 0))).toBeLessThan(1);
  await expect(card.locator('.orbit__back')).toContainText('constraints');
  expect(await card.locator('.orbit__back').evaluate((element) => element.scrollHeight - element.clientHeight)).toBeLessThanOrEqual(1);
  for (const next of (await page.locator('[data-orbit-card]').all()).slice(1)) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(700);
    await next.click({ force: true });
    await expect(next).toHaveAttribute('aria-expanded', 'true');
    await page.waitForTimeout(800);
    expect(await next.locator('.orbit__back').evaluate((element) => element.scrollHeight - element.clientHeight)).toBeLessThanOrEqual(1);
  }
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-orbit-card][aria-expanded="true"]')).toHaveCount(0);
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

test('typing, pauses and backspacing keep one cursor in the navigation', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('./');
  await waitForStage(page);
  await expect(page.locator('[data-typewriter-text]')).toHaveText('WORK', { timeout: 8000 });
  const cursor = page.locator('.nav__phrase .typed-cursor');
  await expect(cursor).toHaveCount(1);
  // Observe every DOM change: a short erased state can fall between 100 ms polls.
  const changes = await page.locator('[data-typewriter-text]').evaluateHandle((output) => {
    const states: { text: string; cursors: number; visibility: string }[] = [];
    const record = (): void => {
      const cursors = output.parentElement?.querySelectorAll('.typed-cursor');
      states.push({
        text: output.textContent ?? '',
        cursors: cursors?.length ?? 0,
        visibility: cursors?.[0] ? getComputedStyle(cursors[0]).visibility : '',
      });
    };
    record();
    new MutationObserver(record).observe(output, { childList: true, characterData: true, subtree: true });
    return states;
  });
  await expect
    .poll(() => changes.evaluate((states) => states.map((state) => state.text)), { timeout: 15_000 })
    .toEqual(expect.arrayContaining(['WORK', 'RIGHT', 'FAST', '']));
  expect(await changes.evaluate((states) => states.every((state) => state.cursors === 1 && state.visibility === 'visible'))).toBe(true);
  await changes.dispose();
  expect(errors).toEqual([]);
});

test('project images enlarge, cycle with arrow keys and restore focus on close', async ({ page }) => {
  await page.goto('work/relayq/');
  await waitForStage(page);
  const first = page.locator('[data-gallery-image]').first();
  await first.click();
  const viewer = page.getByRole('dialog', { name: 'relayq' });
  await expect(viewer).toBeVisible();
  await expect(viewer.locator('[data-gallery-count]')).toHaveText('1 / 3');
  await expect.poll(() => viewer.locator('img').evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth)).toBe(2400);
  await page.keyboard.press('ArrowRight');
  await expect(viewer.locator('[data-gallery-count]')).toHaveText('2 / 3');
  await expect(viewer.locator('[data-gallery-caption]')).toContainText('20,000 jobs');
  await page.keyboard.press('ArrowLeft');
  await expect(viewer.locator('[data-gallery-count]')).toHaveText('1 / 3');
  await page.keyboard.press('Escape');
  await expect(viewer).not.toBeVisible();
  await expect(first).toBeFocused();
  await expect(page.locator('html')).not.toHaveClass(/is-locked/);
});

test('scroll text reflows during a reveal and returns intact after reverse scrolling', async ({ page }) => {
  await page.goto('./');
  await waitForStage(page);
  const text = page.locator('.statement__text');
  const paragraphs = text.locator('p');
  const original = await paragraphs.allTextContents();
  const top = await text.evaluate((element) => element.getBoundingClientRect().top + window.scrollY);
  await page.evaluate((y) => window.scrollTo(0, y - innerHeight * 0.7), top);
  await page.waitForTimeout(80);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(350);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(350);
  const settledTop = await text.evaluate((element) => element.getBoundingClientRect().top + window.scrollY);
  await page.evaluate((y) => window.scrollTo(0, y - 40), settledTop);
  await page.waitForTimeout(450);
  expect((await paragraphs.allTextContents()).map((value) => value.replace(/\s+/g, ' ').trim())).toEqual(
    original.map((value) => value.replace(/\s+/g, ' ').trim()),
  );
  await expect(text.locator('[data-inline-pic]')).toHaveCount(2);
  expect(await text.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1);
  expect(
    await text.locator('.rise-line').evaluateAll((lines) => lines.every((line) => Number(getComputedStyle(line).opacity) > 0.99)),
  ).toBe(true);
  const freshTop = await text.evaluate((element) => element.getBoundingClientRect().top + window.scrollY);
  await page.evaluate((y) => window.scrollTo(0, y - innerHeight * 0.83), freshTop);
  await page.waitForTimeout(450);
  expect(
    await text
      .locator('.rise-line')
      .first()
      .evaluate((line) => Number(getComputedStyle(line).opacity)),
  ).toBeLessThan(0.5);
});
