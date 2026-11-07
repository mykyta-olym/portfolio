// FAQ items are native <details> elements, so they work without script and with the keyboard.
// This only animates the height when an item opens or closes.
import { reducedMotion, type Cleanup } from '@/scripts/core/motion';

export function initFaq(list: HTMLElement): Cleanup {
  if (reducedMotion()) return () => undefined;
  const items = [...list.querySelectorAll<HTMLDetailsElement>('details')];
  const handlers = items.map((details) => {
    const summary = details.querySelector('summary');
    const body = details.querySelector<HTMLElement>('[data-faq-body]');
    if (!summary || !body) return null;
    let animation: Animation | null = null;
    const onClick = (event: MouseEvent): void => {
      event.preventDefault();
      animation?.cancel();
      const opening = !details.open;
      const from = details.offsetHeight;
      if (opening) details.open = true;
      const to = opening ? summary.offsetHeight + body.offsetHeight : summary.offsetHeight;
      details.classList.toggle('is-open', opening);
      animation = details.animate([{ height: `${from}px` }, { height: `${to}px` }], {
        duration: 420,
        easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
      });
      animation.onfinish = () => {
        if (!opening) details.open = false;
        animation = null;
      };
    };
    summary.addEventListener('click', onClick);
    return () => summary.removeEventListener('click', onClick);
  });
  return () => handlers.forEach((remove) => remove?.());
}
