// Coordinates when the page is "on stage": after the home loader or the page transition has
// uncovered it. Entrance animations wait for this so they never play behind a cover.
import { gsap, ScrollTrigger } from '@/scripts/core/gsap';
import type { Cleanup } from '@/scripts/core/motion';

const READY_EVENT = 'stage:ready';
let ready = false;

export function markStageReady(): void {
  if (ready) return;
  ready = true;
  document.documentElement.classList.add('is-stage-ready');
  window.dispatchEvent(new CustomEvent(READY_EVENT));
}

export function whenStageReady(): Promise<void> {
  if (ready) return Promise.resolve();
  return new Promise((resolve) => window.addEventListener(READY_EVENT, () => resolve(), { once: true }));
}

export function isStageReady(): boolean {
  return ready;
}

/**
 * Everything on the first screen enters with the page, including content near its bottom edge.
 * Further down, an entrance waits until its element has scrolled a little into view.
 */
export function entranceStart(element: Element, start = 'top 92%'): () => string {
  return () => (element.getBoundingClientRect().top + window.scrollY < window.innerHeight ? 'top bottom' : start);
}

/** Prepare an entrance now; play it only when both its section and the page are visible. */
export function playOnStage(element: Element, animation: gsap.core.Animation, start = 'top 92%'): Cleanup {
  let disposed = false;
  animation.pause();
  const trigger = ScrollTrigger.create({
    trigger: element,
    start: entranceStart(element, start),
    once: true,
    onEnter: () => {
      void whenStageReady().then(() => {
        if (!disposed) animation.play();
      });
    },
  });
  return () => {
    disposed = true;
    trigger.kill();
    animation.kill();
  };
}

/** Locks scrolling while something covers the page. Counted, so overlaps unlock correctly. */
let locks = 0;
export function lockScroll(): () => void {
  // Overflow does not stop programmatic scrolling already in flight.
  if (locks === 0) gsap.killTweensOf(window);
  locks += 1;
  document.documentElement.classList.add('is-locked');
  let released = false;
  return () => {
    if (released) return;
    released = true;
    locks = Math.max(0, locks - 1);
    if (locks === 0) document.documentElement.classList.remove('is-locked');
  };
}
