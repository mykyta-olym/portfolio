// Encodes rendered PNG frame sequences into web video: H.264 MP4 for reach and hardware
// decoding everywhere, VP9 WebM for size, plus a WebP poster taken from the first frame.
// Usage: node scripts/media/encode-video.mjs <framesDir> <outBase> [--fps 30]
//          [--width 1920] [--crf-h264 24] [--crf-vp9 34] [--poster-quality 70]
import { spawnSync } from 'node:child_process';
import { mkdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { parseArgs } from 'node:util';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    fps: { type: 'string', default: '30' },
    width: { type: 'string' },
    'crf-h264': { type: 'string', default: '24' },
    'crf-vp9': { type: 'string', default: '34' },
    'poster-quality': { type: 'string', default: '70' },
    'poster-frame': { type: 'string', default: '0' },
  },
});
const [framesDir, outBase] = positionals;
if (!framesDir || !outBase) {
  console.error('usage: encode-video.mjs <framesDir> <outBase> [options]');
  process.exit(1);
}
mkdirSync(dirname(outBase), { recursive: true });
const input = ['-framerate', values.fps, '-i', join(framesDir, 'f%05d.png')];
const scale = values.width ? ['-vf', `scale=${values.width}:-2:flags=lanczos`] : [];

function run(args) {
  const result = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`ffmpeg failed: ${args.join(' ')}`);
}

run([
  ...input,
  ...scale,
  '-c:v',
  'libx264',
  '-profile:v',
  'high',
  '-preset',
  'slow',
  '-crf',
  values['crf-h264'],
  '-pix_fmt',
  'yuv420p',
  '-movflags',
  '+faststart',
  '-an',
  `${outBase}.mp4`,
]);
run([
  ...input,
  ...scale,
  '-c:v',
  'libvpx-vp9',
  '-b:v',
  '0',
  '-crf',
  values['crf-vp9'],
  '-row-mt',
  '1',
  '-deadline',
  'good',
  '-cpu-used',
  '2',
  '-pix_fmt',
  'yuv420p',
  '-an',
  `${outBase}.webm`,
]);
const frame = String(Number(values['poster-frame'])).padStart(5, '0');
run([
  '-i',
  join(framesDir, `f${frame}.png`),
  ...scale,
  '-c:v',
  'libwebp',
  '-quality',
  values['poster-quality'],
  '-compression_level',
  '6',
  `${outBase}-poster.webp`,
]);

for (const ext of ['.mp4', '.webm', '-poster.webp']) {
  const size = statSync(`${outBase}${ext}`).size;
  console.log(`${outBase}${ext}  ${(size / 1024).toFixed(0)} KiB`);
}
