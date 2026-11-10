import { SplitText } from 'gsap/SplitText';
import { gsap } from '@/scripts/core/gsap';
import { fontsReady, reducedMotion, type Cleanup } from '@/scripts/core/motion';
import { playOnStage, whenStageReady } from '@/scripts/core/stage';

gsap.registerPlugin(SplitText);

const splitOptions = {
  type: 'lines,words',
  aria: 'none',
  linesClass: 'rise-line',
  mask: 'lines',
  autoSplit: true,
  ignore: '[data-inline-pic]',
} as const;

/** The source's line rise, measured again whenever fonts or paragraph widths change. */
export async function initScrollRise(scope: ParentNode = document): Promise<Cleanup> {
  if (reducedMotion()) return () => undefined;
  const groups = [...scope.querySelectorAll<HTMLElement>('[data-scroll-rise]')];
  await fontsReady();
  let disposed = false;
  const media = gsap.matchMedia();
  media.add(
    { compact: '(max-width: 767px), (pointer: coarse), (pointer: none)', desktop: '(min-width: 768px) and (pointer: fine)' },
    (context) => {
      if (context.conditions?.['compact']) {
        // The same masked lines as on desktop, but touch scrolling is fast and uneven, so each
        // paragraph rises on a timer when it enters instead of following the finger.
        const paragraphs = groups.flatMap((group) => {
          const children = [...group.querySelectorAll<HTMLElement>('p')];
          return children.length ? children : [group];
        });
        const stops: Cleanup[] = [];
        const splits = paragraphs.map((paragraph) => {
          let played = false;
          let stop: Cleanup | null = null;
          stops.push(() => stop?.());
          return SplitText.create(paragraph, {
            ...splitOptions,
            onSplit(self) {
              paragraph.closest('[data-scroll-rise]')?.classList.add('is-split');
              stop?.();
              if (played) return gsap.set(self.lines, { yPercent: 0, opacity: 1 });
              gsap.set(self.lines, { yPercent: 115, opacity: 0 });
              const timeline = gsap
                .timeline({
                  paused: true,
                  onStart: () => {
                    played = true;
                  },
                })
                .to(self.lines, { yPercent: 0, duration: 0.78, stagger: 0.06, ease: 'power1.out' })
                .to(self.lines, { opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power1.out' }, 0);
              stop = playOnStage(paragraph, timeline, 'top 90%');
              return timeline;
            },
          });
        });
        return () => {
          stops.forEach((cleanup) => cleanup());
          splits.forEach((split) => split.revert());
          groups.forEach((group) => group.classList.remove('is-split'));
        };
      }
      const splits = groups.map((group) => {
        const paragraphs = [...group.querySelectorAll<HTMLElement>('p')];
        return SplitText.create(paragraphs.length ? paragraphs : group, {
          ...splitOptions,
          onSplit(self) {
            // Initialize every row together; staggered tweens otherwise leave future rows visible.
            gsap.set(self.lines, { yPercent: 115, opacity: 0 });
            group.classList.add('is-split');
            const stagger = self.lines.length > 1 ? 0.32 / (self.lines.length - 1) : 0;
            const timeline = gsap
              .timeline({
                scrollTrigger: {
                  trigger: group,
                  start: 'top 85%',
                  end: 'top 30%',
                  scrub: 0.12,
                  invalidateOnRefresh: true,
                },
              })
              .to(self.lines, {
                yPercent: 0,
                duration: 0.68,
                stagger,
                ease: 'none',
              })
              .to(self.lines, { opacity: 1, duration: 0.45, stagger, ease: 'none' }, 0);
            timeline.scrollTrigger?.disable(false);
            void whenStageReady().then(() => {
              if (!disposed && timeline.parent) timeline.scrollTrigger?.enable();
            });
            return timeline;
          },
        });
      });
      return () => {
        splits.forEach((split) => split.revert());
        groups.forEach((group) => group.classList.remove('is-split'));
      };
    },
  );
  return () => {
    disposed = true;
    media.revert();
  };
}
