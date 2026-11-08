// Entry point for every page. Shared behaviour starts here; section behaviour is declared in
// the markup with data-module and loaded on demand, so a page only downloads what it uses.
import type { Cleanup } from '@/scripts/core/motion';
import { startPreloader } from '@/scripts/loader/preloader';
import { initPageTransitions } from '@/scripts/modules/page-transition';
import { initAwayTitle, initBackgroundVideo, initBackToTop, initCopy } from '@/scripts/modules/page-details';
import { ScrollTrigger } from '@/scripts/core/gsap';
import { initFadeReveals, initLineReveals } from '@/scripts/text/line-reveal';
import { initScramble } from '@/scripts/text/scramble';
import { initScrollRise } from '@/scripts/text/scroll-rise';
import { initMenu } from '@/scripts/modules/menu';

type Init = (element: HTMLElement) => Cleanup;

const modules: Record<string, () => Promise<Init>> = {
  menu: () => Promise.resolve(initMenu),
  typewriter: () => import('@/scripts/modules/typewriter').then((m) => m.initTypewriter),
  'background-video': () => Promise.resolve((element: HTMLElement) => initBackgroundVideo(element as HTMLVideoElement)),
  'back-to-top': () => Promise.resolve(initBackToTop),
  copy: () => Promise.resolve(initCopy),
  'cursor-label': () => import('@/scripts/modules/cursor-label').then((m) => m.initCursorLabel),
  'pixel-wordmark': () => import('@/scripts/modules/pixel-wordmark').then((m) => m.initPixelWordmark),
  'orbit-gallery': () => import('@/scripts/modules/orbit-gallery').then((m) => m.initOrbitGallery),
  disciplines: () => import('@/scripts/modules/disciplines').then((m) => m.initDisciplines),
  showcase: () => import('@/scripts/modules/showcase').then((m) => m.initShowcase),
  'drag-scroll': () => import('@/scripts/modules/drag-scroll').then((m) => m.initDragScroll),
  marquee: () => import('@/scripts/modules/marquee').then((m) => m.initMarquee),
  'drag-field': () => import('@/scripts/modules/drag-field').then((m) => m.initDragField),
  tabs: () => import('@/scripts/modules/tabs').then((m) => m.initTabs),
  'media-gallery': () => import('@/scripts/modules/media-gallery').then((m) => m.initMediaGallery),
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
  void mountModules().then(() => {
    // Pinned sections change the page height; recalculate once everything is mounted.
    ScrollTrigger.refresh();
    document.documentElement.dataset['modules'] = 'ready';
  });
}

window.addEventListener('pagehide', (event) => {
  if (event.persisted) return;
  while (cleanups.length > 0) cleanups.pop()?.();
});

start();
