// The footer sits under the page like a curtain. Its rows rise into place while the page
// slides off it, tied to the scroll so the motion reverses when the reader scrolls back.
import { gsap, ScrollTrigger } from '@/scripts/core/gsap';
import { reducedMotion, type Cleanup } from '@/scripts/core/motion';

export function initFooterReveal(footer: HTMLElement): Cleanup {
  const sentinel = document.querySelector<HTMLElement>('[data-footer-sentinel]');
  const parts = [...footer.querySelectorAll<HTMLElement>('.footer__mark, .footer__grid > *, .footer__bottom')];
  if (reducedMotion() || !sentinel || parts.length === 0) return () => undefined;
  const tween = gsap.fromTo(
    parts,
    { y: 48, opacity: 0.15 },
    {
      y: 0,
      opacity: 1,
      ease: 'none',
      stagger: 0.12,
      scrollTrigger: {
        trigger: sentinel,
        start: 'top bottom',
        // Finish exactly when the footer is fully uncovered, even on a short final scroll.
        end: (self) => Math.min(self.start + footer.offsetHeight * 0.85, ScrollTrigger.maxScroll(window)),
        scrub: 0.12,
        invalidateOnRefresh: true,
      },
    },
  );
  return () => {
    tween.scrollTrigger?.kill();
    tween.kill();
    gsap.set(parts, { clearProps: 'transform,opacity' });
  };
}
