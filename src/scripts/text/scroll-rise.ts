// The reference's scroll rise: measured text rows share a 1.15em rise and cubic fade.
import { clamp, easeOutCubic } from '@/lib/math';
import { fontsReady, reducedMotion, type Cleanup } from '@/scripts/core/motion';
import { lineIndices, splitWords } from './split';

interface Group {
  element: HTMLElement;
  words: HTMLElement[];
  rows: number[];
  restore(): void;
}

const WINDOW = 0.68;

export async function initScrollRise(scope: ParentNode = document): Promise<Cleanup> {
  const elements = [...scope.querySelectorAll<HTMLElement>('[data-scroll-rise]')];
  if (elements.length === 0 || reducedMotion()) return () => undefined;
  await fontsReady();

  const groups: Group[] = elements.map((element) => {
    const { words, restore } = splitWords(element, 'rise-word', 'rise-inner');
    words.forEach((word, i) => {
      if (!word.hasAttribute('data-inline-pic')) return;
      const outer = document.createElement('span');
      const inner = document.createElement('span');
      outer.className = 'rise-word';
      inner.className = 'rise-inner';
      word.replaceWith(outer);
      outer.append(inner);
      inner.append(word);
      words[i] = outer;
    });
    element.classList.add('is-rising');
    return { element, words, rows: lineIndices(words), restore };
  });

  const update = (): void => {
    const vh = window.innerHeight;
    for (const group of groups) {
      const top = group.element.getBoundingClientRect().top;
      const progress = clamp((vh * 0.85 - top) / (vh * 0.55));
      const count = Math.max(...group.rows) + 1;
      const step = (1 - WINDOW) / Math.max(1, count - 1);
      group.words.forEach((word, index) => {
        const eased = easeOutCubic((progress - (group.rows[index] ?? 0) * step) / WINDOW);
        word.style.setProperty('--rise-y', `${((1 - eased) * 1.15).toFixed(3)}em`);
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
  update();
  const refresh = (): void => {
    groups.forEach((group) => {
      group.rows = lineIndices(group.words);
    });
    schedule();
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', refresh);
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', refresh);
    for (const group of groups) {
      group.restore();
      group.element.classList.remove('is-rising');
    }
  };
}
