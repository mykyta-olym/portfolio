// Statement paragraphs whose lines rise and brighten with the scroll position. The motion is
// tied to scrolling, so it reverses when scrolling back, and every line uses the same curve.
import { clamp, easeOutCubic } from '@/lib/math';
import { fontsReady, reducedMotion, type Cleanup } from '@/scripts/core/motion';
import { lineIndices, splitWords } from './split';

interface Group {
  element: HTMLElement;
  words: HTMLElement[];
  rows: number[];
  lineCount: number;
}

const WINDOW = 0.68;

export async function initScrollRise(scope: ParentNode = document): Promise<Cleanup> {
  const elements = [...scope.querySelectorAll<HTMLElement>('[data-scroll-rise]')];
  if (elements.length === 0 || reducedMotion()) return () => undefined;
  await fontsReady();

  const groups: Group[] = elements.map((element) => {
    const { words } = splitWords(element, 'rise-word', 'rise-inner');
    element.classList.add('is-rising');
    return { element, words, rows: [], lineCount: 1 };
  });

  const measure = (): void => {
    for (const group of groups) {
      group.rows = lineIndices(group.words);
      group.lineCount = Math.max(1, ...group.rows.map((row) => row + 1));
    }
  };

  const update = (): void => {
    const vh = window.innerHeight;
    for (const group of groups) {
      const top = group.element.getBoundingClientRect().top;
      const progress = clamp((vh * 0.88 - top) / (vh * 0.58));
      const step = group.lineCount > 1 ? (1 - WINDOW) / (group.lineCount - 1) : 0;
      group.words.forEach((word, index) => {
        const row = group.rows[index] ?? 0;
        const eased = easeOutCubic((progress - row * step) / WINDOW);
        word.style.setProperty('--rise-y', `${((1 - eased) * 1.1).toFixed(3)}em`);
        word.style.setProperty('--rise-a', Math.min(1, eased * 1.5).toFixed(3));
      });
    }
  };

  let frame = 0;
  const schedule = (): void => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      update();
    });
  };
  const refresh = (): void => {
    measure();
    schedule();
  };

  refresh();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', refresh);
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', refresh);
  };
}
