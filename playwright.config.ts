import { defineConfig, devices } from '@playwright/test';

const port = 4330;
const base = process.env['SITE_BASE'] ?? '/portfolio/';
const ci = Boolean(process.env['CI']);
// Match the live media checks, including the site's H.264 video decoder, in both environments.
const browser = { channel: 'chrome' };

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: ci ? 1 : 0,
  workers: ci ? 2 : 3,
  reporter: ci ? [['github'], ['list']] : 'list',
  use: {
    baseURL: `http://127.0.0.1:${port}${base}`,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `npx astro preview --port ${port} --host 127.0.0.1`,
    url: `http://127.0.0.1:${port}${base}`,
    reuseExistingServer: !ci,
    timeout: 60_000,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], ...browser, viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'], ...browser } },
  ],
});
