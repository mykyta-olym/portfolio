// Footer wordmark: the name set in a pixel font and drawn as a field of small squares. Near
// the pointer the squares ripple and tear sideways. Only animates while the pointer is near.
import { rasterize } from '@/lib/pixels';
import { damp } from '@/lib/math';
import { coarsePointer, reducedMotion, type Cleanup } from '@/scripts/core/motion';

function stackLines(lines: readonly string[]): boolean[][] {
  const blocks = lines.map((line) => rasterize(line));
  const widest = Math.max(...blocks.map((block) => block[0]?.length ?? 0));
  const out: boolean[][] = [];
  blocks.forEach((block, index) => {
    if (index > 0) for (let gap = 0; gap < 2; gap += 1) out.push(new Array<boolean>(widest).fill(false));
    for (const row of block) {
      const pad = widest - row.length;
      const left = Math.floor(pad / 2);
      out.push([...new Array<boolean>(left).fill(false), ...row, ...new Array<boolean>(pad - left).fill(false)]);
    }
  });
  return out;
}

interface Dot {
  x: number;
  y: number;
  seed: number;
}

export function initPixelWordmark(wrapper: HTMLElement): Cleanup {
  const canvas = wrapper.querySelector<HTMLCanvasElement>('canvas');
  const context = canvas?.getContext('2d');
  if (!canvas || !context) return () => undefined;
  const text = wrapper.dataset['text'] ?? 'MYKYTA OLYM';
  const reduce = reducedMotion();
  let grid: boolean[][] = [];
  let columns = 1;
  let rows = 1;
  const interactive = !reduce && !coarsePointer();

  let width = 0;
  let height = 0;
  let cell = 0;
  let dots: Dot[] = [];
  const pointer = { x: 0, y: 0, tx: 0, ty: 0, strength: 0, target: 0 };

  // Each pixel of a glyph is drawn as a 3 by 3 block of dots, which gives the dotted texture.
  const SUB = 3;
  const PAD_X = 4;
  const PAD_Y = 1;
  const layout = (): void => {
    // On narrow screens the name breaks onto two lines so each glyph stays legible.
    grid = stackLines(window.matchMedia('(max-width: 639px)').matches ? text.split(' ') : [text]);
    columns = grid[0]?.length ?? 1;
    rows = grid.length;
    width = canvas.clientWidth;
    cell = width / ((columns + PAD_X * 2) * SUB);
    height = cell * (rows + PAD_Y * 2) * SUB;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    dots = [];
    grid.forEach((row, gy) =>
      row.forEach((on, gx) => {
        if (!on) return;
        for (let sy = 0; sy < SUB; sy += 1)
          for (let sx = 0; sx < SUB; sx += 1) {
            const s = Math.sin((gx * SUB + sx) * 12.9898 + (gy * SUB + sy) * 78.233) * 43758.5453;
            dots.push({
              x: ((gx + PAD_X) * SUB + sx + 0.5) * cell,
              y: ((gy + PAD_Y) * SUB + sy + 0.5) * cell,
              seed: s - Math.floor(s),
            });
          }
      }),
    );
  };

  let previous = 0;
  const draw = (now: number): void => {
    const dt = previous ? Math.min(0.064, (now - previous) / 1000) : 1 / 60;
    previous = now;
    context.clearRect(0, 0, width, height);
    pointer.x += (pointer.tx - pointer.x) * damp(12, dt);
    pointer.y += (pointer.ty - pointer.y) * damp(12, dt);
    pointer.strength += (pointer.target - pointer.strength) * damp(8, dt);
    const size = Math.max(1.5, cell * 0.62);
    const radius = Math.max(90, width * 0.12);
    const force = Math.max(10, width * 0.022) * pointer.strength;
    context.fillStyle = '#fff';
    for (const dot of dots) {
      let x = dot.x;
      let y = dot.y;
      let alpha = 1;
      if (pointer.strength > 0.01) {
        const distance = Math.hypot(dot.x - pointer.x, dot.y - pointer.y);
        if (distance < radius) {
          const near = 1 - distance / radius;
          x += Math.sin(distance * 0.085 - now * 0.014 + dot.seed * 6) * force * near;
          y += Math.cos(distance * 0.06 - now * 0.011 + dot.seed * 5) * force * 0.3 * near;
          const band = Math.abs(Math.sin(Math.floor(dot.y / (cell * 2)) * 4.1 + now * 0.009));
          if (band > 0.74) x += (band - 0.74) * force * 4 * near;
          if (dot.seed > 0.9 && near > 0.35) alpha = 0.25 + dot.seed * 0.4;
        }
      }
      context.globalAlpha = alpha;
      context.fillRect(Math.round(x - size / 2), Math.round(y - size / 2), size, size);
    }
    context.globalAlpha = 1;
  };

  let visible = false;
  let frame = 0;
  const loop = (now: number): void => {
    draw(now);
    frame = pointer.target > 0 || pointer.strength > 0.001 ? requestAnimationFrame(loop) : 0;
  };
  const start = (): void => {
    if (!frame && visible && interactive && (pointer.target > 0 || pointer.strength > 0.001)) {
      previous = 0;
      frame = requestAnimationFrame(loop);
    }
  };
  const stop = (): void => {
    cancelAnimationFrame(frame);
    frame = 0;
  };

  layout();
  draw(0);
  wrapper.classList.add('is-ready');

  // Pointer events start the effect only once the page uncovers it. Observe the canvas
  // itself so a footer taller than a landscape viewport can still respond while scrolling.
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false;
    if (visible && !document.hidden) start();
    else stop();
  });
  observer.observe(canvas);

  const onEnter = (event: PointerEvent): void => {
    const rect = canvas.getBoundingClientRect();
    pointer.tx = pointer.x = event.clientX - rect.left;
    pointer.ty = pointer.y = event.clientY - rect.top;
    pointer.target = 1;
    start();
  };
  const onMove = (event: PointerEvent): void => {
    const rect = canvas.getBoundingClientRect();
    pointer.tx = event.clientX - rect.left;
    pointer.ty = event.clientY - rect.top;
    start();
  };
  const onLeave = (): void => {
    pointer.target = 0;
  };
  const onVisibility = (): void => (document.hidden ? stop() : start());
  let resizeTimer = 0;
  const onResize = (): void => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      layout();
      draw(performance.now());
    }, 150);
  };

  if (interactive) {
    wrapper.addEventListener('pointerenter', onEnter);
    wrapper.addEventListener('pointermove', onMove);
    wrapper.addEventListener('pointerleave', onLeave);
  }
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('resize', onResize);
  return () => {
    stop();
    window.clearTimeout(resizeTimer);
    observer.disconnect();
    wrapper.removeEventListener('pointerenter', onEnter);
    wrapper.removeEventListener('pointermove', onMove);
    wrapper.removeEventListener('pointerleave', onLeave);
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('resize', onResize);
  };
}
