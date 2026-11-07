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
    let expanded = details.open;
    details.classList.add('is-enhanced');
    details.classList.toggle('is-open', expanded);
    const onClick = (event: MouseEvent): void => {
      event.preventDefault();
      // Read the visible height before cancelling, including during a reversal.
      const from = details.getBoundingClientRect().height;
      animation?.cancel();
      expanded = !expanded;
      details.open = true;
      const border = details.offsetHeight - details.clientHeight;
      const to = expanded ? details.offsetHeight : summary.offsetHeight + border;
      details.classList.toggle('is-open', expanded);
      animation = details.animate([{ height: `${from}px` }, { height: `${to}px` }], {
        duration: 420,
        easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
        fill: 'both',
      });
      animation.onfinish = () => {
        details.open = expanded;
        animation?.cancel();
        animation = null;
      };
    };
    summary.addEventListener('click', onClick);
    return () => {
      animation?.cancel();
      summary.removeEventListener('click', onClick);
    };
  });
  return () => handlers.forEach((remove) => remove?.());
}
