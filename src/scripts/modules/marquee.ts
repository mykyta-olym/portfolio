import Swiper from 'swiper';
import { Autoplay } from 'swiper/modules';
import { reducedMotion, type Cleanup } from '@/scripts/core/motion';

export function initMarquee(element: HTMLElement): Cleanup {
  const reduce = reducedMotion();
  const slider = new Swiper(element, {
    modules: [Autoplay],
    slidesPerView: 3,
    spaceBetween: 14,
    loop: true,
    speed: reduce ? 0 : 5000,
    grabCursor: true,
    autoplay: reduce ? false : { delay: 0, disableOnInteraction: false },
    breakpoints: { 768: { slidesPerView: 4, spaceBetween: 70 }, 1024: { slidesPerView: 6, spaceBetween: 100 } },
  });
  const observer = new IntersectionObserver(([entry]) => {
    if (entry?.isIntersecting && !reduce) slider.autoplay.start();
    else slider.autoplay.stop();
  });
  observer.observe(element);
  return () => {
    observer.disconnect();
    slider.destroy();
  };
}
