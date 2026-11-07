// The typed phrase in the navigation pill. A pure step function decides what to show next,
// so the timing can be tested without a browser; the DOM part only applies the steps.
import { reducedMotion, type Cleanup } from '@/scripts/core/motion';
import { whenStageReady } from '@/scripts/core/stage';

export const timing = { hold: 3000, erase: 55, type: 70, pause: 180 } as const;

export interface TypeState {
  index: number;
  shown: string;
  phase: 'typing' | 'holding' | 'erasing';
}

/** Returns the next state and how long to wait before applying it. */
export function nextStep(state: TypeState, words: readonly string[]): { state: TypeState; wait: number } {
  const word = words[state.index] ?? '';
  if (state.phase === 'typing') {
    if (state.shown.length < word.length) {
      return { state: { ...state, shown: word.slice(0, state.shown.length + 1) }, wait: timing.type };
    }
    // A single phrase is typed once and then stays.
    if (words.length < 2) return { state: { ...state, phase: 'holding' }, wait: Infinity };
    return { state: { ...state, phase: 'holding' }, wait: timing.hold };
  }
  if (state.phase === 'holding') return { state: { ...state, phase: 'erasing' }, wait: timing.erase };
  if (state.shown.length > 0) return { state: { ...state, shown: state.shown.slice(0, -1) }, wait: timing.erase };
  return { state: { index: (state.index + 1) % words.length, shown: '', phase: 'typing' }, wait: timing.pause };
}

export function initTypewriter(element: HTMLElement): Cleanup {
  const output = element.querySelector<HTMLElement>('[data-typewriter-text]');
  const words = JSON.parse(element.dataset['words'] ?? '[]') as string[];
  if (!output || words.length === 0) return () => undefined;
  if (reducedMotion()) {
    output.textContent = words[0] ?? '';
    return () => undefined;
  }

  let state: TypeState = { index: 0, shown: '', phase: 'typing' };
  let timer = 0;
  let stopped = false;
  output.textContent = '';
  const run = (): void => {
    if (stopped) return;
    const step = nextStep(state, words);
    state = step.state;
    output.textContent = state.shown;
    element.classList.toggle('is-typing', state.phase !== 'holding');
    if (Number.isFinite(step.wait)) timer = window.setTimeout(run, step.wait);
  };
  void whenStageReady().then(() => {
    timer = window.setTimeout(run, 400);
  });
  return () => {
    stopped = true;
    window.clearTimeout(timer);
  };
}
