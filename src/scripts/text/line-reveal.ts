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
  // Measure under the cover; only playback waits for its actual exit.
  await fontsReady();
  let disposed = false;
  const splits = elements.map((element) => {
    let played = false;
    let trigger: ScrollTrigger | null = null;
    let currentTween: gsap.core.Tween | null = null;
    return SplitText.create(element, {
      type: 'lines',
      aria: 'none',
      mask: 'lines',
      linesClass: 'line-slide',
      autoSplit: true,
      onRevert: () => {
        trigger?.kill();
        currentTween = null;
      },
      onSplit(self) {
        element.classList.add('is-split');
        if (element.classList.contains('is-done')) return gsap.set(self.lines, { yPercent: 0 });
        gsap.set(self.lines, { yPercent: 110 });
        const tween = gsap.to(self.lines, {
          yPercent: 0,
          duration: 0.78,
          ease: 'power1.out',
          stagger: 0.06,
          delay: Number(element.dataset['revealDelay'] ?? 0),
          paused: !played,
          onComplete: () => element.classList.add('is-done'),
        });
        currentTween = tween;
        if (!played)
          trigger = ScrollTrigger.create({
            trigger: element,
            start: 'top 92%',
            once: true,
            onEnter: () => {
              void whenStageReady().then(() => {
                if (disposed || currentTween !== tween) return;
                played = true;
                tween.play();
              });
            },
          });
        return tween;
      },
    });
  });
  return () => {
    disposed = true;
    splits.forEach((split) => split.revert());
  };
}

export async function initFadeReveals(scope: ParentNode = document): Promise<Cleanup> {
  const elements = [...scope.querySelectorAll<HTMLElement>('[data-reveal="fade"]')];
  if (reducedMotion()) {
    elements.forEach((element) => element.classList.add('is-done'));
    return () => undefined;
  }
  await Promise.all([fontsReady(), whenStageReady()]);
  const tweens = elements.map((element) =>
    gsap.to(element, {
      opacity: 1,
      y: 0,
      duration: 0.56,
      delay: Number(element.dataset['revealDelay'] ?? 0),
      ease: 'power1.out',
      scrollTrigger: { trigger: element, start: 'top 92%', once: true },
      onComplete: () => {
        element.classList.add('is-done');
        gsap.set(element, { clearProps: 'opacity,transform' });
      },
    }),
  );
  return () => {
    tweens.forEach((tween) => {
      tween.scrollTrigger?.kill();
      tween.kill();
    });
  };
}
