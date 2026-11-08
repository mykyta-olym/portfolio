import { defineConfig, devices } from '@playwright/test';

const port = 4330;
const base = process.env['SITE_BASE'] ?? '/portfolio/';
const ci = Boolean(process.env['CI']);
// Use real Chrome's headless mode in both environments. The older headless shell does
// not exercise cross-document View Transitions, even when it exposes the CSS API.
const browser = { channel: ci ? 'chromium' : 'chrome' };

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
