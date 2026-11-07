import type { Principle } from '@/types/content';

export const principles: readonly Principle[] = [
  {
    title: 'State the guarantee',
    text: 'If a queue promises at-least-once delivery, the README says what that costs and which duplicates you will see.',
  },
  {
    title: 'Try to break it first',
    text: 'Kill the worker, restart the database, send a thousand buyers at once. A test that never fails proves nothing.',
  },
  {
    title: 'Measure, then write',
    text: 'A number on this site comes from a run, with the conditions next to it. If it looks too good, the measurement gets checked first.',
  },
  {
    title: 'Report the weak spots',
    text: 'When a simple baseline beats the model, that goes in the results table, not in a footnote.',
  },
  {
    title: 'Keep the parts small',
    text: 'Small parts with clear edges are easier to test, easier to read and easier to hand over.',
  },
];
