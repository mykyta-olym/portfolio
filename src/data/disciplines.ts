import type { Discipline, MediaItem } from '@/types/content';
import { projectMedia } from './projects';
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
    image: projectMedia.phishlensEvaluation,
  },
  {
    title: 'Interactive Graphics',
    description: 'Browser games and rendering: procedural worlds, isometric engines, offline 3D.',
    image: projectMedia.gardenPlay,
  },
];

/** Cards for the rotating gallery on the home page, each linked to its case study. */
export const galleryCards: readonly { readonly image: MediaItem; readonly slug: string }[] = [
  { image: projectMedia.gitpulseStudent, slug: 'gitpulse' },
  { image: projectMedia.gardenFlight, slug: 'garden-of-lost-paths' },
  { image: projectMedia.phishlensScore, slug: 'phishlens' },
  { image: projectMedia.relayqFailures, slug: 'relayq' },
  { image: projectMedia.speechTransfer, slug: 'speech-domain-adaptation' },
  { image: projectMedia.stockroomOrders, slug: 'stockroom' },
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
