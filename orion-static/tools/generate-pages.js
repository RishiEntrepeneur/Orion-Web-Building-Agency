/* ---------------------------------------------------------------
   Page generator.
   home.html is the source of truth for the shared chrome (head,
   preloader, HUD, nav, drawer, footer). This lifts everything
   outside <main> from it and re-emits the other pages around their
   own bodies, so the chrome can never drift between pages.

   Usage:  node tools/generate-pages.js
   --------------------------------------------------------------- */
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");

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
  h = h.replace(/(<meta name="description" content=")[^"]*(")/, `$1${opts.desc}$2`);
  h = h.replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${opts.title}$2`);
  h = h.replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${opts.desc}$2`);
  h = h.replace(/(<link rel="canonical" href="https:\/\/orion\.build\/)[^"]*(")/, `$1${page}$2`);
  h = h.replace(/(<meta property="og:url" content="https:\/\/orion\.build\/)[^"]*(")/, `$1${page}$2`);
  h = h.replace(/<body data-page="[^"]*">/, `<body data-page="${opts.slug}">`);
  /* in-page anchors in the shared chrome must point back at the homepage */
  h = h.replace(/href="#(services|method|work|contact)"/g, 'href="home.html#$1"');
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

  /* Article schema for journal pieces */
  if (opts.article) {
    const a = opts.article;
    h = h.replace("</head>", `<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BlogPosting","headline":${JSON.stringify(a.title)},"description":${JSON.stringify(a.dek)},"datePublished":"${a.date}","dateModified":"${a.date}","articleSection":${JSON.stringify(a.category)},"author":{"@type":"Organization","name":"Orion"},"publisher":{"@type":"Organization","name":"Orion"},"mainEntityOfPage":"https://orion.build/${page}"}
</script>
</head>`);
  }

  /* JSON-LD breadcrumb for subpages */
  if (opts.crumb) {
    h = h.replace("</head>", `<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://orion.build/"},{"@type":"ListItem","position":2,"name":"${opts.crumb}","item":"https://orion.build/${page}"}]}
</script>
</head>`);
  }
  return h;
}

function footTail(page) {
  let t = tail;
  t = t.replace(/href="#(services|method|work|contact)"/g, 'href="home.html#$1"');
  return t;
}

function write(page, opts, body) {
  const out = chrome(page, opts) + "\n<main id=\"main\">\n" + body + "\n</main>\n" + footTail(page);
  fs.writeFileSync(path.join(ROOT, page), out);
  console.log("wrote", page, out.split("\n").length, "lines");
}

module.exports = { write };
