import type { Question } from '@/types/content';
import { profile } from './profile';

export const questions: readonly Question[] = [
  {
    question: 'What do you build?',
    answer: [
      'Backend services, web applications and machine learning tools. The work on this site includes a Redis job queue in Go, a phishing URL classifier in Python, a GitLab analytics platform, a shop backend in TypeScript and a browser game.',
    ],
  },
  {
    question: 'Can I read the code?',
    answer: [
      'Yes. Every project links to a public repository with its tests, its README and the results it reports. The numbers on this site are quoted from those repositories.',
    ],
  },
  {
    question: 'How do you check that something works?',
    answer: [
      'With tests that try to break it. In relayq they kill workers and Redis mid job, in stockroom many buyers check out at once, and in phishlens the evaluation is built to catch data leakage.',
    ],
  },
  {
    question: 'Where are you based?',
    answer: [
      `In ${profile.location}. I am from ${profile.origin} and study informatics at the Technical University of Košice, in my fifth year with a bachelor's degree finished. I speak ${profile.languages.join(', ').replace(/, ([^,]*)$/, ' and $1')}.`,
    ],
  },
  {
    question: 'What is the best way to reach you?',
    answer: [`Email is the quickest: ${profile.email}. Telegram and LinkedIn work too, and all links are on the contact page.`],
  },
];
