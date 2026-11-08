// Keep the source's stacked entrance and fan-out. The two-sided cards explain a
// working process, stay upright while orbiting and pause for reading.
import { gsap, ScrollTrigger } from '@/scripts/core/gsap';
import { reducedMotion, type Cleanup } from '@/scripts/core/motion';

export function initOrbitGallery(section: HTMLElement): Cleanup {
  const ring = section.querySelector<HTMLElement>('[data-orbit-ring]');
  const cards = [...section.querySelectorAll<HTMLButtonElement>('[data-orbit-card]')];
  const heading = section.querySelector<HTMLElement>('[data-orbit-heading]');
  if (!ring || !cards.length) return () => undefined;
  const reduce = reducedMotion();
  let timeline: gsap.core.Timeline | null = null;
  let spin: gsap.core.Tween | null = null;
  let visible = false;
  let built = false;
  let selected: HTMLButtonElement | null = null;
  const resting = new Map<HTMLElement, { x: number; y: number }>();

  const expand = (card: HTMLButtonElement | null): void => {
    if (selected) {
      selected.setAttribute('aria-expanded', 'false');
      gsap.to(selected, { ...resting.get(selected), duration: reduce ? 0 : 0.65, ease: 'power3.inOut', overwrite: 'auto' });
    }
    selected = card;
    section.classList.toggle('has-expanded', Boolean(card));
    if (card) {
      if (!resting.has(card)) resting.set(card, { x: Number(gsap.getProperty(card, 'x')), y: Number(gsap.getProperty(card, 'y')) });
      card.setAttribute('aria-expanded', 'true');
      gsap.to(card, { x: 0, y: 0, duration: reduce ? 0 : 0.65, ease: 'power3.inOut', overwrite: 'auto' });
      const stage = section.querySelector<HTMLElement>('.orbit__stage');
      if (stage)
        gsap.to(window, {
          scrollTo: {
            y: stage.getBoundingClientRect().top + window.scrollY + stage.clientHeight / 2 - window.innerHeight / 2,
            autoKill: true,
          },
          duration: reduce ? 0 : 0.65,
          ease: 'power3.inOut',
        });
    }
  };

  const updatePlayback = (): void => {
    const reading = cards.some((card) => card.matches(':hover, :focus-visible') || card.getAttribute('aria-expanded') === 'true');
    spin?.paused(!visible || reading || document.hidden);
    timeline?.paused(!visible || document.hidden);
  };
  const onClick = (event: Event): void => {
    const card = (event.target as Element).closest<HTMLButtonElement>('[data-orbit-card]');
    if (!card) return;
    expand(selected === card ? null : card);
    updatePlayback();
  };
  const onKey = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape' || !selected) return;
    expand(null);
    updatePlayback();
  };
  const build = (animate = true): void => {
    timeline?.kill();
    spin?.kill();
    if (selected) selected.setAttribute('aria-expanded', 'false');
    selected = null;
    section.classList.remove('has-expanded');
    gsap.killTweensOf(cards);
    gsap.set([ring, ...cards], { clearProps: 'all' });
    const count = cards.length;
    const height = section.querySelector<HTMLElement>('.orbit__stage')?.clientHeight ?? window.innerHeight;
    const radius = Math.min(window.innerWidth * 0.32, height * 0.32, 390);
    const positions = {
      x: (i: number) => radius * Math.cos((i * Math.PI * 2) / count - Math.PI / 3),
      y: (i: number) => radius * Math.sin((i * Math.PI * 2) / count - Math.PI / 3),
    };
    cards.forEach((card, i) => resting.set(card, { x: positions.x(i), y: positions.y(i) }));
    gsap.set(cards, { opacity: 1, x: 0, y: 0, rotateX: 0, rotation: 0, scale: 1, transformOrigin: 'center center' });
    timeline = gsap.timeline();
    if (animate) {
      const lift = 50 + (cards[0]?.offsetHeight ?? 120) / 2;
      timeline
        .from(cards, { y: window.innerHeight / 2 + 200, rotateX: -180, scale: 3, duration: 0.5, stagger: 0.1 })
        .set(cards, { transformOrigin: `center ${lift}px` })
        .to(cards, { y: -lift, duration: 0.5, ease: 'power1.out' })
        .to(cards, { rotation: (i) => (i * 360) / count, rotateY: 15, duration: 1, ease: 'power1.out' }, '<')
        .set(cards, { transformOrigin: 'center center' })
        .to(cards, { ...positions, rotation: 0, rotateY: 0, duration: 1.2, ease: 'power3.inOut' });
      if (heading) timeline.fromTo(heading, { opacity: 0, filter: 'blur(40px)' }, { opacity: 1, filter: 'blur(0px)', duration: 1 }, '<');
    } else gsap.set(cards, positions);
    timeline.add(() => {
      spin = gsap.to(ring, {
        rotation: 360,
        duration: 48,
        ease: 'none',
        repeat: -1,
        onUpdate: () => gsap.set(cards, { rotation: -Number(gsap.getProperty(ring, 'rotation')) }),
      });
      updatePlayback();
    });
    built = true;
  };

  if (reduce) section.classList.add('is-static');
  const enter = reduce ? null : ScrollTrigger.create({ trigger: section, start: 'top 60%', once: true, onEnter: () => build() });
  const visibility = ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => {
      visible = self.isActive;
      updatePlayback();
    },
  });
  let width = window.innerWidth;
  let height = window.innerHeight;
  let resizeTimer = 0;
  const onResize = (): void => {
    if (width === window.innerWidth && Math.abs(height - window.innerHeight) < 100) return;
    width = window.innerWidth;
    height = window.innerHeight;
    window.clearTimeout(resizeTimer);
    if (built) resizeTimer = window.setTimeout(() => build(false), 150);
  };
  for (const event of ['pointerover', 'pointerout', 'focusin', 'focusout']) section.addEventListener(event, updatePlayback);
  section.addEventListener('click', onClick);
  section.addEventListener('keydown', onKey);
  window.addEventListener('resize', onResize);
  document.addEventListener('visibilitychange', updatePlayback);
  return () => {
    enter?.kill();
    visibility.kill();
    timeline?.kill();
    spin?.kill();
    gsap.killTweensOf(cards);
    window.clearTimeout(resizeTimer);
    for (const event of ['pointerover', 'pointerout', 'focusin', 'focusout']) section.removeEventListener(event, updatePlayback);
    section.removeEventListener('click', onClick);
    section.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', updatePlayback);
  };
}
