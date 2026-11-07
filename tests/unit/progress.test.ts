import { describe, expect, it } from 'vitest';
import { displayPercent, LoadProgress, stageFor } from '@/scripts/loader/progress';

describe('LoadProgress', () => {
  it('weights tasks and reports partial progress', () => {
    const progress = new LoadProgress().add('fonts', 1).add('video', 3);
    progress.report('video', 0.5);
    expect(progress.value).toBeCloseTo(1.5 / 4);
    progress.settle('fonts');
    expect(progress.value).toBeCloseTo(2.5 / 4);
    expect(progress.complete).toBe(false);
  });

  it('never moves backwards and ignores reports after settling', () => {
    const progress = new LoadProgress().add('video', 1);
    progress.report('video', 0.8);
    progress.report('video', 0.3);
    expect(progress.value).toBeCloseTo(0.8);
    progress.settle('video');
    progress.report('video', 0.1);
    expect(progress.value).toBe(1);
    expect(progress.complete).toBe(true);
  });

  it('settles a failed task so it cannot block completion', () => {
    const progress = new LoadProgress().add('poster', 1).add('video', 4);
    progress.settle('poster');
    progress.settle('video');
    expect(progress.complete).toBe(true);
    expect(displayPercent(progress)).toBe(100);
  });

  it('keeps the counter below 100 until every task has settled', () => {
    const progress = new LoadProgress().add('a', 1).add('b', 1);
    progress.report('a', 1);
    progress.report('b', 0.9999);
    expect(displayPercent(progress)).toBe(99);
    progress.settle('a');
    progress.settle('b');
    expect(displayPercent(progress)).toBe(100);
  });

  it('rejects a weight that is not positive', () => {
    expect(() => new LoadProgress().add('x', 0)).toThrow();
  });
});

describe('stageFor', () => {
  it('holds the final stage back until loading is complete', () => {
    expect(stageFor(0, 5, false)).toBe(0);
    expect(stageFor(0.5, 5, false)).toBe(2);
    expect(stageFor(0.999, 5, false)).toBe(3);
    expect(stageFor(1, 5, false)).toBe(3);
    expect(stageFor(1, 5, true)).toBe(4);
  });
});
