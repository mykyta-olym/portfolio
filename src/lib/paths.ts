const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;

/** Absolute path inside the site, respecting the configured base. */
export function href(path = ''): string {
  return `${base}${path.replace(/^\/+/, '')}`;
}

export function projectHref(slug: string): string {
  return href(`work/${slug}/`);
}

/** True when `current` (a pathname) is `path` or below it. */
export function isCurrent(current: string, path: string): boolean {
  const target = href(path);
  return target === base ? current === base : current.startsWith(target);
}
