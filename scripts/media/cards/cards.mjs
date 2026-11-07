// The card manifest. Numbers, code and test names are read from the sibling repositories at
// build time, so a card can never drift from its source. Expects the repositories next to
// this one (../relayq, ../phishlens, ...), as in the workspace they were cloned into.
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { codeToHtml } from 'shiki';
import { heatmap, horizontalBars, pairedBars } from './charts.mjs';
import { diagram } from './diagrams.mjs';
import { browser, caption, escapeHtml, page, sizes, table, terminal, windowFrame } from './templates.mjs';

const repos = resolve(import.meta.dirname, '../../../..');
const read = (repo, file) => readFileSync(join(repos, repo, file), 'utf8').replaceAll('\r\n', '\n');

export const accents = {
  relayq: '#c2553d',
  phishlens: '#2f9a78',
  gitpulse: '#6d5fd8',
  stockroom: '#c8913a',
  garden: '#a08458',
  speech: '#4a86c8',
};

/** Rows of the first Markdown table whose header row starts with `header`. */
function markdownTable(markdown, header) {
  const lines = markdown.split('\n');
  const start = lines.findIndex((line) => line.startsWith(header));
  if (start < 0) throw new Error(`table not found: ${header}`);
  const rows = [];
  for (const line of lines.slice(start + 2)) {
    if (!line.startsWith('|')) break;
    rows.push(
      line
        .slice(1, -1)
        .split('|')
        .map((cell) => cell.trim().replaceAll('`', '')),
    );
  }
  return rows;
}

function linesOf(text, ranges) {
  const all = text.split('\n');
  return ranges.map(([from, to]) => all.slice(from - 1, to).join('\n'));
}

async function code({ repo, file, ranges, lang, title, meta, size, accent, fontSize = 12.5 }) {
  const parts = linesOf(read(repo, file), ranges);
  const html = await Promise.all(parts.map((part) => codeToHtml(part, { lang, theme: 'vitesse-dark' })));
  const joined = html.join('<div class="elision">. . .</div>');
  const firstLine = ranges[0][0];
  return page({
    size,
    accent,
    body: windowFrame({
      title: title ?? `${repo} / ${file}`,
      meta: meta ?? `lines ${firstLine}-${ranges.at(-1)[1]}`,
      content: joined,
      bodyStyle: `--code-size:${fontSize}px`,
    }),
  });
}

function svgCard({ size, accent, title, meta, svg, note }) {
  return page({ size, accent, body: windowFrame({ title, meta, content: svg }) + (note ? caption(note) : '') });
}

const inner = (size, padX = 104, padY = 120) => [sizes[size][0] - padX, sizes[size][1] - padY];

function relayqCards() {
  const readme = read('relayq', 'README.md');
  const accent = accents.relayq;
  const failures = markdownTable(readme, '| Test |');
  const wanted = [
    'TestKilledWorkerJobIsRedelivered',
    'TestPoisonJobEndsInDeadLetterQueue',
    'TestChaosKillingWorkersLosesNoJob',
    'TestJobsSurviveRedisCrashWhileRunning',
  ];
  const rows = wanted.map((name) => {
    const row = failures.find((cells) => cells[0] === name);
    if (!row) throw new Error(`relayq README lost the row ${name}`);
    return row;
  });
  const bench = markdownTable(readme, '| Scenario | Flags | Median jobs/s |');
  const [w, h] = inner('wide');
  const [sw, sh] = inner('square', 96, 92);
  return [
    {
      id: 'relayq/failures',
      size: 'wide',
      html: page({
        size: 'wide',
        accent,
        body: windowFrame({
          title: 'relayq / failure suite',
          meta: 'README.md',
          content: table({ columns: ['Test', 'Setup', 'Result'], rows: rows.map((r) => [r[0].replace(/^Test/, ''), r[1], r[2]]) }),
          bodyStyle: 'padding-top:14px',
        }),
      }),
    },
    {
      id: 'relayq/states',
      size: 'square',
      html: svgCard({
        size: 'square',
        accent,
        title: 'relayq / job states',
        meta: 'README.md',
        svg: diagram({
          width: sw,
          height: sh,
          accent,
          nodes: [
            { id: 'delayed', label: 'delayed', x: 90, y: 60, w: 120 },
            { id: 'ready', label: 'ready', x: sw - 90, y: 60, w: 120 },
            { id: 'active', label: 'active', sub: 'leased', x: sw / 2, y: sh / 2 + 4, w: 140, h: 54, tone: 'accent' },
            { id: 'completed', label: 'completed', x: 90, y: sh - 40, w: 130 },
            { id: 'dead', label: 'dead letter', x: sw - 90, y: sh - 40, w: 130 },
          ],
          edges: [
            { from: 'delayed', to: 'ready', label: 'due' },
            { from: 'ready', to: 'active', label: 'dequeue takes a lease', bend: -24 },
            { from: 'active', to: 'ready', label: 'lease expired', bend: -24 },
            { from: 'active', to: 'delayed', label: 'failed, retry', bend: 0 },
            { from: 'active', to: 'completed', label: 'returned nil' },
            { from: 'active', to: 'dead', label: 'out of attempts' },
            { from: 'dead', to: 'ready', label: 'requeue', bend: 70, labelAt: [sw - 26, sh / 2] },
          ],
        }),
      }),
    },
    {
      id: 'relayq/dequeue',
      size: 'code',
      html: () =>
        code({ repo: 'relayq', file: 'scripts/dequeue.lua', ranges: [[1, 25]], lang: 'lua', size: 'code', accent, fontSize: 10.4 }),
    },
    {
      id: 'relayq/throughput',
      size: 'wide',
      html: svgCard({
        size: 'wide',
        accent,
        title: 'relayq / benchmark, median jobs per second',
        meta: 'README.md',
        note: 'One machine, measured 2026-11-05, before the delivery tracking fix. Min to max ranges are in the README.',
        svg: horizontalBars({
          width: w,
          height: h - 18,
          accent,
          labelWidth: 210,
          domain: [0, 20000],
          format: (v) => v.toLocaleString('en-US'),
          tickFormat: (v) => v.toLocaleString('en-US'),
          rows: bench.map((r) => ({ label: r[0], value: Number(r[2]) })),
        }),
      }),
    },
    {
      id: 'relayq/architecture',
      size: 'wide',
      html: svgCard({
        size: 'wide',
        accent,
        title: 'relayq / components',
        meta: 'README.md',
        svg: diagram({
          width: w,
          height: h,
          accent,
          nodes: [
            { id: 'producers', label: 'Go producers', x: 90, y: 60, w: 150 },
            { id: 'http', label: 'HTTP callers, CLI', x: 90, y: 180, w: 150 },
            { id: 'api', label: 'relayq serve', x: 290, y: 180, w: 140 },
            { id: 'client', label: 'relayq.Client', x: 290, y: 60, w: 140 },
            { id: 'redis', label: 'Redis', sub: 'Lua scripts', x: 500, y: 120, w: 120, h: 56, tone: 'accent' },
            { id: 'w1', label: 'Worker', x: w - 70, y: 60, w: 110 },
            { id: 'w2', label: 'Worker', x: w - 70, y: 180, w: 110 },
            { id: 'prom', label: 'Prometheus', x: 290, y: h - 40, w: 140, tone: 'muted' },
          ],
          edges: [
            { from: 'producers', to: 'client' },
            { from: 'http', to: 'api' },
            { from: 'api', to: 'client' },
            { from: 'client', to: 'redis', label: 'enqueue' },
            { from: 'w1', to: 'redis', label: 'lease, ack' },
            { from: 'w2', to: 'redis', label: 'lease, ack' },
            { from: 'prom', to: 'api', label: 'scrape', dashed: true },
          ],
        }),
      }),
    },
  ];
}

function phishlensCards() {
  const readme = read('phishlens', 'README.md');
  const accent = accents.phishlens;
  const results = markdownTable(readme, '| Test | Rows | Precision |');
  const prevalence = markdownTable(readme, '| Phishing share |');
  const session = readFileSync(join(import.meta.dirname, 'data/phishlens-score.txt'), 'utf8')
    .trimEnd()
    .split(/\r?\n/);
  const [w, h] = inner('wide');
  return [
    {
      id: 'phishlens/score',
      size: 'wide',
      html: page({
        size: 'wide',
        accent,
        body:
          windowFrame({ title: 'phishlens score', meta: 'captured 2026-11-07', content: terminal(session), bodyStyle: 'font-size:11px' }) +
          caption('A real run of the CLI. The .example address is made up for the demo.'),
      }),
    },
    {
      id: 'phishlens/evaluation',
      size: 'wide',
      html: svgCard({
        size: 'wide',
        accent,
        title: 'phishlens / evaluation',
        meta: 'README.md',
        svg: pairedBars({
          width: w,
          height: h,
          accent,
          series: ['F1', 'ROC AUC'],
          domain: [0, 1],
          labelWidth: 220,
          rows: results.map((r) => ({ label: r[0], values: [Number(r[4]), Number(r[5])], muted: /other dataset/.test(r[0]) })),
        }),
      }),
    },
    {
      id: 'phishlens/prevalence',
      size: 'square',
      html: page({
        size: 'square',
        accent,
        body:
          windowFrame({
            title: 'phishlens / realistic prevalence',
            meta: 'README.md',
            content: table({ columns: ['Phishing share', 'Precision', 'Recall', 'Strict cut', 'Recall'], rows: prevalence }),
          }) + caption('Precision falls as phishing gets rarer. The README says so.'),
      }),
    },
    {
      id: 'phishlens/integrity',
      size: 'code',
      html: () =>
        code({
          repo: 'phishlens',
          file: 'src/phishlens/model.py',
          ranges: [[114, 136]],
          lang: 'python',
          size: 'code',
          accent,
          fontSize: 10.4,
        }),
    },
  ];
}

function gitpulseCards() {
  const accent = accents.gitpulse;
  const [w, h] = inner('wide');
  return [
    {
      id: 'gitpulse/student',
      size: 'wide',
      assets: { student: join(repos, 'gitpulse/assets/screenshots/en/student.png') },
      html: page({ size: 'wide', accent, body: browser({ title: 'GitPulse / student view', image: '{{student}}' }) }),
    },
    {
      id: 'gitpulse/checks',
      size: 'tall',
      assets: { checks: join(repos, 'gitpulse/assets/screenshots/en/checks.png') },
      html: page({
        size: 'tall',
        accent,
        body: browser({ title: 'GitPulse / checks R01 to R13', image: '{{checks}}', position: 'center 34%' }),
      }),
    },
    {
      id: 'gitpulse/rules',
      size: 'code',
      html: () =>
        code({
          repo: 'gitpulse',
          file: 'src/app/compliance/builtin_checks.json',
          ranges: [
            [4, 9],
            [11, 19],
          ],
          lang: 'json',
          size: 'code',
          accent,
          fontSize: 11,
        }),
    },
    {
      id: 'gitpulse/pipeline',
      size: 'wide',
      html: svgCard({
        size: 'wide',
        accent,
        title: 'GitPulse / event pipeline',
        meta: 'docs/11_event_pipeline.md',
        svg: diagram({
          width: w,
          height: h,
          accent,
          nodes: [
            { id: 'hook', label: 'GitLab webhook', sub: 'POST /api/webhooks/gitlab', x: 95, y: 50, w: 170, h: 52 },
            { id: 'dedup', label: 'Dedup x3', sub: 'delivery, UUID, SHA-256', x: 95, y: 150, w: 170, h: 52 },
            { id: 'store', label: 'webhook_events', sub: 'immutable JSONB', x: 95, y: 250, w: 170, h: 52 },
            { id: 'queue', label: 'RQ high queue', sub: 'process_event', x: 330, y: 250, w: 160, h: 52, tone: 'accent' },
            { id: 'retry', label: 'Retry', sub: 'with backoff', x: 330, y: 120, w: 120, h: 50 },
            { id: 'dlq', label: 'Dead letter', x: 330, y: 30, w: 120, h: 40, tone: 'muted' },
            { id: 'metrics', label: 'Team metrics', sub: 'recomputed', x: w - 100, y: 70, w: 170, h: 52 },
            { id: 'cache', label: 'Caches', sub: 'invalidated', x: w - 100, y: 160, w: 170, h: 52 },
            { id: 'sse', label: 'Open dashboards', sub: 'notified', x: w - 100, y: 250, w: 170, h: 52 },
          ],
          edges: [
            { from: 'hook', to: 'dedup' },
            { from: 'dedup', to: 'store' },
            { from: 'store', to: 'queue' },
            { from: 'queue', to: 'retry', label: 'error' },
            { from: 'retry', to: 'dlq', label: 'max retries' },
            { from: 'queue', to: 'metrics', label: 'processed' },
            { from: 'queue', to: 'cache' },
            { from: 'queue', to: 'sse' },
          ],
        }),
      }),
    },
  ];
}

function stockroomCards() {
  const accent = accents.stockroom;
  const statusSource = read('stockroom', 'src/domain/order-status.ts');
  const transitions = {};
  const block = statusSource.slice(statusSource.indexOf('const TRANSITIONS'));
  for (const match of block.matchAll(/^\s+(\w+): \[([^\]]*)\],?$/gm)) {
    transitions[match[1]] = [...match[2].matchAll(/'(\w+)'/g)].map((m) => m[1]);
  }
  const expected = ['pending_payment', 'paid', 'shipped', 'delivered', 'cancelled', 'payment_failed'];
  if (expected.some((s) => !(s in transitions))) throw new Error('stockroom order states changed; update the diagram layout');
  const [sw, sh] = inner('square', 96, 92);
  const place = {
    pending_payment: [sw / 2, 36],
    paid: [sw / 2, 150],
    payment_failed: [sw - 80, 150],
    cancelled: [80, 150],
    shipped: [sw / 2, 262],
    delivered: [sw / 2, 362],
  };
  const nodes = expected.map((id) => ({
    id,
    label: id.replace('_', ' '),
    x: place[id][0],
    y: place[id][1],
    w: id === 'pending_payment' ? 170 : 130,
    tone: id === 'paid' ? 'accent' : id === 'cancelled' || id === 'payment_failed' ? 'muted' : undefined,
  }));
  const edges = Object.entries(transitions).flatMap(([from, targets]) =>
    targets.map((to) => ({ from, to, bend: from === 'paid' && to === 'cancelled' ? 46 : 0 })),
  );
  return [
    {
      id: 'stockroom/checkout',
      size: 'code',
      html: () =>
        code({
          repo: 'stockroom',
          file: 'src/server/checkout.ts',
          ranges: [
            [60, 63],
            [69, 75],
            [98, 100],
            [108, 111],
          ],
          lang: 'typescript',
          size: 'code',
          accent,
          fontSize: 11,
        }),
    },
    {
      id: 'stockroom/orders',
      size: 'square',
      html: svgCard({
        size: 'square',
        accent,
        title: 'stockroom / order states',
        meta: 'src/domain/order-status.ts',
        svg: diagram({ width: sw, height: sh, accent, nodes, edges }),
      }),
    },
    {
      id: 'stockroom/concurrency',
      size: 'wide',
      html: () =>
        code({
          repo: 'stockroom',
          file: 'tests/integration/concurrency.test.ts',
          ranges: [
            [66, 67],
            [79, 79],
            [96, 96],
            [146, 146],
            [161, 161],
            [181, 181],
            [208, 208],
          ],
          lang: 'typescript',
          size: 'wide',
          accent,
          fontSize: 11,
          meta: 'test names',
        }),
    },
  ];
}

function gardenCards() {
  const dir = join(repos, 'zahrada-stratenych-ciest/dokumentacia/obrazky');
  // Screenshots captured by the game's own Playwright script. They are used as they are.
  return [
    { id: 'garden/play', photo: join(dir, 'snimka-hra.jpg'), width: 1600 },
    { id: 'garden/flight', photo: join(dir, 'snimka-let.jpg'), width: 1600, crop: { top: 0.09, bottom: 0.09 } },
    { id: 'garden/book', photo: join(dir, 'snimka-stol.jpg'), width: 1100, crop: { left: 0.22, right: 0.22 } },
    { id: 'garden/gardener', photo: join(dir, 'snimka-zahradnik.jpg'), width: 1600, crop: { top: 0.09, bottom: 0.09 } },
    { id: 'garden/closeup', photo: join(dir, 'snimka-priblizenie.jpg'), width: 1600 },
    { id: 'garden/rain', photo: join(dir, 'snimka-dazd.jpg'), width: 1600 },
  ];
}

function speechCards() {
  const readme = read('parkinsons-speech-da', 'README.md');
  const accent = accents.speech;
  const inDomain = markdownTable(readme, '| Speech Task (Domain) |');
  const multi = markdownTable(readme, '| Target Domain |');
  const csv = read('parkinsons-speech-da', 'reports/pcgita/04_pairwise_all_methods.csv')
    .trim()
    .split('\n')
    .slice(1)
    .map((l) => l.split(','));
  const pairs = [...new Set(csv.map((r) => `${r[0]} > ${r[1]}`))];
  const methods = [...new Set(csv.map((r) => r[2]))];
  const values = pairs.map((pair) =>
    methods.map((method) => {
      const row = csv.find((r) => `${r[0]} > ${r[1]}` === pair && r[2] === method);
      if (!row) throw new Error(`missing ${pair} ${method}`);
      return Number(row[3]);
    }),
  );
  const [w, h] = inner('wide');
  const [sw, sh] = inner('square', 96, 92);
  return [
    {
      id: 'speech/in-domain',
      size: 'wide',
      html: svgCard({
        size: 'wide',
        accent,
        title: 'In-domain ROC AUC by speaking task',
        meta: 'README.md',
        note: 'Five-fold patient-wise cross-validation, five seeds. This is the upper bound for transfer.',
        svg: horizontalBars({
          width: w,
          height: h - 18,
          accent,
          domain: [0.5, 1],
          rows: inDomain.map((r) => ({ label: r[0], value: Number(r[1]) })),
        }),
      }),
    },
    {
      id: 'speech/multi-source',
      size: 'wide',
      html: svgCard({
        size: 'wide',
        accent,
        title: 'Leave one task out: best mean AUC per target',
        meta: 'README.md',
        svg: horizontalBars({
          width: w,
          height: h,
          accent,
          domain: [0.5, 1],
          rows: multi.map((r) => ({ label: r[0], value: Number(r[2]), note: r[1] })),
        }),
      }),
    },
    {
      id: 'speech/transfer',
      size: 'wide',
      html: svgCard({
        size: 'wide',
        accent,
        title: 'Cross-task transfer: mean AUC by method',
        meta: 'reports/pcgita/04_pairwise_all_methods.csv',
        svg: heatmap({
          width: w,
          height: h,
          accent,
          domain: [0.5, 0.9],
          labelWidth: 150,
          rowLabels: pairs,
          columnLabels: methods.map((m) => m.replace('_source', '').replace('_', ' ')),
          values,
        }),
      }),
    },
    {
      id: 'speech/protocol',
      size: 'square',
      html: svgCard({
        size: 'square',
        accent,
        title: 'Patient-wise protocol',
        meta: 'PCGITA_EXPERIMENTS.md',
        svg: diagram({
          width: sw,
          height: sh,
          accent,
          nodes: [
            { id: 'corpus', label: 'PC-GITA', sub: '100 speakers, 7 tasks', x: sw / 2, y: 40, w: 200, h: 52 },
            {
              id: 'adapt',
              label: '60 speakers',
              sub: 'labelled source task',
              x: sw / 2 - 110,
              y: sh / 2 + 10,
              w: 180,
              h: 52,
              tone: 'accent',
            },
            { id: 'test', label: '40 speakers', sub: 'target task, test only', x: sw / 2 + 110, y: sh / 2 + 10, w: 180, h: 52 },
            { id: 'unlab', label: 'Target task', sub: 'labels never used', x: sw / 2 - 110, y: sh - 40, w: 180, h: 52, tone: 'muted' },
          ],
          edges: [
            { from: 'corpus', to: 'adapt' },
            { from: 'corpus', to: 'test' },
            { from: 'adapt', to: 'unlab', label: 'same speakers' },
          ],
        }),
      }),
    },
    {
      id: 'speech/grl',
      size: 'code',
      html: () =>
        code({
          repo: 'parkinsons-speech-da',
          file: 'src/models/domain_adaptation.py',
          ranges: [
            [57, 57],
            [64, 82],
          ],
          lang: 'python',
          size: 'code',
          accent,
          fontSize: 11,
        }),
    },
  ];
}

export function allCards() {
  return [...relayqCards(), ...phishlensCards(), ...gitpulseCards(), ...stockroomCards(), ...gardenCards(), ...speechCards()];
}

export { escapeHtml };
