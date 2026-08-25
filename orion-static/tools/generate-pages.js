/* ---------------------------------------------------------------
   Page generator.
   home.html is the source of truth for the shared chrome (head,
   preloader, HUD, nav, drawer, footer). This lifts everything
   outside <main> from it and re-emits the other pages around their
   own bodies, so the chrome can never drift between pages.

   Absolute URLs (canonical, og:url, JSON-LD) are emitted only when
   tools/data/site.js has an origin set. Pointing a canonical at a
   domain you do not own is worse than having none.

   Usage:  node tools/generate-pages.js
   --------------------------------------------------------------- */
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const SITE = require("./data/site.js");

const ORIGIN = String(SITE.origin || "").replace(/\/+$/, "");
const abs = (page) => (ORIGIN ? ORIGIN + "/" + (page === "index.html" ? "" : page) : null);

const index = fs.readFileSync(path.join(ROOT, "home.html"), "utf8");
const openTag = '<main id="main">';
const closeTag = "</main>";
const a = index.indexOf(openTag);
const b = index.lastIndexOf(closeTag);
if (a < 0 || b < 0) throw new Error("cannot locate <main> in home.html");

const head = index.slice(0, a);
const tail = index.slice(b + closeTag.length);

function chrome(page, opts) {
  let h = head;
  h = h.replace(/<title>[^<]*<\/title>/, `<title>${opts.title}</title>`);
  h = h.replace(/(<meta name="description" content=")[^"]*(")/, () => `<meta name="description" content="${opts.desc}"`);
  h = h.replace(/(<meta property="og:title" content=")[^"]*(")/, () => `<meta property="og:title" content="${opts.title}"`);
  h = h.replace(/(<meta property="og:description" content=")[^"]*(")/, () => `<meta property="og:description" content="${opts.desc}"`);
  h = h.replace(/<body data-page="[^"]*">/, `<body data-page="${opts.slug}">`);

  /* canonical + og:url only exist once a real domain is known */
  const url = abs(page);
  if (url) {
    h = h.replace('<link rel="stylesheet"', `<link rel="canonical" href="${url}" />\n\n<link rel="stylesheet"`);
    h = h.replace('<meta name="twitter:card"', `<meta property="og:url" content="${url}" />\n<meta name="twitter:card"`);
  }

  /* in-page anchors in the shared chrome must point back at the homepage */
  h = h.replace(/href="#(assembly-section|services|work|contact)"/g, 'href="home.html#$1"');

  /* mark the current page in the primary nav */
  if (opts.current) {
    const re = new RegExp(`(<a class="nav__link" href="${opts.current}")`, "g");
    h = h.replace(re, '$1 aria-current="page"');
    const re2 = new RegExp(`(<a class="drawer__a" style="--i:\\d+" href="${opts.current}")`, "g");
    h = h.replace(re2, '$1 aria-current="page"');
  }

  /* a 404 must not be indexed */
  if (opts.noindex) {
    h = h.replace('<meta name="theme-color"', '<meta name="robots" content="noindex, follow" />\n<meta name="theme-color"');
  }

  /* BlogPosting schema for build notes */
  if (opts.article) {
    const art = opts.article;
    const fields = [
      '"@context":"https://schema.org"',
      '"@type":"BlogPosting"',
      `"headline":${JSON.stringify(art.title)}`,
      `"description":${JSON.stringify(art.dek)}`,
      `"datePublished":"${art.date}"`,
      `"dateModified":"${art.date}"`,
      `"articleSection":${JSON.stringify(art.category)}`,
      `"author":{"@type":"Person","name":${JSON.stringify(SITE.name)}}`,
      `"publisher":{"@type":"Person","name":${JSON.stringify(SITE.name)}}`
    ];
    if (url) fields.push(`"mainEntityOfPage":"${url}"`);
    h = h.replace("</head>", `<script type="application/ld+json">\n{${fields.join(",")}}\n</script>\n</head>`);
  }

  /* breadcrumb for subpages */
  if (opts.crumb) {
    const homeUrl = abs("index.html");
    const homeItem = homeUrl ? `,"item":"${homeUrl}"` : "";
    const hereItem = url ? `,"item":"${url}"` : "";
    h = h.replace("</head>", `<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home"${homeItem}},{"@type":"ListItem","position":2,"name":${JSON.stringify(opts.crumb)}${hereItem}}]}
</script>
</head>`);
  }
  return h;
}

function footTail() {
  return tail.replace(/href="#(assembly-section|services|work|contact)"/g, 'href="home.html#$1"');
}

function write(page, opts, body) {
  const out = chrome(page, opts) + "\n<main id=\"main\">\n" + body + "\n</main>\n" + footTail();
  fs.writeFileSync(path.join(ROOT, page), out);
  console.log("wrote", page, out.split("\n").length, "lines");
}

module.exports = { write, SITE, ORIGIN, abs };
