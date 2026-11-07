// Image strips in project rows: a native horizontal scroller (so wheel, keyboard and touch
// work as usual) plus mouse dragging with momentum. A drag never counts as a click.
import { damp } from '@/lib/math';
import { reducedMotion, type Cleanup } from '@/scripts/core/motion';

export function initDragScroll(scroller: HTMLElement): Cleanup {
  let pointerId: number | null = null;
  let startX = 0;
  let startY = 0;
  let startScroll = 0;
  let lastX = 0;
  let lastTime = 0;
  let velocity = 0;
  let dragging = false;
  let frame = 0;

  const stopMomentum = (): void => {
    cancelAnimationFrame(frame);
    frame = 0;
  };

  const onDown = (event: PointerEvent): void => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    stopMomentum();
    pointerId = event.pointerId;
    startX = lastX = event.clientX;
    startY = event.clientY;
    startScroll = scroller.scrollLeft;
    lastTime = performance.now();
    velocity = 0;
    dragging = false;
  };

  const onMove = (event: PointerEvent): void => {
    if (event.pointerId !== pointerId) return;
    const dx = event.clientX - startX;
    if (!dragging) {
      if (Math.abs(dx) < 6 || Math.abs(event.clientY - startY) > Math.abs(dx)) return;
      dragging = true;
      scroller.setPointerCapture(event.pointerId);
      scroller.classList.add('is-dragging');
    }
    const now = performance.now();
    const step = (event.clientX - lastX) / Math.max(1, now - lastTime);
    velocity = velocity * 0.7 + step * 0.3;
    lastX = event.clientX;
    lastTime = now;
    scroller.scrollLeft = startScroll - dx;
  };

  const onUp = (event: PointerEvent): void => {
    if (event.pointerId !== pointerId) return;
    pointerId = null;
    if (!dragging) return;
    scroller.classList.remove('is-dragging');
    if (reducedMotion()) return;
    // Momentum: px per ms, decaying the same way whatever the frame rate.
    let speed = -velocity;
    let previous = performance.now();
    const glide = (now: number): void => {
      const dt = Math.min(64, now - previous);
      previous = now;
      const before = scroller.scrollLeft;
      scroller.scrollLeft += speed * dt;
      speed *= 1 - damp(3.6, dt / 1000);
      if (Math.abs(speed) < 0.01 || scroller.scrollLeft === before) {
        frame = 0;
        return;
      }
      frame = requestAnimationFrame(glide);
    };
    frame = requestAnimationFrame(glide);
  };

  const onClick = (event: MouseEvent): void => {
    if (dragging) {
      event.preventDefault();
      event.stopPropagation();
      dragging = false;
    }
  };

  scroller.addEventListener('pointerdown', onDown);
  scroller.addEventListener('pointermove', onMove);
  scroller.addEventListener('pointerup', onUp);
  scroller.addEventListener('pointercancel', onUp);
  scroller.addEventListener('click', onClick, true);
  scroller.addEventListener('dragstart', (event) => event.preventDefault());
  return () => {
    stopMomentum();
    scroller.removeEventListener('pointerdown', onDown);
    scroller.removeEventListener('pointermove', onMove);
    scroller.removeEventListener('pointerup', onUp);
    scroller.removeEventListener('pointercancel', onUp);
    scroller.removeEventListener('click', onClick, true);
  };
}
