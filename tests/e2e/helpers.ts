import { expect, type Page } from '@playwright/test';

export const pages = [
  '',
  'work/',
  'work/relayq/',
  'work/phishlens/',
  'work/gitpulse/',
  'work/stockroom/',
  'work/garden-of-lost-paths/',
  'work/speech-domain-adaptation/',
  'about/',
  'contact/',
];

/** Collects page errors and console errors for the lifetime of the page. */
export function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  return errors;
}

/** Waits until the loader or the page cover has gone and entrance motion has started. */
export async function waitForStage(page: Page): Promise<void> {
  await expect(page.locator('html')).toHaveClass(/is-stage-ready/, { timeout: 15_000 });
  await expect(page.locator('[data-preloader]')).toHaveCount(0, { timeout: 15_000 });
  await expect(page.locator('html')).toHaveAttribute('data-modules', 'ready', { timeout: 15_000 });
}

export async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}
