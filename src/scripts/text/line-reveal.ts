// Headings and short texts rise into view line by line, once, when they first enter the
// viewport and the page is on stage. The split lines stay in place after the motion (so the
// finished text is not painted a second time); the original markup comes back on the first
// width change, so the text wraps naturally again.
import { gsap } from '@/scripts/core/gsap';
import { fontsReady, reducedMotion, type Cleanup } from '@/scripts/core/motion';
import { whenStageReady } from '@/scripts/core/stage';
import { splitLines } from './split';

interface Pending {
  element: HTMLElement;
  restore: () => void;
  lines: HTMLElement[];
}

export async function initLineReveals(scope: ParentNode = document): Promise<Cleanup> {
  const elements = [...scope.querySelectorAll<HTMLElement>('[data-reveal="lines"]')];
  if (elements.length === 0) return () => undefined;
  if (reducedMotion()) {
    for (const element of elements) element.classList.add('is-done');
    return () => undefined;
  }
  await fontsReady();
  const pending = new Map<HTMLElement, Pending>();
  const finished = new Map<HTMLElement, () => void>();

  const prepare = (element: HTMLElement): void => {
    pending.get(element)?.restore();
    const { lines, restore } = splitLines(element);
    gsap.set(lines, { yPercent: 125 });
    element.classList.add('is-split');
    pending.set(element, { element, lines, restore });
  };
  elements.forEach(prepare);

  const play = (element: HTMLElement): void => {
    const entry = pending.get(element);
    if (!entry) return;
    pending.delete(element);
    const delay = Number(element.dataset['revealDelay'] ?? 0);
    gsap.to(entry.lines, {
      yPercent: 0,
      duration: 1.5,
      ease: 'rise',
      delay,
      stagger: 0.07,
      onComplete: () => {
        element.classList.add('is-done');
        finished.set(element, entry.restore);
      },
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        const element = entry.target as HTMLElement;
        void whenStageReady().then(() => play(element));
      }
    },
    { rootMargin: '0px 0px 12% 0px' },
  );
  elements.forEach((element) => observer.observe(element));

  // Line breaks change with the width; re-split anything that has not played yet.
  let timer = 0;
  let lastWidth = window.innerWidth;
  const onResize = (): void => {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      for (const element of [...pending.keys()]) prepare(element);
      for (const [element, restore] of finished) {
        restore();
        element.classList.remove('is-split');
      }
      finished.clear();
    }, 150);
  };
  window.addEventListener('resize', onResize);

  return () => {
    observer.disconnect();
    window.removeEventListener('resize', onResize);
    for (const entry of pending.values()) entry.restore();
    for (const restore of finished.values()) restore();
  };
}

/** Elements that fade up once visible, for blocks that are not plain text. */
export function initFadeReveals(scope: ParentNode = document): Cleanup {
  const elements = [...scope.querySelectorAll<HTMLElement>('[data-reveal="fade"]')];
  if (reducedMotion()) {
    elements.forEach((element) => element.classList.add('is-done'));
    return () => undefined;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        const element = entry.target as HTMLElement;
        const delay = Number(element.dataset['revealDelay'] ?? 0) * 1000;
        void whenStageReady().then(() => window.setTimeout(() => element.classList.add('is-done'), delay));
      }
    },
    { rootMargin: '0px 0px -6% 0px' },
  );
  elements.forEach((element) => observer.observe(element));
  return () => observer.disconnect();
}
