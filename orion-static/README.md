# Orion — static site

A four-page marketing site for Orion, a web studio. **Zero dependencies, zero build
step, zero third-party network requests.** Hand-written HTML, CSS and ES2020.

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
# then http://localhost:8000
```

## Art direction

Mission-control editorial. True black ground, *bone* white type rather than
blue-white, Anton condensed at billboard scale, hairline rules instead of card
borders, monospaced data labels, and blue/violet/acid used as a hot **signal**
rather than as ambient glow.

Colour is zoned: each section declares `data-zone-set` and the accent swaps as
you scroll — blue for the index, violet for services, acid for method and
position, flare for work. Zone utilities redeclare literal colour values rather
than chaining `var()` indirections, because a custom property that references
another resolves where it is *declared*, not where it is used.

## Files

```
index.html          home — hero, services, position, method, work, standards, contact
services.html       capabilities, engagement models, FAQ
work.html           six builds, long form
contact.html        brief form, what-happens-next, studio details
assets/css/styles.css   design tokens, components, motion primitives
assets/js/app.js        the whole motion system, one rAF loop
assets/fonts/           Anton, Inter Tight, JetBrains Mono (OFL, latin subsets)
tools/                  page generator — see below
```

### Editing pages

`index.html` is the source of truth for the shared chrome: `<head>`, preloader,
HUD, nav, drawer and footer. The other three pages are generated from it so the
chrome cannot drift.

```sh
node tools/build.js     # regenerates services.html, work.html, contact.html
```

Edit the chrome in `index.html` and the page bodies in `tools/bodies/`, then
re-run the generator. The contact form is lifted directly out of `index.html`,
so there is only ever one copy of it.

## Motion

Everything runs off a single `requestAnimationFrame` loop with registered
tickers, driven by a non-reactive shared state object. Scroll and pointer are
read into that object by passive listeners; nothing in the loop triggers a
React-style re-render and nothing polls the DOM for values it can cache.
Smoothing uses frame-rate-independent exponential damping
(`1 - 2^(-dt/halfLife)`), so motion is identical at 60Hz and 144Hz.

| | |
|---|---|
| Preloader | Constellation draws in, counter races to 100, slat curtain lifts |
| Cursor | Stateful dot + difference-blend ring: link, view, drag, text |
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

- **LCP 136–224ms** on all four pages; the LCP element is the `<h1>` in every case
- **7 requests, ~235KB**, no third-party origins
- **Contrast** computed numerically: body 17.9:1, secondary 9.2:1, mono labels
  4.8:1, every accent ≥ 8.3:1 against the ground; interactive borders use a
  dedicated `--edge` token at 3.4:1 (WCAG 1.4.11)
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

Anton, Inter Tight and JetBrains Mono, latin subsets, self-hosted under the SIL
Open Font License 1.1 (see `assets/fonts/LICENSE.txt`). Self-hosting removes the
render-blocking third-party request and the flash of fallback text that the
Google Fonts CDN causes on a cold connection.
