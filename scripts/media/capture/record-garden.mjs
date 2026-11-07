// Records real gameplay of Garden of Lost Paths for the menu card: the flight over the maze
// and a short auto-walk. Serves the game from the sibling repository, drives it the way its
// own capture script does, and keeps only the part after the player enters the garden.
// Usage: node scripts/media/capture/record-garden.mjs
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdirSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { chromium } from '@playwright/test';

const root = resolve(import.meta.dirname, '../../..');
const game = resolve(root, '../zahrada-stratenych-ciest/Olym_PG1_20262027');
const work = join(root, '.media-cache', 'garden-capture');
const out = join(root, 'public', 'media', 'menu');
rmSync(work, { recursive: true, force: true });
mkdirSync(work, { recursive: true });
mkdirSync(out, { recursive: true });

const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};
const server = createServer((request, response) => {
  let path = normalize(join(game, decodeURIComponent(new URL(request.url ?? '/', 'http://local').pathname)));
  try {
    if (statSync(path).isDirectory()) path = join(path, 'index.html');
    if (!path.startsWith(game + sep) || !statSync(path).isFile()) throw new Error('not found');
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
  args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required', '--mute-audio'],
});
const size = { width: 1280, height: 800 };
const context = await browser.newContext({ viewport: size, recordVideo: { dir: work, size } });
const page = await context.newPage();
const started = Date.now();
const mark = () => (Date.now() - started) / 1000;
const click = (selector) => page.locator(`${selector}:visible`).first().click();

await page.goto(`http://127.0.0.1:${port}/`);
await page.waitForFunction(() => document.getElementById('vyzva')?.classList.contains('viditelna'), null, { timeout: 60000 });
await page.keyboard.press('Enter');
await page.waitForTimeout(2600);
await click('[data-akcia="zacat"]');
await page.waitForSelector('[data-akcia="vstupit"]:visible:not(.caka)', { timeout: 60000 });
await click('[data-akcia="vstupit"]');
const entered = mark();
// The flight over the maze, then the player walks with the auto-walk key.
await page.waitForTimeout(6500);
await page.keyboard.press('u');
await page.waitForTimeout(9000);
const ended = mark();
await context.close();
await browser.close();
server.close();

const raw = readdirSync(work).find((name) => name.endsWith('.webm'));
if (!raw) throw new Error('no recording was written');
encode(join(work, raw), entered, ended);
console.log(`recorded the garden from ${entered.toFixed(1)} s into ${out}`);

function encode(source, enteredAt, endedAt) {
  const start = Math.max(0, enteredAt + 0.3);
  const length = Math.min(10.5, endedAt - start - 0.2);
  const fade = `fade=t=in:st=0:d=0.5,fade=t=out:st=${(length - 0.6).toFixed(2)}:d=0.6`;
  // The game draws inside 88 px letterbox bars at this window size; they are cut away.
  const filters = `trim=start=${start.toFixed(2)}:duration=${length.toFixed(2)},setpts=PTS-STARTPTS,crop=iw:ih-176:0:88,fps=24,scale=720:-2:flags=lanczos,${fade}`;
  const run = (args) => {
    const result = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', source, ...args], { stdio: 'inherit' });
    if (result.status !== 0) throw new Error(`ffmpeg failed: ${args.join(' ')}`);
  };
  // H.264 only: on this ink texture VP9 came out larger than H.264 at the same quality.
  run([
    '-vf',
    filters,
    '-c:v',
    'libx264',
    '-preset',
    'slow',
    '-crf',
    '30',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    '-an',
    join(out, 'garden.mp4'),
  ]);
  run([
    '-vf',
    `trim=start=${(start + 4).toFixed(2)},setpts=PTS-STARTPTS,crop=iw:ih-176:0:88,scale=720:-2:flags=lanczos`,
    '-frames:v',
    '1',
    '-c:v',
    'libwebp',
    '-quality',
    '72',
    join(out, 'garden-poster.webp'),
  ]);
}
