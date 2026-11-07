// The home page loader. Its counter is driven by real loading events: web fonts, the hero
// poster, enough of the hero video to play smoothly, and the window load event. The mark
// morphs one stage per step of progress. Failed assets settle instead of blocking.
import { loaderStages } from '@/lib/pixels';
import { lockScroll, markStageReady } from '@/scripts/core/stage';
import { reducedMotion } from '@/scripts/core/motion';
import { displayPercent, LoadProgress, stageFor } from './progress';
import { PixelMark } from './pixel-mark';

const SEEN_KEY = 'loader-seen';
const MORPH_MS = 360;
const COUNTER_STEP_MS = 140;
const MAX_WAIT_MS = 4000;

function readSeen(): boolean {
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

function writeSeen(): void {
  try {
    sessionStorage.setItem(SEEN_KEY, '1');
  } catch {
    // Storage can be blocked; the loader then simply plays its first-visit timing again.
  }
}

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
  const seen = readSeen();
  const minimum = reduce ? 250 : seen ? 650 : 1700;
  const unlock = lockScroll();
  const progress = new LoadProgress().add('document', 1).add('fonts', 2).add('poster', 1).add('video', 4);

  if (document.readyState === 'complete') progress.settle('document');
  else window.addEventListener('load', () => progress.settle('document'), { once: true });
  if ('fonts' in document) void document.fonts.ready.then(() => progress.settle('fonts'));
  else progress.settle('fonts');
  trackImage(progress, 'poster', document.querySelector<HTMLImageElement>('[data-hero-poster]'));
  trackVideo(progress, document.querySelector<HTMLVideoElement>('[data-hero-video]'));

  const mark = new PixelMark(canvas);
  const last = loaderStages.length - 1;
  let shownStage = 0;
  let morphFrom = 0;
  let morphStart = -1;
  let shownPercent = -1;
  let lastCounterUpdate = 0;
  let leaving = false;
  const started = performance.now();
  mark.draw(loaderStages[0] ?? [], loaderStages[0] ?? [], 1);

  const setPercent = (value: number): void => {
    const previous = digits.querySelector<HTMLElement>('[data-digit]');
    const next = document.createElement('span');
    next.dataset['digit'] = '';
    next.className = 'loader__digit';
    next.textContent = String(value).padStart(2, '0');
    digits.append(next);
    if (!previous || reduce) {
      previous?.remove();
      return;
    }
    const timing = { duration: 280, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'both' as const };
    previous.animate(
      [
        { transform: 'translateY(0)', opacity: 1 },
        { transform: 'translateY(-45%)', opacity: 0 },
      ],
      timing,
    );
    next.animate(
      [
        { transform: 'translateY(45%)', opacity: 0 },
        { transform: 'translateY(0)', opacity: 1 },
      ],
      timing,
    ).onfinish = () => previous.remove();
  };

  const leave = (): void => {
    if (leaving) return;
    leaving = true;
    writeSeen();
    root.classList.add('is-leaving');
    const finish = (): void => {
      root.remove();
      unlock();
    };
    // The page underneath starts its entrance while the cover is lifting.
    window.setTimeout(markStageReady, reduce ? 0 : 280);
    root.addEventListener('transitionend', finish, { once: true });
    window.setTimeout(finish, 1400);
  };

  const tick = (now: number): void => {
    if (leaving) return;
    const elapsed = now - started;
    const percent = displayPercent(progress);
    if (percent !== shownPercent && now - lastCounterUpdate >= COUNTER_STEP_MS) {
      shownPercent = percent;
      lastCounterUpdate = now;
      setPercent(percent);
    }

    const target = reduce ? (progress.complete ? last : shownStage) : stageFor(progress.value, loaderStages.length, progress.complete);
    if (morphStart < 0 && target > shownStage) {
      morphFrom = shownStage;
      shownStage += 1;
      morphStart = now;
    }
    if (morphStart >= 0) {
      const t = reduce ? 1 : Math.min(1, (now - morphStart) / MORPH_MS);
      mark.draw(loaderStages[morphFrom] ?? [], loaderStages[shownStage] ?? [], t);
      if (t >= 1) morphStart = -1;
    }

    const settled = progress.complete && shownStage === last && morphStart < 0 && shownPercent === 100;
    if ((settled && elapsed >= minimum) || elapsed >= MAX_WAIT_MS) {
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
