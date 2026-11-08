// Renders the source-derived presentation plates to src/assets/work/<project>/<name>.webp.
// Usage: node scripts/media/cards/render-cards.mjs [idPrefix]
import { createServer } from 'node:http';
import { copyFileSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, normalize, resolve, sep } from 'node:path';
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { presentationCards } from './presentations.mjs';

const root = resolve(import.meta.dirname, '../../..');
const cache = join(root, '.media-cache', 'cards');
const outRoot = join(root, 'src', 'assets', 'work');
const filter = process.argv.slice(2).find((arg) => !arg.startsWith('--')) ?? '';
mkdirSync(join(cache, 'assets'), { recursive: true });

const types = { '.html': 'text/html', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg' };
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

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 2 });
const page = await context.newPage();
page.on('pageerror', (error) => console.error('page error:', error.message));

const cards = presentationCards().filter((card) => card.id.startsWith(filter));
for (const card of cards) {
  const target = join(outRoot, `${card.id}.webp`);
  mkdirSync(dirname(target), { recursive: true });

  if (card.photo) {
    const image = sharp(card.photo);
    const { width = 0, height = 0 } = await image.metadata();
    const crop = { top: 0, bottom: 0, left: 0, right: 0, ...card.crop };
    const left = Math.round(width * crop.left);
    const top = Math.round(height * crop.top);
    await image
      .extract({
        left,
        top,
        width: Math.round(width * (1 - crop.left - crop.right)),
        height: Math.round(height * (1 - crop.top - crop.bottom)),
      })
      .resize({ width: card.width })
      .webp({ quality: 84, effort: 6 })
      .toFile(target);
    console.log('photo', card.id);
    continue;
  }

  let html = typeof card.html === 'function' ? await card.html() : card.html;
  for (const [key, file] of Object.entries(card.assets ?? {})) {
    const name = `${card.id.replace('/', '-')}-${basename(file)}`;
    copyFileSync(file, join(cache, 'assets', name));
    html = html.replaceAll(`{{${key}}}`, `/.media-cache/cards/assets/${name}`);
  }
  const file = join(cache, `${card.id.replace('/', '-')}.html`);
  writeFileSync(file, html);
  await page.goto(`http://127.0.0.1:${port}/.media-cache/cards/${basename(file)}`);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images].map((img) => (img.complete ? null : new Promise((done) => img.addEventListener('load', done, { once: true })))),
    );
  });
  const png = await page.locator('#card').screenshot({ type: 'png' });
  await sharp(png).webp({ quality: 90, effort: 6 }).toFile(target);
  console.log('card ', card.id);
}

await browser.close();
server.close();
console.log(`${cards.length} visuals written to ${outRoot}`);
