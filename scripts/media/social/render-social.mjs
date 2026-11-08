// Favicons and the social preview image. The icons come from the shared monogram in
// src/lib/pixels.ts; the preview is HTML rendered in Chrome over the showcase still.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromium } from '@playwright/test';
import sharp from 'sharp';

const root = resolve(import.meta.dirname, '../../..');
const pub = join(root, 'public');
mkdirSync(join(pub, 'social'), { recursive: true });

const source = readFileSync(join(root, 'src/lib/pixels.ts'), 'utf8');
const match = source.match(/export const monogram: Grid = \[([^\]]+)\]/);
if (!match) throw new Error('monogram not found in src/lib/pixels.ts');
const rows = [...match[1].matchAll(/'([.#]+)'/g)].map((m) => m[1]);

function iconSvg({ padding, background, radius }) {
  const cells = rows.flatMap((row, y) => [...row].map((c, x) => (c === '#' ? `<rect x="${x}" y="${y}" width="1" height="1"/>` : '')));
  const size = rows.length + padding * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-padding} ${-padding} ${size} ${size}" shape-rendering="crispEdges">${
    background ? `<rect x="${-padding}" y="${-padding}" width="${size}" height="${size}" rx="${radius}" fill="${background}"/>` : ''
  }<g fill="#fff">${cells.join('')}</g></svg>`;
}

const favicon = iconSvg({ padding: 1, background: '#000', radius: 1.4 });
writeFileSync(join(pub, 'favicon.svg'), favicon);
await sharp(Buffer.from(favicon)).resize(32, 32, { kernel: 'nearest' }).png().toFile(join(pub, 'favicon-32.png'));
const touch = iconSvg({ padding: 2, background: '#000', radius: 0 });
await sharp(Buffer.from(touch)).resize(180, 180, { kernel: 'nearest' }).png().toFile(join(pub, 'apple-touch-icon.png'));
await sharp(Buffer.from(touch)).resize(192, 192, { kernel: 'nearest' }).png().toFile(join(pub, 'icon-192.png'));
await sharp(Buffer.from(touch)).resize(512, 512, { kernel: 'nearest' }).png().toFile(join(pub, 'icon-512.png'));

const still = (await sharp(join(root, 'src/assets/renders/showcase.webp')).resize(1200, 675).jpeg({ quality: 90 }).toBuffer()).toString(
  'base64',
);
const font = (file) => readFileSync(join(root, 'node_modules', file)).toString('base64');
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: 'Inter'; font-weight: 100 900; src: url(data:font/woff2;base64,${font('@fontsource-variable/inter/files/inter-latin-wght-normal.woff2')}) format('woff2'); }
@font-face { font-family: 'Plex'; src: url(data:font/woff2;base64,${font('@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2')}) format('woff2'); }
@font-face { font-family: 'Plex'; unicode-range: U+0100-024F; src: url(data:font/woff2;base64,${font('@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-ext-400-normal.woff2')}) format('woff2'); }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; overflow: hidden; background: #000 url(data:image/jpeg;base64,${still}) center 40% / cover; font-family: 'Inter'; color: #fff; }
.shade { position: absolute; inset: 0; background: linear-gradient(90deg, rgb(0 0 0 / 82%) 0%, rgb(0 0 0 / 30%) 55%, transparent 100%); }
.copy { position: absolute; left: 72px; bottom: 72px; }
h1 { font-size: 86px; font-weight: 400; letter-spacing: -0.06em; line-height: 1; }
p { margin-top: 22px; font-size: 26px; font-weight: 300; color: #dcdcdc; }
.tag { position: absolute; left: 72px; top: 64px; font: 14px 'Plex'; letter-spacing: 0.18em; color: #bdbdbd; }
</style></head><body><div class="shade"></div><div class="tag">SOFTWARE DEVELOPER / KOŠICE</div><div class="copy"><h1>Mykyta Olym</h1><p>Backend systems, web apps and applied machine learning.</p></div></body></html>`;

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
const png = await page.screenshot({ type: 'png' });
await browser.close();
await sharp(png)
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(join(pub, 'social', 'og-default.jpg'));
console.log('favicon.svg, favicon-32.png, apple-touch-icon.png, icon-192.png, icon-512.png, social/og-default.jpg');
