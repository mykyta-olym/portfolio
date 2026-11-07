import type { Project } from '@/types/content';

import relayqFailures from '@/assets/work/relayq/failures.webp';
import relayqStates from '@/assets/work/relayq/states.webp';
import relayqDequeue from '@/assets/work/relayq/dequeue.webp';
import relayqThroughput from '@/assets/work/relayq/throughput.webp';
import relayqArchitecture from '@/assets/work/relayq/architecture.webp';
import phishlensScore from '@/assets/work/phishlens/score.webp';
import phishlensEvaluation from '@/assets/work/phishlens/evaluation.webp';
import phishlensPrevalence from '@/assets/work/phishlens/prevalence.webp';
import phishlensIntegrity from '@/assets/work/phishlens/integrity.webp';
import gitpulseStudent from '@/assets/work/gitpulse/student.webp';
import gitpulseChecks from '@/assets/work/gitpulse/checks.webp';
import gitpulsePipeline from '@/assets/work/gitpulse/pipeline.webp';
import gitpulseRules from '@/assets/work/gitpulse/rules.webp';
import stockroomConcurrency from '@/assets/work/stockroom/concurrency.webp';
import stockroomOrders from '@/assets/work/stockroom/orders.webp';
import stockroomCheckout from '@/assets/work/stockroom/checkout.webp';
import gardenPlay from '@/assets/work/garden/play.webp';
import gardenFlight from '@/assets/work/garden/flight.webp';
import gardenBook from '@/assets/work/garden/book.webp';
import gardenGardener from '@/assets/work/garden/gardener.webp';
import gardenCloseup from '@/assets/work/garden/closeup.webp';
import gardenRain from '@/assets/work/garden/rain.webp';
import speechInDomain from '@/assets/work/speech/in-domain.webp';
import speechTransfer from '@/assets/work/speech/transfer.webp';
import speechMultiSource from '@/assets/work/speech/multi-source.webp';
import speechProtocol from '@/assets/work/speech/protocol.webp';
import speechGrl from '@/assets/work/speech/grl.webp';

const github = (repo: string) => `https://github.com/mykyta-olym/${repo}`;

const media = {
  relayqFailures: {
    src: relayqFailures,
    kind: 'terminal',
    alt: 'Table of relayq failure tests: a killed worker job is redelivered after 2.0 seconds, a poison job ends in the dead letter queue after 3 deliveries, and a chaos run kills 34 workers with 0 jobs lost.',
  },
  relayqStates: {
    src: relayqStates,
    kind: 'diagram',
    alt: 'Diagram of relayq job states: delayed, ready, active with a lease, completed and dead letter, with the transitions between them.',
  },
  relayqDequeue: {
    src: relayqDequeue,
    kind: 'code',
    alt: 'The relayq dequeue Lua script, which pops jobs and leases them in one atomic step.',
  },
  relayqThroughput: {
    src: relayqThroughput,
    kind: 'chart',
    alt: 'Bar chart of relayq median throughput: 7,637 jobs per second enqueued one at a time, 17,774 in batches of 100, 4,096 processing a full queue, 3,571 producing and processing together.',
  },
  relayqArchitecture: {
    src: relayqArchitecture,
    kind: 'diagram',
    alt: 'relayq components: Go producers and HTTP callers reach Redis through the client, workers lease and acknowledge jobs, and Prometheus scrapes the API.',
  },
  phishlensScore: {
    src: phishlensScore,
    kind: 'terminal',
    alt: 'Terminal output of phishlens score: a made-up phishing-style URL scores 0.958 and a GitHub URL scores 0.009, each with the three features that moved the score.',
  },
  phishlensEvaluation: {
    src: phishlensEvaluation,
    kind: 'chart',
    alt: 'Chart of phishlens F1 and ROC AUC on six test sets. On later dates and unseen domains F1 is 0.869 and ROC AUC 0.942; on two older outside datasets the scores are lower.',
  },
  phishlensPrevalence: {
    src: phishlensPrevalence,
    kind: 'chart',
    alt: 'Table of phishlens precision at realistic phishing shares of 5, 1 and 0.1 percent, falling from 0.458 to 0.016 at the default cut.',
  },
  phishlensIntegrity: {
    src: phishlensIntegrity,
    kind: 'code',
    alt: 'Python code that verifies the SHA-256 of the model file and its feature list before LightGBM parses it.',
  },
  gitpulseStudent: {
    src: gitpulseStudent,
    kind: 'screenshot',
    alt: 'GitPulse student view with a score trend, a skill profile and a week-by-week grid of passed and failed checks.',
  },
  gitpulseChecks: {
    src: gitpulseChecks,
    kind: 'screenshot',
    alt: 'GitPulse settings listing the teamwork checks with their categories and weights.',
  },
  gitpulsePipeline: {
    src: gitpulsePipeline,
    kind: 'diagram',
    alt: 'GitPulse event pipeline: a GitLab webhook passes three deduplication layers, is stored, processed on a high priority queue, then team metrics are recomputed, caches invalidated and open dashboards notified. Failures retry with backoff and end in a dead letter queue.',
  },
  gitpulseRules: {
    src: gitpulseRules,
    kind: 'code',
    alt: 'JSON definition of the first built-in GitPulse check, Issue Assigned, with its parameters.',
  },
  stockroomConcurrency: {
    src: stockroomConcurrency,
    kind: 'code',
    alt: 'Names of the stockroom concurrency tests, such as selling exactly the stock when 40 buyers race for 7 units, plus a control test that oversells without row locks.',
  },
  stockroomOrders: {
    src: stockroomOrders,
    kind: 'diagram',
    alt: 'stockroom order states: pending payment to paid, payment failed or cancelled; paid to shipped or cancelled; shipped to delivered.',
  },
  stockroomCheckout: {
    src: stockroomCheckout,
    kind: 'code',
    alt: 'TypeScript checkout code that locks the cart row, then product rows in id order, with SELECT FOR UPDATE.',
  },
  gardenPlay: {
    src: gardenPlay,
    kind: 'screenshot',
    alt: 'Isometric garden maze drawn in ink on paper, with hedges, trees, benches and a small figure on the path.',
  },
  gardenFlight: {
    src: gardenFlight,
    kind: 'screenshot',
    alt: 'A flight over the whole generated maze, seen from above on a book page.',
  },
  gardenBook: {
    src: gardenBook,
    kind: 'screenshot',
    alt: 'The game opens as a leather book on a wooden table, titled Garden of Lost Paths in Slovak.',
  },
  gardenGardener: {
    src: gardenGardener,
    kind: 'screenshot',
    alt: 'A villager speaks to the player in a speech bubble inside the garden maze.',
  },
  gardenCloseup: {
    src: gardenCloseup,
    kind: 'screenshot',
    alt: 'Zoomed-in view of the maze with an arch, benches and the player.',
  },
  gardenRain: {
    src: gardenRain,
    kind: 'screenshot',
    alt: 'The garden maze in the rain.',
  },
  speechInDomain: {
    src: speechInDomain,
    kind: 'chart',
    alt: 'Bar chart of in-domain ROC AUC by speaking task, from 0.920 for monologue to 0.768 for diadochokinetic tasks.',
  },
  speechTransfer: {
    src: speechTransfer,
    kind: 'chart',
    alt: 'Heatmap of mean AUC for six source to target task pairs and seven methods, including CORAL, MMD and DANN.',
  },
  speechMultiSource: {
    src: speechMultiSource,
    kind: 'chart',
    alt: 'Bar chart of the best mean AUC per target task when training on all other tasks; ExtraTrees is best for most targets.',
  },
  speechProtocol: {
    src: speechProtocol,
    kind: 'diagram',
    alt: 'Protocol diagram: 100 speakers split into 60 for adaptation and 40 for testing, with target labels never used during adaptation.',
  },
  speechGrl: {
    src: speechGrl,
    kind: 'code',
    alt: 'PyTorch gradient reversal function: identity on the forward pass and a negated, scaled gradient on the backward pass.',
  },
} as const satisfies Record<string, Project['gallery'][number]>;

export const projects: readonly Project[] = [
  {
    slug: 'relayq',
    name: 'relayq',
    repository: github('relayq'),
    summary: 'A background job queue for Go on Redis. In a chaos test that killed 34 workers during 20,000 jobs, no job was lost.',
    tagline: 'Leases, retries and a dead letter queue, with tests that kill workers and Redis on purpose.',
    tags: ['Go', 'Redis'],
    kind: 'Go library and service',
    stack: ['Go', 'Redis', 'Lua', 'Prometheus', 'Docker', 'GitHub Actions'],
    year: '2026',
    accent: '#c2553d',
    metrics: [
      { value: '0', label: 'jobs lost with 34 workers killed mid run' },
      { value: '2.0 s', label: 'until a job from a killed worker runs again' },
      { value: '11 of 11', label: 'deliberate bugs caught by the tests' },
    ],
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        paragraphs: [
          'relayq runs background jobs from a Redis-backed queue with at-least-once delivery. Jobs carry priorities, delays, timeouts and idempotency keys. Workers lease jobs, send heartbeats and retry with exponential backoff; a job that keeps failing moves to a dead letter queue and can be requeued.',
          'It ships as a Go library, an HTTP API with a small CLI, and Prometheus metrics for queue depth, handler time, lost leases and panics.',
        ],
      },
      {
        id: 'challenge',
        title: 'The challenge',
        paragraphs: [
          'A job must never end up in neither the ready set nor the active set, even when a process dies in the middle of a change. Every state change is one atomic Lua script, Redis TIME is the only clock, and a per-delivery token fences out workers that come back after their lease ran out.',
          'The failure suite starts real worker processes and real Redis containers and kills them: SIGKILL mid job, paused containers, Redis restarts under several persistence modes.',
        ],
      },
      {
        id: 'outcome',
        title: 'The outcome',
        paragraphs: [
          'With six worker processes and one killed about every 150 ms, 20,000 jobs finished: 34 workers killed, 244 leases redelivered, 0 jobs lost and 1 duplicate finish, which at-least-once delivery allows and the README says so.',
          'A mutation runner breaks one guarantee at a time in the source and requires a named test to fail. All 11 mutants were caught. Benchmarks are published with their ranges and with the caveat that they predate the last fix.',
        ],
      },
    ],
    strip: [media.relayqFailures, media.relayqStates, media.relayqDequeue],
    gallery: [media.relayqFailures, media.relayqStates, media.relayqThroughput, media.relayqArchitecture, media.relayqDequeue],
    featuredOnHome: true,
  },
  {
    slug: 'phishlens',
    name: 'phishlens',
    repository: github('phishlens'),
    summary:
      'Scores how likely a URL is to be phishing from the string alone. F1 0.869 on later dates and unseen domains, and the report shows where it falls short.',
    tagline: 'A LightGBM model over hand-built URL features, with explanations and an evaluation built to catch leakage.',
    tags: ['Python', 'ML'],
    kind: 'Python CLI and API',
    stack: ['Python', 'LightGBM', 'FastAPI', 'TreeSHAP', 'pytest', 'Docker'],
    year: '2026',
    accent: '#2f9a78',
    metrics: [
      { value: '0.869', label: 'F1 on later dates and unseen domains' },
      { value: '0.942', label: 'ROC AUC on the same test set' },
      { value: '379/s', label: 'URLs scored on one thread, with explanations' },
    ],
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        paragraphs: [
          'phishlens scores a URL without fetching it. A parser that never raises turns the string into hand-built features, a LightGBM model scores them, and TreeSHAP explains which parts of the URL pushed the score up or down.',
          'It runs as a CLI and as a FastAPI service with single and batch endpoints. The model is stored as text rather than a pickle, and its SHA-256 and feature list are checked before it is loaded.',
        ],
      },
      {
        id: 'challenge',
        title: 'The challenge',
        paragraphs: [
          'URL classifiers often look better than they are because the same domains, or near copies of the same URLs, end up on both sides of the split. Here the test set uses later dates, registered domains are kept apart, and two outside datasets show how the model travels.',
          'A harmless edit test checks that adding something like a tracking parameter does not move a score, and another test fails if the numbers in the docs drift from the stored metrics.',
        ],
      },
      {
        id: 'outcome',
        title: 'The outcome',
        paragraphs: [
          'On later dates and unseen domains: precision 0.915, recall 0.828, F1 0.869 and ROC AUC 0.942. A character n-gram baseline reached ROC AUC 0.959 on the same data, scores drop on the older outside datasets, and precision falls when phishing is rare. All of it is in the report.',
          'Scoring runs at 379 URLs per second on one thread with explanations, and two training runs produced a byte-identical model.',
        ],
      },
    ],
    strip: [media.phishlensScore, media.phishlensPrevalence, media.phishlensIntegrity],
    gallery: [media.phishlensScore, media.phishlensEvaluation, media.phishlensPrevalence, media.phishlensIntegrity],
    featuredOnHome: true,
  },
  {
    slug: 'gitpulse',
    name: 'GitPulse',
    repository: github('gitpulse'),
    summary:
      'Teamwork analytics for GitLab. Webhooks feed priority queues, 13 configurable checks score each student every week, and dashboards update live.',
    tagline: 'Webhook-driven analytics for team projects on GitLab, with a rule engine, live dashboards and monitoring as code.',
    tags: ['Python', 'FastAPI'],
    kind: 'Web application',
    stack: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'RQ', 'htmx', 'Prometheus', 'Grafana'],
    year: '2026',
    accent: '#6d5fd8',
    metrics: [
      { value: '13', label: 'teamwork checks, reweightable and extendable' },
      { value: '195', label: 'routes across the API, dashboard and live streams' },
      { value: '18', label: 'Prometheus alert rules shipped with the code' },
    ],
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        paragraphs: [
          'GitPulse receives GitLab webhooks for merge requests, issues, pipelines and pushes, stores them, and recomputes the affected team on background workers. A rule engine scores each student weekly against 13 checks, such as review given, tests written or pipeline green, which can be reweighted, switched off or extended with custom rules.',
          'Teachers and students get dashboards with score trends, skill profiles and week-by-week heatmaps, in Slovak and English.',
        ],
      },
      {
        id: 'challenge',
        title: 'The challenge',
        paragraphs: [
          'There is no polling and no scheduler: every change arrives as an event. A webhook passes three deduplication layers, is stored as an immutable record, and is processed on a high priority queue with retries and a dead letter queue. After that the team metrics are recomputed, caches are dropped and open dashboards are notified over Server-Sent Events.',
          'Security is part of the design: GitLab OAuth sessions, CSRF tokens, bcrypt-hashed webhook secrets, encrypted GitLab tokens and rate limits.',
        ],
      },
      {
        id: 'outcome',
        title: 'The outcome',
        paragraphs: [
          'The application serves 195 routes on PostgreSQL 16 and Redis 7, with a Slovak catalogue of 3,489 interface strings. Prometheus, Grafana and Jaeger come as an optional profile with a provisioned dashboard and 18 alert rules.',
        ],
      },
    ],
    strip: [media.gitpulseStudent, media.gitpulseRules, media.gitpulseChecks],
    gallery: [media.gitpulseStudent, media.gitpulsePipeline, media.gitpulseChecks, media.gitpulseRules],
    featuredOnHome: true,
  },
  {
    slug: 'stockroom',
    name: 'stockroom',
    repository: github('stockroom'),
    summary:
      'The server core of an electronic components shop. Checkout locks rows in a fixed order, and concurrency tests check that stock never oversells.',
    tagline: 'Parametric search, exact pricing and a transactional checkout on PostgreSQL, tested with many buyers at once.',
    tags: ['TypeScript', 'PostgreSQL'],
    kind: 'TypeScript backend',
    stack: ['TypeScript', 'PostgreSQL', 'Drizzle ORM', 'Zod', 'Vitest', 'Docker'],
    year: '2026',
    accent: '#c8913a',
    metrics: [
      { value: '40 / 7', label: 'buyers racing for units in one test' },
      { value: '6', label: 'order states, with every transition in one map' },
      { value: '1', label: 'control test that proves the race is real' },
    ],
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        paragraphs: [
          'stockroom is the domain and server layer of an electronic components shop: parametric catalogue search, engineering values with SI prefixes such as 4.7 kOhm or 100 nF, quantity-break pricing in integer cents, carts, a checkout behind a pluggable payment interface, and an order state machine that returns stock on cancellation.',
        ],
      },
      {
        id: 'challenge',
        title: 'The challenge',
        paragraphs: [
          'Two buyers must never get the last unit. Checkout locks the cart row and then the product rows with SELECT ... FOR UPDATE in a fixed order, so two orders that share products queue in the same sequence and cannot deadlock. A conditional stock guard and a stock movement ledger are written in the same transaction.',
        ],
      },
      {
        id: 'outcome',
        title: 'The outcome',
        paragraphs: [
          'Integration tests run simultaneous buyers against a real PostgreSQL: 40 buyers race for 7 units, carts hold the same products in opposite orders, the same form is submitted twice at once. A control test runs checkout without row locks and oversells, which shows the race in the other tests is real.',
          'The domain layer has no web framework or database dependency and is unit-tested on its own.',
        ],
      },
    ],
    strip: [media.stockroomConcurrency, media.stockroomOrders, media.stockroomCheckout],
    gallery: [media.stockroomConcurrency, media.stockroomCheckout, media.stockroomOrders],
    featuredOnHome: false,
  },
  {
    slug: 'garden-of-lost-paths',
    name: 'Garden of Lost Paths',
    repository: github('zahrada-stratenych-ciest'),
    summary: 'An isometric storybook maze in Phaser 4. Seeded mazes from rot.js, A* hints, and narration synced word by word to the page.',
    tagline: 'A procedurally generated garden maze, drawn as an illustrated storybook and played in the browser.',
    tags: ['JavaScript', 'Phaser'],
    kind: 'Browser game',
    stack: ['JavaScript', 'Phaser 4', 'rot.js', 'Playwright', 'Python tooling'],
    year: '2026',
    accent: '#a08458',
    metrics: [
      { value: '2:1', label: 'isometric projection with its own depth sorting' },
      { value: 'A*', label: 'route finding for hints and auto-walk' },
      { value: '0', label: 'build steps: it runs from static files' },
    ],
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        paragraphs: [
          'Each garden is generated from a seed with rot.js and drawn in a 2:1 isometric projection, with camera zoom and pan and depth sorting across terrain, hedges, characters and particles. A storybook interface frames the game with page-turning chapters, bookmarks and settings; there is rain, ambient sound and villagers who walk the paths.',
        ],
      },
      {
        id: 'challenge',
        title: 'The challenge',
        paragraphs: [
          'Isometric scenes break easily: a hedge drawn in the wrong order covers the player. The game uses its own isometric coordinate system and painter-order layering. Narration lines carry per-word timestamps, so the text on the page appears in rhythm with the voice, and A* routing powers the hint and auto-walk keys.',
        ],
      },
      {
        id: 'outcome',
        title: 'The outcome',
        paragraphs: [
          'The game runs from static files with no build step. Tooling packs sprite atlases, and a Playwright script plays the game to capture the screenshots on this page and a demo video.',
        ],
      },
    ],
    strip: [media.gardenPlay, media.gardenBook, media.gardenFlight],
    gallery: [media.gardenPlay, media.gardenFlight, media.gardenGardener, media.gardenCloseup, media.gardenRain, media.gardenBook],
    credits:
      'Illustrations and sounds are third-party assets credited in the repository: the city game tileset by Withering Systems and Comigo UI elements (CC BY 4.0) and CC0 assets from OpenGameArt, Poly Haven, Kenney and Freesound. Narration voices were synthesised with ElevenLabs. The code is original.',
    featuredOnHome: false,
  },
  {
    slug: 'speech-domain-adaptation',
    name: 'Speech Domain Adaptation',
    repository: github('parkinsons-speech-da'),
    summary:
      "Detecting Parkinson's disease from speech when a model moves between speaking tasks. Adaptation methods written in PyTorch, judged on patient-wise splits.",
    tagline:
      'Domain adaptation compared on acoustic features, spectrogram CNNs and wav2vec 2.0 embeddings, with no speaker in both training and test.',
    tags: ['Python', 'PyTorch'],
    kind: 'Machine learning study',
    stack: ['Python', 'PyTorch', 'scikit-learn', 'wav2vec 2.0', 'pandas', 'matplotlib'],
    year: '2026',
    accent: '#4a86c8',
    metrics: [
      { value: '0.920', label: 'in-domain ROC AUC on the monologue task' },
      { value: '0.870', label: 'AUC for sentences to words with linear CORAL' },
      { value: '5', label: 'seeds behind every reported mean' },
    ],
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        paragraphs: [
          "The study uses the PC-GITA speech corpus: 100 speakers, half of them with Parkinson's disease, recorded across seven speaking tasks such as vowels, sentences and a monologue. It extracts 47 acoustic features per recording, log-mel spectrograms and frozen wav2vec 2.0 embeddings, then measures how well a model trained on one task works on another.",
        ],
      },
      {
        id: 'challenge',
        title: 'The challenge',
        paragraphs: [
          'Speech models learn the speaker as easily as the disease. Test speakers never appear in training or in the unlabelled target data, and target labels are not used during adaptation. CORAL, Deep CORAL, MMD, DANN with gradient reversal and CDAN are implemented from scratch in PyTorch.',
        ],
      },
      {
        id: 'outcome',
        title: 'The outcome',
        paragraphs: [
          'In-domain, the monologue task reaches ROC AUC 0.920. Across tasks, linear CORAL transfers sentences to words at a mean AUC of 0.870. A plain ExtraTrees model is the best method for most targets when training on all other tasks, and the write-up reports that rather than favouring the deep methods.',
        ],
      },
    ],
    strip: [media.speechTransfer, media.speechProtocol, media.speechGrl],
    gallery: [media.speechInDomain, media.speechTransfer, media.speechMultiSource, media.speechProtocol, media.speechGrl],
    featuredOnHome: false,
  },
];

export const featuredProjects = projects.filter((project) => project.featuredOnHome);

export function projectBySlug(slug: string): Project {
  const project = projects.find((item) => item.slug === slug);
  if (!project) throw new Error(`Unknown project: ${slug}`);
  return project;
}

export { media as projectMedia };
