import { filled, type Grid } from '@/lib/pixels';
import { smoothstep } from '@/lib/math';

const SIZE = 6;

/** Draws the 6 by 6 mark on a canvas, morphing between two grids. */
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

  /**
   * t runs from 0 to 1. Cells shared by both grids stay put; new cells grow from their
   * centre and old ones shrink, in a diagonal wave from the top left corner.
   */
  draw(from: Grid, to: Grid, t: number): void {
    const { context, cssSize } = this;
    const cell = cssSize / SIZE;
    context.clearRect(0, 0, cssSize, cssSize);
    context.fillStyle = '#fff';
    context.beginPath();
    for (let y = 0; y < SIZE; y += 1) {
      for (let x = 0; x < SIZE; x += 1) {
        const a = filled(from, x, y);
        const b = filled(to, x, y);
        if (!a && !b) continue;
        let scale = 1;
        if (a !== b) {
          const delay = ((x + y) / (2 * (SIZE - 1))) * 0.45;
          const local = smoothstep((t - delay) / 0.55);
          scale = b ? local : 1 - local;
        }
        if (scale <= 0.001) continue;
        const side = cell * scale;
        const left = x * cell + (cell - side) / 2;
        const top = y * cell + (cell - side) / 2;
        // Snap to whole pixels so neighbouring cells meet without hairline gaps.
        const l = Math.floor(left);
        const r = Math.ceil(left + side);
        const tp = Math.floor(top);
        const bt = Math.ceil(top + side);
        context.rect(l, tp, r - l, bt - tp);
      }
    }
    context.fill();
  }
}
