// Accessible tabs for the case study sections (Overview, The challenge, The outcome).
// Without script every panel is shown in order; with script one panel shows at a time.
import { reducedMotion, type Cleanup } from '@/scripts/core/motion';

export function initTabs(root: HTMLElement): Cleanup {
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls') ?? ''));
  if (tabs.length === 0) return () => undefined;
  root.classList.add('is-enhanced');
  let animation: Animation | undefined;

  const select = (index: number, focus: boolean): void => {
    animation?.cancel();
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      const panel = panels[i];
      if (panel) panel.hidden = !active;
    });
    if (focus) tabs[index]?.focus();
    const panel = panels[index];
    if (panel && !reducedMotion()) {
      animation = panel.animate(
        [
          { opacity: 0.35, translate: '0 5px' },
          { opacity: 1, translate: '0 0' },
        ],
        {
          duration: 240,
          easing: 'cubic-bezier(.22,1,.36,1)',
        },
      );
    }
  };
  select(0, false);

  const onClick = (event: MouseEvent): void => {
    const index = tabs.indexOf(event.currentTarget as HTMLButtonElement);
    if (index >= 0) select(index, false);
  };
  const onKey = (event: KeyboardEvent): void => {
    const index = tabs.indexOf(event.currentTarget as HTMLButtonElement);
    const keys: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 };
    const next = keys[event.key];
    if (next === undefined) return;
    event.preventDefault();
    select((next + tabs.length) % tabs.length, true);
  };
  tabs.forEach((tab) => {
    tab.addEventListener('click', onClick);
    tab.addEventListener('keydown', onKey);
  });
  return () => {
    animation?.cancel();
    tabs.forEach((tab) => {
      tab.removeEventListener('click', onClick);
      tab.removeEventListener('keydown', onKey);
    });
  };
}
