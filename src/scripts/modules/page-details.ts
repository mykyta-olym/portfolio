// Small page-wide behaviours: the hero video, back to top, and the tab title while away.
import { reducedMotion, type Cleanup } from '@/scripts/core/motion';
import { gsap } from '@/scripts/core/gsap';

/** Plays a background video only while it is on screen; with reduced motion it stays paused. */
export function initBackgroundVideo(video: HTMLVideoElement): Cleanup {
  const reveal = (): void => video.classList.add('is-playing');
  video.addEventListener('playing', reveal, { once: true });
  if (reducedMotion()) {
    video.removeAttribute('autoplay');
    video.pause();
    return () => undefined;
  }
  let visible = false;
  const update = (): void => {
    if (visible && !document.hidden) void video.play().catch(() => undefined);
    else video.pause();
  };
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false;
    update();
  });
  observer.observe(video);
  document.addEventListener('visibilitychange', update);
  return () => {
    observer.disconnect();
    document.removeEventListener('visibilitychange', update);
    video.pause();
  };
}

export function initBackToTop(button: HTMLElement): Cleanup {
  let tween: gsap.core.Tween | null = null;
  const reset = (): void => {
    button.classList.remove('is-returning');
  };
  const cancel = (): void => {
    tween?.kill();
    reset();
  };
  const onClick = (): void => {
    cancel();
    const finish = (): void => {
      reset();
      document.querySelector<HTMLElement>('#main')?.focus({ preventScroll: true });
    };
    if (reducedMotion()) {
      window.scrollTo(0, 0);
      finish();
      return;
    }
    button.classList.add('is-returning');
    tween = gsap.to(window, {
      scrollTo: { y: 0, autoKill: true, onAutoKill: reset },
      duration: gsap.utils.clamp(1.1, 1.9, window.scrollY / 7000),
      ease: 'power3.inOut',
      onComplete: finish,
      onInterrupt: reset,
    });
  };
  const onKey = (event: KeyboardEvent): void => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) cancel();
  };
  button.addEventListener('click', onClick);
  window.addEventListener('wheel', cancel, { passive: true });
  window.addEventListener('touchstart', cancel, { passive: true });
  window.addEventListener('keydown', onKey);
  return () => {
    cancel();
    button.removeEventListener('click', onClick);
    window.removeEventListener('wheel', cancel);
    window.removeEventListener('touchstart', cancel);
    window.removeEventListener('keydown', onKey);
  };
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
