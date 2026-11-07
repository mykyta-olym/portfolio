// Scroll-linked contrast: words brighten in reading order without moving the text's baseline.
import { clamp, easeOutCubic } from '@/lib/math';
import { fontsReady, reducedMotion, type Cleanup } from '@/scripts/core/motion';
import { splitWords } from './split';

interface Group {
  element: HTMLElement;
  words: HTMLElement[];
  restore(): void;
}

const WINDOW = 0.45;

export async function initScrollRise(scope: ParentNode = document): Promise<Cleanup> {
  const elements = [...scope.querySelectorAll<HTMLElement>('[data-scroll-rise]')];
  if (elements.length === 0 || reducedMotion()) return () => undefined;
  await fontsReady();

  const groups: Group[] = elements.map((element) => {
    const { words, restore } = splitWords(element, 'rise-word', 'rise-inner');
    element.classList.add('is-rising');
    return { element, words, restore };
  });

  const update = (): void => {
    const vh = window.innerHeight;
    for (const group of groups) {
      const top = group.element.getBoundingClientRect().top;
      const progress = clamp((vh * 0.85 - top) / (vh * 0.55));
      const step = (1 - WINDOW) / Math.max(1, group.words.length - 1);
      group.words.forEach((word, index) => {
        const eased = easeOutCubic((progress - index * step) / WINDOW);
        word.style.setProperty('--rise-a', (0.45 + eased * 0.55).toFixed(3));
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
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    for (const group of groups) {
      group.restore();
      group.element.classList.remove('is-rising');
    }
  };
}
