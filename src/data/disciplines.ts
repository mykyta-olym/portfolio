import type { Discipline, MediaItem } from '@/types/content';
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
export const fieldTiles: readonly MediaItem[] = [
  projectMedia.gardenPlay,
  projectMedia.relayqDequeue,
  projectMedia.gitpulseStudent,
  projectMedia.speechInDomain,
  projectMedia.phishlensScore,
  projectMedia.stockroomOrders,
  projectMedia.gardenBook,
  projectMedia.relayqThroughput,
  projectMedia.gitpulsePipeline,
  projectMedia.speechProtocol,
  projectMedia.gardenFlight,
  projectMedia.phishlensEvaluation,
  projectMedia.stockroomCheckout,
  projectMedia.relayqStates,
  projectMedia.gardenGardener,
  projectMedia.speechTransfer,
];
