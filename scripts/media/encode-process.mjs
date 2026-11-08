// Encode the real browser captures documented in ASSETS.md. No image content is altered.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '../..');
mkdirSync(resolve(root, 'src/assets/process'), { recursive: true });
for (const name of ['understand', 'build', 'test', 'refine', 'ship']) {
  await sharp(resolve(root, `.media-cache/project-captures/process-${name}.png`))
    .webp({ quality: 90, effort: 6 })
    .toFile(resolve(root, `src/assets/process/${name}.webp`));
}
