// Portfolio plates: actual captures and source-derived diagrams. No invented product UI.
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
const esc = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

const root = resolve(import.meta.dirname, '../../..');
const repos = resolve(root, '..');
const capture = (name) => join(root, '.media-cache/project-captures', name);
const read = (repo, file) => readFileSync(join(repos, repo, file), 'utf8');
const font = `@font-face{font-family:Figtree;src:url('/node_modules/@fontsource-variable/figtree/files/figtree-latin-wght-normal.woff2')}@font-face{font-family:Mono;src:url('/node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2')}`;

function plate(title, eyebrow, body, footer, light = false) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${font}
*{box-sizing:border-box;margin:0}body{font-family:Figtree,sans-serif;-webkit-font-smoothing:antialiased}#card{width:1200px;height:750px;overflow:hidden;position:relative;background:${light ? '#ecebe5' : '#161718'};color:${light ? '#202223' : '#ecece8'};padding:54px 60px}
.eyebrow,.foot,.micro{font:14px/1.4 Mono,monospace;letter-spacing:.07em;text-transform:uppercase}.eyebrow{opacity:.55;display:flex;justify-content:space-between}.title{font-size:58px;line-height:1.05;letter-spacing:-.045em;font-weight:450;margin-top:17px}.foot{position:absolute;bottom:30px;left:60px;right:60px;display:flex;justify-content:space-between;opacity:.5;font-size:12px;text-transform:none;letter-spacing:.025em}.art{position:absolute;inset:190px 60px 74px}.split{display:grid;grid-template-columns:1fr 1fr;gap:28px;height:100%}.panel{border:1px solid #ffffff20;border-radius:12px;padding:28px;background:#1d1e20}.light .panel{border-color:#2222;background:#f8f8f3}.label{font:13px Mono;letter-spacing:.06em;text-transform:uppercase;opacity:.5}.big{font-size:102px;letter-spacing:-.065em;line-height:1.1;font-weight:400}.body{font-size:22px;line-height:1.35;opacity:.7}.muted{opacity:.45}.chip{display:inline-block;padding:9px 14px;border:1px solid #8886;border-radius:50px;font:14px Mono}.rule{border-top:1px solid #8885;margin-top:22px;padding-top:22px}.shot{height:100%;width:100%;object-fit:contain;display:block}.screen{height:100%;border:7px solid #313234;border-radius:11px;background:#ededed;box-shadow:0 24px 50px #0004;overflow:hidden}.screen img{display:block;width:100%;height:100%;object-fit:contain}.metric{border-top:1px solid #8885;padding-top:18px;display:flex;justify-content:space-between;align-items:center}.metric strong{font-size:50px;letter-spacing:-.04em;font-weight:400}svg{width:100%;height:100%;overflow:visible}svg text{font-family:Figtree,sans-serif;fill:currentColor}svg .mono{font-family:Mono,monospace}.table{display:grid;gap:1px;background:#8883;border:1px solid #8883}.tr{display:grid;grid-template-columns:2.2fr 1fr 1fr;gap:20px;padding:17px 24px;background:#161718;font-size:21px}.light .tr{background:#ecebe5}.tr.head{font:13px Mono;text-transform:uppercase;opacity:.7}.bar{height:18px;background:#7774;border-radius:2px;overflow:hidden}.bar i{display:block;height:100%;background:#deded7}
</style></head><body><div id="card" class="${light ? 'light' : ''}"><div class="eyebrow"><span>${eyebrow}</span><span>Mykyta Olym / Selected work</span></div><h1 class="title">${title}</h1><div class="art">${body}</div><div class="foot"><span>${footer}</span><span>2026</span></div></div></body></html>`;
}
const svg = (body, view = '0 0 1080 470') => `<svg viewBox="${view}" fill="none" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
const text = (x, y, t, s = 22, extra = '') => `<text x="${x}" y="${y}" font-size="${s}" ${extra}>${esc(t)}</text>`;
const line = (x1, y1, x2, y2, extra = '') => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="currentColor" stroke-opacity=".3" ${extra}/>`;
const box = (x, y, w, h, label, sub = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#222426" stroke="#ffffff32"/>${text(x + 22, y + 35, label, 24)}${sub ? text(x + 22, y + 61, sub, 14, 'opacity=".5" class="mono"') : ''}`;
const card = (id, title, eyebrow, body, footer, light = false, assets) => ({
  id,
  html: plate(title, eyebrow, body, footer, light),
  assets,
});

function relay() {
  const jobs = Array.from(
    { length: 6 },
    (_, i) =>
      `<g transform="translate(${75 + i * 36},${170 - i * 13})"><rect width="225" height="118" rx="8" fill="${i === 5 ? '#e2e3dd' : '#292b2d'}" stroke="#666"/><path d="M22 26h102M22 42h64M22 70h140" stroke="${i === 5 ? '#333' : '#777'}" stroke-width="3"/>${i === 5 ? text(22, 100, 'JOB / 006', 14, 'style="fill:#333" class="mono"') : ''}</g>`,
  ).join('');
  const cover = svg(
    `<defs><pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="#777" opacity=".35"/></pattern></defs><rect width="1080" height="470" fill="url(#grid)"/>${jobs}${line(480, 190, 670, 190)}${line(670, 190, 670, 90)}${line(670, 190, 670, 290)}${line(670, 90, 730, 90)}${line(670, 190, 730, 190)}${line(670, 290, 730, 290)}${[0, 1, 2].map((i) => box(730, 48 + i * 100, 285, 78, `Worker 0${i + 1}`, i === 1 ? 'lease expired → retry' : 'heartbeat / acknowledge')).join('')}${text(80, 418, 'Redis-backed jobs. Built to survive a dead worker.', 24)}`,
  );
  const states = svg(
    `${box(30, 170, 180, 86, 'Ready', 'priority queue')}${box(330, 170, 210, 86, 'Active', 'delivery token + lease')}${box(680, 65, 245, 86, 'Completed', 'acknowledged')}${box(680, 285, 245, 86, 'Dead letter', 'attempts exhausted')}${line(210, 213, 330, 213)}${line(540, 213, 620, 213)}${line(620, 213, 620, 108)}${line(620, 108, 680, 108)}${line(620, 213, 620, 328)}${line(620, 328, 680, 328)}<path d="M435 170V62H120V170" stroke="#b9bab4" stroke-dasharray="6 6"/>${text(200, 44, 'Lease expired / retry', 18)}${text(570, 200, '✓', 22)}${text(30, 420, 'A state change is one atomic Lua script.', 25)}`,
  );
  return [
    card('relayq/cover', 'relayq', '01 / Distributed systems', cover, 'Go · Redis · Lua / Architecture illustration'),
    card('relayq/states', 'One job. Every state accounted for.', 'relayq / Delivery lifecycle', states, 'Source: README.md · lua/'),
    card(
      'relayq/failures',
      'Pull the plug. Keep the job.',
      'relayq / Failure suite',
      `<div class="split"><div class="panel"><div class="label">Chaos test / 20,000 jobs</div><div class="big" style="margin-top:34px">0 lost</div><p class="body rule">34 workers killed.<br>244 leases redelivered.<br>1 duplicate finish — delivery is at least once.</p></div><div class="panel"><div class="label">Worker killed mid-job</div><div class="big" style="margin-top:34px">2.0<span style="font-size:48px"> s</span></div><p class="body rule">The same job runs again<br>after its lease expires.</p><div class="metric" style="margin-top:30px"><span class="body">Mutation checks</span><strong>11 / 11</strong></div></div></div>`,
      'Source: README.md / Recorded failure tests',
    ),
  ];
}
function phish() {
  return [
    card(
      'phishlens/cover',
      'phishlens',
      '02 / Explainable machine learning',
      svg(
        `<rect x="0" y="35" width="1080" height="106" rx="12" fill="#242628" stroke="#ffffff30"/>${text(32, 78, 'URL STRING → FEATURES → LIGHTGBM → EXPLANATION', 14, 'class="mono" opacity=".5"')}${text(32, 116, 'paypal.secure-login.example.com / verify / account.php', 29)}<circle cx="205" cy="300" r="117" stroke="#777" stroke-width="2"/><circle cx="205" cy="300" r="102" stroke="#ecece8" stroke-width="7" stroke-dasharray="485 641" transform="rotate(-90 205 300)"/>${text(205, 305, '0.756', 52, 'text-anchor="middle"')}${text(205, 340, 'likely_phishing', 14, 'class="mono" text-anchor="middle" opacity=".5"')}${[
          [219, 1.92, 'Brand name in the subdomain'],
          [293, 0.93, 'Length of the host name'],
          [367, 0.48, 'Credential words in the path'],
        ]
          .map(
            ([y, v, t]) =>
              `${text(430, y, t, 22)}<rect x="430" y="${y + 14}" width="${v * 245}" height="8" rx="4" fill="#d5d6d0"/>${text(1030, y, `+${v.toFixed(2)}`, 22, 'text-anchor="end" class="mono"')}`,
          )
          .join('')}`,
      ),
      'Actual CLI output / Example URL · Model score is not a safety verdict',
    ),
    card(
      'phishlens/score',
      'Read the signal behind the score.',
      'phishlens / CLI capture',
      `<div class="panel" style="height:100%;padding:36px"><p class="label">uv run phishlens score --top 3</p><p style="font:19px Mono;margin-top:28px">http://paypal.secure-login.example.com/verify/account.php</p><div style="display:flex;align-items:baseline;gap:28px;margin:30px 0"><span class="big">0.756</span><span class="chip">likely_phishing</span></div><p class="body" style="font-family:Mono;font-size:20px;line-height:1.9">+1.92 &nbsp; brand name in the subdomain<br>+0.93 &nbsp; length of the host name<br>+0.48 &nbsp; credential or alert words in the path</p></div>`,
      'Captured 2026-11-08 / Contributions are log-odds; the URL is never fetched',
    ),
    card(
      'phishlens/evaluation',
      'A split that makes leakage visible.',
      'phishlens / Evaluation',
      `<div class="table"><div class="tr head"><span>Test set</span><span>F1</span><span>ROC AUC</span></div>${[
        ['Later dates, unseen domains', '.869', '.942'],
        ['Random row split', '.929', '.989'],
        ['Split by domain', '.901', '.979'],
        ['Hannousse / external', '.646', '.700'],
        ['PhiUSIIL / external', '.571', '.734'],
      ]
        .map((r) => `<div class="tr">${r.map((c) => `<span>${c}</span>`).join('')}</div>`)
        .join(
          '',
        )}</div><p class="body" style="margin-top:28px">Results fall on outside datasets. That limitation belongs in the result.</p>`,
      'Source: reports/metrics.json · README.md',
    ),
    card(
      'phishlens/prevalence',
      'A rare threat changes the odds.',
      'phishlens / Realistic prevalence',
      `<div class="split" style="grid-template-columns:1fr 1.5fr"><div><div class="big" style="margin-top:36px">1%</div><p class="body">phishing share</p><p class="body rule">At the default cut,<br>precision is only 13.9%.</p></div><div class="panel"><div class="label">Precision / default threshold</div>${[
        [5, 0.458],
        [1, 0.139],
        [0.1, 0.016],
      ]
        .map(
          ([p, v]) =>
            `<div style="display:grid;grid-template-columns:70px 1fr 72px;gap:20px;align-items:center;margin-top:55px;font-size:23px"><span>${p}%</span><div class="bar"><i style="width:${v * 100}%"></i></div><span>${(v * 100).toFixed(1)}%</span></div>`,
        )
        .join('')}<p class="label" style="margin-top:45px">Treat a flag as a reason to investigate.</p></div></div>`,
      'Source: reports/metrics.json / Prevalence experiment',
    ),
  ];
}
function stock() {
  const cells = Array.from({ length: 40 }, (_, i) => {
    const x = 42 + (i % 10) * 99,
      y = 24 + Math.floor(i / 10) * 91;
    return `<rect x="${x}" y="${y}" width="80" height="67" rx="5" fill="${i < 7 ? '#e5e5de' : '#222426'}" stroke="#7776"/>${text(x + 40, y + 42, String(i + 1).padStart(2, '0'), 21, `text-anchor="middle" style="fill:${i < 7 ? '#222' : '#666'}" class="mono"`)}`;
  }).join('');
  return [
    card(
      'stockroom/cover',
      'stockroom',
      '04 / Transactional commerce',
      svg(`${cells}${text(40, 438, '40 simultaneous buyers. 7 units. Exactly 7 sales.', 28)}`),
      'Integration-test scenario / PostgreSQL row locks',
    ),
    card(
      'stockroom/concurrency',
      'The last unit is sold once.',
      'stockroom / Concurrency tests',
      `<div class="split"><div class="panel"><div class="label">Many buyers / one stock count</div><div class="big" style="margin:30px 0">40 → 7</div><p class="body">Exactly the available stock is sold.<br>Mixed quantities never oversell.</p><p class="body rule">Opposite product order?<br>No deadlock.</p></div><div class="panel"><div class="label">Repeat submission</div><div class="big" style="margin:30px 0">2 → 1</div><p class="body">Two concurrent submits.<br>One order.</p><p class="body rule">The unlocked control oversells,<br>proving the race is real.</p></div></div>`,
      'Re-run 2026-11-08 / tests/integration/concurrency.test.ts',
    ),
    card(
      'stockroom/orders',
      'From checkout to delivery.',
      'stockroom / Order lifecycle',
      svg(
        `${box(32, 165, 230, 90, 'Pending payment')}${box(384, 165, 180, 90, 'Paid')}${box(685, 165, 160, 90, 'Shipped')}${box(940, 165, 140, 90, 'Delivered')}${line(262, 210, 384, 210)}${line(564, 210, 685, 210)}${line(845, 210, 940, 210)}${box(48, 365, 210, 74, 'Payment failed')}${box(390, 365, 210, 74, 'Cancelled')}${line(150, 255, 150, 365)}${line(248, 255, 495, 365)}${line(474, 255, 495, 365)}${text(35, 80, 'Explicit transitions. Stock returned on cancellation.', 25)}`,
      ),
      'Source: src/domain/order-status.ts',
    ),
  ];
}
function gitpulse() {
  const shot = (key, title, eyebrow, file, footer) =>
    card(
      key,
      title,
      eyebrow,
      key === 'gitpulse/student'
        ? `<div class="screen" style="height:423px;margin-top:30px"><img src="{{shot}}" style="height:auto" alt=""></div>`
        : `<div class="screen"><img src="{{shot}}" alt=""></div>`,
      footer,
      true,
      { shot: capture(file) },
    );
  return [
    shot('gitpulse/cover', 'GitPulse', '03 / Teamwork analytics', 'gitpulse-course.png', 'Actual app / Seeded demonstration course'),
    shot(
      'gitpulse/student',
      'See the work behind the score.',
      'GitPulse / Student progress',
      'gitpulse-student.png',
      'Actual app / Synthetic demo students',
    ),
    shot(
      'gitpulse/checks',
      'A course, at a glance.',
      'GitPulse / Analytics',
      'gitpulse-analytics.png',
      'Actual app / Synthetic demo course',
    ),
    shot(
      'gitpulse/dashboard',
      'One place for every team.',
      'GitPulse / Teacher dashboard',
      'gitpulse-dashboard.png',
      'Actual app / Seeded demonstration data',
    ),
  ];
}
function garden() {
  const shot = (id, title, file) =>
    card(
      `garden/${id}`,
      title,
      '05 / Garden of Lost Paths',
      `<div class="screen" style="border:0;background:transparent;box-shadow:none"><img src="{{shot}}" alt=""></div>`,
      'Actual gameplay / Phaser 4 · rot.js',
      true,
      { shot: capture(file) },
    );
  return [
    shot('cover', 'A garden, between the pages.', 'garden-play.png'),
    shot('play', 'Find your way through the ink.', 'garden-walk.png'),
    shot('book', 'Every journey starts with a page.', 'garden-book.png'),
    shot('flight', 'A world grown from a seed.', 'garden-prologue.png'),
  ];
}
function speech() {
  const csv = read('parkinsons-speech-da', 'reports/pcgita/05_domain_gap.csv')
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((l) => l.split(','));
  const mono = csv.find((r) => r[0] === 'monologue');
  if (!mono) throw new Error('Missing monologue experiment');
  const wave = Array.from({ length: 120 }, (_, i) => {
    const amp = Math.sin(i * 0.39) * Math.cos(i * 0.13) * Math.sin(i * 0.087) ** 2 * 90;
    return `M${i * 8 + 55} ${180 - Math.abs(amp)}v${Math.max(4, Math.abs(amp) * 2)}`;
  }).join('');
  return [
    card(
      'speech/cover',
      'Voice, across domains.',
      '06 / Speech domain adaptation',
      svg(
        `<path d="${wave}" stroke="#d7d8d1" stroke-width="4" stroke-linecap="round"/>${line(30, 315, 1050, 315)}${text(45, 383, '7 speaking tasks', 31)}${text(440, 383, '100 speakers', 31)}${text(815, 383, '5 seeds', 31)}${text(45, 425, 'PC-GITA / Patient-wise evaluation', 17, 'opacity=".5" class="mono"')}`,
      ),
      'Conceptual waveform / Experiment structure from PCGITA_EXPERIMENTS.md',
    ),
    card(
      'speech/in-domain',
      'A voice changes with the task.',
      'Speech benchmark / In-domain ROC AUC',
      svg(
        `${[
          ['Monologue', 0.92],
          ['Words', 0.878],
          ['Sentences 2', 0.862],
          ['Reading', 0.838],
          ['Vowels', 0.794],
          ['DDK', 0.768],
        ]
          .map(
            ([label, v], i) =>
              `${text(0, 52 + i * 66, label, 24)}<rect x="205" y="${26 + i * 66}" width="700" height="30" rx="3" fill="#8882"/><rect x="205" y="${26 + i * 66}" width="${v * 700}" height="30" rx="3" fill="#cbcdc5"/>${text(1030, 51 + i * 66, v.toFixed(3), 25, 'text-anchor="end" class="mono"')}`,
          )
          .join('')}`,
      ),
      'Source: README.md / Patient-wise cross-validation',
    ),
    card(
      'speech/multi-source',
      'Generalisation is the experiment.',
      'Speech benchmark / Leave one task out',
      `<div class="split" style="grid-template-columns:.8fr 1.5fr"><div><div class="big" style="margin-top:20px">${Number(mono[2]).toFixed(3)}</div><p class="body">AUC / held-out monologue</p><p class="body rule">Train on other tasks.<br>Test on unseen speakers.</p></div><div class="table"><div class="tr head" style="grid-template-columns:1.5fr 1fr 1fr"><span>Task</span><span>In domain</span><span>Transfer</span></div>${csv
        .filter((r) => ['monologue', 'words', 'vowels', 'ddk'].includes(r[0]))
        .map(
          (r) =>
            `<div class="tr" style="grid-template-columns:1.5fr 1fr 1fr"><span>${r[0]}</span><span>${Number(r[1]).toFixed(3)}</span><span>${Number(r[2]).toFixed(3)}</span></div>`,
        )
        .join('')}</div></div>`,
      'Source: reports/pcgita/05_domain_gap.csv / Synthetic waveform on cover',
    ),
    card(
      'speech/protocol',
      'Keep the patient split intact.',
      'Speech benchmark / Evaluation protocol',
      svg(
        `${box(365, 15, 330, 90, 'PC-GITA', '100 speakers / 7 tasks')}${box(80, 200, 350, 90, '60 adaptation speakers', 'labelled source / unlabelled target')}${box(650, 200, 350, 90, '40 test speakers', 'target task / evaluation only')}${line(530, 105, 255, 200)}${line(530, 105, 825, 200)}${line(540, 170, 540, 420, 'stroke-dasharray="5 7"')}${text(65, 400, 'No speaker overlap.', 29)}${text(650, 400, 'No target labels during adaptation.', 25)}`,
      ),
      'Source: PCGITA_EXPERIMENTS.md / Five-seed evaluation',
    ),
  ];
}

export function presentationCards() {
  return [...relay(), ...phish(), ...gitpulse(), ...stock(), ...garden(), ...speech()];
}
