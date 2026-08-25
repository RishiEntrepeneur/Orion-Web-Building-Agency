# Orion — static site

A four-page marketing site for Orion, a web studio. **Zero dependencies, zero build
step, zero third-party network requests.** Hand-written HTML, CSS and ES2020.

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
