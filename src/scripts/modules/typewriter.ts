import Typed from 'typed.js';
import { reducedMotion, type Cleanup } from '@/scripts/core/motion';
import { whenStageReady } from '@/scripts/core/stage';

/** Typed.js owns typing, backspacing and the persistent blinking cursor. */
export function initTypewriter(element: HTMLElement): Cleanup {
  const output = element.querySelector<HTMLElement>('[data-typewriter-text]');
  const words = JSON.parse(element.dataset['words'] ?? '[]') as string[];
  if (!output || !words.length || reducedMotion()) return () => undefined;
  let typed: Typed | null = null;
  let disposed = false;
  void whenStageReady().then(() => {
    if (disposed) return;
    output.textContent = '';
    element.classList.add('is-typing');
    typed = new Typed(output, {
      strings: words,
      typeSpeed: 70,
      backSpeed: 42,
      startDelay: 400,
      backDelay: 2400,
      smartBackspace: true,
      loop: words.length > 1,
      showCursor: true,
      cursorChar: '|',
      autoInsertCss: true,
      contentType: 'null',
    });
  });
  const onVisibility = (): void => {
    if (document.hidden) typed?.stop();
    else typed?.start();
  };
  document.addEventListener('visibilitychange', onVisibility);
  return () => {
    disposed = true;
    typed?.destroy();
    document.removeEventListener('visibilitychange', onVisibility);
  };
}
