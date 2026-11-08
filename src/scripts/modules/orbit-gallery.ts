// The reference's flashing-circle style-1 sequence. Each card has its own flattened slot
// so stacked cards keep a definite paint order instead of intersecting in one 3D plane.
import { gsap, ScrollTrigger } from '@/scripts/core/gsap';
import { reducedMotion, type Cleanup } from '@/scripts/core/motion';

function radiusFor(width: number): number {
  if (width > 1024) return 230;
  if (width >= 768) return 200;
  return 130;
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
  let turn: gsap.core.Tween | null = null;
  let built = false;

  const build = (): void => {
    timeline?.kill();
    flips?.kill();
    spin?.kill();
    turn?.kill();
    gsap.set([ring, ...cards], { clearProps: 'all' });
    const count = cards.length;
    const slice = (Math.PI * 2) / count;
    const cardHeight = cards[0]?.offsetHeight ?? 120;
    const lift = 50 + cardHeight / 2;
    const radius = Math.min(radiusFor(window.innerWidth) + 50, window.innerWidth * 0.34) - lift;
    const offset = -Math.PI / 4;
    gsap.set(cards, { x: 0, y: 0, rotation: 0, rotateY: 0, scale: 1, transformOrigin: 'center center' });
    timeline = gsap
      .timeline()
      .from(cards, {
        y: window.innerHeight / 2 + cardHeight * 1.5,
        rotateX: -180,
        scale: 3,
        duration: 0.5,
        stagger: 0.1,
      })
      .set(cards, { transformOrigin: `center ${lift + cardHeight / 2}px` })
      .to(cards, { y: -lift, duration: 0.5, ease: 'power1.out' })
      .to(cards, { rotation: (i) => (i * 360) / count, rotateY: 15, duration: 1, ease: 'power1.out' }, '<')
      .to(cards, {
        x: (i) => radius * Math.cos(slice * i + offset),
        y: (i) => radius * Math.sin(slice * i + offset) - lift,
        rotation: (i) => ((slice * i + offset) * 180) / Math.PI + 90,
      })
      .to(cards, { rotateY: 180, duration: 1 }, '<');
    if (heading) timeline.fromTo(heading, { opacity: 0, filter: 'blur(60px)' }, { opacity: 1, filter: 'blur(0px)', duration: 1 }, '<');
    timeline.add(() => {
      spin = gsap.to(ring, { rotation: 360, duration: 20, ease: 'none', repeat: -1 });
      flips = gsap.to(
        {},
        {
          duration: 2,
          repeat: -1,
          onRepeat: () => {
            const card = cards[Math.floor(Math.random() * count)];
            turn?.kill();
            if (card) turn = gsap.to(card, { rotateY: '+=180', duration: 0.8 });
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
      for (const tween of [timeline, spin, flips, turn]) {
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
    turn?.kill();
    window.removeEventListener('resize', onResize);
  };
}
