# Orion — static site

A sixteen-page site for Orion — one person, in England — plus three complete
demo sites that show what each package buys. Hand-written HTML, CSS and
JavaScript. No framework, no bundler, no third-party request at runtime, and
nothing on any page that was not typed.

```sh
python3 -m http.server 8000
# then http://localhost:8000
```

There is no build step for the browser. There *is* a generator, which is not
the same thing: `home.html` is the source of truth for the shared chrome, and
`node tools/build.js` re-emits the other pages around their own bodies so the
header, footer and head can never drift between them. Ship the folder as it is.

```sh
node tools/build.js         # the site: 16 pages from home.html's chrome
node tools/demos/build.js   # the demos: 12 pages across three sites
node tools/make-artifact.js # fold the whole thing into one HTML file
```

---

## Art direction

**A luxury editorial, at night.** Very few things on screen at once, a lot of
air, one accent per zone, and display type large enough to be the picture.

The site is dark — Orion is a constellation — and the three demos are not, on
purpose: an agency site that only knows one register is a portfolio of one.

| | ground | display | accent |
|---|---|---|---|
| Orion | `#08070e` | Bodoni Moda | seven zone colours, one per section |
| Alderley Chess Club | `#f2f0e8` ivory | Fraunces | `#22493a` board green |
| Fairweather Barbers | `#14110f` warm black | Bebas Neue | `#d3ac2e` brass |
| Saltmarsh | `#efece4` bone | Fraunces | `#8b3517` ember |

### Optical size, pinned

A didone reversed out of a dark ground loses its hairlines. Every display face
sets `font-optical-sizing: none` and pins `opsz` **below** the rendered size, so
the strokes thicken enough to survive:

```css
font-optical-sizing: none;
font-variation-settings: "opsz" 26;   /* on type rendered at 60–160px */
```

Three bands: `opsz 26` for display, `15` for headings, `9` for numerals.

### Zones

Seven colour zones, switched by `data-zone-set` on each section and read from
`[data-zone]` on the root. The zone blocks **redeclare literal values** rather
than aliasing one custom property to another: a custom property that references
another resolves where it is *declared*, not where it is used, so aliasing
silently pins every zone to the first one.

---

## Pages

**Prices · Demos · What I build · About · Contact** in the bar, in that order,
because that is the order somebody deciding whether to hire you wants them in.
`This site`, `Build notes` and `Pay` are in the footer; they are pages about
the pages.

| page | what it is |
|---|---|
| `index.html` | the intro: a browser, a search, and Orion opening in a new tab |
| `home.html` | the argument, in six screens and under 300 words |
| `prices.html` | the three packages and the comparison table — the only place prices live |
| `demos.html` | the three demo sites, and a machine you can climb into |
| `services.html` | what each package actually involves |
| `work.html` | this site, taken apart: budgets, measurements, decisions |
| `about.html` | who is doing it |
| `contact.html` | a brief, assembled in the browser |
| `pay.html` | a checkout that handles no money |
| `journal*.html` | four build notes |
| `privacy.html` `terms.html` `404.html` | the rest |

### Restraint

The home page runs to just under **300 words** across six screens. It used to
be 974 across nine and it read as a brochure: every section carried body copy,
tag lists, metrics and descriptions, so nothing had room to land.

The detail did not get deleted, it moved to the pages built for it. The budget
that produced it: **a heading of six words or fewer, and at most one supporting
line of about eighteen.** Anything that needed more became a link.

---

## The intro

`index.html` opens inside somebody else's browser.

A drawn window — tab strip, traffic lights, an address bar that navigates —
sits on a desk. A pointer moves to the search field, somebody types *how to
build a website*, autocomplete offers the usual three, and the fourth is Orion.
The results page swaps in, the address bar and the tab title follow it, the
pointer clicks the one result, and **Orion opens in a second tab** — which then
zooms until the tab is the screen.

The search engine is Google, at the client's instruction, and the mark is
**drawn rather than set**: Product Sans is not a typeface anybody can license,
and the letterforms are geometric enough to build from a handful of arcs and
bars. Orion's own address in that bar is its name rather than a domain nobody
owns — an earlier version printed `orion.build`, and the truth sweep caught it,
because a domain you do not own printed in an address bar is a claim rather
than a drawing.

It runs off a **cue list evaluated against elapsed time**, not chained timeouts.
That is what makes it skippable: Escape fires every cue that has not run yet and
lands on the final frame. Skip is an ordinary link, so the page curtain carries
it into the site.

Because a gate that replays on every visit gets old fast, the sequence records
itself in `sessionStorage` once it has run, and later visits in the same session
land on the final frame. It is deliberately **not** a redirect — bouncing the
root to another page traps the back button.

The root carries a real `<h1>`, and its first paint is on frame one rather than
behind a reveal, so the landing page keeps an LCP inside the site's budget
despite being an animation.

---

## The short version

The first thing under the hero, because it is what somebody who has just
arrived actually wants: what this is, why it is worth paying for, what happens
if they say yes, what it costs, and what they are left holding.

Five acts over one canvas. A cloud of points morphs between five arrangements
as you scroll — a page, then a lattice of identical pages, then a process, then
three bars, then Orion's Belt — and the **same scroll position** picks the
words, so the picture and the sentence cannot drift apart. The argument is in
the shapes.

**After you say yes** follows it with the six steps in order, because the
question after "why" is always "and then what happens".

---

## The walkthrough

**Walk me through it** under the hero runs an eleven-stop tour across six pages:
the home page, the demos, the prices, the terms, the teardown, and the brief.
Each stop scrolls to the thing it is describing and puts a ring round it.

There is no router here — every page is a separate document — so the
position lives in `sessionStorage` and the panel rebuilds itself wherever it
lands. Next and Back are **links** when they cross a page boundary, so the
existing page curtain carries them, and buttons when they do not. A stop
inside a pinned track can walk a fraction of the way into it (`into`),
because the top of a three-screen track is the frame where nothing has
happened yet.

The copy for all eleven stops lives in one JSON block in the shared chrome, so
the stops cannot drift between pages.

Every stop argues by pointing at something the reader can check rather than
by claiming anything — the words were written for this business, the
pictures were drawn for these pages, the prices are printed, the numbers are
measurable in their own browser. That is the only kind of argument this site
is allowed to make.

---

## The detonation

`makeBurst(canvas)` is a real explosion on a 2D canvas: a white-hot core, a
pressure ring, a pane of glass cut into shards and thrown outward, sparks, and
smoke for the light to hang in.

The shards are the part that matters. A rectangle is cut on a **jittered lattice
that neighbouring cells share**, so every fragment edge matches the fragment
beside it and the pane reads as one thing breaking rather than a grid of
rectangles flying apart. Speed falls off with distance from the blast, which is
what puts the hole in the middle first and peels the edges away after.

Sparks are biased into uneven lobes by a slow wave over the angle. An even fan
reads as a firework; a detonation is lopsided.

It fires twice on this site: at the end of the intro, when the page becomes
Orion, and on the home page's assembly — once when the scroll reaches the end of
the track, and again whenever you press **Detonate**.

The kick it gives the assembly is added **at draw time and never written back
into the damped camera**. A damped value that is also being added to every frame
converges on the wrong number rather than on its target: with a 110ms half-life
and a constant addition, the steady state is about twenty-five times the kick.

---

## The Assembly

A scroll-driven exploded view, in software 3D on a 2D canvas. Five layers of a
web page — grid, structure, type, colour, motion — built as sets of primitives
in local space and separated along z. A camera of six keyframes is sampled by
scroll position rather than by a clock, so the object is wherever your scroll
says it is.

Layers are depth-sorted per frame and the one being described reads brightest,
so exactly one thing is legible at a time.

Under reduced motion the track collapses, the stage stops pinning, and the
object renders once as a static three-quarter frame with every caption shown.

---

## The demo sites

Three complete sites, one per package. Every business is invented and every
page says so in a bar across the top. They are not case studies; they are what
each package looks like finished.

| | package | pages | what it demonstrates |
|---|---|---|---|
| **Alderley Chess Club** | Starter Launch | 3 | one interactive thing, done properly |
| **Fairweather Barbers** | Business Growth | 5 | a real business, running |
| **Saltmarsh** | Premium Custom | 4 | a site that behaves like an application |

The ladder has to be visible or the prices are arbitrary. Starter gets a
steppable chess opening and nothing else moving. Growth adds a filterable
gallery on a lightbox, a drawn street map, and a sign in the header that reads
the clock. Premium adds a scroll film and a working booking system.

### `demos/_lib/` — the shared floor

`base.css`, `motion.js` and `art.js`. What separates a Starter site from a
Premium one is how much of this it uses, not how well it is built.

**`art.js` — pictures, drawn rather than photographed.**
There are no photographs and no rights to any, and a site for a restaurant with
no pictures reads as a wireframe. So the pictures are generated:

- `marsh` — an estuary where the light and the tide are both parameters. Sky,
  sun, cloud bands stretched by fBm, two banks, water with a broken specular
  path, groyne posts with reflections, channels cut into the mud, reeds, birds,
  mist.
- `interior` — a room at night. The first version drew the whole room and read
  as a diagram of a restaurant; a dark room photographs as almost entirely black
  with three things catching the light, so that is what it draws.
- `portrait` — a head in profile as a halftone. Front-on ovals read as the
  placeholder avatar every piece of software draws when it has no photograph; a
  profile reads as a person, and it shows the shape of the cut.
- `board` — a chess board under one lamp, in perspective, with turned pieces.
- `map` — a plausible town, generated from a seed. A real street plan on a demo
  for a shop that does not exist would be claiming an address.
- `field` — a quiet full-bleed texture with contour threads.

A canvas paints the first time it comes near the viewport, repaints on resize,
and is driven by the frame loop only while it is on screen and animated.

**`motion.js` — one frame loop, split read-then-write.** Interleaving a layout
read after a style write forces a synchronous layout, and with a dozen animated
elements that is dozens of layouts a frame. Everything is opt-in by attribute:
`data-rev`, `data-par`, `data-mag`, `data-count`, `data-marquee`, `data-seq`,
`data-lift`, `data-lb`, `data-split`.

It also publishes `--chrome`: the measured height of the demo notice plus the
sticky header. A hero that asks for `100svh` on top of that pushes its own call
to action off the bottom of the first screen, so heroes subtract it.

### Saltmarsh's tide film

A pinned track of 340svh. Scroll position sets the hour and the water level on
one canvas, and the four captions are keyed to the *same* number — so the words
and the picture can never drift. The landscape repaints at 30fps rather than
every frame, which is more than the eye asks of a sunset.

### Saltmarsh's booking system

Three steps: a date, a time and a party size, then who is coming.

Availability is **derived from the date** rather than stored, so it is stable
across reloads without a server: the same Tuesday is always shut and the same
Friday is always nearly full. A real build would ask the restaurant's system.
Every step but the final write is live, and the confirmation says plainly that
nothing was sent.

### The barbers' sign

The header sign reads the clock: *Open until 18:00*, *Open, closing at 18:00*
in the last hour, or *Closed · open Thursday 09:00*. It repaints once a minute
and marks today in the printed hours table.

---

## Money

`pay.html` is a checkout that **handles no money**. There are no card fields and
no payment code, because a site that collects card details has a PCI surface and
this one should not have one. Each package points at a Stripe hosted Payment
Link; Stripe takes the payment on its own page.

Set the links in `tools/data/site.js`:

```js
checkout: { starter: "", growth: "", premium: "" }
```

While a link is empty its package shows the invoice route instead, which is the
right way to start anyway. The build **fails** if a link is not an `https`
Stripe URL — a typo in a payment link is not something to discover in
production.

The account has to belong to an adult. Stripe's terms require the account holder
to be 18, and in England a contract with a minor is generally not enforceable
against them, so the account and the contracts go in a parent's name.

Prices live in `tools/data/packages.js` and appear on `prices.html`, `pay.html`
and `contact.html` from that one source. The build fails if the three ever
disagree.

## Capacity, written down

A monthly fee is a promise about future time, so the limits that keep it
keepable are printed on the site: six sites carried on a monthly plan at once,
two builds running at the same time, three months' notice before winding a plan
down. A cap nobody can see is a cap you will quietly break.

---

## The single-file preview

`node tools/make-artifact.js` folds the whole site into one self-contained HTML
file: every page as a section, six font families inlined as data URIs, page
links rewritten to in-file anchors. It refuses to emit a dead link.

A single file has no second page to point an iframe at, so the machine's screen
shows full-length stills instead. `node tools/demo-stills.mjs` captures them
with reduced motion on — which collapses the pinned tracks and shows every
scroll reveal, which is exactly what a still of the page should contain.

---

## Motion

Everything scroll-linked runs through one `requestAnimationFrame` loop in three
phases: every layout **read**, then all the maths, then every style **write**.

Damping is frame-rate independent, so the same half-life holds at 30fps and 144:

```js
damp(cur, target, halfLife, dt) => lerp(cur, target, 1 - 2 ** (-dt / halfLife));
```

Under `prefers-reduced-motion` every sequence collapses to its destination
rather than being removed: the reader gets the information, not the journey.

---

## Sound

Off by default, and a toggle in the header. Every sound is synthesised in the
Web Audio API — no files, no network. The context is created on the first
gesture, because browsers refuse one made before.

---

## Traps worth naming

### `String.replace` ate my selector

`String.replace` treats `$` in the **replacement** as an escape. `$&` inserts
the whole match, `` $` `` inserts everything before it. A replacement containing
`$(".lab__tab")` therefore becomes `$(".lab__tab")` with the preceding
document spliced in — and the module it belonged to returns early and dies in
silence.

This bit three times. Always pass a function:

```js
s.replace(needle, () => replacement);   // not s.replace(needle, replacement)
```

### `[hidden]` has to win

`.btn` is `display: inline-flex`. The user-agent sheet's `[hidden] { display:
none }` is a plain element-attribute rule, so any component that sets its own
`display` outranks it — and hiding that component from script then does nothing
at all, silently. It leaked the nav CTA onto small screens once and showed a
live pay button for an unconfigured package once. One rule ends it:

```css
[hidden] { display: none !important; }
```

### `putImageData` replaces, it does not blend

It ignores `globalCompositeOperation`, `globalAlpha` **and** the current
transform. Stamping film grain that way does not lay grain over a picture, it
wipes the picture. `grain()` tiles a cached noise canvas with `createPattern`
instead.

### Nonzero winding cancels

Filling a head, its hair and its beard as one path lets their winding directions
cancel where they overlap, and nonzero then punches a hole through the crown.
Each part begins, closes and fills on its own.

Related: every hair shape's inner edge has to sit **below** the crown of the
skull, not above it. A hairline gap between two fills reads as a dark bar drawn
across the head.

### A damped value must not be fed its own kick

Adding a constant to a value that is also being damped towards a target makes it
converge on `target + k/rate`, not on `target`. Add the kick at draw time.

### `position: sticky` fails silently, twice

1. **A transformed ancestor.** A transform makes an element the containing block
   for everything inside it, so a sticky descendant stops behaving. This is why
   the 3D rig applies perspective per element, and why `init3D` refuses to tilt
   any section containing a sticky element rather than relying on anyone
   remembering.
2. **A shrink-wrapped containing block.** A sticky element can only travel
   within its containing block. In a grid with `align-items: start` a sidebar
   column is only as tall as its content, so there is nowhere to travel. The
   column needs `align-self: stretch`.

### A palette token reaching where it should not

Three contrast failures, all the same shape. `.nav a` set the colour of the
label *inside* a solid button and painted it the same as the fill behind it. The
footer's muted greys were mixed from `--paper`, which is black on a dark demo —
they come from their own `--foot-ink` now. And an accent that is a signature on
bone is unreadable on near-black.

---

## Verified

Measured in a real browser rather than asserted. Every number below was produced
by a script, not by looking.

- **28 pages** — 16 site, 12 demo — load with no page error and exactly one `<h1>`
- **link graph** — 0 dead file links, 0 dead anchors
- **contrast** — every piece of text on all 28 pages meets WCAG 2.2 AA, computed
  numerically against its real composited ground. Disabled controls are exempt
  under 1.4.3; text over a picture is judged by eye, not by this
- **no JavaScript** — all 28 pages render their full text with script disabled.
  Every reveal starts at `opacity: 0`, so without the `<noscript>` block this is
  a blank page under a preloader that never lifts
- **overflow** — no horizontal overflow at 360, 390, 768, 1024, 1280, 1440, 1920
- **the intro** — the address bar navigates, the tab title follows it, Orion
  opens in a second tab, the tab zooms, the page detonates, the title card lands
- **the demos** — the opening steps and highlights its last move; the gallery
  filters 8 → 2 and the lightbox opens, paints its copy and traps focus; the
  tide film's sun and clock both advance with the scroll and the captions stay
  keyed to them; a booking runs date → sitting → details, refuses an empty
  submission and confirms a complete one
- **the truth sweep** — 33 banned patterns across every generated file, and the
  build exits non-zero on a hit

## Before publishing

1. Set `origin` in `tools/data/site.js` to the real domain. While it is empty
   the build emits no canonical, no `og:url` and no sitemap, because a canonical
   pointing at a domain you do not own is worse than none.
2. Create the three Stripe Payment Links and paste them into `checkout`.
3. Re-run `node tools/build.js`, `node tools/demos/build.js` and the
   verification scripts.

## Fonts

Six families, latin subsets, self-hosted under the SIL Open Font License 1.1
(`assets/fonts/LICENSE.txt`). Bodoni Moda (roman and italic), Archivo and IBM
Plex Mono carry this site; Fraunces, Bebas Neue and Cormorant Garamond give the
demo sites their own voices. Bodoni and Archivo are variable, so every weight
and every width comes from one file each.

Self-hosting removes the render-blocking third-party request and the flash of
fallback text a font CDN causes on a cold connection. It is also the only way
the "no third-party request" claim on the site is true.
