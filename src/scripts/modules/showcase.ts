// A full-bleed picture that shrinks into a framed card while the heading rises over it.
// Pinned and scrubbed, so it follows the scroll in both directions.
import { gsap, ScrollTrigger } from '@/scripts/core/gsap';
import { reducedMotion, type Cleanup } from '@/scripts/core/motion';

export function initShowcase(wrapper: HTMLElement): Cleanup {
  const frame = wrapper.querySelector<HTMLElement>('[data-showcase-frame]');
  const content = [...wrapper.querySelectorAll<HTMLElement>('[data-showcase-content]')];
  if (!frame) return () => undefined;
  if (reducedMotion()) {
    wrapper.classList.add('is-static');
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
        trigger: wrapper,
        animation: timeline,
        pin: true,
        start: 'center center',
        end: 'bottom top',
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
