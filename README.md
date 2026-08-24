# ORION — 3D & AI Agency Landing Page

A production-ready, dark-themed, cinematic landing page for an agency selling
next-generation 3D and AI-driven websites to premium brands and local
businesses.

Built as a **single core page** (`app/page.tsx`) composed of seven sections,
with a small set of statutory pages under `/legal`.

---

## Stack

| Concern     | Choice                                                  |
| ----------- | ------------------------------------------------------- |
| Framework   | Next.js 16 (App Router, React 19, TypeScript, Turbopack) |
| Styling     | Tailwind CSS v4 (CSS-first `@theme` configuration)      |
| Icons       | `lucide-react`                                          |
| Motion      | Native CSS animations + `IntersectionObserver`          |
| Fonts       | Space Grotesk (display) + Inter (body) via `next/font`  |

No animation library, no 3D runtime, no CSS-in-JS — every effect is CSS or a
handful of lines of vanilla DOM work, so the page ships as fully static HTML.

---

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run build      # production build (all routes prerender statically)
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
```

---

## Page architecture

```
app/
  layout.tsx              Root shell: fonts, SEO metadata, JSON-LD, page chrome
  page.tsx                The single core landing page
  globals.css             Tailwind v4 theme: palette, keyframes, utilities
  icon.svg                Favicon
  legal/                  Privacy · Terms · Cookies · Accessibility
components/
  Navbar.tsx              Sticky nav: blur, scroll progress, scrollspy, drawer
  CookieConsent.tsx       UK GDPR / PECR cookie control
  LegalPage.tsx           Shared shell for the statutory pages
  sections/
    Hero.tsx              Headline, subheadline, dual CTAs, 3D viewframe
    ScrollTransformation.tsx  Bento grid: how 2D flats become 3D environments
    Pricing.tsx           Three productised packages
    Process.tsx           Three-step production timeline
    Faq.tsx               Objection-handling accordion + FAQPage structured data
    Footer.tsx            Legal compliance footer
  ui/
    Viewframe3D.tsx       Simulated Spline/Dora scene with HUD chrome
    DepthStack.tsx        Interactive "flat 2D → spatial 3D" demonstration
    SpotlightCard.tsx     Glass card with a cursor-tracking spotlight
    Reveal.tsx            Scroll-triggered entrance animation
    CtaLink.tsx           Glowing call-to-action anchor
    SectionHeading.tsx    Shared eyebrow / title / description header
    AmbientBackdrop.tsx   Grid mesh, nebula orbs, grain, vignette
    LogoMark.tsx          Animated wireframe-cube logo marker
    CookiePreferencesButton.tsx
lib/
  site.ts                 Brand, contact, navigation and UK legal details
  faqs.ts                 FAQ copy (also feeds the FAQPage structured data)
  utils.ts                `cn()` classname joiner
```

---

## Dropping in a real 3D scene

`components/ui/Viewframe3D.tsx` renders a dependency-free stand-in: a real CSS
3D cube inside a HUD shell with crosshairs, scanlines and live telemetry. Every
HUD layer is absolutely positioned over the scene, so swapping the scene leaves
the chrome untouched.

```bash
npm install @splinetool/react-spline
```

Then replace `<SimulatedScene />` inside the viewport `<div>`:

```tsx
<Spline scene="https://prod.spline.design/<your-scene>/scene.splinecode" />
```

An `<iframe>` (Spline's share embed or a Dora export) works the same way.

---

## Rebranding

Almost everything brand-facing lives in **`lib/site.ts`**: name, tagline,
domain, email, phone, and the UK legal block. Colours and motion live in the
`@theme` blocks at the top of **`app/globals.css`**.

> **The legal pages ship with placeholder content.** Replace the company
> number, VAT number, ICO registration and registered office in `lib/site.ts`,
> and have `app/legal/*` reviewed by a qualified UK solicitor before relying on
> them commercially.

---

## Accessibility & performance notes

- Semantic HTML5 landmarks, one `<h1>`, ordered heading outline, skip link.
- The accordion, mobile drawer and cookie dialog are keyboard operable with
  correct `aria-expanded` / `aria-controls` wiring.
- All decorative chrome (grid mesh, HUD, orbs, the 3D scene) is
  `aria-hidden`; the depth demonstration carries a descriptive `role="img"`
  label.
- `prefers-reduced-motion: reduce` disables every animation and forces all
  scroll-reveal content visible.
- Text colours meet WCAG 2.2 AA contrast against the dark surfaces.
- Cursor parallax writes transforms straight to the DOM inside a
  `requestAnimationFrame` loop, so pointer movement never re-renders React.
- Verified with no horizontal overflow from 320px to 1920px.
