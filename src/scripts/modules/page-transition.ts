// Supporting browsers use the reference's CSS-only cross-document transition. The cover
// below is the fallback; normal navigation remains intact in both paths.
import { fontsReady, reducedMotion, type Cleanup } from '@/scripts/core/motion';
import { lockScroll, markStageReady } from '@/scripts/core/stage';

declare global {
  interface Window {
    pageReveal?: ViewTransition | null;
  }
}

export const TRANSITION_KEY = 'page-transition';
const LEAVE_MS = 700;

function shouldIntercept(event: MouseEvent, anchor: HTMLAnchorElement): URL | null {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
  if (anchor.target && anchor.target !== '_self') return null;
  if (anchor.hasAttribute('download') || anchor.dataset['transition'] === 'off') return null;
  const url = new URL(anchor.href, location.href);
  if (url.origin !== location.origin) return null;
  if (!url.pathname.startsWith(import.meta.env.BASE_URL)) return null;
  if (url.pathname === location.pathname && url.search === location.search) return null;
  return url;
}

export function initPageTransitions(panel: HTMLElement): Cleanup {
  const root = document.documentElement;
  const hasLoader = Boolean(document.querySelector('[data-preloader]'));
  const native = typeof CSSViewTransitionRule !== 'undefined';
  let leaving = false;

  try {
    sessionStorage.removeItem(TRANSITION_KEY);
  } catch {
    // Without storage the next page simply arrives uncovered.
  }

  if (native) {
    root.classList.remove('is-departing', 'is-arriving', 'is-uncovering');
    if (!hasLoader)
      void fontsReady(1500).then(() =>
        requestAnimationFrame(() => {
          const transition = (window as Window & { pageReveal?: ViewTransition }).pageReveal;
          if (transition && !reducedMotion()) {
            // Start text just before the incoming top slice opens, rather than behind it.
            void transition.ready.then(() => window.setTimeout(markStageReady, 1050)).catch(markStageReady);
          } else markStageReady();
        }),
      );
  } else if (root.classList.contains('is-arriving') && !hasLoader && !reducedMotion()) {
    const unlock = lockScroll();
    void fontsReady(1500).then(() => {
      requestAnimationFrame(() => {
        root.classList.add('is-uncovering');
        root.classList.remove('is-arriving');
        window.setTimeout(markStageReady, 200);
        const done = (): void => {
          root.classList.remove('is-uncovering');
          unlock();
        };
        panel.addEventListener('transitionend', done, { once: true });
        window.setTimeout(done, 1300);
      });
    });
  } else {
    root.classList.remove('is-arriving');
    if (!hasLoader) void fontsReady(1500).then(markStageReady);
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
    // A second navigation can arrive before the previous reveal finishes. End that
    // reveal now so the browser can capture a fresh outgoing page without a delay.
    if (native) window.pageReveal?.skipTransition();
    try {
      sessionStorage.setItem(TRANSITION_KEY, url.pathname);
    } catch {
      // Navigation still works; the next page just will not start covered.
    }
    if (!native && !reducedMotion()) {
      event.preventDefault();
      root.classList.add('is-departing');
      window.setTimeout(() => location.assign(url.href), LEAVE_MS);
    }
  };

  // Back and forward can restore this page from memory with the cover still raised.
  const onPageShow = (event: PageTransitionEvent): void => {
    if (!event.persisted) return;
    leaving = false;
    root.classList.remove('is-departing', 'is-arriving', 'is-uncovering');
    markStageReady();
  };

  document.addEventListener('click', onClick);
  window.addEventListener('pageshow', onPageShow);
  return () => {
    document.removeEventListener('click', onClick);
    window.removeEventListener('pageshow', onPageShow);
  };
}
