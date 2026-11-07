import { describe, expect, it } from 'vitest';
import { nextStep, timing, type TypeState } from '@/scripts/modules/typewriter';

function run(words: string[], steps: number): { states: TypeState[]; waits: number[] } {
  let state: TypeState = { index: 0, shown: '', phase: 'typing' };
  const states: TypeState[] = [];
  const waits: number[] = [];
  for (let i = 0; i < steps; i += 1) {
    const step = nextStep(state, words);
    state = step.state;
    states.push(state);
    waits.push(step.wait);
    if (!Number.isFinite(step.wait)) break;
  }
  return { states, waits };
}

describe('typewriter', () => {
  it('types, holds, erases and moves to the next word', () => {
    const { states, waits } = run(['ab', 'c'], 12);
    expect(states.map((s) => s.shown)).toEqual(['a', 'ab', 'ab', 'ab', 'a', '', '', 'c', 'c', 'c', '', '']);
    expect(waits[0]).toBe(timing.type);
    expect(waits[2]).toBe(timing.hold);
    expect(waits[6]).toBe(timing.pause);
    expect(states[7]?.index).toBe(1);
    expect(states.at(-1)?.index).toBe(0);
  });

  it('types a single phrase once and then stops', () => {
    const { states, waits } = run(['ok'], 10);
    expect(states.at(-1)).toEqual({ index: 0, shown: 'ok', phase: 'holding' });
    expect(waits.at(-1)).toBe(Infinity);
  });
});
