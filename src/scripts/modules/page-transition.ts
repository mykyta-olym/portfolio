// Cover the live page before navigation so videos and motion keep playing on departure.
import { fontsReady, reducedMotion, type Cleanup } from '@/scripts/core/motion';
import { lockScroll, markStageReady } from '@/scripts/core/stage';

export const TRANSITION_KEY = 'page-transition';
const LEAVE_MS = 800;

function shouldIntercept(event: MouseEvent, anchor: HTMLAnchorElement): URL | null {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
  if (anchor.target && anchor.target !== '_self') return null;
  if (anchor.hasAttribute('download') || anchor.dataset['transition'] === 'off') return null;
  const url = new URL(anchor.href, location.href);
  if (url.origin !== location.origin || !url.pathname.startsWith(import.meta.env.BASE_URL)) return null;
  if (url.pathname === location.pathname && url.search === location.search) return null;
  return url;
}

export function initPageTransitions(panel: HTMLElement): Cleanup {
  const root = document.documentElement;
  const hasLoader = Boolean(document.querySelector('[data-preloader]'));
  const reduce = reducedMotion();
  const timers: number[] = [];
  let leaving = false;
  let disposed = false;
  let unlock: (() => void) | undefined;

  const uncover = (): void => {
    if (disposed) return;
    root.classList.remove('is-uncovering');
    markStageReady();
    unlock?.();
    unlock = undefined;
  };
  if (root.classList.contains('is-arriving') && !hasLoader && !reduce) {
    unlock = lockScroll();
    void fontsReady().then(() => {
      if (disposed) return;
      // Resolve the covered style before starting the incoming live-DOM reveal.
      panel.getBoundingClientRect();
      requestAnimationFrame(() => {
        if (disposed) return;
        root.classList.replace('is-arriving', 'is-uncovering');
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
    if (!hasLoader) void fontsReady().then(() => !disposed && markStageReady());
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
      root.classList.remove('is-arriving', 'is-uncovering');
      root.classList.add('is-departing');
      timers.push(window.setTimeout(() => location.assign(url.href), LEAVE_MS));
    }
  };
  const onPageShow = (event: PageTransitionEvent): void => {
    if (!event.persisted) return;
    leaving = false;
    root.classList.remove('is-departing', 'is-arriving', 'is-uncovering');
    uncover();
  };
  document.addEventListener('click', onClick);
  window.addEventListener('pageshow', onPageShow);
  return () => {
    disposed = true;
    timers.forEach(clearTimeout);
    unlock?.();
    document.removeEventListener('click', onClick);
    window.removeEventListener('pageshow', onPageShow);
  };
}
