// The navigation panel under the pill. Opening blurs the page, wipes the black panel up from
// the bottom, lifts the links in, then reveals the media card. Closing wipes it away upwards.
// Focus is kept inside while open; Escape, the close button and the backdrop all close it.
import { gsap } from '@/scripts/core/gsap';
import { reducedMotion, type Cleanup } from '@/scripts/core/motion';
import { lockScroll } from '@/scripts/core/stage';

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
const CLOSED_FROM_BOTTOM = 'inset(100% 0% 0% 0%)';
const CLOSED_TO_TOP = 'inset(0% 0% 100% 0%)';
const OPEN = 'inset(0% 0% 0% 0%)';

export function initMenu(root: HTMLElement): Cleanup {
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const panel = root.querySelector<HTMLElement>('[data-menu-panel]');
  const surface = root.querySelector<HTMLElement>('[data-menu-surface]');
  const head = root.querySelector<HTMLElement>('.menu__head');
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  const navContent = document.querySelectorAll<HTMLElement>('.nav__logo, .nav__phrase');
  const backdrop = root.querySelector<HTMLElement>('[data-menu-backdrop]');
  const closeButton = root.querySelector<HTMLButtonElement>('[data-menu-close]');
  const media = root.querySelector<HTMLElement>('[data-menu-media]');
  const video = root.querySelector<HTMLVideoElement>('[data-menu-video]');
  if (!toggle || !panel || !surface || !backdrop || !closeButton) return () => undefined;
  const links = [...root.querySelectorAll<HTMLElement>('.menu__nav [data-menu-item]')];
  const socials = [...root.querySelectorAll<HTMLElement>('.menu__social [data-menu-item]')];
  const items = [...links, ...socials];

  let open = false;
  let timeline: gsap.core.Timeline | null = null;
  let unlock: (() => void) | null = null;
  const reduce = reducedMotion();

  gsap.set(panel, { clipPath: CLOSED_FROM_BOTTOM });
  if (media) gsap.set(media, { clipPath: CLOSED_FROM_BOTTOM });

  const setOpen = (value: boolean): void => {
    open = value;
    toggle.setAttribute('aria-expanded', String(value));
    root.toggleAttribute('data-open', value);
    closeButton.classList.toggle('is-open', value);
  };

  const show = (): void => {
    if (open) return;
    const starting = root.hidden;
    timeline?.kill();
    setOpen(true);
    root.hidden = false;
    gsap.set(toggle, { opacity: 0 });
    nav?.classList.add('is-menu-active');
    surface.inert = false;
    unlock ??= lockScroll();
    if (video && video.preload === 'none') {
      video.preload = 'auto';
      video.load();
    }
    if (!reduce) void video?.play().catch(() => undefined);
    if (starting) {
      gsap.set(backdrop, { opacity: 0 });
      gsap.set(panel, { clipPath: CLOSED_FROM_BOTTOM });
      gsap.set(head, { opacity: 0 });
      gsap.set(items, { y: 30, opacity: 0 });
      if (media) gsap.set(media, { clipPath: CLOSED_FROM_BOTTOM });
    }
    if (reduce) {
      gsap.set(panel, { clipPath: OPEN });
      gsap.set(head, { opacity: 1 });
      gsap.set(navContent, { opacity: 0 });
      gsap.set(items, { opacity: 1, y: 0 });
      if (media) gsap.set(media, { clipPath: OPEN });
      gsap.set(backdrop, { opacity: 1 });
    } else {
      timeline = gsap
        .timeline()
        .to(backdrop, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0)
        .to(navContent, { opacity: 0, duration: 0.6 }, 0)
        .to(panel, { clipPath: OPEN, duration: 1.2, ease: 'wipe' }, 0)
        .to(links, { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: 'power3.out' }, 0.6)
        .to(socials, { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: 'power3.out' }, 0.6)
        .to(head, { opacity: 1, duration: 0.6 }, 0.8);
      if (media) timeline.to(media, { clipPath: OPEN, duration: 1.5, ease: 'wipe' }, 0.4);
    }
    closeButton.focus({ preventScroll: true });
  };

  const hide = (restoreFocus = true): void => {
    if (!open) return;
    setOpen(false);
    surface.inert = true;
    timeline?.kill();
    const finish = (): void => {
      root.hidden = true;
      nav?.classList.remove('is-menu-active');
      gsap.set(navContent, { clearProps: 'opacity' });
      gsap.set(toggle, { clearProps: 'opacity' });
      video?.pause();
      gsap.set(panel, { clipPath: CLOSED_FROM_BOTTOM });
      if (media) gsap.set(media, { clipPath: CLOSED_FROM_BOTTOM });
      unlock?.();
      unlock = null;
    };
    if (reduce) finish();
    else {
      timeline = gsap
        .timeline({ onComplete: finish })
        .to(head, { opacity: 0, duration: 0.3 }, 0)
        .to(navContent, { opacity: 1, duration: 0.6 }, 0.5)
        .to(toggle, { opacity: 1, duration: 0.6 }, 0.5)
        .to(panel, { clipPath: CLOSED_TO_TOP, duration: 1.2, ease: 'wipe' }, 0)
        .to(backdrop, { opacity: 0, duration: 0.6, ease: 'power2.inOut' }, 0.5);
    }
    if (restoreFocus) toggle.focus({ preventScroll: true });
  };

  const onKey = (event: KeyboardEvent): void => {
    if (!open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      hide();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const onToggle = (): void => (open ? hide() : show());
  const onClose = onToggle;
  const onBackdrop = (): void => hide();
  // Links inside navigate away; the page transition covers the panel, so it can stay open.
  const onPageShow = (event: PageTransitionEvent): void => {
    if (event.persisted && open) hide(false);
  };

  toggle.addEventListener('click', onToggle);
  closeButton.addEventListener('click', onClose);
  backdrop.addEventListener('click', onBackdrop);
  document.addEventListener('keydown', onKey);
  window.addEventListener('pageshow', onPageShow);
  return () => {
    toggle.removeEventListener('click', onToggle);
    closeButton.removeEventListener('click', onClose);
    backdrop.removeEventListener('click', onBackdrop);
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('pageshow', onPageShow);
    timeline?.kill();
    nav?.classList.remove('is-menu-active');
    gsap.set(navContent, { clearProps: 'opacity' });
    gsap.set(toggle, { clearProps: 'opacity' });
    unlock?.();
    video?.pause();
  };
}
