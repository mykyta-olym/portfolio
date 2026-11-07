// Entry point for every page. Shared behaviour starts here; section behaviour is declared in
// the markup with data-module and loaded on demand, so a page only downloads what it uses.
import type { Cleanup } from '@/scripts/core/motion';
import { startPreloader } from '@/scripts/loader/preloader';
import { initPageTransitions } from '@/scripts/modules/page-transition';
import { initAwayTitle } from '@/scripts/modules/page-details';
import { initFadeReveals, initLineReveals } from '@/scripts/text/line-reveal';
import { initScramble } from '@/scripts/text/scramble';
import { initScrollRise } from '@/scripts/text/scroll-rise';

type Init = (element: HTMLElement) => Cleanup;

const modules: Record<string, () => Promise<Init>> = {
  menu: () => import('@/scripts/modules/menu').then((m) => m.initMenu),
  typewriter: () => import('@/scripts/modules/typewriter').then((m) => m.initTypewriter),
  'background-video': () =>
    import('@/scripts/modules/page-details').then((m) => (element: HTMLElement) => m.initBackgroundVideo(element as HTMLVideoElement)),
  'back-to-top': () => import('@/scripts/modules/page-details').then((m) => m.initBackToTop),
  copy: () => import('@/scripts/modules/page-details').then((m) => m.initCopy),
  'cursor-label': () => import('@/scripts/modules/cursor-label').then((m) => m.initCursorLabel),
  'pixel-wordmark': () => import('@/scripts/modules/pixel-wordmark').then((m) => m.initPixelWordmark),
  'orbit-gallery': () => import('@/scripts/modules/orbit-gallery').then((m) => m.initOrbitGallery),
  disciplines: () => import('@/scripts/modules/disciplines').then((m) => m.initDisciplines),
  showcase: () => import('@/scripts/modules/showcase').then((m) => m.initShowcase),
  'drag-scroll': () => import('@/scripts/modules/drag-scroll').then((m) => m.initDragScroll),
  'drag-field': () => import('@/scripts/modules/drag-field').then((m) => m.initDragField),
  faq: () => import('@/scripts/modules/faq').then((m) => m.initFaq),
  tabs: () => import('@/scripts/modules/tabs').then((m) => m.initTabs),
};

const cleanups: Cleanup[] = [];

async function mountModules(): Promise<void> {
  const elements = [...document.querySelectorAll<HTMLElement>('[data-module]')];
  await Promise.all(
    elements.map(async (element) => {
      const names = (element.dataset['module'] ?? '').split(/\s+/).filter(Boolean);
      for (const name of names) {
        const load = modules[name];
        if (!load) {
          console.warn(`Unknown module "${name}"`);
          continue;
        }
        try {
          const init = await load();
          cleanups.push(init(element));
        } catch (error) {
          // One failing section must not take the rest of the page down with it.
          console.error(`Module "${name}" failed`, error);
        }
      }
    }),
  );
}

function start(): void {
  const loader = document.querySelector<HTMLElement>('[data-preloader]');
  if (loader) startPreloader(loader);
  const cover = document.querySelector<HTMLElement>('[data-page-cover]');
  if (cover) cleanups.push(initPageTransitions(cover));
  cleanups.push(initAwayTitle(), initFadeReveals(), initScramble());
  void initLineReveals().then((cleanup) => cleanups.push(cleanup));
  void initScrollRise().then((cleanup) => cleanups.push(cleanup));
  void mountModules().then(async () => {
    // Pinned sections change the page height; recalculate once everything is mounted.
    const { ScrollTrigger } = await import('@/scripts/core/gsap');
    ScrollTrigger.refresh();
  });
}

window.addEventListener('pagehide', (event) => {
  if (event.persisted) return;
  while (cleanups.length > 0) cleanups.pop()?.();
});

start();
