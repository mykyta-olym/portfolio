// Turns a one-way animated WebP into a seamless loop: it plays forward, then back, and slows
// near each turn so the reversal eases instead of bouncing. A clip whose last frame does not
// match its first otherwise jumps back to the start on every loop.
// Usage: node scripts/media/pingpong-webp.mjs <in.webp> <out.webp> [--skip 0] [--ease 6]
//          [--quality 75]
//   --skip     leading frames to drop, for clips that open with uneven steps
//   --ease     frames on each side of a turn that are slowed down
import { statSync } from 'node:fs';
import { parseArgs } from 'node:util';
import sharp from 'sharp';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    skip: { type: 'string', default: '0' },
    ease: { type: 'string', default: '6' },
    quality: { type: 'string', default: '75' },
  },
});
const [input, output] = positionals;
if (!input || !output) {
  console.error('usage: pingpong-webp.mjs <in.webp> <out.webp> [options]');
  process.exit(1);
}

const meta = await sharp(input, { animated: true }).metadata();
const pages = meta.pages ?? 1;
const skip = Number(values.skip);
const ease = Number(values.ease);
if (pages - skip < 3) throw new Error('not enough frames for a loop');
const frames = [];
for (let page = skip; page < pages; page += 1) frames.push(await sharp(input, { page, pages: 1 }).png().toBuffer());
const delays = (meta.delay ?? []).slice(skip);
const base = delays.length ? delays.reduce((sum, delay) => sum + delay, 0) / delays.length : 40;

// Forward through every frame, then back without repeating either end: the loop wraps from
// the second frame to the first, so no frame is shown twice in a row.
const order = [...frames.keys(), ...[...frames.keys()].slice(1, -1).reverse()];
const last = frames.length - 1;
const delay = order.map((index) => {
  const fromTurn = Math.min(index, last - index);
  if (fromTurn >= ease) return Math.round(base);
  // Up to twice as long on the turning frame, easing back to normal speed.
  return Math.round(base * (1 + (1 - fromTurn / ease) ** 2));
});

await sharp(
  order.map((index) => frames[index]),
  { join: { animated: true } },
)
  .webp({ quality: Number(values.quality), effort: 6, loop: 0, delay })
  .toFile(output);

const total = delay.reduce((sum, value) => sum + value, 0);
console.log(`${output}: ${order.length} frames, ${(total / 1000).toFixed(2)} s loop, ${Math.round(statSync(output).size / 1024)} KB`);
