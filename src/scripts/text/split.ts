// Splits plain text into words and groups them into the lines the browser actually drew.

export interface SplitWords {
  readonly words: HTMLElement[];
  restore(): void;
}

/** Wraps every word in a span. Inline elements marked data-inline-pic are kept as words. */
export function splitWords(element: HTMLElement, wordClass: string, innerClass?: string): SplitWords {
  const original = element.innerHTML;
  const words: HTMLElement[] = [];
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);

  for (const node of textNodes) {
    const parts = (node.textContent ?? '').split(/(\s+)/);
    const fragment = document.createDocumentFragment();
    for (const part of parts) {
      if (part === '') continue;
      if (/^\s+$/.test(part)) {
        fragment.append(document.createTextNode(part));
        continue;
      }
      const word = document.createElement('span');
      word.className = wordClass;
      if (innerClass) {
        const inner = document.createElement('span');
        inner.className = innerClass;
        inner.textContent = part;
        word.append(inner);
      } else {
        word.textContent = part;
      }
      fragment.append(word);
      words.push(word);
    }
    node.replaceWith(fragment);
  }
  for (const pic of element.querySelectorAll<HTMLElement>('[data-inline-pic]')) words.push(pic);
  words.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
  return {
    words,
    restore: () => {
      element.innerHTML = original;
    },
  };
}

/** Groups elements by their rendered row. Returns the row index of every element. */
export function lineIndices(elements: readonly HTMLElement[]): number[] {
  const tops: number[] = [];
  return elements.map((element) => {
    const rect = element.getBoundingClientRect();
    const centre = rect.top + rect.height / 2;
    let row = tops.findIndex((top) => Math.abs(top - centre) < rect.height * 0.5);
    if (row < 0) {
      tops.push(centre);
      row = tops.length - 1;
    }
    return row;
  });
}

/**
 * Rebuilds a plain-text element as clipped lines, for the rise-in reveal. Returns the
 * sliding parts and a function that puts the original markup back.
 */
export function splitLines(element: HTMLElement): { lines: HTMLElement[]; restore: () => void } {
  const { words, restore } = splitWords(element, 'split-word');
  const rows = lineIndices(words);
  const lineCount = rows.length ? Math.max(...rows) + 1 : 0;
  const lines: HTMLElement[] = [];
  const containers: HTMLElement[] = [];
  for (let i = 0; i < lineCount; i += 1) {
    const clip = document.createElement('span');
    clip.className = 'line-clip';
    const slide = document.createElement('span');
    slide.className = 'line-slide';
    clip.append(slide);
    lines.push(slide);
    containers.push(clip);
  }
  words.forEach((word, index) => {
    const line = lines[rows[index] ?? 0];
    if (!line) return;
    if (line.childNodes.length > 0) line.append(document.createTextNode(' '));
    line.append(word.cloneNode(true));
  });
  // A space between the line boxes keeps words apart in the text and the accessible name.
  element.replaceChildren(...containers.flatMap((clip, index) => (index === 0 ? [clip] : [document.createTextNode(' '), clip])));
  return { lines, restore };
}
