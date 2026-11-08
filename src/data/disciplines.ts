import type { Discipline, MediaItem } from '@/types/content';
import code from '@/assets/about/code.webp';
import design from '@/assets/about/design.webp';
import planning from '@/assets/about/planning.webp';
import workspace from '@/assets/about/workspace.webp';
import modelling from '@/assets/about/modelling.webp';
import development from '@/assets/about/development.webp';
import management from '@/assets/about/management.webp';
import bottle from '@/assets/about/bottle.png';
import selected from '@/assets/about/selected.webp';
import terminal from '@/assets/about/terminal.webp';
import understand from '@/assets/process/understand.webp';
import build from '@/assets/process/build.webp';
import test from '@/assets/process/test.webp';
import refine from '@/assets/process/refine.webp';
import ship from '@/assets/process/ship.webp';
import { projectMedia } from './projects';

export const disciplines: readonly Discipline[] = [
  {
    title: 'Backend Systems',
    description: 'Queues, transactions and event pipelines that keep their guarantees when processes die.',
    image: projectMedia.relayqStates,
  },
  {
    title: 'Web Applications',
    description: 'Server-rendered dashboards with live updates, sign-in and access control.',
    image: projectMedia.gitpulseStudent,
  },
  {
    title: 'Machine Learning',
    description: 'Models judged on honest splits, with explanations and their weak spots reported.',
    image: projectMedia.speechMultiSource,
  },
  {
    title: 'Interactive Graphics',
    description: 'Browser games and rendering: procedural worlds, isometric engines, offline 3D.',
    image: projectMedia.gardenPlay,
  },
];

/** The home orbit explains the working process; project evidence lives in Selected work. */
export const galleryCards = [
  {
    image: understand,
    title: 'Understand',
    text: 'Start with the documented scope and constraints. This is the portfolio README.',
    source: 'portfolio / README.md',
  },
  {
    image: projectMedia.stockroomOrders.src,
    title: 'Plan',
    text: 'Map the state changes before implementation. This is the stockroom order lifecycle.',
    source: 'stockroom / order states',
  },
  {
    image: build,
    title: 'Build',
    text: 'Use established tools for the interactions. This is the actual GSAP menu implementation.',
    source: 'portfolio / menu.ts',
  },
  {
    image: test,
    title: 'Test',
    text: 'Verify the behavior in a real browser. This is a recorded Playwright run, including accessibility checks.',
    source: 'GitHub Actions / 615d8ad',
  },
  {
    image: refine,
    title: 'Refine',
    text: 'Review the small states too. This is the portrait button revealing its colour and hover label.',
    source: 'portfolio / hover state',
  },
  {
    image: ship,
    title: 'Ship',
    text: 'Deploy only after verification. This is the successful GitHub Pages workflow for this portfolio.',
    source: 'GitHub Actions / 615d8ad',
  },
];

/** Tiles for the draggable field on the about page. */
const fieldPhotos = [
  design,
  planning,
  development,
  selected,
  code,
  terminal,
  workspace,
  modelling,
  management,
  development,
  bottle,
  selected,
  planning,
  code,
  design,
  modelling,
];

export const fieldTiles: readonly MediaItem[] = fieldPhotos.map((src) => ({ src, alt: '', kind: 'photo' }));
