/* Build the single-file artifact preview.
   An artifact is one HTML file, so anything that needs a second page is either
   pulled in whole or removed — never left as a link that goes nowhere.

   What ends up in it: the intro sequence as an overlay, then the home page,
   with the package cards and the real contact form lifted in from the two
   pages that own them, so the preview ends somewhere useful. */
const fs = require("fs"), path = require("path");
const R = path.resolve(__dirname, "..");
/* Where the demo stills live. Regenerate them with tools/demo-stills.mjs
   whenever a demo page changes, or the machine will show a stale screen. */
const STILLS = process.env.STILLS || path.join(R, "tools", "stills");
const OUT = process.env.OUT || path.join(R, "tools", "orion-preview.html");
let html = fs.readFileSync(path.join(R, "home.html"), "utf8");
let css = fs.readFileSync(path.join(R, "assets/css/styles.css"), "utf8");
const js = fs.readFileSync(path.join(R, "assets/js/app.js"), "utf8");

for (const f of fs.readdirSync(path.join(R, "assets/fonts")).filter(n => n.endsWith(".woff2"))) {
  const b64 = fs.readFileSync(path.join(R, "assets/fonts", f)).toString("base64");
  css = css.split(`url("../fonts/${f}")`).join(`url("data:font/woff2;base64,${b64}")`);
}

/* Find a section by its data-sec value and walk back to the opening tag.
   Matching the whole opening tag as a literal string was brittle: adding an
   id to the packages section moved the attribute order and the lookup missed
   a section that was plainly there. */
const section = (src, sec) => {
  const marker = 'data-sec="' + sec + '"';
  const at = src.indexOf(marker);
  if (at < 0) throw new Error("section not found: " + sec);
  const a = src.lastIndexOf("<section", at);
  if (a < 0) throw new Error("no opening <section> before " + sec);
  const b = src.indexOf("</section>", at);
  if (b < 0) throw new Error("unclosed section: " + sec);
  return src.slice(a, b + "</section>".length);
};

const jsonld = (html.match(/<script type="application\/ld\+json">[\s\S]*?<\/script>/) || [""])[0];
let body = html.slice(html.indexOf(">", html.indexOf("<body")) + 1, html.lastIndexOf("</body>"));

/* ---- bring in the two sections worth showing from elsewhere ---- */
/* prices.html owns the packages, the ladder and the capacity commitment now */
const prices = fs.readFileSync(path.join(R, "prices.html"), "utf8");
const contact = fs.readFileSync(path.join(R, "contact.html"), "utf8");
const packages = section(prices, "PACKAGES");
const commitment = section(prices, "CAPACITY");
const form = section(contact, "BRIEF")
  /* it lands last here, after "what I build" and the packages */
  .replace('<span class="sec-head__idx">01</span>', '<span class="sec-head__idx">04</span>');

/* ---- the machine ----------------------------------------------------
   demos.html runs the three demo sites live in an iframe. A single file
   has no second page to point an iframe at, so the screen shows the real
   pages as full-length stills instead, and becomes scrollable once the
   flight lands. The camera move is identical. */
const demos = fs.readFileSync(path.join(R, "demos.html"), "utf8");
let lab = section(demos, "MACHINE");
/* the tier ladder is the argument the machine is evidence for, so the
   preview carries both */
const ladder = section(prices, "LADDER");

const shot = (name) =>
  "data:image/jpeg;base64," + fs.readFileSync(path.join(STILLS, "full-" + name + ".jpg")).toString("base64");

/* the iframe and its glare go; a stack of stills takes their place */
lab = lab.replace(/<iframe class="mach__frame"[\s\S]*?<\/iframe>/,
  '<div class="mach__page" data-shot-wrap>' +
  ["chess", "barbers", "saltmarsh"].map((k, i) =>
    `<img data-shot="${k}" data-on="${i === 0}" alt="" width="1200" src="${shot(k)}" />`
  ).join("") +
  "</div>");

/* nothing to open full size in a single file, so that line becomes a note */
lab = lab.replace(/<a id="lab-open"[^>]*>[\s\S]*?<\/a>/,
  '<span class="lab__real">These are the real pages — scroll them once you are inside</span>');
lab = lab.replace('<span id="lab-state">Closed</span>', '<span id="lab-state">Closed</span>');

const labCss = `
.mach__page { position: absolute; inset: 0; overflow: hidden; background: #fff; }
.mach[data-live="true"] .mach__page { overflow-y: auto; overscroll-behavior: contain; }
.mach__page img { display: none; width: 100%; height: auto; }
.mach__page img[data-on="true"] { display: block; }
.lab__real { color: var(--ash); }
`;

const labShim = `
/* artifact only: the tabs swap which still is on the screen */
(function () {
  var wrap = document.querySelector("[data-shot-wrap]");
  if (!wrap) return;
  var imgs = wrap.querySelectorAll("img[data-shot]");
  function show(key) {
    Array.prototype.forEach.call(imgs, function (im) {
      im.setAttribute("data-on", String(im.getAttribute("data-shot") === key));
    });
    wrap.scrollTop = 0;
  }
  Array.prototype.forEach.call(document.querySelectorAll(".lab__tab"), function (t) {
    t.addEventListener("click", function () {
      var d = t.getAttribute("data-demo") || "";
      show(d.split("/")[1] || "chess");
    });
  });
})();
`;

/* the home page's contact block is a CTA pointing at two pages that are not in
   this file; the real form says the same thing and actually works */
const homeContact = section(body, "CONTACT");
body = body.replace(homeContact,
  packages + "\n\n" + ladder + "\n\n" + commitment + "\n\n" + lab + "\n\n" + form);


/* ---- links: keep the ones that resolve to a section here, drop the rest ---- */
body = body
  .replace(/href="home\.html"/g, 'href="#index"')
  .replace(/href="services\.html"/g, 'href="#services"')
  .replace(/href="contact\.html"/g, 'href="#contact"')
  .replace(/href="work\.html(#[a-z-]+)?"/g, 'href="#work"')
  /* the machine is in this file, so its page link becomes the section anchor */
  .replace(/href="demos\.html"/g, 'href="#lab"')
  .replace(/href="prices\.html"/g, 'href="#packages"')
  .replace(/href="home\.html#/g, 'href="#');

/* nav + drawer: About and Build notes have no section in this file */
body = body.replace(/\s*<a class="nav__link" href="about\.html"[^>]*>[\s\S]*?<\/a>/, "");
body = body.replace(/\s*<a class="nav__link" href="journal\.html"[^>]*>[\s\S]*?<\/a>/, "");
body = body.replace(/\s*<li class="drawer__item"><a class="drawer__a"[^>]*href="about\.html"[\s\S]*?<\/li>/, "");
body = body.replace(/\s*<li class="drawer__item"><a class="drawer__a"[^>]*href="journal\.html"[\s\S]*?<\/li>/, "");
let n = 0;
body = body.replace(/(<a class="drawer__a" style="--i:)\d+(" href="[^"]*"(?: data-curtain="[^"]*")?><i>)\d+(<\/i>)/g,
  (m, a, b, c) => { const i = n++; return a + i + b + ("0" + (i + 1)).slice(-2) + c; });

/* work lane: three cards point at build notes, three at the teardown page.
   Neither exists here, so they stop advertising a click nothing can honour. */
body = body.replace(/<a class="(work__card[^"]*)" href="(?:journal-[^"]*|#work)"[^>]*>([\s\S]*?)<\/a>/g,
  (m, cls, inner) => `<article class="${cls}">${inner}</article>`);
/* and the lane's closing CTA duplicates the section it sits in */
body = body.replace(/\s*<a class="btn btn--solid" href="#work"[^>]*>\s*<span class="btn__lab">[\s\S]*?<\/span>\s*<\/a>/, "");

/* footer columns that index pages this file does not contain */
body = body.replace(/\s*<nav aria-label="Build notes">[\s\S]*?<\/nav>/, "");
body = body.replace(/\s*<li class="foot__li"><a href="(?:index|about|journal|pay)\.html"[^>]*>[^<]*<\/a><\/li>/g, "");
body = body.replace(/\s*<a class="mono" href="(?:privacy|terms)\.html"[^>]*>[^<]*<\/a>/g, "");
/* the About button in the hero pair, and anything else still aimed at it */
body = body.replace(/\s*<a class="btn btn--ghost" href="about\.html"[^>]*>\s*<span class="btn__lab">[\s\S]*?<\/span>\s*<\/a>/g, "");
body = body.replace(/\s*<a[^>]*href="about\.html"[^>]*>[\s\S]*?<\/a>/g, "");

body = body.replace(/<script src="assets\/js\/app\.js" defer><\/script>\n?/, "");

/* ---- the intro plays over the home page, then dissolves to reveal it ---- */
let intro = fs.readFileSync(path.join(R, "index.html"), "utf8");
const grab = (re) => { const m = intro.match(re); if (!m) throw new Error("intro piece missing: " + re); return m[0]; };
const bar = grab(/<header class="intro__bar">[\s\S]*?<\/header>/);
let sec = grab(/<section class="intro"[\s\S]*?<\/section>\n<\/main>/).replace("\n</main>", "");
const prog = grab(/<div class="intro__prog"[\s\S]*?<\/div>/);
/* the home page owns #flow; a duplicate id would steal that canvas */
sec = sec.replace(/\s*<div class="intro__field"[\s\S]*?<\/div>/, "");
const [bar2, sec2] = [bar, sec].map((h) => h.replace(/href="home\.html"/g, 'href="#index" data-intro-go'));

body = `<div id="intro-overlay">\n${bar2}\n${sec2}\n${prog}\n</div>\n` + body;
/* the intro is the loading experience here, so the preloader goes */
body = body.replace(/<div class="boot" id="boot"[\s\S]*?<div class="boot__bar" id="boot-bar" aria-hidden="true"><i><\/i><\/div>\n<\/div>\n/, "");

const overlayCss = `
#intro-overlay {
  position: fixed; inset: 0; z-index: 800; background: var(--void);
  transition: opacity 0.8s var(--ease-out), transform 1s var(--ease-out), filter 0.8s var(--ease-out);
}
#intro-overlay[data-done="true"] { opacity: 0; transform: scale(1.06); filter: blur(6px); pointer-events: none; }
#intro-overlay .intro { min-height: 100svh; }
`;

let jsPatched = js.replace('location.href = "home.html"', 'window.__introGo && window.__introGo()');
/* the site remembers that you have seen the intro and skips it next time;
   a preview should play every single time it is opened */
jsPatched = jsPatched.replace(
  'try { alreadySeen = sessionStorage.getItem("orion-intro") === "1"; } catch (e) {}',
  '/* artifact: always play */');
if (jsPatched.indexOf("artifact: always play") < 0) throw new Error("intro skip not neutralised");
const shim = `
/* artifact only: dismiss the intro overlay rather than navigating */
(function () {
  var ov = document.getElementById("intro-overlay");
  if (!ov) return;
  var root = document.documentElement;
  root.style.overflow = "hidden";
  function go(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (ov.getAttribute("data-done") === "true") return;
    ov.setAttribute("data-done", "true");
    root.style.overflow = "";
    window.scrollTo({ top: 0, behavior: "instant" });
    window.setTimeout(function () { if (ov.parentNode) ov.parentNode.removeChild(ov); }, 1100);
  }
  window.__introGo = go;
  Array.prototype.forEach.call(document.querySelectorAll("[data-intro-go]"), function (a) {
    a.addEventListener("click", go);
  });
})();
`;

const out = `<title>Orion</title>\n${jsonld}\n<style>\n${css}\n${overlayCss}\n${labCss}\n</style>\n${body}\n<script>\n${jsPatched}\n${shim}\n${labShim}\n<\/script>\n`;
fs.writeFileSync(OUT, out);
console.log("wrote " + OUT);

console.log(`artifact ${Math.round(out.length / 1024)}KB`);
const dead = [...out.matchAll(/href="([^"]*\.html[^"]*)"/g)].map(m => m[1]);
console.log(dead.length === 0 ? "PASS no page links left dead" : "FAIL dead: " + [...new Set(dead)].join(", "));
const ids = new Set([...out.matchAll(/id="([^"]+)"/g)].map(m => m[1]));
const anchors = [...new Set([...out.matchAll(/href="#([^"]+)"/g)].map(m => m[1]))].filter(a => a && !ids.has(a));
console.log(anchors.length === 0 ? "PASS every anchor resolves" : "FAIL anchors: " + anchors.join(", "));
