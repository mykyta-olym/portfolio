// Renders a scene from scripts/media/render/scenes frame by frame in Chrome on the real GPU.
// Usage: node scripts/media/render/render.mjs --scene blocks --variant landscape
//          --w 1920 --h 1080 --frames 300 [--from 0] [--to 299] [--samples 40] [--out dir]
import { createServer } from 'node:http';
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from '@playwright/test';

const { values } = parseArgs({
  options: {
    scene: { type: 'string', default: 'blocks' },
    variant: { type: 'string', default: 'landscape' },
    w: { type: 'string', default: '1920' },
    h: { type: 'string', default: '1080' },
    frames: { type: 'string', default: '300' },
    from: { type: 'string', default: '0' },
    to: { type: 'string' },
    samples: { type: 'string', default: '40' },
    out: { type: 'string' },
  },
});

const root = resolve(import.meta.dirname, '../../..');
const total = Number(values.frames);
const first = Number(values.from);
const last = values.to === undefined ? total - 1 : Number(values.to);
const outDir = resolve(values.out ?? join(root, '.media-cache', `${values.scene}-${values.variant}`));
mkdirSync(outDir, { recursive: true });

const types = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json' };
const server = createServer((request, response) => {
  const path = normalize(join(root, decodeURIComponent(new URL(request.url ?? '/', 'http://local').pathname)));
  try {
    if (!path.startsWith(root + sep) || !statSync(path).isFile()) throw new Error('not found');
    response.writeHead(200, { 'Content-Type': types[extname(path)] ?? 'application/octet-stream' });
    response.end(readFileSync(path));
  } catch {
    response.writeHead(404);
    response.end();
  }
});
await new Promise((done) => server.listen(0, '127.0.0.1', () => done(undefined)));
const address = server.address();
const port = typeof address === 'object' && address ? address.port : 0;

const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--disable-gpu-watchdog', '--disable-background-timer-throttling'],
});
const page = await browser.newPage({ viewport: { width: 400, height: 300 } });
page.on('pageerror', (error) => console.error('page error:', error.message));
page.on('console', (message) => {
  if (message.type() === 'error' || message.type() === 'warning') console.error('console:', message.text().slice(0, 300));
});
const query = new URLSearchParams({ scene: values.scene, variant: values.variant, w: values.w, h: values.h, samples: values.samples });
await page.goto(`http://127.0.0.1:${port}/scripts/media/render/page.html?${query}`);
await page.waitForFunction(() => window.renderReady === true, null, { timeout: 120000 });
console.log('renderer:', await page.evaluate(() => window.renderInfo));

const started = Date.now();
for (let frame = first; frame <= last; frame += 1) {
  const data = await page.evaluate(([f, t]) => window.renderFrame(f, t), [frame, total]);
  writeFileSync(join(outDir, `f${String(frame).padStart(5, '0')}.png`), Buffer.from(data, 'base64'));
  if ((frame - first) % 25 === 0 || last - first < 6) {
    const each = (Date.now() - started) / (frame - first + 1) / 1000;
    const timing = await page.evaluate(() => window.lastTiming);
    console.log(`frame ${frame}/${last}  ${each.toFixed(2)} s/frame`, JSON.stringify(timing));
  }
}
await browser.close();
server.close();
console.log(`rendered ${last - first + 1} frames to ${outDir}`);
