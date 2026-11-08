// Source choreography: 00 → 36 → 78 → 99, with each counter change starting on the
// same frame as its logo morph. Slow media can hold the final beat, never the page forever.
import { loaderStages } from '@/lib/pixels';
import { lockScroll, markStageReady } from '@/scripts/core/stage';
import { reducedMotion } from '@/scripts/core/motion';
import { LoadProgress } from './progress';
import { PixelMark } from './pixel-mark';

const MILESTONES = [0, 490, 1210, 2080];
const PERCENTAGES = ['00', '36', '78', '99'];
const GRID_MOVE = 340;
const MAX_WAIT_MS = 4000;

/** True on connections where waiting for the hero video would hold the page back. */
function slowConnection(): boolean {
  const connection = (navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } }).connection;
  if (!connection) return false;
  return Boolean(connection.saveData) || ['slow-2g', '2g', '3g'].includes(connection.effectiveType ?? '');
}

function trackVideo(progress: LoadProgress, video: HTMLVideoElement | null): void {
  // The poster under the video is a frame of the same loop, so on a slow connection the page
  // opens on the poster and the video fades in once it can play.
  if (!video || slowConnection()) {
    progress.settle('video');
    return;
  }
  // Three seconds buffered is enough for a smooth start; the rest streams while playing.
  const needed = 3;
  const update = (): void => {
    if (video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
      progress.settle('video');
      return;
    }
    const { buffered } = video;
    if (buffered.length > 0) progress.report('video', buffered.end(buffered.length - 1) / needed);
  };
  video.addEventListener('progress', update);
  video.addEventListener('loadeddata', update);
  video.addEventListener('canplaythrough', () => progress.settle('video'), { once: true });
  const sources = video.querySelectorAll('source');
  sources[sources.length - 1]?.addEventListener('error', () => progress.settle('video'), { once: true });
  video.addEventListener('error', () => progress.settle('video'), { once: true });
  update();
}

function trackImage(progress: LoadProgress, name: string, image: HTMLImageElement | null): void {
  if (!image) {
    progress.settle(name);
    return;
  }
  const done = (): void => progress.settle(name);
  if (image.complete) done();
  else {
    image.addEventListener('load', done, { once: true });
    image.addEventListener('error', done, { once: true });
  }
}

export function startPreloader(root: HTMLElement): void {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-loader-mark]');
  const digits = root.querySelector<HTMLElement>('[data-loader-digits]');
  if (!canvas || !digits) return;

  const reduce = reducedMotion();
  const minimum = reduce ? 250 : 3000;
  const unlock = lockScroll();
  const progress = new LoadProgress().add('document', 1).add('fonts', 2).add('poster', 1).add('video', 4);

  if (document.readyState === 'complete') progress.settle('document');
  else window.addEventListener('load', () => progress.settle('document'), { once: true });
  if ('fonts' in document) void document.fonts.ready.then(() => progress.settle('fonts'));
  else progress.settle('fonts');
  trackImage(progress, 'poster', document.querySelector<HTMLImageElement>('[data-hero-poster]'));
  trackVideo(progress, document.querySelector<HTMLVideoElement>('[data-hero-video]'));

  const mark = new PixelMark(canvas);
  let milestone = 0;
  let currentDigit = digits.querySelector<HTMLElement>('[data-digit]');
  let counterAnimations: Animation[] = [];
  let leaving = false;
  const started = performance.now();
  mark.draw(loaderStages[0] ?? [], loaderStages[0] ?? [], 1);

  const setPercent = (value: string): void => {
    // A suspended tab can cross several milestones in one frame. Keep only its current
    // digit before starting another roll; animations must never accumulate old layers.
    counterAnimations.forEach((animation) => animation.cancel());
    for (const digit of digits.children) if (digit !== currentDigit) digit.remove();
    const previous = currentDigit;
    const next = document.createElement('span');
    next.dataset['digit'] = '';
    next.className = 'loader__digit';
    next.textContent = value;
    digits.append(next);
    currentDigit = next;
    if (!previous || reduce) {
      previous?.remove();
      return;
    }
    const timing = { duration: GRID_MOVE, easing: 'cubic-bezier(.45, 0, .55, 1)', fill: 'both' as const };
    const leaving = previous.animate(
      [
        { transform: 'translateY(0)', opacity: 1 },
        { transform: 'translate3d(0, -38%, 0)', opacity: 0 },
      ],
      timing,
    );
    const arriving = next.animate(
      [
        { transform: 'translate3d(0, 38%, 0)', opacity: 0 },
        { transform: 'translateY(0)', opacity: 1 },
      ],
      timing,
    );
    counterAnimations = [leaving, arriving];
    arriving.onfinish = () => {
      previous.remove();
      leaving.cancel();
      arriving.cancel();
      counterAnimations = [];
    };
  };

  const leave = (): void => {
    if (leaving) return;
    leaving = true;
    const finish = (): void => {
      root.remove();
      unlock();
    };
    // The page underneath starts its entrance while the cover is lifting.
    window.setTimeout(() => root.classList.add('is-leaving'), reduce ? 0 : 90);
    window.setTimeout(markStageReady, reduce ? 0 : 370);
    root.addEventListener('transitionend', finish, { once: true });
    window.setTimeout(finish, 1400);
  };

  const tick = (now: number): void => {
    if (leaving) return;
    const elapsed = now - started;
    while (milestone < MILESTONES.length - 1 && elapsed >= (MILESTONES[milestone + 1] ?? 0)) {
      milestone += 1;
      setPercent(PERCENTAGES[milestone] ?? '99');
    }
    if (!reduce) {
      const stage = milestone + 1;
      const start = milestone === 0 ? 100 : (MILESTONES[milestone] ?? 0);
      const duration = milestone === 0 ? 280 : milestone === 3 ? 550 : GRID_MOVE;
      const t = Math.max(0, Math.min(1, (elapsed - start) / duration));
      mark.draw(loaderStages[stage - 1] ?? [], loaderStages[stage] ?? [], t);
    } else {
      const final = loaderStages.at(-1) ?? [];
      mark.draw(final, final, 1);
    }
    if ((progress.complete && elapsed >= minimum) || elapsed >= MAX_WAIT_MS) {
      leave();
      return;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  // A page restored from the back-forward cache must not come back covered.
  window.addEventListener('pageshow', (event) => {
    if (event.persisted && root.isConnected) leave();
  });
}
