// Page transitions for a multi-page site. Leaving: a black panel rises over the page, then
// the browser navigates normally. Arriving: a tiny inline script in <head> has already
// marked the page as covered before first paint, and this module lifts the panel once fonts
// are ready. The home page has its own loader, which takes the place of the panel.
import { fontsReady, reducedMotion, type Cleanup } from '@/scripts/core/motion';
import { lockScroll, markStageReady } from '@/scripts/core/stage';

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
  let leaving = false;

  try {
    sessionStorage.removeItem(TRANSITION_KEY);
  } catch {
    // Without storage the next page simply arrives uncovered.
  }

  if (root.classList.contains('is-arriving') && !hasLoader && !reducedMotion()) {
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
    if (!(anchor instanceof HTMLAnchorElement) || reducedMotion()) return;
    const url = shouldIntercept(event, anchor);
    if (!url) return;
    event.preventDefault();
    if (leaving) return;
    leaving = true;
    try {
      sessionStorage.setItem(TRANSITION_KEY, '1');
    } catch {
      // Navigation still works; the next page just will not start covered.
    }
    root.classList.add('is-departing');
    window.setTimeout(() => location.assign(url.href), LEAVE_MS);
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
