import { filled, monogram, type Grid } from '@/lib/pixels';
import { smoothstep } from '@/lib/math';

const SIZE = monogram.length;

/** Draws the shared mark on a canvas, morphing between two grids. */
export class PixelMark {
  private readonly context: CanvasRenderingContext2D;
  private readonly cssSize: number;

  constructor(canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d');
    if (!context) throw new Error('2D canvas is not available');
    this.context = context;
    this.cssSize = canvas.clientWidth || 54;
    const ratio = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = Math.round(this.cssSize * ratio);
    canvas.height = Math.round(this.cssSize * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  /** Source grid morph: shared cells stay fixed; changing cells extend from a neighbour. */
  draw(from: Grid, to: Grid, t: number): void {
    const { context, cssSize } = this;
    const cell = cssSize / SIZE;
    context.clearRect(0, 0, cssSize, cssSize);
    context.fillStyle = '#fff';
    context.beginPath();
    const p = smoothstep(t);
    for (let y = 0; y < SIZE; y += 1) {
      for (let x = 0; x < SIZE; x += 1) {
        const a = filled(from, x, y);
        const b = filled(to, x, y);
        if (!a && !b) continue;
        const scale = a === b ? 1 : b ? p : 1 - p;
        if (scale <= 0.001) continue;
        const side = cell * scale;
        let left = x * cell;
        let top = y * cell;
        let width = cell;
        let height = cell;
        if (a !== b) {
          const directions = [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
          ] as const;
          let direction = -1;
          for (const grid of [b ? from : to, b ? to : from]) {
            direction = directions.findIndex(([dx, dy]) => filled(grid, x + dx, y + dy));
            if (direction >= 0) break;
          }
          if (direction < 2 && direction >= 0) {
            width = side;
            if (direction === 1) left += cell - side;
          } else if (direction >= 2) {
            height = side;
            if (direction === 3) top += cell - side;
          } else {
            width = height = side;
            left += (cell - side) / 2;
            top += (cell - side) / 2;
          }
        }
        // Snap to whole pixels so neighbouring cells meet without hairline gaps.
        const l = Math.floor(left);
        const r = Math.ceil(left + width);
        const tp = Math.floor(top);
        const bt = Math.ceil(top + height);
        context.rect(l, tp, r - l, bt - tp);
      }
    }
    context.fill();
  }
}
