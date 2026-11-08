# Mykyta Olym, portfolio

Personal portfolio of Mykyta Olym, a software developer in Košice. It presents six public
projects with case studies, written from their repositories: what each one does, how it was
built and what its tests and measurements show.

Live: https://mykyta-olym.github.io/portfolio/

## Stack

- [Astro 7](https://astro.build) with static output: every route is a real HTML file, so
  nested pages work on reload and without JavaScript.
- TypeScript in strict mode for all page scripts and data.
- [GSAP 3](https://gsap.com) with ScrollTrigger, SplitText, ScrambleText, Draggable, Inertia, CustomEase and ScrollToPlugin for the motion system.
- [Swiper](https://swiperjs.com) for the project carousels and continuous tool-logo strip.
- [Typed.js](https://github.com/mattboldt/typed.js/tree/v2.1.0) for navigation typing and its persistent cursor.
- [Three.js](https://threejs.org) for the photographic About field, adapting the reference's camera and curved-plane motion.
- Plain CSS with design tokens in `src/styles/tokens.css`; component styles are scoped.
- Self-hosted Inter, Inter Tight, Figtree and IBM Plex Mono from Fontsource (SIL OFL).
- Vitest for unit tests, Playwright and axe-core for end-to-end and accessibility tests.

About loads WebGL on demand and pauses its renderer when idle, offscreen or in a background tab.
Other reference animations ship as video and animated WebP; the laptop banner is a still image.
Sources and the laptop edit prompt are in [ASSETS.md](ASSETS.md).

## What is on the site

- Home: the reference's synchronized four-beat loader, the monochrome hero loop, a scroll-linked line reveal,
  a two-sided orbit of real work artifacts, a pinned list of disciplines with matching examples, a picture that shrinks into a frame, selected
  projects with Swiper image strips, contact and FAQ, and a footer that reveals itself
  under the page with a pixel wordmark that reacts to the pointer.
- Work: all six projects.
- Case studies: a neutral illustrated background specific to each subject, a sticky panel with stack, key numbers and tabbed sections next to a column
  of real visuals: screenshots, verbatim code, diagrams and charts drawn from each repository.
- About: a draggable field of faceless process photographs and design imagery, a short prologue and working principles.
- Contact: the reference's animated cubic background and paper cards, with Mykyta's links and email copy control; a 404 page.

Page changes use the reference's four rising horizontal slices and white pause through
native cross-document View Transitions. Browsers without support use the page cover. With
`prefers-reduced-motion` all of this becomes static, and the content is complete without
JavaScript. Internal returns to home use the page transition without replaying the first-load
sequence. Navigation, social links and calls to action have contextual hover labels; portrait
buttons reveal the actual photo in colour. Back to top uses an interruptible eased scroll and
only moves keyboard focus after arrival.

## Existing solutions and application code

| Interaction                               | Implementation                                                                             |
| ----------------------------------------- | ------------------------------------------------------------------------------------------ |
| Typing, erasing and cursor                | Typed.js 2.1.0                                                                             |
| Responsive text lines and decoding labels | GSAP SplitText and ScrambleTextPlugin                                                      |
| About pointer input and momentum          | GSAP Draggable and InertiaPlugin; Three.js renders the reference's curved image field      |
| Pointer label                             | GSAP quickTo; no separate animation loop                                                   |
| Return to top                             | GSAP ScrollToPlugin                                                                        |
| Image strips and continuous logos         | Swiper, A11y, Mousewheel and Autoplay                                                      |
| FAQ                                       | Native details/summary, CSS details-content and interpolate-size; no JavaScript controller |
| Tab panel height                          | CSS Grid keeps all panels in one cell; no measuring or ResizeObserver                      |
| Full-size images                          | Native dialog with the project's caption and keyboard controls                             |
| Navigation                                | Native cross-document View Transitions and the reference's slice keyframes                 |

The remaining application code supplies content, accessible controls, cleanup, reference timing
and composition. The personalised pixel mark, canvas wordmark and Three.js scene still need
their own drawing code. Unsupported CSS features retain the native content and controls;
FAQ opens immediately if size interpolation is unavailable.

## Running it

Node 24 (22.23 or later) and npm.

```sh
npm ci
npm run dev        # http://localhost:4321/portfolio/
npm run build      # static site in dist/, then checks links, assets and copy
npm run preview
```

Checks:

```sh
npm run check         # astro check (TypeScript)
npm run lint          # ESLint
npm run format:check  # Prettier
npm test              # Vitest unit tests
npm run test:e2e      # Playwright, desktop and mobile projects, against the built site
npm run verify        # all of the above in order
```

Locally the end-to-end tests run in the installed Google Chrome; CI uses Playwright's
Chromium channel with the [new headless mode](https://playwright.dev/docs/browsers#chromium-new-headless-mode),
so the native page transitions are exercised by the same browser engine.
Native transition checks run with one worker because the browser skips these animations
in background windows. The remaining end-to-end checks run in parallel.

## Media

Production media is committed; the build does not fetch media from other sites or run a renderer.
See [ASSETS.md](ASSETS.md) for reference assets, stock footage, reduced-motion stills and credits.
The scripts below preserve the original local media-generation workflow; the new hero, menu,
contact background and laptop image use the sources documented there.

| Script                      | Produces                                                                        | Needs                                           |
| --------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------- |
| `render/render.mjs`         | Frames of the three.js scenes in `render/scenes`, rendered in Chrome on the GPU | Chrome                                          |
| `encode-video.mjs`          | H.264 and VP9 loops and a poster from rendered frames                           | ffmpeg                                          |
| `cards/render-cards.mjs`    | Project presentation plates, real screenshots and source-derived diagrams       | Chrome, sibling repositories and local captures |
| `capture/record-garden.mjs` | An optional Garden gameplay capture                                             | Chrome, ffmpeg, the game repository             |
| `social/render-social.mjs`  | Favicons and the social preview image                                           | Chrome                                          |

Example, the hero loop:

```sh
node scripts/media/render/render.mjs --scene blocks --variant landscape --w 1920 --h 1080 --frames 300
node scripts/media/encode-video.mjs .media-cache/blocks-landscape public/media/hero/hero-1080
```

The renderer averages sub-pixel jittered frames for anti-aliasing and blurs with a gather
depth-of-field pass, so each 1080p frame takes about 1.6 s on an Intel UHD 630. Every wave
in the scene completes whole cycles per loop, so the video repeats without a seam.

The current project plates use `cards/presentations.mjs`. Run
`node scripts/media/cards/render-cards.mjs [projectPrefix]` to render them at 2400 x 1500.
GitPulse and Garden require the actual screenshots listed in that manifest under
`.media-cache/project-captures/`. These are presentation assets, not fabricated app screens.
The full-resolution plates open in the case study image viewer; Garden also has a
user-controlled gameplay recording. See ASSETS.md for provenance and result sources.

## Performance measurement

Run `node scripts/qa/measure.mjs <url> --width 2560 --height 1440` against a production preview.
The script records LCP, CLS, frame intervals while scrolling, and video frame drops on the
machine's real GPU. `--throttle` adds 4x CPU slowdown and a 1.6 Mbps, 150 ms network.

The loader follows the reference's 3 s choreography: 00, 36, 78, then 99 percent, synchronized
with the mark. It can hold the last beat while assets settle, up to 4 s. Slow or data-saving
connections do not wait for video buffering. The About field measured 16.7 ms median and
16.8 ms p95 frame intervals at 2560×1440 on an Intel UHD 630, with no idle draws before or
after interaction. These are lab measurements on one machine, not field data.

## Project structure

```text
src/
  pages/            routes: home, work, work/[slug], about, contact, 404
  layouts/          BaseLayout: head, navigation, menu, footer, page cover
  components/       sections, case study, about, navigation, loader, ui
  data/             profile, projects, FAQ, principles, navigation (typed content)
  scripts/          app entry, core (GSAP setup, stage, motion), loader, text, modules
  styles/           tokens, base, utilities
  assets/           images processed at build time (project visuals, renders, avatar)
public/media/       videos and posters
scripts/
  media/            offline rendering, cards, gameplay capture, social images
  qa/               performance measurement
  validation/       post-build checks for links, assets, headings and punctuation
tests/
  unit/             Vitest
  e2e/              Playwright and axe-core
```

Each section that needs behaviour declares it with `data-module`, and `src/scripts/app.ts`
loads that module on demand. Modules return a cleanup function.

## Deployment

`.github/workflows/deploy.yml` runs the checks, unit tests, build and end-to-end tests on
every push and pull request, and deploys `dist/` to GitHub Pages from `main`. The site is
served under `/portfolio/`; set `SITE_BASE=/` to build it for a domain root.

## Credits

Media sources, original ownership and the laptop image edit are documented in [ASSETS.md](ASSETS.md).
Screenshots of Garden of Lost Paths show third-party art credited in that repository: the
city game tileset by Withering Systems and Comigo UI elements (CC BY 4.0), and CC0 assets.
Fonts are under the SIL Open Font License. GSAP is used under its standard no-charge
license.

## License

The code is MIT licensed, see `LICENSE`. Project screenshots and the avatar are not covered
by that license.
