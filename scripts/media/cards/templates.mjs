// HTML for project visuals. Every card is a real artefact from a repository: verbatim
// source code, a captured command run, numbers quoted from a README, a diagram of the
// actual state machine, or a real screenshot. Rendered by render-cards.mjs.

export const sizes = {
  wide: [800, 500],
  square: [600, 520],
  even: [520, 520],
  tall: [520, 650],
  banner: [960, 540],
  code: [800, 560],
};

const fonts = `
@font-face { font-family: 'Inter'; font-weight: 100 900; src: url('/node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2') format('woff2'); }
@font-face { font-family: 'Plex Mono'; font-weight: 400; src: url('/node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2') format('woff2'); }
@font-face { font-family: 'Plex Mono'; font-weight: 500; src: url('/node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2') format('woff2'); }
`;

export function escapeHtml(text) {
  return String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

export function page({ size, accent, body, background = 'glow' }) {
  const [width, height] = sizes[size];
  const backdrop =
    background === 'glow'
      ? `radial-gradient(120% 90% at 85% 0%, color-mix(in srgb, ${accent} 26%, transparent), transparent 62%), radial-gradient(90% 80% at 0% 100%, color-mix(in srgb, ${accent} 12%, transparent), transparent 60%), #0b0b0c`
      : background;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>card</title><style>
${fonts}
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { background: #000; }
body { font-family: 'Inter', sans-serif; color: #e9e9ea; -webkit-font-smoothing: antialiased; }
#card { position: relative; width: ${width}px; height: ${height}px; overflow: hidden; background: ${backdrop}; padding: 28px; display: flex; }
.window { flex: 1; display: flex; flex-direction: column; min-width: 0; background: #121214; border: 1px solid rgb(255 255 255 / 9%); border-radius: 14px; overflow: hidden; box-shadow: 0 30px 60px -30px rgb(0 0 0 / 80%); }
.bar { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-bottom: 1px solid rgb(255 255 255 / 7%); font: 500 11px/1 'Plex Mono', monospace; letter-spacing: 0.02em; color: #9c9ca3; }
.bar .dot { width: 7px; height: 7px; border-radius: 50%; background: ${accent}; flex: none; }
.bar .meta { margin-left: auto; color: #6d6d74; }
.body { flex: 1; min-height: 0; padding: 18px 20px; position: relative; }
.mono { font-family: 'Plex Mono', monospace; }
.caption { position: absolute; left: 28px; right: 28px; bottom: 10px; font: 400 10px/1.2 'Plex Mono', monospace; color: #6d6d74; letter-spacing: 0.02em; }
pre.shiki { background: transparent !important; font: 400 var(--code-size, 12.5px)/1.62 'Plex Mono', monospace; white-space: pre; }
pre.shiki code { font-family: inherit; }
.elision { color: #55555c; font: 400 var(--code-size, 12px)/1 'Plex Mono', monospace; padding: 7px 0; letter-spacing: 0.2em; }
.term { font: 400 12.5px/1.75 'Plex Mono', monospace; white-space: pre; color: #c9c9ce; }
.term .cmd { color: #f2f2f3; }
.term .prompt { color: ${accent}; }
.term .hi { color: #fff; font-weight: 500; }
.term .pos { color: #ff8f7a; }
.term .neg { color: #8fd6b4; }
table { width: 100%; border-collapse: collapse; font-size: 12px; }
th { text-align: left; font: 500 10px/1.2 'Plex Mono', monospace; letter-spacing: 0.06em; text-transform: uppercase; color: #77777e; padding: 0 10px 10px 0; border-bottom: 1px solid rgb(255 255 255 / 9%); }
td { padding: 11px 10px 11px 0; border-bottom: 1px solid rgb(255 255 255 / 6%); vertical-align: top; line-height: 1.38; color: #cfcfd4; }
td.key { font: 500 11px/1.4 'Plex Mono', monospace; color: #f4f4f5; }
td.result { color: #fff; }
.shot { width: 100%; display: block; }
.frame-body { flex: 1; min-height: 0; overflow: hidden; background: #fff; }
.frame-body img { width: 100%; display: block; }
svg text { font-family: 'Inter', sans-serif; }
</style></head><body><div id="card">${body}</div></body></html>`;
}

export function windowFrame({ title, meta = '', content, bodyStyle = '' }) {
  return `<div class="window"><div class="bar"><span class="dot"></span><span>${escapeHtml(title)}</span><span class="meta">${escapeHtml(meta)}</span></div><div class="body" style="${bodyStyle}">${content}</div></div>`;
}

export function caption(text) {
  return `<div class="caption">${escapeHtml(text)}</div>`;
}

/** A captured terminal session: the first line is the command, the rest is output. */
export function terminal(lines) {
  return `<div class="term">${lines
    .map((line, index) => {
      const safe = escapeHtml(line);
      if (index === 0) return `<span class="prompt">$</span> <span class="cmd">${safe.replace(/^\$\s*/, '')}</span>`;
      if (/^\s+\+/.test(line)) return `<span class="pos">${safe}</span>`;
      if (/^\s+-/.test(line)) return `<span class="neg">${safe}</span>`;
      return `<span class="hi">${safe}</span>`;
    })
    .join('\n')}</div>`;
}

export function table({ columns, rows }) {
  const head = columns.map((column) => `<th>${escapeHtml(column)}</th>`).join('');
  const body = rows
    .map(
      (row) =>
        `<tr>${row
          .map((cell, index) => `<td class="${index === 0 ? 'key' : index === row.length - 1 ? 'result' : ''}">${escapeHtml(cell)}</td>`)
          .join('')}</tr>`,
    )
    .join('');
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

/** A real screenshot inside a minimal browser frame, cropped from the top. */
export function browser({ title, image, position = 'top' }) {
  return `<div class="window"><div class="bar"><span class="dot"></span><span>${escapeHtml(title)}</span></div><div class="frame-body"><img src="${image}" style="object-position:${position}" alt=""></div></div>`;
}
