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
import build from '@/assets/process/build.webp';
import test from '@/assets/process/test.webp';
import servers from '@/assets/backgrounds/servers.webp';
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
export const galleryCards: readonly { image: MediaItem['src']; title: string; text: string; source: string; position?: string }[] = [
  {
    image: design,
    title: 'Understand',
    text: 'Clarify the goal, users and constraints before choosing a tool or writing code.',
    source: 'Start with the problem',
  },
  {
    image: planning,
    title: 'Plan',
    text: 'Sketch the flow and state changes, including what happens when something goes wrong.',
    source: 'Make the decisions visible',
  },
  {
    image: build,
    position: '50% 25%',
    title: 'Build',
    text: 'Build one clear part at a time with established libraries and readable code.',
    source: 'Keep the implementation clear',
  },
  {
    image: test,
    position: '50% 15%',
    title: 'Test',
    text: 'Check the important paths with unit, browser and accessibility tests.',
    source: 'Check behavior and failure cases',
  },
  {
    image: management,
    title: 'Refine',
    text: 'Review layout, motion, keyboard use and responsive states in the browser.',
    source: 'Make the small states work',
  },
  {
    image: servers,
    title: 'Ship',
    text: 'Create a reproducible release, check the deployment and verify the live result.',
    source: 'Follow through after deployment',
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
