# Media sources

The reference is [Gian Media](https://gianmediagroup.com/). Decorative reference media
is kept separate from the project evidence. It does not show projects delivered by Mykyta.
The MIT license for this repository covers the code, not third-party images or video.

| Local files                                                 | Source                                                                                                                                                                                                                                                                                                                                                                        |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `public/media/hero/mono-grid-1080.mp4`                      | [Original grid video](https://gianmediagroup.com/storage/2026/07/Grid-Background-Gian-Media.mp4), encoded to monochrome H.264 with ffmpeg. Display filter matches the reference: grayscale(1), brightness(0.75), contrast(1.1).                                                                                                                                               |
| `public/media/hero/mono-grid-portrait.mp4` and hero posters | Portrait crop and first frames of that grid video; monochrome.                                                                                                                                                                                                                                                                                                                |
| `public/media/inline/{experience,shape,convert}.webp`       | Gian Media's animated [experience](https://gianmediagroup.com/wp-content/uploads/2026/10/experience.webp), [shape](https://gianmediagroup.com/wp-content/uploads/2026/10/shape.webp), and [conversion](https://gianmediagroup.com/wp-content/uploads/2026/10/Shape-Conv.webp) inserts                                                                                         |
| `public/media/contact/cubic-loop.webp`                      | [Original animated contact background](https://gianmediagroup.com/wp-content/uploads/2026/08/cubic-loop.webp)                                                                                                                                                                                                                                                                 |
| `*-still.webp`                                              | First frames of the corresponding animations, shown with reduced motion                                                                                                                                                                                                                                                                                                       |
| `public/media/menu/code-process*`                           | [Software developer working on code, screen close up, Mixkit 1728](https://mixkit.co/free-stock-video/software-developer-working-on-code-screen-close-up-1728/), under the [Mixkit Stock Video Free License](https://mixkit.co/license/#videoFree). Screen-only footage, no person or face. Encoded to monochrome H.264 at 960px with ffmpeg; poster extracted from the clip. |
| `src/assets/about/{design,planning}.webp`                   | Faceless images from [Gian Media Studio](https://gianmediagroup.com/studio/), `GianMedia-about-{1,2}.webp` under `/storage/2026/10/`. The identifiable person and glasses close-up are excluded.                                                                                                                                                                              |
| `public/media/tools/*.svg`                                  | [Simple Icons](https://simpleicons.org/), downloaded through `https://cdn.simpleicons.org/{slug}/d0d0d0`; brand marks belong to their owners                                                                                                                                                                                                                                  |
| `src/assets/profile/avatar.jpg`                             | Mykyta's supplied portrait                                                                                                                                                                                                                                                                                                                                                    |
| `src/assets/work/**`                                        | Evidence from the six project repositories; Garden art credits remain in its repository                                                                                                                                                                                                                                                                                       |

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

- Circular gallery retains the flashing-circle style-1 stacked entry (0.5s, 0.1s stagger, scale 3), fan and radial spread. It explains six stages using process photographs. Cards become interactive only after the entrance completes, using native inert and a shared ready state. Desktop hover turns a card; activation expands it at the centre for reading, including on phones. The 48s orbit pauses while reading and until its 0.5 s return flip finishes, then counter-rotates the cards so they stay upright. Resizing places the cards directly without replaying the entrance. Separate slots prevent coplanar intersections; the ring paints above its heading.
- About uses Three.js textured planes, a wrapped grid, scale 0.6, curved normals while dragging, camera z 500 to 450, inertia and a temporary text blur. Bounded placement keeps photographs apart. The renderer pauses when idle or hidden and disposes its GPU resources on page exit. Static photographs remain available without WebGL, JavaScript, or with reduced motion.
- Scroll text uses GSAP SplitText for responsive line measurement, with the reference's 0.68 progress window and 115% rise. Scroll-driven movement is linear so its final portion keeps following the scroll. Paragraphs share their section's viewport progress, with a 0.12 s scrub and faster opacity completion. Every row starts hidden together, including rows whose stagger has not begun. Inline artwork stays with its line. Short entrances use a 0.78 s power1 ease-out and 60 ms line stagger at the same 92% viewport threshold as 0.56 s fades. Lines are measured under the cover after fonts load; playback waits for its actual exit. Completed headings remain shown after reflow; stale pre-entry triggers and pending playback are removed on re-split.
- Page changes use four white DOM bands with native CSS transform transitions, followed by normal navigation. The Web Animations API waits for the actual incoming transitions instead of a separate arrival timer. This replaces the reference's cross-document snapshot effect at the user's request: the outgoing background video and GSAP motion keep running during departure. Astro's built-in hover prefetch warms internal routes. Internal home arrivals still skip the initial loader; reduced motion uses direct navigation.
- Contact uses the original 0.53 black background overlay, 70px/62px desktop title, 15px/16px description, translucent card shell and white paper. The scanline overlay is lighter for legibility, both labels have a straight full-width divider, and social links occupy consistent 28 px rows. At phone width, the background is contained at the bottom and the social panel is hidden as in the reference; all social links remain in the menu. The card shells keep their geometry on hover; only their actual controls react. The email card is slightly wider to fit Mykyta's longer address and accessible copy button.
- The reference's colour grading is applied to the hero, and coloured custom case-study glows have been removed. Project plates use a neutral charcoal/paper palette. Actual application and game screenshots retain their original colours.
- Loader: the original 490/1210/2080 ms milestones, 340 ms counter roll, fixed percent sign, and 3 s hold followed by the 820 ms upward exit. Its grid cells extend from neighbouring cells using the reference algorithm; the final mark is Mykyta's monogram. Unlike the original, asset readiness can hold the final 99 beat until a 4 s deadline. Counter layers and animations are cleaned up even after a suspended tab skips milestones.
- Menu: one opaque black frame expands from the pill's 52 px height in 0.52 s with GSAP power1 easing, while its full-height contents retain their final layout. Links enter at 0.1 s and socials at 0.14 s, both with a 0.04 s stagger and 0.36 s duration; media reveals in 0.36 s. The close control responds immediately. Closing contracts the same frame in 0.4 s; the covered pill returns only after it finishes. The closed pill uses the reference's neutral rgb(74 74 74 / 38%) with an 18 px backdrop blur; the backdrop is darkened to keep white controls readable over light project images; opening replaces it with the reference's pure black overlay, including the header, without an outlined seam or tinted surface. The bar-to-cross transition retains its 250 ms transforms. Only the root scroll container is locked, preserving sticky footer geometry. The background is inert until closing finishes; Escape, keyboard focus containment, viewport resizing, history restoration and interrupted transitions remain supported.
- Text links roll to compact context labels (Code, Connect, Message, Hire me, Meet, View) inside a fixed mask, with matching 100% travel on both layers and a shared 240 ms ease-in-out. The original accessible name and destination remain stable. Buttons retain the reference's Shikoba 10 px text/icon shift and pixel arrow; colour, icon and label motion now share the 240 ms ease-in-out. Profile buttons reveal the portrait's colour and soften its corners on the same clock. Keyboard focus gets the same effects; reduced motion disables the transitions.
- The home Refine card uses the reference's [Web management](https://gianmediagroup.com/storage/2026/10/Web-management.webp) tablet photograph (`src/assets/about/management.webp`). This is decorative process imagery, not a claim about client work.

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

## Process photographs

The home orbit uses decorative process photographs; they are not presented as images of Mykyta or evidence of his projects. The reverse side explains the step. The tiny README, code and workflow screenshots were replaced at the user's request.

- Understand, Plan and Refine reuse the previously documented reference's strategy, wireframe notebook and tablet images.
- Build: cottonbro studio, [Close Up of a Hand on a Laptop Keyboard](https://www.pexels.com/photo/close-up-of-a-hand-on-a-laptop-keyboard-5474296/), Pexels License, downloaded 8 November 2026.
- Test: Tima Miroshnichenko, [Person Using Computer](https://www.pexels.com/photo/person-using-computer-5380591/), Pexels License, downloaded 8 November 2026. This is terminal/workstation imagery, not a claim that the screen contains this project's tests.
- Ship reuses Brett Sayles's server-rack photograph credited above.

The two new originals were encoded at 1200 px wide as WebP. CSS crops them to the card and applies monochrome grading. The discipline examples still use the actual job-state diagram, student dashboard, model evaluation and game scene documented above.

## About photography / 9 November 2026

The About field contains eight distinct photographs of software work and computing equipment,
replacing the repeated agency mockups, product render and unrelated design imagery.
These are decorative stock photographs, not Mykyta's workspace or project screenshots.
Each photograph was inspected individually, including the equipment actually pictured.
The original framing is retained; the gallery applies its existing monochrome filter.

Downloaded from Pexels on 9 November 2026 under the [Pexels License](https://www.pexels.com/license/).
Files are self-hosted in `src/assets/about/photography/`, encoded at 1200 px wide as WebP;
Astro produces the responsive 320 and 560 px variants. No runtime stock-provider requests.

| Local file         | Photographer / original photograph                                                                                                                                   | Subject                                                                         |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `source-code.webp` | Pixabay, [PHP Screengrab](https://www.pexels.com/photo/abstract-business-code-coder-270348/)                                                                         | Source code on a monitor                                                        |
| `keyboard.webp`    | Jeric Turga, [Modern mechanical keyboard under low light](https://www.pexels.com/photo/modern-mechanical-keyboard-under-low-light-28534977/)                         | Input tools, close detail                                                       |
| `circuits.webp`    | ClickerHappy, [Shallow Focus Photography of Black Circuit Board](https://www.pexels.com/photo/shallow-focus-photography-of-black-circuit-board-1448561/)             | Components and PCB traces                                                       |
| `workstation.webp` | Mikhail Nilov, [A Person Doing Computer Programming](https://www.pexels.com/photo/a-person-doing-computer-programming-7988086/)                                      | Hands, laptop and code display; no face                                         |
| `flowchart.webp`   | Christina Morillo, [White Dry-erase Board With Red Diagram](https://www.pexels.com/photo/white-dry-erase-board-with-red-diagram-1181311/)                            | Planning a screen flow; no face                                                 |
| `network.webp`     | Brett Sayles, [Structured cabling system with numerous network cables](https://www.pexels.com/photo/structured-cabling-system-with-numerous-network-cables-4508748/) | Fibre connections and network hardware                                          |
| `storage.webp`     | Brett Sayles, [High Angle Shot of Network Switch](https://www.pexels.com/photo/high-angle-shot-of-network-switch-5050305/)                                           | Server drive bays; named for the actual image, rather than the provider's title |
| `desk.webp`        | Gaurav Vishwakarma, [Dark Desk Setup with Laptop and Keyboard](https://www.pexels.com/photo/dark-desk-setup-with-laptop-and-keyboard-35697247/)                      | A restrained workspace, without a branded website mockup                        |

The field keeps each image's native aspect ratio. The static fallback centres the actual
number of rows, so reduced motion and no-JavaScript layouts use the same eight-image selection.
The title's drag/blur transform applies only to its content-sized heading, with an explicit
layer above the canvas and a small text shadow for legibility over bright photographs.
This avoids clipping or losing text during repeated drags; the camera and plane motion stay intact.
The former gallery-only reference files were removed; the three home process photographs
remain credited above.
