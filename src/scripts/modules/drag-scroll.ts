// Two slides on desktop; a small next-slide preview makes touch swiping discoverable.
import Swiper from 'swiper';
import { A11y, Mousewheel } from 'swiper/modules';
import { reducedMotion, type Cleanup } from '@/scripts/core/motion';

export function initDragScroll(scroller: HTMLElement): Cleanup {
  const slider = new Swiper(scroller, {
    modules: [A11y, Mousewheel],
    slidesPerView: 1.1,
    spaceBetween: 12,
    speed: reducedMotion() ? 0 : 500,
    grabCursor: true,
    a11y: { slideRole: 'listitem' },
    mousewheel: { forceToAxis: true, releaseOnEdges: true },
    breakpoints: { 768: { slidesPerView: 2, spaceBetween: 20 } },
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
}
