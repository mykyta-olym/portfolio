import { gsap } from '@/scripts/core/gsap';
import { reducedMotion, type Cleanup } from '@/scripts/core/motion';

/** A restrained camera move through the ready-made photograph, tied to scroll. */
export function initCaseHero(section: HTMLElement): Cleanup {
  const image = section.querySelector<HTMLElement>('[data-case-background]');
  if (!image || reducedMotion()) return () => undefined;
  const tween = gsap.fromTo(
    image,
    { yPercent: -3, scale: 1.04 },
    {
      yPercent: 6,
      scale: 1.1,
      ease: 'none',
      scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: true },
    },
  );
  return () => {
    tween.scrollTrigger?.kill();
    tween.kill();
  };
}
