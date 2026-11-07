// Small SVG charts drawn from numbers in the repositories. No chart library: the shapes
// are simple and this keeps the output identical from run to run.
import { escapeHtml } from './templates.mjs';

const text = (x, y, value, attrs = '') => `<text x="${x}" y="${y}" ${attrs}>${escapeHtml(value)}</text>`;

/** Horizontal bars. rows: [{ label, value, note }]. */
export function horizontalBars({
  rows,
  domain,
  width,
  height,
  accent,
  format = (v) => v.toFixed(3),
  tickFormat = (v) => v.toFixed(2),
  labelWidth = 150,
}) {
  const [min, max] = domain;
  const top = 6;
  const rowHeight = (height - top - 26) / rows.length;
  const barHeight = Math.min(22, rowHeight * 0.56);
  const plotLeft = labelWidth;
  const plotWidth = width - plotLeft - 70;
  const x = (v) => plotLeft + ((v - min) / (max - min)) * plotWidth;
  const ticks = [];
  for (let v = min; v <= max + 1e-9; v += (max - min) / 4) {
    ticks.push(
      `<line x1="${x(v)}" x2="${x(v)}" y1="${top}" y2="${height - 22}" stroke="rgb(255 255 255 / 7%)"/>` +
        text(x(v), height - 6, tickFormat(v), 'font-size="10" fill="#6d6d74" text-anchor="middle"'),
    );
  }
  const bars = rows
    .map((row, i) => {
      const cy = top + rowHeight * i + rowHeight / 2;
      const w = Math.max(2, x(row.value) - plotLeft);
      return (
        text(plotLeft - 12, cy + 4, row.label, 'font-size="12" fill="#cfcfd4" text-anchor="end"') +
        `<rect x="${plotLeft}" y="${cy - barHeight / 2}" width="${w}" height="${barHeight}" rx="3" fill="${row.muted ? '#3a3a40' : accent}"/>` +
        text(plotLeft + w + 8, cy + 4, format(row.value), 'font-size="12" font-weight="600" fill="#f4f4f5"') +
        (row.note ? text(plotLeft + w + 50, cy + 4, row.note, 'font-size="10" fill="#8a8a92"') : '')
      );
    })
    .join('');
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">${ticks.join('')}${bars}</svg>`;
}

/** Two values per row, drawn as a pair of thin bars. */
export function pairedBars({ rows, series, domain, width, height, accent, labelWidth = 190 }) {
  const [min, max] = domain;
  const top = 26;
  const rowHeight = (height - top - 24) / rows.length;
  const plotLeft = labelWidth;
  const plotWidth = width - plotLeft - 56;
  const x = (v) => plotLeft + ((v - min) / (max - min)) * plotWidth;
  const colours = [accent, '#d8d8dc'];
  const legend = series
    .map(
      (name, i) =>
        `<rect x="${plotLeft + i * 110}" y="2" width="10" height="10" rx="2" fill="${colours[i]}"/>` +
        text(plotLeft + i * 110 + 16, 11, name, 'font-size="11" fill="#a9a9b0"'),
    )
    .join('');
  const ticks = [];
  for (let v = min; v <= max + 1e-9; v += (max - min) / 5) {
    ticks.push(
      `<line x1="${x(v)}" x2="${x(v)}" y1="${top - 4}" y2="${height - 20}" stroke="rgb(255 255 255 / 7%)"/>` +
        text(x(v), height - 5, v.toFixed(1), 'font-size="10" fill="#6d6d74" text-anchor="middle"'),
    );
  }
  const bars = rows
    .map((row, i) => {
      const y0 = top + rowHeight * i + rowHeight / 2;
      return (
        text(plotLeft - 12, y0 + 4, row.label, `font-size="11.5" fill="${row.muted ? '#8a8a92' : '#d6d6da'}" text-anchor="end"`) +
        row.values
          .map((v, j) => {
            const y = y0 - 9 + j * 10;
            const w = Math.max(2, x(v) - plotLeft);
            return (
              `<rect x="${plotLeft}" y="${y}" width="${w}" height="7" rx="2" fill="${colours[j]}" opacity="${row.muted ? 0.55 : 1}"/>` +
              text(plotLeft + w + 6, y + 7, v.toFixed(3), 'font-size="10" fill="#d6d6da"')
            );
          })
          .join('')
      );
    })
    .join('');
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">${legend}${ticks.join('')}${bars}</svg>`;
}

/** Heatmap with values printed in the cells. */
export function heatmap({ rowLabels, columnLabels, values, domain, width, height, accent, labelWidth = 150, headerHeight = 54 }) {
  const [min, max] = domain;
  const cols = columnLabels.length;
  const cellWidth = (width - labelWidth) / cols;
  const cellHeight = (height - headerHeight) / rowLabels.length;
  const shade = (v) => {
    const t = Math.min(1, Math.max(0, (v - min) / (max - min)));
    return `color-mix(in srgb, ${accent} ${Math.round(12 + t * 88)}%, #141416)`;
  };
  const header = columnLabels
    .map((label, j) => {
      const cx = labelWidth + cellWidth * j + cellWidth / 2;
      return text(cx, headerHeight - 12, label, 'font-size="10.5" fill="#a9a9b0" text-anchor="middle"');
    })
    .join('');
  const cells = values
    .map((row, i) =>
      row
        .map((v, j) => {
          const x = labelWidth + cellWidth * j;
          const y = headerHeight + cellHeight * i;
          const best = v === Math.max(...row);
          return (
            `<rect x="${x + 1.5}" y="${y + 1.5}" width="${cellWidth - 3}" height="${cellHeight - 3}" rx="3" fill="${shade(v)}"/>` +
            text(
              x + cellWidth / 2,
              y + cellHeight / 2 + 4,
              v.toFixed(3),
              `font-size="11" text-anchor="middle" fill="#fff" font-weight="${best ? 700 : 400}"`,
            )
          );
        })
        .join(''),
    )
    .join('');
  const labels = rowLabels
    .map((label, i) =>
      text(labelWidth - 12, headerHeight + cellHeight * i + cellHeight / 2 + 4, label, 'font-size="11" fill="#cfcfd4" text-anchor="end"'),
    )
    .join('');
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">${header}${labels}${cells}</svg>`;
}
