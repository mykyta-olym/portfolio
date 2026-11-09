// Cover the live page before navigation so videos and motion keep playing on departure.
import { fontsReady, reducedMotion, type Cleanup } from '@/scripts/core/motion';
import { lockScroll, markStageReady } from '@/scripts/core/stage';

export const TRANSITION_KEY = 'page-transition';
const LEAVE_MS = 800;
// Entrances start while the bands sweep away, so the page never opens empty and then fills in.
const ENTRANCE_LEAD_MS = 140;

function shouldIntercept(event: MouseEvent, anchor: HTMLAnchorElement): URL | null {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
  if (anchor.target && anchor.target !== '_self') return null;
  if (anchor.hasAttribute('download') || anchor.dataset['transition'] === 'off') return null;
  const url = new URL(anchor.href, location.href);
  if (url.origin !== location.origin || !url.pathname.startsWith(import.meta.env.BASE_URL)) return null;
  if (url.pathname === location.pathname && url.search === location.search) return null;
  return url;
}

export function initPageTransitions(panel: HTMLElement, prepared: Promise<unknown> = Promise.resolve()): Cleanup {
  const root = document.documentElement;
  const hasLoader = Boolean(document.querySelector('[data-preloader]'));
  const reduce = reducedMotion();
  const timers: number[] = [];
  let leaving = false;
  let disposed = false;
  let unlock: (() => void) | undefined;
  const exits: Animation[] = [];
  const readyToReveal = Promise.race([
    Promise.all([fontsReady(), prepared]),
    new Promise<void>((resolve) => timers.push(window.setTimeout(resolve, 2500))),
  ]);

  const clearExit = (): void => {
    exits.forEach((animation) => animation.cancel());
    exits.length = 0;
  };
  const startExit = (): void => {
    const menu = document.querySelector<HTMLElement>('[data-module="menu"][data-open]');
    const scope = menu ?? document;
    const candidates = [
      ...scope.querySelectorAll<HTMLElement>(
        menu
          ? '.menu__head, .menu__nav, .menu__foot'
          : '[data-reveal]:not([data-reveal-motion="opacity"]), .nav__pill, [data-scroll-rise], .field__tiles, [data-field-canvas], .orbit__stage, .showcase__wrapper, .footer',
      ),
    ];
    const targets = candidates.filter((element) => {
      const box = element.getBoundingClientRect();
      return (
        box.width > 0 &&
        box.height > 0 &&
        box.bottom > 0 &&
        box.top < innerHeight &&
        box.right > 0 &&
        box.left < innerWidth &&
        getComputedStyle(element).visibility !== 'hidden' &&
        !candidates.some((parent) => parent !== element && parent.contains(element))
      );
    });
    for (const element of targets) {
      const timing: KeyframeAnimationOptions = { duration: 320, easing: 'cubic-bezier(.4, 0, 1, 1)', fill: 'both' };
      // Snapshot opacity; compose movement with any entrance or drag still in progress.
      // Underlying animations and background videos keep running throughout departure.
      exits.push(
        element.animate({ opacity: [Number(getComputedStyle(element).opacity), 0] }, timing),
        element.animate({ transform: ['translateY(0)', 'translateY(-10px)'] }, { ...timing, composite: 'add' }),
      );
    }
  };

  const uncover = (): void => {
    if (disposed) return;
    root.classList.remove('is-uncovering');
    markStageReady();
    unlock?.();
    unlock = undefined;
  };
  if (root.classList.contains('is-arriving') && !hasLoader && !reduce) {
    unlock = lockScroll();
    void readyToReveal.then(() => {
      if (disposed) return;
      // Resolve the covered style before starting the incoming live-DOM reveal.
      panel.getBoundingClientRect();
      requestAnimationFrame(() => {
        if (disposed) return;
        root.classList.replace('is-arriving', 'is-uncovering');
        timers.push(window.setTimeout(() => !disposed && markStageReady(), ENTRANCE_LEAD_MS));
        // Follow the actual CSS band transitions, including interrupted/disabled motion.
        requestAnimationFrame(() => {
          if (disposed) return;
          void Promise.all(panel.getAnimations({ subtree: true }).map((animation) => animation.finished.catch(() => undefined))).then(
            () => !disposed && uncover(),
          );
        });
      });
    });
  } else {
    root.classList.remove('is-arriving');
    if (!hasLoader) void readyToReveal.then(() => !disposed && markStageReady());
  }

  const onClick = (event: MouseEvent): void => {
    const anchor = (event.target as Element | null)?.closest?.('a[href]');
    if (!(anchor instanceof HTMLAnchorElement)) return;
    const url = shouldIntercept(event, anchor);
    if (!url) return;
    if (leaving) {
      event.preventDefault();
      return;
    }
    leaving = true;
    try {
      sessionStorage.setItem(TRANSITION_KEY, url.pathname);
    } catch {
      // Navigation remains functional when storage is unavailable.
    }
    if (!reduce) {
      event.preventDefault();
      startExit();
      root.classList.remove('is-arriving', 'is-uncovering');
      root.classList.add('is-departing');
      timers.push(window.setTimeout(() => location.assign(url.href), LEAVE_MS));
    }
  };
  const onPageShow = (event: PageTransitionEvent): void => {
    if (!event.persisted) return;
    timers.forEach(clearTimeout);
    timers.length = 0;
    leaving = false;
    clearExit();
    try {
      sessionStorage.removeItem(TRANSITION_KEY);
    } catch {
      // History restoration also works when storage is unavailable.
    }
    root.classList.remove('is-departing', 'is-arriving', 'is-uncovering');
    uncover();
  };
  document.addEventListener('click', onClick);
  window.addEventListener('pageshow', onPageShow);
  return () => {
    disposed = true;
    clearExit();
    timers.forEach(clearTimeout);
    unlock?.();
    document.removeEventListener('click', onClick);
    window.removeEventListener('pageshow', onPageShow);
  };
}
