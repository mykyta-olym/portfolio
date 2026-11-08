// A small label that follows the pointer over elements with data-cursor, such as "Drag" on
// the about field. Mouse only; hidden on touch screens.
import { gsap } from '@/scripts/core/gsap';
import { coarsePointer, reducedMotion, type Cleanup } from '@/scripts/core/motion';

export function initCursorLabel(label: HTMLElement): Cleanup {
  if (coarsePointer()) return () => undefined;
  const text = label.querySelector<HTMLElement>('[data-cursor-text]') ?? label;
  const reduce = reducedMotion();
  let tx = 0;
  let ty = 0;
  const xTo = gsap.quickTo(label, 'x', { duration: 0.2, ease: 'power3.out' });
  const yTo = gsap.quickTo(label, 'y', { duration: 0.2, ease: 'power3.out' });

  const onMove = (event: PointerEvent): void => {
    if (event.pointerType !== 'mouse') return;
    tx = event.clientX;
    ty = event.clientY;
    hasPointer = true;
    refresh(event.target as Element | null);
  };

  let hasPointer = false;
  // Shows or hides the label for whatever is under the pointer. Scrolling moves the page
  // under a still pointer, so it is re-checked on scroll as well as on movement.
  const refresh = (target: Element | null): void => {
    const host = target?.closest?.<HTMLElement>('[data-cursor]');
    if (host) {
      const value = host.dataset['cursor'] ?? '';
      if (text.textContent !== value) text.textContent = value;
      if (!label.classList.contains('is-visible')) {
        xTo.tween.pause();
        yTo.tween.pause();
        gsap.set(label, { x: tx, y: ty });
      }
      label.classList.add('is-visible');
      if (reduce) gsap.set(label, { x: tx, y: ty });
      else {
        xTo(tx);
        yTo(ty);
      }
    } else {
      label.classList.remove('is-visible');
    }
  };
  const onScroll = (): void => {
    if (hasPointer) refresh(document.elementFromPoint(tx, ty));
  };
  const onLeave = (): void => {
    hasPointer = false;
    label.classList.remove('is-visible');
  };

  document.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  document.documentElement.addEventListener('pointerleave', onLeave);
  return () => {
    xTo.tween.kill();
    yTo.tween.kill();
    document.removeEventListener('pointermove', onMove);
    window.removeEventListener('scroll', onScroll);
    document.documentElement.removeEventListener('pointerleave', onLeave);
  };
}
