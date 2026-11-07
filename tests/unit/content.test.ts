import { describe, expect, it } from 'vitest';
import { projects } from '@/data/projects';
import { questions } from '@/data/faq';
import { principles } from '@/data/principles';
import { disciplines, galleryCards } from '@/data/disciplines';
import { profile, site } from '@/data/profile';
import { pillPhrases } from '@/data/navigation';

// Typographic dashes, curly quotes, ellipses, arrows and middle dots are not used in copy.
const forbidden = /[–—…←-⇿·“”‘’]|\p{Extended_Pictographic}/u;
const hype = /passionate|cutting[- ]edge|innovative|world[- ]class|blazing|turning ideas|digital world|university project|coursework/i;

function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, item]) => (key === 'src' ? [] : strings(item)));
  }
  return [];
}

const allCopy = strings({ projects, questions, principles, disciplines, profile, site, pillPhrases });

describe('content', () => {
  it('uses ASCII punctuation and no hype in every piece of copy', () => {
    for (const text of allCopy) {
      expect(text, text).not.toMatch(forbidden);
      expect(text, text).not.toMatch(hype);
    }
  });

  it('gives every project a unique slug, its public repository and complete media', () => {
    const slugs = new Set(projects.map((p) => p.slug));
    expect(slugs.size).toBe(projects.length);
    for (const project of projects) {
      expect(project.repository).toMatch(/^https:\/\/github\.com\/mykyta-olym\/[\w.-]+$/);
      expect(project.strip).toHaveLength(3);
      expect(project.gallery.length).toBeGreaterThanOrEqual(3);
      expect(project.metrics).toHaveLength(3);
      expect(project.sections.map((s) => s.id)).toEqual(['overview', 'challenge', 'outcome']);
      for (const item of [...project.strip, ...project.gallery]) expect(item.alt.length).toBeGreaterThan(20);
    }
  });

  it('features three projects on the home page', () => {
    expect(projects.filter((p) => p.featuredOnHome)).toHaveLength(3);
  });

  it('links every gallery card to an existing project', () => {
    const slugs = new Set(projects.map((p) => p.slug));
    for (const card of galleryCards) expect(slugs.has(card.slug)).toBe(true);
  });

  it('keeps contact details to the approved public channels', () => {
    const hrefs = profile.links.map((link) => link.href);
    expect(hrefs).toEqual([
      'https://github.com/mykyta-olym',
      'https://www.linkedin.com/in/mykyta-olym',
      'https://t.me/PhD_Mykyta',
      'mailto:mykyta.olym.work@gmail.com',
    ]);
    expect(allCopy.join(' ')).not.toMatch(/\+\d{3}|\d{3}[ -]\d{3}[ -]\d{3}/);
  });
});
