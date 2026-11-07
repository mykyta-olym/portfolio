// Small page-wide behaviours: the hero video, back to top, and the tab title while away.
import { reducedMotion, type Cleanup } from '@/scripts/core/motion';

/** Plays a background video only while it is on screen; with reduced motion it stays paused. */
export function initBackgroundVideo(video: HTMLVideoElement): Cleanup {
  const reveal = (): void => video.classList.add('is-playing');
  video.addEventListener('playing', reveal, { once: true });
  if (reducedMotion()) {
    video.removeAttribute('autoplay');
    video.pause();
    return () => undefined;
  }
  const observer = new IntersectionObserver(([entry]) => {
    if (entry?.isIntersecting && !document.hidden) void video.play().catch(() => undefined);
    else video.pause();
  });
  observer.observe(video);
  return () => observer.disconnect();
}

export function initBackToTop(button: HTMLElement): Cleanup {
  const onClick = (): void => {
    window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
    document.querySelector<HTMLElement>('#main')?.focus({ preventScroll: true });
  };
  button.addEventListener('click', onClick);
  return () => button.removeEventListener('click', onClick);
}

/** While the tab is in the background its title cycles "Still compiling" with dots. */
export function initAwayTitle(): Cleanup {
  const original = document.title;
  let timer = 0;
  let dots = 1;
  const onVisibility = (): void => {
    window.clearInterval(timer);
    if (document.hidden) {
      const tick = (): void => {
        document.title = `Still compiling${'.'.repeat(dots)}`;
        dots = dots >= 3 ? 1 : dots + 1;
      };
      dots = 1;
      tick();
      timer = window.setInterval(tick, 800);
    } else {
      document.title = original;
    }
  };
  document.addEventListener('visibilitychange', onVisibility);
  return () => {
    window.clearInterval(timer);
    document.title = original;
    document.removeEventListener('visibilitychange', onVisibility);
  };
}

/** Copies data-copy to the clipboard, confirms visually and through a polite live region. */
export function initCopy(button: HTMLElement): Cleanup {
  const value = button.dataset['copy'] ?? '';
  const status = button.parentElement?.querySelector<HTMLElement>('[data-copy-status]') ?? null;
  let timer = 0;
  const onClick = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(value);
      button.classList.add('is-copied');
      if (status) status.textContent = 'Email address copied';
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        button.classList.remove('is-copied');
        if (status) status.textContent = '';
      }, 1800);
    } catch {
      // Clipboard access can be denied; the address stays visible and selectable.
    }
  };
  const handler = (): void => void onClick();
  button.addEventListener('click', handler);
  return () => {
    window.clearTimeout(timer);
    button.removeEventListener('click', handler);
  };
}
