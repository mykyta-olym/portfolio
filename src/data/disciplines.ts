import type { Discipline, MediaItem } from '@/types/content';
import { projectMedia } from './projects';
import code from '@/assets/about/code.webp';
import design from '@/assets/about/design.webp';
import glasses from '@/assets/about/glasses.webp';
import planning from '@/assets/about/planning.webp';
import workspace from '@/assets/about/workspace.webp';
import modelling from '@/assets/about/modelling.webp';
import laptop from '@/assets/renders/showcase.webp';
import avatar from '@/assets/profile/avatar.jpg';

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
  { src: design, alt: '', kind: 'photo' },
  { src: laptop, alt: '', kind: 'render' },
  { src: glasses, alt: '', kind: 'photo' },
  { src: code, alt: '', kind: 'photo' },
  { src: planning, alt: '', kind: 'photo' },
  projectMedia.gardenFlight,
  { src: workspace, alt: '', kind: 'photo' },
  projectMedia.gitpulseStudent,
  { src: modelling, alt: '', kind: 'photo' },
  { src: avatar, alt: '', kind: 'photo' },
  projectMedia.relayqDequeue,
  projectMedia.phishlensScore,
  projectMedia.stockroomOrders,
  projectMedia.gardenBook,
  projectMedia.gitpulsePipeline,
  projectMedia.speechProtocol,
];
