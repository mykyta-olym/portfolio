# Media sources

The reference is [Gian Media](https://gianmediagroup.com/). Decorative reference media
is kept separate from the project evidence. It does not show projects delivered by Mykyta.
The MIT license for this repository covers the code, not third-party images or video.

| Local files                                                         | Source                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `public/media/hero/mono-grid-1080.mp4`                              | [Original grid video](https://gianmediagroup.com/storage/2026/07/Grid-Background-Gian-Media.mp4), encoded to monochrome H.264 with ffmpeg. Display filter matches the reference: grayscale(1), brightness(0.75), contrast(1.1).                                                                                                                                                           |
| `public/media/hero/mono-grid-portrait.mp4` and hero posters         | Portrait crop and first frames of that grid video; monochrome.                                                                                                                                                                                                                                                                                                                            |
| `public/media/inline/{experience,shape,convert}.webp`               | Gian Media's animated [experience](https://gianmediagroup.com/wp-content/uploads/2026/10/experience.webp), [shape](https://gianmediagroup.com/wp-content/uploads/2026/10/shape.webp), and [conversion](https://gianmediagroup.com/wp-content/uploads/2026/10/Shape-Conv.webp) inserts                                                                                                     |
| `public/media/contact/cubic-loop.webp`                              | [Original animated contact background](https://gianmediagroup.com/wp-content/uploads/2026/08/cubic-loop.webp)                                                                                                                                                                                                                                                                             |
| `*-still.webp`                                                      | First frames of the corresponding animations, shown with reduced motion                                                                                                                                                                                                                                                                                                                   |
| `public/media/menu/code-process*`, `src/assets/about/terminal.webp` | [Software developer working on code, screen close up, Mixkit 1728](https://mixkit.co/free-stock-video/software-developer-working-on-code-screen-close-up-1728/), under the [Mixkit Stock Video Free License](https://mixkit.co/license/#videoFree). Screen-only footage, no person or face. Encoded to monochrome H.264 at 960px with ffmpeg; poster and a still extracted from the clip. |
| `src/assets/about/{design,planning,code,modelling,workspace}.webp`  | Faceless images from [Gian Media Studio](https://gianmediagroup.com/studio/), `GianMedia-about-{1,2,6,7,8}.webp` under `/storage/2026/10/`. The identifiable person and glasses close-up are excluded.                                                                                                                                                                                    |
| `src/assets/about/development.webp`                                 | Reference [laptop mockup](https://gianmediagroup.com/storage/2026/09/web-development-service.webp). Decorative reference, not Mykyta's project evidence.                                                                                                                                                                                                                                  |
| `public/media/tools/*.svg`                                          | [Simple Icons](https://simpleicons.org/), downloaded through `https://cdn.simpleicons.org/{slug}/d0d0d0`; brand marks belong to their owners                                                                                                                                                                                                                                              |
| `src/assets/profile/avatar.jpg`                                     | Mykyta's supplied portrait                                                                                                                                                                                                                                                                                                                                                                |
| `src/assets/work/**`                                                | Evidence from the six project repositories; Garden art credits remain in its repository                                                                                                                                                                                                                                                                                                   |

Reference media retains its original ownership. Gian Media does not publish an open license
for these assets. The reference's WordPress, Elementor and widget bundles are not included.
The implementation uses GSAP, Swiper and Three.js; their APIs and measured reference timing are used
without depending on that site's runtime or hotlinking its media.

## Laptop image edit

Output: `src/assets/renders/showcase.webp`, displayed as the home cinematic banner. Created with the built-in ImageGen tool, then converted to WebP with Sharp.
Input 1: [reference laptop scene](https://gianmediagroup.com/wp-content/uploads/2026/09/Untitled-design.webp).
Input 2: `src/assets/profile/avatar.jpg`.

Final prompt:

> Use case: compositing. Asset type: full-width cinematic image for Mykyta Olym's personal software developer portfolio. Image 1 is the EDIT TARGET: the dark laptop standing on basalt. Image 2 is a SUPPORTING IDENTITY INPUT: the actual portrait of Mykyta, to appear only on the laptop screen. Change ONLY the contents of the laptop screen in Image 1. Preserve the original wide 16:9 composition, exact laptop perspective and silhouette, rock surface, lighting, black negative space, camera and framing. On the screen make a beautiful understated black-and-white personal developer portfolio: the actual portrait from Image 2 as a tasteful grayscale circular portrait with the identity preserved, beside crisp large off-white sans serif text 'Mykyta Olym', smaller text 'Software developer', and a tiny line 'Kyiv / Kosice'. A few restrained minimal interface lines may complete the portfolio screen. Match the angled screen perspective, subtle reflections and realistic brightness; the laptop display should be clearly readable at normal banner scale without glowing excessively. Keep everything outside the display unchanged. No browser chrome, no floating text outside the display, no garish color, no watermarks. Deliver a high resolution landscape image, ideally 2560x1440 or higher.

## Motion source and adaptations

The public widget scripts on [Gian Media home](https://gianmediagroup.com/) and [Studio](https://gianmediagroup.com/studio/) are the behavioural reference. The application does not include WordPress, Elementor, jQuery or the widget bundles.

- Circular gallery retains the flashing-circle style-1 stacked entry (0.5s, 0.1s stagger, scale 3), fan and radial spread. It explains six stages using actual work artifacts, rather than repeating project covers or using unrelated stock photos. Desktop hover turns a card; activation expands it at the centre for reading, including on phones. The 48s orbit pauses while reading and counter-rotates the cards so they stay upright. Resizing places the cards directly without replaying the entrance. Separate slots prevent coplanar intersections.
- About uses Three.js textured planes, a wrapped grid, scale 0.6, curved normals while dragging, camera z 500 to 450, inertia and a temporary text blur. Bounded placement keeps photographs apart. The renderer pauses when idle or hidden and disposes its GPU resources on page exit. Static photographs remain available without WebGL, JavaScript, or with reduced motion.
- Scroll text uses GSAP SplitText for responsive line measurement, with the reference's 0.68 progress window, 115% rise and cubic easing. Each paragraph follows its own viewport position, with a 0.2 s scrub. Inline artwork stays with its line. Clip margins preserve accents and descenders. Short entrance text uses the source's 1.75 s duration, 60 ms stagger and 350 px early trigger.
- Contact uses the original 0.53 black background overlay, 70px/62px desktop title, 15px/16px description, translucent card shell, white paper and the same scanline overlay. At phone width, the background is contained at the bottom and the social panel is hidden as in the reference; all social links remain in the menu. The email card is slightly wider to fit Mykyta's longer address and accessible copy button.
- The reference's colour grading is applied to the hero, and coloured custom case-study glows have been removed. Project plates use a neutral charcoal/paper palette. Actual application and game screenshots retain their original colours.
- Loader: the original 490/1210/2080 ms milestones, 340 ms counter roll, fixed percent sign, and 3 s hold followed by the 820 ms upward exit. Its grid cells extend from neighbouring cells using the reference algorithm; the final mark is Mykyta's monogram. Unlike the original, asset readiness can hold the final 99 beat until a 4 s deadline. Counter layers and animations are cleaned up even after a suspended tab skips milestones.
- Menu: the original CustomEase wipe, 1.2 s body motion, link entrance at 0.6 s with 0.08 s stagger, social entrance with 0.05 s stagger, and 1.5 s media reveal starting at 0.4 s. The header and close control respond immediately outside the body's clip, so the first click never leaves an empty control. The module is bundled with the application entry. Closing clips the body upward without prematurely fading its links. The bar-to-cross transition follows the widget's 250 ms transforms. Escape, focus containment and interrupted transitions remain supported.
- Text links roll to context-specific invitations (Hire me, Meet me, Stalk me, Read the code) inside a fixed mask, with matching 110% travel on both layers and a 450 ms ease-out. The original accessible name and destination remain stable. Buttons retain the reference's Shikoba 10 px text/icon shift, pixel arrow and colour inversion. Profile buttons reveal the actual portrait's colour and soften its corners while the label changes. Keyboard focus gets the same effects; reduced motion disables the transitions.
- Additional faceless About imagery: [Web management](https://gianmediagroup.com/storage/2026/10/Web-management.webp) and [exploded 3D model](https://gianmediagroup.com/storage/2026/09/3d-design.png). These are decorative process imagery, not claims about client work.

- The About laptop mockup `src/assets/about/selected.webp` is the reference's [Selected Work image](https://gianmediagroup.com/storage/2026/10/Selected-Work-2-e1791040812822.webp), used only in its decorative field.

## Project presentation plates / 8 November 2026

The 22 plates in `src/assets/work/` are rendered at 2400 x 1500 from
`scripts/media/cards/presentations.mjs`, using Figtree and IBM Plex Mono.
They contain original editorial diagrams, real captures and reported measurements.
No stock photos of other products or AI-generated app interfaces are used.

| Project                                                                         | Material and verification                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [relayq](https://github.com/mykyta-olym/relayq)                                 | Queue/worker illustration and actual state machine. Failure figures come from README.md. The Docker demo was started and its live queue statistics inspected.                                                                                                     |
| [phishlens](https://github.com/mykyta-olym/phishlens)                           | CLI and FastAPI were run locally. The illustrated example returned 0.756 with contributions +1.92, +0.93, +0.48. Evaluation/prevalence values come from reports/metrics.json and README.md. The example URL is fictional; a model score is not a safety verdict.  |
| [GitPulse](https://github.com/mykyta-olym/gitpulse)                             | Real course, teacher, student and analytics screens from an isolated PostgreSQL/Redis demo. All students/events are synthetic seed data. Captured after page transitions and charts settled.                                                                      |
| [stockroom](https://github.com/mykyta-olym/stockroom)                           | This checkout has domain/server code, without an app interface. Plates illustrate actual tests and the six-state map. All 103 integration tests passed against a separate PostgreSQL instance.                                                                    |
| [Garden of Lost Paths](https://github.com/mykyta-olym/zahrada-stratenych-ciest) | Real book, chapter entrance and gameplay captures. `public/media/projects/garden-walk.mp4` is a silent, user-controlled 14.5 s excerpt from a fresh game run, H.264, 1280 x 800, 25 fps. Bundled art/music licensing remains documented in that repository.       |
| [Speech domain adaptation](https://github.com/mykyta-olym/parkinsons-speech-da) | Actual report plots/CSVs were inspected. Task results come from README.md and reports/pcgita/05_domain_gap.csv; the protocol comes from PCGITA_EXPERIMENTS.md. The cover waveform is a conceptual illustration, not a patient recording. Training was not re-run. |

The case study captions distinguish screenshots, conceptual illustrations and measured results.
Full-resolution plates open in a native dialog with keyboard navigation; they remain direct image
links when JavaScript is unavailable. Playback starts only when the visitor requests it.

- Page navigation uses the reference's CSS-only “Smooth Staggered Slices V4”: four 25.4% masks, the original eight keyframes, 2.25 s duration, cubic-bezier(.48,0,.23,1), and white backdrop. This also applies to the home CTA and logo links. The initial-load sequence is skipped on internal return to home; title entrances begin as the incoming slices reveal. It uses the browser's [cross-document View Transitions](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document); the existing cover remains a fallback for browsers without this feature.
- Back to top uses the standard [GSAP ScrollToPlugin](https://gsap.com/docs/v3/Plugins/ScrollToPlugin/) with a 1.1-1.9s power3.inOut curve. Wheel, touch and scroll keys cancel the tween. Focus moves to main only on completion. Reduced motion returns immediately.
- Navigation typing, erasing and cursor blinking use [Typed.js 2.1.0](https://github.com/mattboldt/typed.js/tree/v2.1.0), MIT licensed. The library owns the cursor throughout typing and pauses. It stops in background tabs and is omitted with reduced motion.
- Label decoding uses [GSAP ScrambleTextPlugin](https://gsap.com/docs/v3/Plugins/ScrambleTextPlugin/); the pointer label uses GSAP quickTo. Both replace hand-written animation-frame loops. About pointer capture and momentum use [Draggable](https://gsap.com/docs/v3/Plugins/Draggable/) with InertiaPlugin, while retaining the reference's curved planes and camera movement.
- FAQ uses native details/summary and the browser's details-content size interpolation, following [Chrome's documented pattern](https://developer.chrome.com/blog/styling-details) (code examples Apache 2.0). There is no JavaScript height controller. Case panel height is reserved by CSS Grid rather than script measurement. Both preserve the native keyboard behavior.
- Case headers use the ready-made photographs listed below and actual Garden game art. The old custom SVG backdrops have been removed. Stock photos are decorative context, not project screenshots. CSS applies monochrome grading and a black contrast overlay. GSAP ScrollTrigger controls a small reversible camera move; reduced motion keeps the image still.

## Case background photographs

Downloaded from the original providers on 8 November 2026, encoded as WebP at up to 2400 px.
The five stock photographs are used under the [Pexels License](https://www.pexels.com/license/).
They contain equipment and workspaces, without identifiable people.

| Asset / case                             | Original photographer and source                                                                                            |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `backgrounds/servers.webp` / relayq      | Brett Sayles, [Server Racks on Data Center](https://www.pexels.com/photo/server-racks-on-data-center-4508751/)              |
| `backgrounds/network.webp` / phishlens   | Pixabay, [Close Up Photo of Ethernet Cable](https://www.pexels.com/photo/close-up-photo-of-ethernet-cable-163047/)          |
| `backgrounds/code.webp` / GitPulse       | Nemuel Sereti, [Programming Code on Screen](https://www.pexels.com/photo/programming-code-on-screen-6424584/)               |
| `backgrounds/inventory.webp` / stockroom | cottonbro studio, [Labeled Shelves in a Warehouse](https://www.pexels.com/photo/labeled-shelves-in-a-warehouse-7018662/)    |
| `backgrounds/microphone.webp` / Speech   | Rene Terp, [Close-Up Shot of a Black Microphone](https://www.pexels.com/photo/close-up-shot-of-a-black-microphone-7710305/) |
| `backgrounds/garden.webp` / Garden       | Actual game scene from the previously documented Garden capture; original game art credits remain in its repository.        |

The image viewer's entry/exit uses the browser's `@starting-style`, `display` and `overlay`
transitions, following [Chrome's top-layer animation pattern](https://developer.chrome.com/docs/modern-web-guidance/guides/ui-behaviors/animate-to-from-top-layer).
Image changes wait for native `Image.decode()` and discard superseded requests. Closing restores
focus to the original opener, including after navigating to a different image.

## Process artifacts

The home orbit's `src/assets/process/*.webp` files are real browser captures made on 8 November 2026:

- Understand: the [portfolio README](https://github.com/mykyta-olym/portfolio/blob/615d8ad/README.md), describing its scope.
- Plan: the already documented stockroom order-state illustration, sourced from its domain code.
- Build: [the actual menu implementation](https://github.com/mykyta-olym/portfolio/blob/615d8ad/src/scripts/modules/menu.ts).
- Test and Ship: respectively the test annotations and deployment graph from [recorded run 42465717375](https://github.com/mykyta-olym/portfolio/actions/runs/42465717375), commit 615d8ad. These are historical workflow captures, not current test counters.
- Refine: this portfolio's actual avatar button in its colour/hover-label state.

`node scripts/media/encode-process.mjs` encodes the original PNG captures from `.media-cache/project-captures/` without altering their contents. The discipline examples use the actual job-state diagram, student dashboard, model evaluation and game scene documented above.
