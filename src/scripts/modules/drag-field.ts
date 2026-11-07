// The about page hero: an endless field of tiles that can be dragged in any direction with
// momentum. While it moves fast the tiles tilt toward the motion and the title blurs. Plain
// DOM and CSS transforms, no WebGL, so it stays light on integrated graphics.
import { damp } from '@/lib/math';
import { coarsePointer, reducedMotion, type Cleanup } from '@/scripts/core/motion';

interface Tile {
  element: HTMLElement;
  baseX: number;
  baseY: number;
}

export function initDragField(field: HTMLElement): Cleanup {
  const tiles: Tile[] = [...field.querySelectorAll<HTMLElement>('[data-field-tile]')].map((element) => ({
    element,
    baseX: Number(element.dataset['x'] ?? 0),
    baseY: Number(element.dataset['y'] ?? 0),
  }));
  const title = field.querySelector<HTMLElement>('[data-field-title]');
  if (tiles.length === 0) return () => undefined;
  const reduce = reducedMotion();
  const touch = coarsePointer();

  // Tiles sit on a grid of cells; the whole pattern repeats every `span` pixels.
  let cellW = 0;
  let cellH = 0;
  let spanX = 0;
  let spanY = 0;
  const columns = Math.max(...tiles.map((t) => t.baseX)) + 1;
  const rows = Math.max(...tiles.map((t) => t.baseY)) + 1;
  const measure = (): void => {
    const width = field.clientWidth;
    cellW = Math.max(220, width / (width < 768 ? 2.1 : 4.2));
    cellH = cellW * 0.82;
    spanX = cellW * columns;
    spanY = cellH * rows;
  };
  measure();

  let offsetX = 0;
  let offsetY = 0;
  let targetX = 0;
  let targetY = 0;
  let velocityX = 0;
  let velocityY = 0;
  let pointer: number | null = null;
  let lastX = 0;
  let lastY = 0;
  let lastTime = 0;
  let previous = performance.now();
  let frame = 0;
  let visible = true;

  const wrap = (value: number, span: number): number => ((value % span) + span) % span;

  const render = (now: number): void => {
    const dt = Math.min(0.064, (now - previous) / 1000);
    previous = now;
    if (pointer === null && !reduce) {
      targetX += velocityX * dt;
      targetY += velocityY * dt;
      const decay = 1 - damp(3.2, dt);
      velocityX *= decay;
      velocityY *= decay;
    }
    const follow = reduce ? 1 : damp(14, dt);
    offsetX += (targetX - offsetX) * follow;
    offsetY += (targetY - offsetY) * follow;
    const speed = Math.hypot(targetX - offsetX, targetY - offsetY) + Math.hypot(velocityX, velocityY) * 0.02;
    const tiltX = Math.max(-14, Math.min(14, -(targetY - offsetY) * 0.12));
    const tiltY = Math.max(-14, Math.min(14, (targetX - offsetX) * 0.12));
    const width = field.clientWidth;
    const height = field.clientHeight;
    for (const tile of tiles) {
      const x = wrap(tile.baseX * cellW + offsetX + cellW * 0.5, spanX) - cellW * 0.5 - (spanX - width) / 2;
      const y = wrap(tile.baseY * cellH + offsetY + cellH * 0.5, spanY) - cellH * 0.5 - (spanY - height) / 2;
      tile.element.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`;
    }
    if (title) title.style.setProperty('--field-blur', `${Math.min(14, speed * 0.25).toFixed(2)}px`);
    const moving = pointer !== null || speed > 0.05;
    frame = visible && moving ? requestAnimationFrame(render) : 0;
  };

  const kick = (): void => {
    if (!frame && visible) {
      previous = performance.now();
      frame = requestAnimationFrame(render);
    }
  };

  const onDown = (event: PointerEvent): void => {
    if (event.button !== 0) return;
    pointer = event.pointerId;
    lastX = event.clientX;
    lastY = event.clientY;
    lastTime = event.timeStamp;
    velocityX = 0;
    velocityY = 0;
    field.setPointerCapture(event.pointerId);
    field.classList.add('is-dragging');
    kick();
  };
  const onMove = (event: PointerEvent): void => {
    if (event.pointerId !== pointer) return;
    const dx = event.clientX - lastX;
    // On touch screens only horizontal dragging moves the field; vertical swipes scroll the page.
    const dy = touch ? 0 : event.clientY - lastY;
    const dt = Math.max(0.008, (event.timeStamp - lastTime) / 1000);
    lastX = event.clientX;
    lastY = event.clientY;
    lastTime = event.timeStamp;
    targetX += dx;
    targetY += dy;
    velocityX = velocityX * 0.6 + (dx / dt) * 0.4;
    velocityY = velocityY * 0.6 + (dy / dt) * 0.4;
  };
  const onUp = (event: PointerEvent): void => {
    if (event.pointerId !== pointer) return;
    pointer = null;
    field.classList.remove('is-dragging');
    kick();
  };

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? true;
    if (visible) kick();
  });
  observer.observe(field);

  let resizeTimer = 0;
  const onResize = (): void => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      measure();
      kick();
      requestAnimationFrame(render);
    }, 120);
  };

  field.addEventListener('pointerdown', onDown);
  field.addEventListener('pointermove', onMove);
  field.addEventListener('pointerup', onUp);
  field.addEventListener('pointercancel', onUp);
  window.addEventListener('resize', onResize);
  requestAnimationFrame(render);
  field.classList.add('is-ready');

  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    field.removeEventListener('pointerdown', onDown);
    field.removeEventListener('pointermove', onMove);
    field.removeEventListener('pointerup', onUp);
    field.removeEventListener('pointercancel', onUp);
    window.removeEventListener('resize', onResize);
  };
}
