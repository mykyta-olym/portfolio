// Box-and-arrow diagrams with hand-placed nodes. Used for the real state machines and
// pipelines described in each repository.
import { escapeHtml } from './templates.mjs';

function anchor(node, toward) {
  // Point on the node border in the direction of another point.
  const dx = toward.x - node.x;
  const dy = toward.y - node.y;
  const hw = node.w / 2;
  const hh = node.h / 2;
  const scale = Math.min(Math.abs(dx) > 1e-6 ? hw / Math.abs(dx) : Infinity, Math.abs(dy) > 1e-6 ? hh / Math.abs(dy) : Infinity);
  return { x: node.x + dx * scale, y: node.y + dy * scale };
}

/**
 * nodes: [{ id, label, sub?, x, y, w?, h?, tone? }] with x and y at the node centre.
 * edges: [{ from, to, label?, bend?, labelAt?: [x, y], dashed? }]
 */
export function diagram({ width, height, nodes, edges, accent }) {
  const byId = new Map(nodes.map((n) => [n.id, { w: 150, h: 46, ...n }]));
  const marker = `<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#9c9ca3"/></marker></defs>`;
  const lines = edges
    .map((edge) => {
      const a = byId.get(edge.from);
      const b = byId.get(edge.to);
      if (!a || !b) throw new Error(`edge ${edge.from} -> ${edge.to} has an unknown node`);
      const bend = edge.bend ?? 0;
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const nx = -(b.y - a.y);
      const ny = b.x - a.x;
      const length = Math.hypot(nx, ny) || 1;
      const control = { x: mid.x + (nx / length) * bend, y: mid.y + (ny / length) * bend };
      const start = anchor(a, bend ? control : b);
      const end = anchor(b, bend ? control : a);
      const path = bend
        ? `M${start.x},${start.y} Q${control.x},${control.y} ${end.x},${end.y}`
        : `M${start.x},${start.y} L${end.x},${end.y}`;
      const labelPoint = edge.labelAt
        ? { x: edge.labelAt[0], y: edge.labelAt[1] }
        : bend
          ? { x: (start.x + 2 * control.x + end.x) / 4, y: (start.y + 2 * control.y + end.y) / 4 }
          : { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
      const label = edge.label
        ? `<text x="${labelPoint.x}" y="${labelPoint.y}" font-size="10.5" fill="#a9a9b0" text-anchor="middle" paint-order="stroke" stroke="#121214" stroke-width="5">${escapeHtml(edge.label)}</text>`
        : '';
      return `<path d="${path}" fill="none" stroke="#5c5c63" stroke-width="1.4" ${edge.dashed ? 'stroke-dasharray="4 4"' : ''} marker-end="url(#arrow)"/>${label}`;
    })
    .join('');
  const boxes = [...byId.values()]
    .map((n) => {
      const fill = n.tone === 'accent' ? accent : n.tone === 'muted' ? '#1b1b1e' : '#202024';
      const stroke = n.tone === 'accent' ? accent : 'rgb(255 255 255 / 14%)';
      const colour = n.tone === 'accent' ? '#fff' : '#ececee';
      const labelY = n.sub ? n.y - 3 : n.y + 4.5;
      return (
        `<rect x="${n.x - n.w / 2}" y="${n.y - n.h / 2}" width="${n.w}" height="${n.h}" rx="9" fill="${fill}" stroke="${stroke}"/>` +
        `<text x="${n.x}" y="${labelY}" font-size="13" font-weight="600" fill="${colour}" text-anchor="middle">${escapeHtml(n.label)}</text>` +
        (n.sub
          ? `<text x="${n.x}" y="${n.y + 12}" font-size="10" fill="${n.tone === 'accent' ? '#fff' : '#9c9ca3'}" opacity="0.85" text-anchor="middle">${escapeHtml(n.sub)}</text>`
          : '')
      );
    })
    .join('');
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">${marker}${lines}${boxes}</svg>`;
}
