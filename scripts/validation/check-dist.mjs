// Checks the built site before it ships:
// 1. every internal href, src, srcset and poster points at a file that exists in dist,
// 2. every page has a title, a description and exactly one h1,
// 3. visible copy uses ASCII punctuation (no typographic dashes, quotes, ellipses or arrows).
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const dist = resolve(import.meta.dirname, '../../dist');
const base = process.env.SITE_BASE ?? '/portfolio/';
const forbidden = /[–—…→←·“”‘’]/u;

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const problems = [];
const pages = walk(dist).filter((file) => file.endsWith('.html'));
const urlPattern = /\s(?:href|src|poster)="([^"]+)"/g;
const srcsetPattern = /\ssrcset="([^"]+)"/g;

function checkTarget(page, url) {
  if (!url.startsWith(base)) return;
  const clean = decodeURIComponent(url.slice(base.length).split(/[?#]/)[0] ?? '');
  const target = clean === '' || clean.endsWith('/') ? join(dist, clean, 'index.html') : join(dist, clean);
  if (!existsSync(target)) problems.push(`${relative(dist, page)}: missing ${url}`);
}

for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  for (const [, url] of html.matchAll(urlPattern)) checkTarget(page, url);
  for (const [, set] of html.matchAll(srcsetPattern)) {
    for (const candidate of set.split(',')) checkTarget(page, candidate.trim().split(/\s+/)[0] ?? '');
  }
  if (!/<title>[^<]+<\/title>/.test(html)) problems.push(`${relative(dist, page)}: no <title>`);
  if (!/<meta name="description" content="[^"]+"/.test(html)) problems.push(`${relative(dist, page)}: no description`);
  const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1 !== 1) problems.push(`${relative(dist, page)}: ${h1} h1 elements`);
  const visible = html
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, ' ');
  const hit = visible.match(forbidden);
  if (hit) {
    const at = visible.indexOf(hit[0]);
    problems.push(
      `${relative(dist, page)}: non-ASCII punctuation "${hit[0]}" near "${visible.slice(Math.max(0, at - 30), at + 10).trim()}"`,
    );
  }
}

if (problems.length > 0) {
  console.error(`check-dist: ${problems.length} problem(s)`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}
console.log(`check-dist: ${pages.length} pages, links, assets and copy are fine`);
