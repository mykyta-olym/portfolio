// Measures a page in Chrome on the real GPU: LCP and CLS from PerformanceObserver, frame
// times while scrolling with real wheel events, long tasks, and hero video frame drops.
// Usage: node scripts/qa/measure.mjs <url> [--width 1440] [--height 900] [--throttle]
//   --throttle  emulates a mid-range phone: 4x CPU slowdown and a 1.6 Mbps, 150 ms network.
import { parseArgs } from 'node:util';
import { chromium } from '@playwright/test';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    width: { type: 'string', default: '1440' },
    height: { type: 'string', default: '900' },
    throttle: { type: 'boolean', default: false },
  },
});
const url = positionals[0];
if (!url) throw new Error('usage: measure.mjs <url> [--width] [--height] [--throttle]');
const width = Number(values.width);
const height = Number(values.height);

const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'],
});
const context = await browser.newContext({ viewport: { width, height } });
const page = await context.newPage();
const gpu = await page.evaluate(() => {
  const gl = document.createElement('canvas').getContext('webgl2');
  const info = gl?.getExtension('WEBGL_debug_renderer_info');
  return info && gl ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : 'unknown';
});
if (values.throttle) {
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
  });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
}
await page.addInitScript(() => {
  window.__metrics = { lcp: 0, cls: 0, longTasks: 0, longTaskMs: 0 };
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) window.__metrics.lcp = entry.startTime;
  }).observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__metrics.cls += entry.value;
  }).observe({ type: 'layout-shift', buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      window.__metrics.longTasks += 1;
      window.__metrics.longTaskMs += entry.duration;
    }
  }).observe({ type: 'longtask', buffered: true });
});

const started = Date.now();
await page.goto(url, { waitUntil: 'load', timeout: 120000 });
await page.waitForFunction(() => document.documentElement.classList.contains('is-stage-ready'), null, { timeout: 60000 });
const stageMs = Date.now() - started;
await page.waitForTimeout(2500);

await page.evaluate(() => {
  window.__frames = [];
  let last = performance.now();
  const loop = (now) => {
    window.__frames.push(now - last);
    last = now;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
});
await page.mouse.move(width / 2, height / 2);
for (let i = 0; i < 800; i += 1) {
  await page.mouse.wheel(0, 80);
  await page.waitForTimeout(30);
  if (await page.evaluate(() => scrollY + innerHeight >= document.documentElement.scrollHeight - 2)) break;
}
const result = await page.evaluate(() => {
  const frames = window.__frames.slice(10);
  const sorted = [...frames].sort((a, b) => a - b);
  const at = (p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] ?? 0;
  const video = document.querySelector('[data-hero-video]');
  const quality = video?.getVideoPlaybackQuality?.();
  return {
    lcpMs: Math.round(window.__metrics.lcp),
    cls: Number(window.__metrics.cls.toFixed(4)),
    longTasks: window.__metrics.longTasks,
    longTaskMs: Math.round(window.__metrics.longTaskMs),
    frames: frames.length,
    medianFrameMs: Number(at(0.5).toFixed(1)),
    p95FrameMs: Number(at(0.95).toFixed(1)),
    worstFrameMs: Number((sorted.at(-1) ?? 0).toFixed(1)),
    framesOver33ms: frames.filter((f) => f > 33.4).length,
    video: quality ? { total: quality.totalVideoFrames, dropped: quality.droppedVideoFrames } : null,
  };
});
console.log(
  JSON.stringify({ url, viewport: `${width}x${height}`, throttled: values.throttle, gpu, stageReadyMs: stageMs, ...result }, null, 1),
);
await browser.close();
