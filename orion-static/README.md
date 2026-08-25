# Orion — static starter

**Architecting Elite Digital Experiences**

A production-oriented static site for the Orion agency: semantic HTML5, Tailwind
CSS via CDN, and dependency-free ES6+ JavaScript. No build step required to run
it, no framework, no npm install.

> **Note on this repository.** There is a second, separate implementation of the
> Orion site at the repository root, built with Next.js, React and Three.js. The
> two are independent and neither depends on the other — this directory is the
> zero-dependency static version. Pick one to take forward, or keep both.

---

## Run it

Any static server will do; there is nothing to compile.

```bash
cd orion-static
python3 -m http.server 8000     # then open http://localhost:8000
```

Opening `index.html` directly with `file://` also works.

---

## Structure

```
orion-static/
├── index.html         Single-page site: hero, services, process, work, contact
├── services.html      Detailed service breakdown
├── contact.html       Standalone briefing form
├── assets/
│   ├── css/styles.css Palette, glass + glow treatments, timeline, motion
│   ├── js/app.js      Header, menu, scrollspy, reveals, particles, validation
│   └── img/favicon.svg
└── README.md
```

`index.html` is the primary architecture — one page, smooth-scrolled anchors,
and a scrollspy that keeps the nav in step. `services.html` and `contact.html`
are genuine separate pages for depth, sharing the same global CSS and JS. Every
module in `app.js` exits quietly when the markup it needs is absent, so one
script serves all three pages without per-page guards.

---

## Before you deploy: replace the Tailwind CDN

`index.html` loads Tailwind from `cdn.tailwindcss.com`. That is the Play CDN —
it ships the **compiler** to the browser and cannot purge unused styles.
Tailwind's own documentation says not to use it in production. It is here
because the brief asked for Tailwind via CDN, and it is genuinely convenient
while you are editing.

To ship, generate a real stylesheet once:

```bash
npx tailwindcss@3 -i tailwind.in.css -o assets/css/tailwind.css --minify
```

…where `tailwind.in.css` contains the three `@tailwind` directives and a
`tailwind.config.js` carries the same `theme.extend` block that is currently
inline in `index.html`. Then in each page, swap:

```html
<script src="https://cdn.tailwindcss.com"></script>
<script>tailwind.config = { ... }</script>
```

for:

```html
<link rel="stylesheet" href="assets/css/tailwind.css" />
```

That is the only change needed. The compiled sheet for this markup is about
13 KB before gzip, against roughly 400 KB of compiler over the CDN.

---

## Colour, and why some of it is not what you would expect

The palette is the brief's: obsidian and deep slate substrate, stark white
type, electric blue `#3b82f6` and neon violet `#8b5cf6`. Every value was
measured rather than eyeballed, and two results changed the design:

| Pairing | Ratio | Consequence |
|---|---|---|
| `#8b5cf6` text on `--raised` | **3.97:1** | Fails AA. Violet **text** uses `--violet-text` `#b69cff` (7.36:1). Raw violet is for glows, borders and fills only. |
| White text on a solid `#3b82f6` fill | **3.68:1** | Fails AA. Filled accent buttons carry **dark ink** — `#05060a` on blue is 5.51:1, on violet 4.78:1. |

Everything else clears AA comfortably: muted body text 8.05:1 at worst, dim
text 4.69:1, blue text 4.58:1.

---

## What the JavaScript does

| Module | Behaviour |
|---|---|
| Header | Frosts on scroll; transparent over the hero. |
| Mobile menu | Toggle, `Escape` to close, focus trapped inside, scroll locked on `<html>` (locking `<body>` alone does nothing, since `<html>` is the scrolling element). |
| Smooth scroll | Native `scroll-behavior` with `scroll-padding-top` clearing the fixed header; JS moves focus to the target so keyboard and screen-reader users follow too. |
| Scrollspy | `IntersectionObserver` marks the current section with `aria-current`. |
| Reveals | Fade-and-rise on entry — except anything already on screen at load, which is shown with **no transition at all**. An element at `opacity: 0` does not count as painted, so animating the hero in would delay Largest Contentful Paint by the length of the fade for no benefit. |
| Timeline | Rail draws, then each node lights in sequence. |
| Particles | Canvas 2D starfield, density scaled to viewport area and capped, DPR capped at 2, links to the cursor, and paused when the tab is hidden or the hero scrolls away. |
| Form | Field-level validation on blur, errors cleared as they are fixed, focus moved to the first invalid field on submit. |

All motion is disabled and the particle canvas hidden under
`prefers-reduced-motion: reduce`.

---

## Wiring the contact form

There is no backend, so the form does not pretend to send. On a valid submit it
assembles the brief, shows it, and offers it as a prefilled `mailto:` draft —
which genuinely works. To post it somewhere real, replace the mailto block in
`initForm()` (`assets/js/app.js`) with a `fetch()` to your endpoint.

The email rule deliberately warns rather than blocks on free-mail domains: a
personal address is a lead, not an error.

---

## Placeholder content to replace

- Portfolio cards in `index.html` — client names, copy and tags are illustrative.
- `hello@orion.studio` throughout, including the mailto in `app.js`.
- Budget tiers in the contact form's `<select>`.
