import type { NavigationItem } from '@/types/content';

export const primaryNavigation: readonly NavigationItem[] = [
  { label: 'Work', path: 'work/' },
  { label: 'About', path: 'about/' },
  { label: 'Contact', path: 'contact/' },
];

/** Words typed into the navigation pill, per page. */
export const pillPhrases = {
  home: { prefix: 'Make it', words: ['work', 'right', 'fast'] },
  work: { prefix: '', words: ['All code is public'] },
  about: { prefix: '', words: ['From Kyiv', 'In Košice'] },
  contact: { prefix: '', words: ['Inbox open'] },
  project: { prefix: '', words: ['Case study'] },
  missing: { prefix: '', words: ['Page not found'] },
} as const;

export type PillContext = keyof typeof pillPhrases;
