// The pill expands into one opaque panel. Its contents keep their final layout while the
// outer frame grows, so the header and the page behind it never jump or cross-fade.
// Focus is kept inside while open; Escape, the close button and the backdrop all close it.
import { gsap } from '@/scripts/core/gsap';
import { reducedMotion, type Cleanup } from '@/scripts/core/motion';
import { lockScroll } from '@/scripts/core/stage';

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
const CLOSED_FROM_BOTTOM = 'inset(100% 0% 0% 0%)';
const OPEN = 'inset(0% 0% 0% 0%)';
const PILL_COLOR = 'rgba(74, 74, 74, 0.38)';
const PANEL_COLOR = '#000000';

export function initMenu(root: HTMLElement): Cleanup {
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const dialog = root.querySelector<HTMLElement>('[role="dialog"]');
  const surface = root.querySelector<HTMLElement>('[data-menu-surface]');
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  const backdrop = root.querySelector<HTMLElement>('[data-menu-backdrop]');
  const closeButton = root.querySelector<HTMLButtonElement>('[data-menu-close]');
  const media = root.querySelector<HTMLElement>('[data-menu-media]');
  const video = root.querySelector<HTMLVideoElement>('[data-menu-video]');
  if (!toggle || !dialog || !surface || !backdrop || !closeButton) return () => undefined;
  const background = [...document.querySelectorAll<HTMLElement>('.page-shell, .footer, [data-nav], .skip-link')];
  const links = [...root.querySelectorAll<HTMLElement>('.menu__nav [data-menu-item]')];
  const socials = [...root.querySelectorAll<HTMLElement>('.menu__social [data-menu-item]')];
  const items = [...links, ...socials];

  let open = false;
  let timeline: gsap.core.Timeline | null = null;
  let unlock: (() => void) | null = null;
  let viewportWidth = window.innerWidth;
  let viewportHeight = window.innerHeight;
  const reduce = reducedMotion();

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
    nav?.classList.add('is-menu-active');
    background.forEach((element) => (element.inert = true));
    surface.inert = true;
    unlock ??= lockScroll();
    if (video && video.preload === 'none') {
      video.preload = 'auto';
      video.load();
    }
    if (!reduce) void video?.play().catch(() => undefined);
    if (starting) {
      gsap.set(backdrop, { opacity: 0 });
      gsap.set(dialog, { height: 52, backgroundColor: PILL_COLOR });
      gsap.set(items, { y: 16, opacity: 0 });
      if (media) gsap.set(media, { clipPath: CLOSED_FROM_BOTTOM });
    }
    if (reduce) {
      gsap.set(dialog, { clearProps: 'height', backgroundColor: PANEL_COLOR });
      surface.inert = false;
      gsap.set(items, { opacity: 1, y: 0 });
      if (media) gsap.set(media, { clipPath: OPEN });
      gsap.set(backdrop, { opacity: 1 });
    } else {
      timeline = gsap
        .timeline()
        .to(backdrop, { opacity: 1, duration: 0.45, ease: 'power2.out' }, 0)
        .to(
          dialog,
          {
            height: () => root.clientHeight - dialog.offsetTop,
            backgroundColor: PANEL_COLOR,
            duration: 0.65,
            ease: 'power3.out',
            onComplete: () => {
              gsap.set(dialog, { clearProps: 'height' });
              surface.inert = false;
            },
          },
          0,
        )
        .to(links, { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power3.out' }, 0.15)
        .to(socials, { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power3.out' }, 0.2);
      if (media) timeline.to(media, { clipPath: OPEN, duration: 0.5, ease: 'power3.out' }, 0.25);
    }
    closeButton.focus({ preventScroll: true });
  };

  const hide = (restoreFocus = true, immediate = false): void => {
    if (!open && (!immediate || root.hidden)) return;
    setOpen(false);
    surface.inert = true;
    timeline?.kill();
    const finish = (): void => {
      root.hidden = true;
      nav?.classList.remove('is-menu-active');
      background.forEach((element) => (element.inert = false));
      video?.pause();
      gsap.set(dialog, { clearProps: 'height,backgroundColor' });
      if (media) gsap.set(media, { clipPath: CLOSED_FROM_BOTTOM });
      unlock?.();
      unlock = null;
      if (restoreFocus) toggle.focus({ preventScroll: true });
    };
    if (reduce || immediate) finish();
    else {
      timeline = gsap
        .timeline({ onComplete: finish })
        .to(dialog, { height: 52, backgroundColor: PILL_COLOR, duration: 0.5, ease: 'power3.inOut' }, 0)
        .to(backdrop, { opacity: 0, duration: 0.4, ease: 'power2.inOut' }, 0.1);
    }
  };

  const onKey = (event: KeyboardEvent): void => {
    if (root.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      hide();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
      (el) => el.offsetParent !== null && !el.closest('[inert]'),
    );
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
    if (event.persisted) hide(false, true);
  };
  const onResize = (): void => {
    if (viewportWidth === window.innerWidth && viewportHeight === window.innerHeight) return;
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
    if (!root.hidden) timeline?.progress(1);
  };

  toggle.addEventListener('click', onToggle);
  closeButton.addEventListener('click', onClose);
  backdrop.addEventListener('click', onBackdrop);
  document.addEventListener('keydown', onKey);
  window.addEventListener('pageshow', onPageShow);
  window.addEventListener('resize', onResize);
  return () => {
    toggle.removeEventListener('click', onToggle);
    closeButton.removeEventListener('click', onClose);
    backdrop.removeEventListener('click', onBackdrop);
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('pageshow', onPageShow);
    window.removeEventListener('resize', onResize);
    timeline?.kill();
    nav?.classList.remove('is-menu-active');
    background.forEach((element) => (element.inert = false));
    unlock?.();
    video?.pause();
  };
}
