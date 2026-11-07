// Project cards fly up into a ring around the heading, then the ring turns slowly while a
// random card flips now and then. Built once when the section first comes into view, and
// paused whenever it is off screen.
import { gsap, ScrollTrigger } from '@/scripts/core/gsap';
import { reducedMotion, type Cleanup } from '@/scripts/core/motion';

function radiusFor(width: number): number {
  if (width > 1024) return 280;
  if (width >= 768) return 230;
  return 150;
}

export function initOrbitGallery(section: HTMLElement): Cleanup {
  const ring = section.querySelector<HTMLElement>('[data-orbit-ring]');
  const cards = [...section.querySelectorAll<HTMLElement>('[data-orbit-card]')];
  const heading = section.querySelector<HTMLElement>('[data-orbit-heading]');
  if (!ring || cards.length === 0) return () => undefined;
  if (reducedMotion()) {
    section.classList.add('is-static');
    return () => undefined;
  }

  let timeline: gsap.core.Timeline | null = null;
  let flips: gsap.core.Tween | null = null;
  let spin: gsap.core.Tween | null = null;
  let built = false;

  const build = (): void => {
    timeline?.kill();
    flips?.kill();
    spin?.kill();
    gsap.set([ring, ...cards], { clearProps: 'all' });
    const count = cards.length;
    const slice = (Math.PI * 2) / count;
    const cardHeight = cards[0]?.offsetHeight ?? 120;
    const lift = 40 + cardHeight / 2;
    const radius = radiusFor(window.innerWidth);
    const offset = -Math.PI / 2;
    timeline = gsap
      .timeline()
      .from(cards, {
        y: window.innerHeight / 2 + cardHeight * 1.5,
        rotateX: -180,
        scale: 2.6,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
      })
      .to(cards, { y: -lift, duration: 0.5, ease: 'power1.out' })
      .to(
        cards,
        {
          x: (i) => radius * Math.cos(slice * i + offset),
          y: (i) => radius * Math.sin(slice * i + offset),
          rotation: (i) => ((slice * i + offset) * 180) / Math.PI + 90,
          rotateY: 0,
          duration: 1.1,
          ease: 'power2.inOut',
        },
        '>-0.1',
      );
    if (heading) timeline.fromTo(heading, { opacity: 0, filter: 'blur(40px)' }, { opacity: 1, filter: 'blur(0px)', duration: 1.1 }, '<');
    timeline.add(() => {
      spin = gsap.to(ring, { rotation: 360, duration: 24, ease: 'none', repeat: -1 });
      flips = gsap.to(
        {},
        {
          duration: 2,
          repeat: -1,
          onRepeat: () => {
            const card = cards[Math.floor(Math.random() * count)];
            if (card) gsap.to(card, { rotateY: '+=180', duration: 0.8, ease: 'power2.inOut' });
          },
        },
      );
    });
    built = true;
  };

  const enter = ScrollTrigger.create({ trigger: section, start: 'top 60%', once: true, onEnter: build });
  const visibility = ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => {
      const playing = self.isActive;
      for (const tween of [spin, flips]) {
        if (!tween) continue;
        if (playing) tween.resume();
        else tween.pause();
      }
    },
  });

  let lastBand = radiusFor(window.innerWidth);
  const onResize = (): void => {
    const band = radiusFor(window.innerWidth);
    if (built && band !== lastBand) build();
    lastBand = band;
  };
  window.addEventListener('resize', onResize);

  return () => {
    enter.kill();
    visibility.kill();
    timeline?.kill();
    flips?.kill();
    spin?.kill();
    window.removeEventListener('resize', onResize);
  };
}
