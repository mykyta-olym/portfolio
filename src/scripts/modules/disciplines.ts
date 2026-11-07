// "What I do": the section is tall and its content sticks to the viewport. Scroll progress
// through the section picks the active line, which brightens and swaps the picture.
import { ScrollTrigger } from '@/scripts/core/gsap';
import type { Cleanup } from '@/scripts/core/motion';

export function activeIndex(progress: number, count: number): number {
  return Math.min(count - 1, Math.max(0, Math.floor(progress * count)));
}

export function initDisciplines(section: HTMLElement): Cleanup {
  const items = [...section.querySelectorAll<HTMLElement>('[data-discipline-item]')];
  const images = [...section.querySelectorAll<HTMLElement>('[data-discipline-image]')];
  if (items.length === 0) return () => undefined;
  let current = -1;
  const select = (index: number): void => {
    if (index === current) return;
    current = index;
    items.forEach((item, i) => item.classList.toggle('is-active', i === index));
    images.forEach((image, i) => image.classList.toggle('is-active', i === index));
  };
  select(0);
  const trigger = ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => select(activeIndex(self.progress, items.length)),
  });
  return () => trigger.kill();
}
