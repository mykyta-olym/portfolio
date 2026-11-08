import { describe, expect, it } from 'vitest';
import { filled, loaderStages, monogram, rasterize } from '@/lib/pixels';
import { activeIndex } from '@/scripts/modules/disciplines';
import { clamp, damp, easeOutCubic } from '@/lib/math';

describe('pixel artwork', () => {
  it('draws the monogram and every loader stage on the same square grid', () => {
    for (const grid of [monogram, ...loaderStages]) {
      expect(grid).toHaveLength(monogram.length);
      for (const row of grid) expect(row).toMatch(new RegExp(`^[.#]{${monogram.length}}$`));
    }
    expect(loaderStages.at(-1)).toBe(monogram);
    expect(filled(monogram, 0, 0)).toBe(true);
    expect(filled(monogram, 2, 0)).toBe(false);
    expect(filled(monogram, 9, 9)).toBe(false);
  });

  it('sets the name in the 5 by 7 font with one column between glyphs', () => {
    const rows = rasterize('OLYM');
    expect(rows).toHaveLength(7);
    expect(rows[0]).toHaveLength(4 * 5 + 3);
    expect(rasterize('MYKYTA OLYM')[0]).toHaveLength(10 * 5 + 3 + 10);
  });

  it('refuses characters it has no glyph for', () => {
    expect(() => rasterize('Q')).toThrow(/No pixel glyph/);
  });
});

describe('helpers', () => {
  it('maps scroll progress to the active discipline', () => {
    expect(activeIndex(0, 4)).toBe(0);
    expect(activeIndex(0.26, 4)).toBe(1);
    expect(activeIndex(0.99, 4)).toBe(3);
    expect(activeIndex(1, 4)).toBe(3);
    expect(activeIndex(-0.2, 4)).toBe(0);
  });

  it('clamps, eases and damps', () => {
    expect(clamp(2)).toBe(1);
    expect(clamp(-1)).toBe(0);
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    // Damping over one 1/30 s step equals two 1/60 s steps: frame-rate independent.
    const one = damp(10, 1 / 30);
    const two = 1 - (1 - damp(10, 1 / 60)) ** 2;
    expect(one).toBeCloseTo(two, 10);
  });
});
