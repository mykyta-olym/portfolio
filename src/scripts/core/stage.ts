// Coordinates when the page is "on stage": after the home loader or the page transition has
// uncovered it. Entrance animations wait for this so they never play behind a cover.

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

/** Locks scrolling while something covers the page. Counted, so overlaps unlock correctly. */
let locks = 0;
export function lockScroll(): () => void {
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
