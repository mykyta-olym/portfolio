// A full-bleed picture that shrinks into a framed card while the heading rises over it.
// The frame sticks with CSS; the scrubbed timeline only changes transforms and opacity, so
// it follows the scroll in both directions without moving the layout.
import { gsap, ScrollTrigger } from '@/scripts/core/gsap';
import { reducedMotion, type Cleanup } from '@/scripts/core/motion';

export function initShowcase(section: HTMLElement): Cleanup {
  const frame = section.querySelector<HTMLElement>('[data-showcase-frame]');
  const content = [...section.querySelectorAll<HTMLElement>('[data-showcase-content]')];
  if (!frame) return () => undefined;
  if (reducedMotion()) {
    section.classList.add('is-static');
    return () => undefined;
  }
  const media = gsap.matchMedia();
  media.add(
    { desktop: '(min-width: 1024px)', tablet: '(min-width: 768px) and (max-width: 1023.98px)', phone: '(max-width: 767.98px)' },
    (context) => {
      const { desktop, tablet } = context.conditions ?? {};
      const scale = desktop ? 0.6 : tablet ? 0.7 : 0.62;
      const timeline = gsap
        .timeline()
        .fromTo(frame, { scale: 1 }, { scale, ease: 'none' })
        .fromTo(content, { y: 90, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.3, ease: 'power2.out' });
      const trigger = ScrollTrigger.create({
        trigger: section,
        animation: timeline,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
      });
      return () => {
        trigger.kill();
        timeline.kill();
      };
    },
  );
  return () => media.revert();
}
