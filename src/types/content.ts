import type { ImageMetadata } from 'astro';

export interface ExternalLink {
  readonly label: string;
  readonly href: string;
  /** Short visible form, for example a handle or an address. */
  readonly display?: string;
}

export interface Profile {
  readonly name: string;
  readonly role: string;
  readonly focus: string;
  readonly location: string;
  readonly origin: string;
  readonly study: string;
  readonly languages: readonly string[];
  readonly email: string;
  readonly links: readonly ExternalLink[];
}

export type MediaKind = 'screenshot' | 'chart' | 'diagram' | 'code' | 'terminal' | 'render' | 'photo';

export interface MediaItem {
  readonly src: ImageMetadata;
  readonly alt: string;
  readonly kind: MediaKind;
  readonly caption?: string;
}

export interface Metric {
  readonly value: string;
  readonly label: string;
}

export type CaseSectionId = 'overview' | 'challenge' | 'outcome';

export interface CaseSection {
  readonly id: CaseSectionId;
  readonly title: string;
  readonly paragraphs: readonly string[];
}

export interface Project {
  readonly slug: string;
  readonly name: string;
  readonly repository: string;
  /** One or two sentences for list rows. */
  readonly summary: string;
  /** Subtitle under the case study title. */
  readonly tagline: string;
  readonly tags: readonly string[];
  readonly kind: string;
  readonly stack: readonly string[];
  readonly year: string;
  /** Base hue of the case study header, as a CSS colour. */
  readonly accent: string;
  readonly metrics: readonly Metric[];
  readonly sections: readonly CaseSection[];
  /** Three images for the draggable strip in list rows. */
  readonly strip: readonly [MediaItem, MediaItem, MediaItem];
  /** The tall image column on the case study page. */
  readonly gallery: readonly MediaItem[];
  readonly credits?: string;
  readonly featuredOnHome: boolean;
}

export interface Question {
  readonly question: string;
  readonly answer: readonly string[];
}

export interface Discipline {
  readonly title: string;
  readonly description: string;
  readonly image: MediaItem;
}

export interface Principle {
  readonly title: string;
  readonly text: string;
}

export interface NavigationItem {
  readonly label: string;
  /** Path inside the site, without the base. */
  readonly path: string;
}
