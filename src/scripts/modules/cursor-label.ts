// A small label that follows the pointer over elements with data-cursor, such as "Drag" on
// the about field or "Play" on the footer wordmark. Mouse only; hidden on touch screens.
import { damp } from '@/lib/math';
import { coarsePointer, reducedMotion, type Cleanup } from '@/scripts/core/motion';

export function initCursorLabel(label: HTMLElement): Cleanup {
  if (coarsePointer()) return () => undefined;
  const text = label.querySelector<HTMLElement>('[data-cursor-text]') ?? label;
  const reduce = reducedMotion();
  let x = 0;
  let y = 0;
  let tx = 0;
  let ty = 0;
  let frame = 0;
  let previous = 0;

  const render = (now: number): void => {
    const dt = previous ? (now - previous) / 1000 : 1 / 60;
    previous = now;
    const k = reduce ? 1 : damp(18, dt);
    x += (tx - x) * k;
    y += (ty - y) * k;
    label.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    frame = Math.abs(tx - x) + Math.abs(ty - y) > 0.2 ? requestAnimationFrame(render) : 0;
    if (!frame) previous = 0;
  };

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
        x = tx;
        y = ty;
      }
      label.classList.add('is-visible');
    } else {
      label.classList.remove('is-visible');
    }
    if (!frame) frame = requestAnimationFrame(render);
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
    cancelAnimationFrame(frame);
    document.removeEventListener('pointermove', onMove);
    window.removeEventListener('scroll', onScroll);
    document.documentElement.removeEventListener('pointerleave', onLeave);
  };
}
