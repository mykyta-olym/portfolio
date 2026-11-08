import { SplitText } from 'gsap/SplitText';
import { gsap, ScrollTrigger } from '@/scripts/core/gsap';
import { fontsReady, reducedMotion, type Cleanup } from '@/scripts/core/motion';
import { whenStageReady } from '@/scripts/core/stage';

gsap.registerPlugin(SplitText);

/** Preserve nested markup and reflow even during an active reveal. */
export async function initLineReveals(scope: ParentNode = document): Promise<Cleanup> {
  const elements = [...scope.querySelectorAll<HTMLElement>('[data-reveal="lines"]')];
  if (reducedMotion()) {
    elements.forEach((element) => element.classList.add('is-done'));
    return () => undefined;
  }
  await fontsReady();
  let disposed = false;
  const triggers: ScrollTrigger[] = [];
  const splits = elements.map((element) => {
    let played = false;
    return SplitText.create(element, {
      type: 'lines',
      aria: 'none',
      mask: 'lines',
      linesClass: 'line-slide',
      autoSplit: true,
      onSplit(self) {
        element.classList.add('is-split');
        const tween = gsap.fromTo(
          self.lines,
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: 1.75,
            ease: 'text-rise',
            stagger: 0.06,
            delay: Number(element.dataset['revealDelay'] ?? 0),
            paused: !played,
            onComplete: () => element.classList.add('is-done'),
          },
        );
        void whenStageReady().then(() => {
          if (disposed) return;
          if (!played)
            triggers.push(
              ScrollTrigger.create({
                trigger: element,
                start: 'top bottom+=350',
                once: true,
                onEnter: () => {
                  played = true;
                  tween.play();
                },
              }),
            );
        });
        return tween;
      },
    });
  });
  return () => {
    disposed = true;
    triggers.forEach((trigger) => trigger.kill());
    splits.forEach((split) => split.revert());
  };
}

export function initFadeReveals(scope: ParentNode = document): Cleanup {
  const elements = [...scope.querySelectorAll<HTMLElement>('[data-reveal="fade"]')];
  if (reducedMotion()) {
    elements.forEach((element) => element.classList.add('is-done'));
    return () => undefined;
  }
  const timers: number[] = [];
  let disposed = false;
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        const element = entry.target as HTMLElement;
        void whenStageReady().then(() => {
          if (!disposed)
            timers.push(window.setTimeout(() => element.classList.add('is-done'), Number(element.dataset['revealDelay'] ?? 0) * 1000));
        });
      }
    },
    { rootMargin: '0px 0px 120px 0px' },
  );
  elements.forEach((element) => observer.observe(element));
  return () => {
    disposed = true;
    observer.disconnect();
    timers.forEach((timer) => clearTimeout(timer));
  };
}
