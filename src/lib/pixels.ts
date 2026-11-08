// Pixel artwork shared by the logo, the loader and the footer wordmark.
// Grids are strings: '#' is a filled cell, '.' is empty.

export type Grid = readonly string[];

/** Seven columns leave a clear V between the two upright stems of the M. */
export const monogram: Grid = ['#.....#', '##...##', '#.#.#.#', '#..#..#', '#.....#', '#.....#', '#.....#'];

/** Loader stages, from scattered cells to the monogram. Each step is one readable shape. */
export const loaderStages: readonly Grid[] = [
  ['.......', '.......', '..###..', '..###..', '..###..', '.......', '.......'],
  ['.......', '.#..#..', '.#####.', '.#####.', '...###.', '.......', '.......'],
  ['.......', '.#####.', '.#..##.', '.#...##', '...###.', '...##..', '.......'],
  ['#.....#', '##...##', '#.#.#.#', '#..#..#', '#....##', '#.....#', '#.....#'],
  monogram,
];

// 5 by 7 capitals for the footer wordmark. Only the glyphs the site uses are drawn.
const font: Record<string, Grid> = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  ' ': ['...', '...', '...', '...', '...', '...', '...'],
};

/** Lays out text in the pixel font. Returns rows of booleans, one column gap between glyphs. */
export function rasterize(text: string): boolean[][] {
  const glyphs = [...text.toUpperCase()].map((char) => {
    const glyph = font[char];
    if (!glyph) throw new Error(`No pixel glyph for "${char}"`);
    return glyph;
  });
  const rows: boolean[][] = Array.from({ length: 7 }, () => []);
  glyphs.forEach((glyph, index) => {
    for (let y = 0; y < 7; y += 1) {
      const row = rows[y];
      const line = glyph[y];
      if (!row || line === undefined) continue;
      for (const cell of line) row.push(cell === '#');
      if (index < glyphs.length - 1) row.push(false);
    }
  });
  return rows;
}

export function filled(grid: Grid, x: number, y: number): boolean {
  return grid[y]?.[x] === '#';
}
