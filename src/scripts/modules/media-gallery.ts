import { reducedMotion, type Cleanup } from '@/scripts/core/motion';
import { lockScroll } from '@/scripts/core/stage';

/** The full-resolution image is also the link fallback when JavaScript is unavailable. */
export function initMediaGallery(root: HTMLElement): Cleanup {
  const links = [...root.querySelectorAll<HTMLAnchorElement>('[data-gallery-image]')];
  const dialog = root.querySelector<HTMLDialogElement>('[data-gallery-dialog]');
  const image = root.querySelector<HTMLImageElement>('[data-gallery-full]');
  const caption = root.querySelector<HTMLElement>('[data-gallery-caption]');
  const counter = root.querySelector<HTMLElement>('[data-gallery-count]');
  if (!dialog || !image || !caption || !counter) return () => undefined;
  let current = 0;
  let release: (() => void) | undefined;
  let animation: Animation | undefined;
  let opener: HTMLAnchorElement | null = null;
  let revision = 0;
  const original = root.querySelector<HTMLAnchorElement>('[data-gallery-original]');
  const videos = [...root.querySelectorAll('video')];
  const pauseVideos = (): void => videos.forEach((video) => video.pause());
  const videoObserver = new IntersectionObserver((entries) =>
    entries.forEach((entry) => {
      if (!entry.isIntersecting) (entry.target as HTMLVideoElement).pause();
    }),
  );
  videos.forEach((video) => videoObserver.observe(video));
  const onVisibility = (): void => {
    if (document.hidden) pauseVideos();
  };
  document.addEventListener('visibilitychange', onVisibility);

  const show = async (index: number): Promise<void> => {
    current = (index + links.length) % links.length;
    const link = links[current];
    if (!link) return;
    const request = ++revision;
    dialog.setAttribute('aria-busy', 'true');
    counter.textContent = `${current + 1} / ${links.length}`;
    caption.textContent = 'Loading image…';
    if (original) original.href = link.href;
    const nextImage = new Image();
    nextImage.src = link.href;
    try {
      await nextImage.decode();
    } catch {
      if (request === revision) {
        image.hidden = true;
        caption.textContent = 'Image unavailable. Open the original to try again.';
        dialog.setAttribute('aria-busy', 'false');
      }
      return;
    }
    if (request !== revision) return;
    animation?.cancel();
    image.src = nextImage.src;
    image.hidden = false;
    image.alt = link.querySelector('img')?.alt ?? '';
    caption.textContent = link.dataset['caption'] ?? '';
    dialog.setAttribute('aria-busy', 'false');
    if (!reducedMotion()) animation = image.animate([{ opacity: 0.5 }, { opacity: 1 }], { duration: 240 });
  };
  const open = (event: MouseEvent): void => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    pauseVideos();
    opener = event.currentTarget as HTMLAnchorElement;
    image.hidden = true;
    caption.textContent = 'Loading image…';
    void show(links.indexOf(opener));
    release = lockScroll();
    dialog.showModal();
  };
  const close = (): void => dialog.close();
  const afterClose = (): void => {
    revision += 1;
    animation?.cancel();
    release?.();
    release = undefined;
    opener?.focus({ preventScroll: true });
  };
  const previous = (): void => void show(current - 1);
  const next = (): void => void show(current + 1);
  const onKey = (event: KeyboardEvent): void => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      void show(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  };
  const onBackdrop = (event: MouseEvent): void => {
    if (event.target === dialog) close();
  };
  const closeButton = root.querySelector<HTMLButtonElement>('[data-gallery-close]');
  const prevButton = root.querySelector<HTMLButtonElement>('[data-gallery-prev]');
  const nextButton = root.querySelector<HTMLButtonElement>('[data-gallery-next]');
  links.forEach((link) => link.addEventListener('click', open));
  closeButton?.addEventListener('click', close);
  prevButton?.addEventListener('click', previous);
  nextButton?.addEventListener('click', next);
  dialog.addEventListener('close', afterClose);
  dialog.addEventListener('keydown', onKey);
  dialog.addEventListener('click', onBackdrop);
  return () => {
    revision += 1;
    animation?.cancel();
    videoObserver.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    pauseVideos();
    release?.();
    links.forEach((link) => link.removeEventListener('click', open));
    closeButton?.removeEventListener('click', close);
    prevButton?.removeEventListener('click', previous);
    nextButton?.removeEventListener('click', next);
    dialog.removeEventListener('close', afterClose);
    dialog.removeEventListener('keydown', onKey);
    dialog.removeEventListener('click', onBackdrop);
  };
}
