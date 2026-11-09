// Centered native touch slides; desktop retains the two-image draggable strip.
import Swiper from 'swiper';
import { A11y, Mousewheel, Navigation, Pagination } from 'swiper/modules';
import { gsap } from '@/scripts/core/gsap';
import { reducedMotion, type Cleanup } from '@/scripts/core/motion';

export function initDragScroll(scroller: HTMLElement): Cleanup {
  const media = gsap.matchMedia();
  media.add({ compact: '(max-width: 767px), (pointer: coarse)', desktop: '(min-width: 768px) and (pointer: fine)' }, (context) => {
    const compact = Boolean(context.conditions?.['compact']);
    const controls = scroller.parentElement ?? scroller;
    const slider = new Swiper(scroller, {
      modules: [A11y, Mousewheel, Navigation, Pagination],
      cssMode: compact,
      slidesPerView: compact ? 1 : 2,
      spaceBetween: compact ? 12 : 20,
      speed: reducedMotion() ? 0 : 420,
      grabCursor: true,
      a11y: { slideRole: 'listitem', prevSlideMessage: 'Previous image', nextSlideMessage: 'Next image' },
      mousewheel: { forceToAxis: true, releaseOnEdges: true },
      navigation: {
        prevEl: controls.querySelector<HTMLButtonElement>('[data-slide-prev]'),
        nextEl: controls.querySelector<HTMLButtonElement>('[data-slide-next]'),
      },
      pagination: { el: controls.querySelector<HTMLElement>('[data-slide-count]'), type: 'fraction' },
    });
    const onKey = (event: KeyboardEvent): void => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      if (event.key === 'ArrowRight') slider.slideNext();
      else slider.slidePrev();
    };
    scroller.addEventListener('keydown', onKey);
    return () => {
      scroller.removeEventListener('keydown', onKey);
      slider.destroy();
    };
  });
  return () => media.revert();
}
