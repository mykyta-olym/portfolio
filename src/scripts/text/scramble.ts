// Small uppercase labels decode from random characters when they come into view. A group
// replays only after it has fully left the screen, and not more often than every 1.5 s.
import { reducedMotion, type Cleanup } from '@/scripts/core/motion';
import { gsap } from '@/scripts/core/gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

gsap.registerPlugin(ScrambleTextPlugin);

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#+=';
const DURATION = 520;
const STAGGER = 90;
const COOLDOWN = 1500;

export function scrambleText(element: HTMLElement, delay = 0): void {
  const finalText = element.dataset['text'] ?? element.textContent ?? '';
  element.dataset['text'] = finalText;
  gsap.to(element, {
    duration: DURATION / 1000,
    delay: delay / 1000,
    scrambleText: { text: finalText, chars: CHARACTERS, speed: 0.6 },
    ease: 'none',
    overwrite: true,
  });
}

export function initScramble(scope: ParentNode = document): Cleanup {
  const groups = [...scope.querySelectorAll<HTMLElement>('[data-scramble-group]')];
  if (groups.length === 0 || reducedMotion()) return () => undefined;
  const state = new Map(groups.map((group) => [group, { armed: true, last: -Infinity }]));

  const trigger = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const group = entry.target as HTMLElement;
        const current = state.get(group);
        if (!entry.isIntersecting || !current?.armed) continue;
        const now = performance.now();
        if (now - current.last < COOLDOWN) continue;
        current.armed = false;
        current.last = now;
        group.querySelectorAll<HTMLElement>('[data-scramble]').forEach((label, index) => scrambleText(label, index * STAGGER));
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  const rearm = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const current = state.get(entry.target as HTMLElement);
      if (current && !entry.isIntersecting) current.armed = true;
    }
  });
  groups.forEach((group) => {
    trigger.observe(group);
    rearm.observe(group);
  });
  return () => {
    trigger.disconnect();
    rearm.disconnect();
    groups.forEach((group) => gsap.killTweensOf(group.querySelectorAll('[data-scramble]')));
  };
}
