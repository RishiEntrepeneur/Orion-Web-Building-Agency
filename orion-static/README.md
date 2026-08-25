# Orion — static site

An eighteen-page marketing site for Orion, a web studio. **Zero dependencies,
zero third-party network requests.** Hand-written HTML, CSS and ES2020.

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
# then http://localhost:8000
```

## Art direction

**Couture observatory** — luxury editorial typography inside a technical
instrument frame, flying through coloured space.

Bodoni Moda, a high-contrast didone, set in mixed case at billboard scale with
italic for emphasis. Archivo carries the interface, IBM Plex Mono the data
labels. The ground is a violet-black rather than a neutral one.

Colour is zoned across **seven** signals — champagne gold for the index, violet
for services, teal for the position statement, blue for the method, magenta for
the work, acid for the standards, flare for contact. Each section carries an
ambient two-hue wash in its own accent, so colour is present throughout rather
than saved for a single pop. Every one of the seven clears 4.5:1 against the
ground as text, which is what allows them all to be used for type.

Zone utilities redeclare literal colour values rather than chaining `var()`
indirections, because a custom property that references another resolves where
it is *declared*, not where it is used.

### The didone problem, and the fix

A high-contrast serif reversed out of near-black loses its hairlines: at the
sizes used here the hyphen in "E-commerce" and the diagonal of a "4" dropped
below one device pixel and disappeared outright. The fix is optical-size
compensation — `font-optical-sizing` is switched off and `opsz` is pinned
*below* the rendered size in three bands (26 for display, 15 for headings, 9 for
small numerals), because lower optical sizes carry sturdier hairlines. This is
why the type holds together on a dark ground.

## Pages

```
index.html                        home
about.html                        studio — principles, shape, working here
services.html                     capabilities, engagement models, FAQ
work.html                         six builds, long form, each linking to its case study
journal.html                      article index
contact.html                      brief form, what happens next, studio details

case-northwind.html               \
case-maison-verre.html             |
case-halden.html                   |  six case studies, generated from
case-arden.html                    |  tools/data/cases.js
case-kestrel.html                  |
case-meridian.html                /

journal-read-think-write.html     \  three articles, generated from
journal-didone-on-dark.html        |  tools/data/journal.js
journal-performance-budget.html   /

privacy.html                      privacy notice
terms.html                        site terms
404.html                          not found, with eight ways back

sitemap.xml, robots.txt           generated
```

Every case study links to the next and previous one, so the six form a loop.
Every article links to the other two. Nothing on the site is a dead end: no
element that looks clickable fails to lead somewhere, which is verified by
crawling the built output rather than by inspection.

```
assets/css/styles.css   design tokens, components, motion primitives
assets/js/app.js        the whole motion system, one rAF loop
assets/fonts/           Bodoni Moda, Archivo, IBM Plex Mono (OFL, latin subsets)
tools/                  page generator, templates and content data
```

### Editing

`index.html` is the source of truth for the shared chrome: `<head>`, preloader,
HUD, nav, drawer and footer. Every other page is generated from it, so the
chrome cannot drift.

```sh
node tools/build.js     # regenerates all 17 other pages, plus sitemap and robots
```

- Chrome → edit `index.html`
- One-off page bodies → `tools/bodies/`
- Case studies → `tools/data/cases.js`
- Articles → `tools/data/journal.js`
- Repeated page shapes → `tools/templates.js`

The contact form is lifted directly out of `index.html` at build time, so there
is only ever one copy of it.

## Motion

Everything runs off a single `requestAnimationFrame` loop, driven by a
non-reactive shared state object. Scroll and pointer are read into that object
by passive listeners; nothing in the loop triggers a React-style re-render and
nothing polls the DOM for values it can cache. Smoothing uses frame-rate
independent exponential damping (`1 - 2^(-dt/halfLife)`), so motion is
identical at 60Hz and 144Hz.

### Why it is smooth: read, think, write

The loop runs three phases per frame, and callbacks register into the phase they
belong in — `addReader`, `addTicker`, `addWriter`:

1. **Read** — every `getBoundingClientRect` and `getComputedStyle` in the whole app
2. **Think** — damping and maths, no DOM access
3. **Write** — every style, transform and attribute

The reason is that a layout read issued *after* a style write forces the browser
to lay the page out synchronously to answer it. With a dozen animated elements
each measuring and then writing in turn, that is dozens of forced layouts per
frame, and it is the actual cause of scroll-linked stutter — far more than any
easing curve. Instrumenting the running page confirms **zero read-after-write
transitions across 129 consecutive frames**: one layout pass per frame.

Two subtler things fall out of the same discipline:

- Event handlers must not measure either. A `pointermove` handler that reads a
  rect runs *between* frames and lands after that frame's writes, so the tilt
  effect measures in the read phase instead.
- Anything inside a 3D-transformed subtree must be measured with
  `getComputedStyle`, not `getBoundingClientRect` — a client rect comes back
  scaled by the transform, and in the word cycler that 2.9% error accumulated
  across steps until the previous word hung visibly above the current one.

Beyond that: the ambient colour washes use radial gradients rather than
`filter: blur(90px)`, because a blur is a filter pass and those sections are
3D-transformed, so it re-rasterised as they tilted. `will-change` is applied
only to the handful of elements the loop writes every frame — applying it
broadly costs memory and makes things worse. And the loop keeps a rolling
average of frame cost: if the machine cannot hold 60fps it permanently steps
down particle count and canvas frame rates rather than oscillating between
quality tiers, which is more distracting than simply running lighter.

| | |
|---|---|
| Preloader | Constellation draws in, counter races to 100, slat curtain lifts |
| 3D scroll rig | Every unpinned section tilts and recedes in real perspective as it crosses the viewport |
| Scene tilt | The hero rotates toward the cursor, its layers separated in z |
| Armillary | A software-3D rotating armature with Orion suspended inside, true perspective projection, no library |
| Grid floor | A CSS-3D plane receding to a horizon under the hero |
| Chromatic split | Headlines fringe blue/magenta in proportion to scroll velocity |
| Card rotation | Work tiles rotate in Y by their position across the lane |
| Cursor | Stateful dot + difference-blend ring: link, view, drag, text |
| 3D flips | Button labels and nav links rotate on the X axis rather than sliding |
| Kinetic type | Headings split into masked words that rise into place |
| Text scramble | Mono labels resolve out of noise on hover and on first view |
| Flow field | Curl-noise particle plot, pointer-repelled, hero background |
| ASCII plot | Orion rendered in text mode, rotating with pointer and scroll |
| Halftone plates | Per-project generative dot / cross / bar fields, six tints |
| Marquees | Seamless, speed and skew driven by scroll velocity |
| Method | Pinned section, four steps advancing on scroll with a progress rail |
| Work | Pinned stage with a horizontally-scrolling lane |
| Magnetic | Buttons drift toward the cursor within reach |
| Counters, parallax, tilt, clip-wipes, SVG stroke draws, page-transition curtain |

## Sound

Off by default, with a toggle in the nav and in the mobile drawer. The choice
persists in `localStorage`, and if it was on last visit the engine arms itself on
the first pointer or key event — browsers will not let a page start audio before
a gesture, and the toggle is itself that gesture on a first visit.

Every sound is **synthesised at runtime** from oscillators and shaped noise, so
there are no audio files and the page weight does not change. The graph is a
gain bus into a compressor, with a send into a convolution reverb whose impulse
response is generated on the fly — reverb is what stops synthesised tones
sounding like a system beep.

The seven colour zones are tuned to the seven notes of an A minor pentatonic
scale, low to high, so scrolling the page plays an ascending run and any two
sections sound consonant together. Hovers pick from a small pool of high notes
so a fast sweep across the nav does not repeat one pitch, and are rate-limited
to one every 55ms. The rest: a pluck on click, rising and falling arpeggios for
the drawer, a filtered noise sweep on page transitions, a resolving chord when
the preloader lifts, a major arpeggio on a valid submit and a low detuned pair
on a validation failure.

No `AudioContext` is constructed until the visitor asks for sound.

Everything above is gated behind `prefers-reduced-motion: reduce`. Under it the
preloader is skipped, the cursor is disabled, pins collapse to normal flow, all
four method steps show at once, and the flow field and ASCII plot render as
single static frames rather than blank rectangles. No content is ever left at
`opacity: 0`.

Density also drops automatically on low-tier devices (`hardwareConcurrency`,
`deviceMemory`, viewport width), and canvases pause when scrolled out of view or
when the tab is hidden.

## Verified

Measured in Chromium at 360–1920px, not eyeballed:

- **LCP 196–300ms** on all four pages; the LCP element is the `<h1>` in every case
- **9 requests, ~376KB**, no third-party origins (224KB of that is the three
  self-hosted variable families)
- **Zero dead ends**: every internal link resolves, every page is reachable from
  home by following links, and nothing that looks clickable is inert
- **Zero forced synchronous layouts** across 129 instrumented frames
- **Contrast** computed numerically: body 18.0:1, secondary 9.8:1, mono labels
  5.5:1, and all seven zone signals between 6.3:1 and 17.5:1 as text against the
  ground; interactive borders use a dedicated `--edge` token at 3.5:1 (WCAG 1.4.11)
- **No horizontal overflow** at 360 / 390 / 768 / 1024 / 1280 / 1440 / 1920
- **Keyboard**: drawer traps focus, Escape closes and restores it, collapsed FAQ
  panels and the closed drawer are `inert`
- **Form**: blocks empty submits with per-field messages, validates email shape
  and detail length, then assembles the brief

## The contact form

There is no server. The form validates in the browser, renders the assembled
brief into a terminal panel and hands it to your mail client as a prefilled
`mailto:` draft. Nothing is transmitted, stored or tracked until the visitor
presses send themselves. Wire it to a real endpoint by replacing the submit
handler in `assets/js/app.js`.

## Content note

Project names, metrics and the studio address are **sample content** for an
unlaunched studio, not real client results. The four "standards" figures are
stated as commitments the studio holds itself to, not as measured past
outcomes. Replace them before the site goes live.

## Fonts

Bodoni Moda (roman and italic), Archivo and IBM Plex Mono — latin subsets,
self-hosted under the SIL Open Font License 1.1 (see
`assets/fonts/LICENSE.txt`). Bodoni and Archivo are variable, so every weight
and, for Archivo, every width comes from a single file. Self-hosting removes the
render-blocking third-party request and the flash of fallback text that the
Google Fonts CDN causes on a cold connection.


## A trap worth naming twice

`position: sticky` fails silently in two different ways, and this site hit both.

1. **A transformed ancestor.** A transform makes an element the containing block
   for everything inside it, so a sticky descendant stops behaving. This is why
   the 3D scroll rig applies perspective per element rather than to a wrapper —
   and why `init3D` now refuses to tilt any section that contains a sticky
   element, rather than relying on anyone remembering the rule.
2. **A shrink-wrapped containing block.** A sticky element can only travel
   within its containing block. In a grid with `align-items: start`, a sidebar
   column is only as tall as its own content, so there is nowhere to travel and
   it simply scrolls away. The column needs `align-self: stretch`.

Neither throws, neither warns, and both look like "sticky is broken".
