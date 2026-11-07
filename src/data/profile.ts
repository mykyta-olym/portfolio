import type { ExternalLink, Profile } from '@/types/content';

const email = 'mykyta.olym.work@gmail.com';

export const links = {
  github: { label: 'GitHub', href: 'https://github.com/mykyta-olym', display: 'mykyta-olym' },
  linkedin: { label: 'LinkedIn', href: 'https://www.linkedin.com/in/mykyta-olym', display: 'mykyta-olym' },
  telegram: { label: 'Telegram', href: 'https://t.me/PhD_Mykyta', display: '@PhD_Mykyta' },
  email: { label: 'Email', href: `mailto:${email}`, display: email },
} as const satisfies Record<string, ExternalLink>;

export const profile: Profile = {
  name: 'Mykyta Olym',
  role: 'Software developer',
  focus: 'Backend systems, web applications and applied machine learning',
  location: 'Košice, Slovakia',
  origin: 'Kyiv, Ukraine',
  study: 'Informatics, fifth year, Technical University of Košice',
  languages: ['Ukrainian', 'English', 'Slovak'],
  email,
  links: [links.github, links.linkedin, links.telegram, links.email],
};

export const site = {
  title: 'Mykyta Olym',
  description:
    'Mykyta Olym is a software developer in Košice. Backend systems, web applications and applied machine learning, each published with its tests and measured results.',
  locale: 'en',
} as const;
