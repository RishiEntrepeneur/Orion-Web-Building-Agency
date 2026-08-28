# Orion

A web studio site. Two versions live in this repository, and they exist for
different reasons.

## `site/` — the one that is deployed

One HTML document, plus one serverless function. No framework, no bundler, no
dependencies past a font stylesheet, and **no build step** — which is the point.
Nothing between writing a page and having it online can fail, because there is
nothing in between.

- `site/index.html` — the whole front end, about 20 KB
- `site/functions/api/contact.js` — the contact endpoint, zero dependencies
- `site/_headers` — security headers, applied at the edge

### Deploy it

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/RishiEntrepeneur/Orion-Web-Building-Agency)

Or by hand, which takes about two minutes:

1. **dash.cloudflare.com** → Workers & Pages → Create → Pages → Connect to Git
2. Pick this repository and the branch `claude/agency-landing-3d-ai-gyutrd`
3. **Framework preset:** None · **Build command:** *leave empty* ·
   **Build output directory:** `site`
4. Deploy

The empty build command is deliberate. Cloudflare finds `site/functions/`
on its own and deploys the endpoint alongside the page.

### Make the contact form deliver

Settings → Environment variables:

| Variable | Value |
| --- | --- |
| `RESEND_API_KEY` | a key from [resend.com](https://resend.com) |
| `CONTACT_TO` | where briefs should land |
| `CONTACT_FROM` | only once a domain is verified in Resend |

Redeploy after adding them — variables are read at build time.

Without a key the endpoint still validates the brief and reports that delivery
is not configured, and the form hands the message to the visitor's own mail app
instead. It never reports a send that did not happen.

## `app/` — the one with the WebGL film

A Next.js application: a volumetric cloud sky raymarched in a fragment shader,
a seven-chapter scroll film that plays itself, a brief-to-layout engine, and a
keyboard-first command palette. It is the more interesting piece of work and
the harder thing to keep running.

It needs a working Node toolchain: `npm install`, then `npm run dev`.
