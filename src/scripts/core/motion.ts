const query = typeof window === 'undefined' ? null : window.matchMedia('(prefers-reduced-motion: reduce)');

export function reducedMotion(): boolean {
  return query?.matches ?? false;
}

export function coarsePointer(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
}

/** Resolves once web fonts are ready, so measured line breaks match what is painted. */
export async function fontsReady(timeoutMs = 2500): Promise<void> {
  if (!('fonts' in document)) return;
  await Promise.race([document.fonts.ready, new Promise((resolve) => setTimeout(resolve, timeoutMs))]);
}

export type Cleanup = () => void;
