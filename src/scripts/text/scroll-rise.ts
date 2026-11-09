import { SplitText } from 'gsap/SplitText';
import { gsap } from '@/scripts/core/gsap';
import { fontsReady, reducedMotion, type Cleanup } from '@/scripts/core/motion';
import { whenStageReady } from '@/scripts/core/stage';

gsap.registerPlugin(SplitText);

/** The source's line rise, measured again whenever fonts or paragraph widths change. */
export async function initScrollRise(scope: ParentNode = document): Promise<Cleanup> {
  if (reducedMotion()) return () => undefined;
  const groups = [...scope.querySelectorAll<HTMLElement>('[data-scroll-rise]')];
  await Promise.all([fontsReady(), whenStageReady()]);
  const splits = groups.map((group) => {
    const paragraphs = [...group.querySelectorAll<HTMLElement>('p')];
    return SplitText.create(paragraphs.length ? paragraphs : group, {
      type: 'lines,words',
      aria: 'none',
      linesClass: 'rise-line',
      mask: 'lines',
      autoSplit: true,
      ignore: '[data-inline-pic]',
      onSplit(self) {
        // Initialize every row together; staggered tweens otherwise leave future rows visible.
        gsap.set(self.lines, { yPercent: 115, opacity: 0 });
        group.classList.add('is-split');
        const stagger = self.lines.length > 1 ? 0.32 / (self.lines.length - 1) : 0;
        return gsap
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
      },
    });
  });
  return () => splits.forEach((split) => split.revert());
}
