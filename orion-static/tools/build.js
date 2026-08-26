/* Regenerates every page except index.html (the intro landing page) and
   home.html, which is the source of truth for the shared chrome.
   Run: node tools/build.js */
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const { write, SITE, ORIGIN, abs } = require("./generate-pages.js");
const T = require("./templates.js");
const JOURNAL = require("./data/journal.js");
const PACKAGES = require("./data/packages.js");
const body = (f) => fs.readFileSync(path.join(__dirname, "bodies", f), "utf8");

/* ---------- what I build: packages injected from data ---------- */
/* The packages used to live here too. One home for a price is the whole
   point of having a price. */
const servicesBody = body("services.html");

/* ---------- contact: one copy of the form, options from the same data ---------- */
/* "£999+ + £99/month" reads badly, so a trailing + becomes a leading "from". */
const setupLabel = (k) => (k.setup.endsWith("+") ? "from " + k.setup.slice(0, -1) : k.setup);
const packageOptions = PACKAGES
  .map((k) => {
    const label = `${k.name} — ${setupLabel(k)} + ${k.monthly}/month`;
    return `                <option value="${label}">${label}</option>`;
  })
  .join("\n");

const contactBlock = body("contact-form.html")
  .replace("<!--PACKAGE_OPTIONS-->", () => packageOptions)
  .replace('data-inbox=""', () => `data-inbox="${SITE.email || ""}"`)
  .replace('<span class="sec-head__idx">05</span>', '<span class="sec-head__idx">01</span>')
  .replace('data-sec="CONTACT"', 'data-sec="BRIEF"')
  .replace('<span class="sec-head__label" data-scramble-in>Start here</span>',
           '<span class="sec-head__label" data-scramble-in>Project brief</span>');

/* ---------- pay: one option per package, wired to its Stripe link ---------- */
const LINKS = SITE.checkout || {};
const badLink = Object.keys(LINKS).filter((k) => LINKS[k] && !/^https:\/\/(buy\.stripe\.com|[a-z0-9-]+\.stripe\.com)\//.test(LINKS[k]));
if (badLink.length) {
  console.error("\nBUILD FAILED — checkout links must be https Stripe URLs:");
  badLink.forEach((k) => console.error("  " + k + ": " + LINKS[k]));
  process.exit(1);
}
const checkoutOptions = PACKAGES.map((k, i) => `          <button class="co__opt" type="button" role="radio" aria-checked="${i === 0}"
                  data-pk="${k.id}"
                  data-name="${k.name}"
                  data-setup="${k.setup}"
                  data-monthly="${k.monthly}"
                  data-link="${LINKS[k.id] || ""}"
                  data-inc="${k.features.join(" | ")}">
            <span class="co__on">${k.name}</span>
            <span class="co__op">${setupLabel(k)} <i>+ ${k.monthly}/mo</i></span>
            <span class="co__ot">${k.tagline}</span>
          </button>`).join("\n");

const payBody = body("pay.html").replace("<!--CHECKOUT_OPTIONS-->", () => checkoutOptions);

const pricesBody = body("prices.html")
  .replace("<!--PACKAGES-->", () => T.packages(PACKAGES))
  .replace("<!--LADDER-->", () => T.ladder(PACKAGES, { idx: "02" }))
  .replace("<!--COMMITMENT-->", () => T.commitment(SITE.capacity));

/* ---------- hand-written pages ---------- */
write("prices.html", {
  title: "Prices — Orion",
  desc: "Three packages: £299, £599 or from £999 to build, then £39, £59 or £99 a month. What each one includes, side by side.",
  slug: "prices", current: "prices.html", crumb: "Prices"
}, pricesBody);

write("pay.html", {
  title: "Pay — Orion",
  desc: "Pay for a job we have already agreed. Handled by Stripe; card details never touch this site.",
  slug: "pay", crumb: "Pay"
}, payBody);

write("services.html", {
  title: "What I build — Orion",
  desc: "Design and build, motion and 3D, performance and accessibility — and three packages, from £299 to build plus £39 a month.",
  slug: "services", current: "services.html", crumb: "What I build"
}, servicesBody);

write("demos.html", {
  title: "Demos — Orion",
  desc: "One finished demo site per package: a chess club, a barbershop and a restaurant with a working booking system.",
  slug: "demos", current: "demos.html", crumb: "Demos"
}, body("demos.html"));

write("work.html", {
  title: "This site — Orion",
  desc: "No client list yet, so here is this website taken apart: six problems it posed, how each was solved, and every number measured.",
  slug: "work", current: "work.html", crumb: "This site"
}, body("work.html"));

write("about.html", {
  title: "About — Orion",
  desc: "Orion is one person in England, of Indian family, who writes every line by hand — no framework, no template, no tracker.",
  slug: "about", current: "about.html", crumb: "About"
}, body("about.html"));

write("contact.html", {
  title: "Contact — Orion",
  desc: "Tell me what you want built. Read by one person, with no tracking and no autoresponder.",
  slug: "contact", current: "contact.html", crumb: "Contact"
}, body("head.html") + "\n" + contactBlock + "\n" + body("tail.html"));

write("privacy.html", {
  title: "Privacy — Orion",
  desc: "This website collects nothing: no analytics, no cookies, no third-party scripts. What happens to a message, and your rights under the UK GDPR.",
  slug: "privacy", crumb: "Privacy"
}, body("privacy.html"));

write("terms.html", {
  title: "Terms — Orion",
  desc: "Terms for using the Orion website, written in plain English. Orion is one person, not a company.",
  slug: "terms", crumb: "Terms"
}, body("terms.html"));

write("404.html", {
  title: "Page not found — Orion",
  desc: "That page is not on this site. Here is everything that is.",
  slug: "notfound", crumb: "Not found", noindex: true
}, body("notfound.html"));

/* ---------- build notes ---------- */
write("journal.html", {
  title: "Build notes — Orion",
  desc: "Problems I actually hit building this site, and what fixed them.",
  slug: "journal", current: "journal.html", crumb: "Build notes"
}, T.journalIndex(JOURNAL));

JOURNAL.forEach((a) => {
  const others = JOURNAL.filter((o) => o.slug !== a.slug);
  write(a.slug + ".html", {
    title: a.title + " — Orion build notes",
    desc: a.dek,
    slug: a.slug, current: "journal.html", crumb: a.title,
    article: a
  }, T.article(a, others));
});

/* ---------- sitemap + robots ---------- */
const PAGES = fs.readdirSync(ROOT).filter((f) => f.endsWith(".html") && f !== "404.html").sort();
const sitemapPath = path.join(ROOT, "sitemap.xml");

if (ORIGIN) {
  const today = process.env.BUILD_DATE || "2026-08-25";
  const urls = PAGES.map((f) => {
    const pri = f === "index.html" ? "1.0" : f === "home.html" ? "0.9" : f.startsWith("journal-") ? "0.7" : "0.8";
    return `  <url><loc>${abs(f)}</loc><lastmod>${today}</lastmod><priority>${pri}</priority></url>`;
  }).join("\n");
  fs.writeFileSync(sitemapPath,
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`);
  fs.writeFileSync(path.join(ROOT, "robots.txt"),
`User-agent: *
Allow: /

Sitemap: ${ORIGIN}/sitemap.xml
`);
  console.log("wrote sitemap.xml (" + PAGES.length + " urls) and robots.txt");
} else {
  /* No domain set yet. A sitemap of URLs on a domain nobody owns is worse
     than no sitemap, so it is not written — and any stale one is removed. */
  if (fs.existsSync(sitemapPath)) fs.unlinkSync(sitemapPath);
  fs.writeFileSync(path.join(ROOT, "robots.txt"),
`User-agent: *
Allow: /

# No Sitemap line yet: set "origin" in tools/data/site.js to the real
# domain and re-run "node tools/build.js" to generate sitemap.xml.
`);
  console.log("no origin set in tools/data/site.js — skipped sitemap.xml, wrote robots.txt");
}

/* ---------- prices agree across both surfaces ----------
   The cards and the contact select are generated from the same data, so they
   cannot drift — but nothing stops a future edit from hard-coding one of them,
   and a price that disagrees with itself is exactly the kind of untruth this
   build is supposed to catch. */
const svc = fs.readFileSync(path.join(ROOT, "prices.html"), "utf8");
const con = fs.readFileSync(path.join(ROOT, "contact.html"), "utf8");
const drift = [];
PACKAGES.forEach((k) => {
  if (!svc.includes(k.setup) || !svc.includes(k.monthly)) drift.push(k.name + " missing from prices.html");
  if (!con.includes(setupLabel(k)) || !con.includes(k.monthly)) drift.push(k.name + " missing from contact.html");
});
if (drift.length) {
  console.error("\nBUILD FAILED — package prices disagree between pages:");
  drift.forEach((d) => console.error("  " + d));
  process.exit(1);
}
/* pay.html is generated from the same data, so it joins the check */
const pay = fs.readFileSync(path.join(ROOT, "pay.html"), "utf8");
PACKAGES.forEach((k) => {
  if (!pay.includes(k.setup) || !pay.includes(k.monthly)) drift.push(k.name + " missing from pay.html");
});
if (drift.length) {
  console.error("\nBUILD FAILED — package prices disagree between pages:");
  drift.forEach((d) => console.error("  " + d));
  process.exit(1);
}
console.log("prices agree across prices.html, pay.html and contact.html (" + PACKAGES.length + " packages)");

/* ---------- truth sweep ----------
   Every string below was on this site once, and every one of them was
   invented: clients that do not exist, prices that were never charged, a
   company that was never registered, an address nobody lives at. The build
   fails rather than let one come back by accident. */
const BANNED = [
  "orion.build", "studio@orion", "new@orion", "Orion Studio Ltd",
  "egistered in England & Wales", "Northwind", "Maison Verre", "Halden Systems",
  "Arden Capital", "Kestrel Manufacturing", "Meridian Care", "Founded 2024",
  "\u00a325k", "\u00a3100k+", "\u00a34k / month", "\u00a36k fixed", "\u00a3950", "From \u00a31,800",
  "4,120,000,000", "one business day", "Sample project", "sample set",
  "3 people per project", "Concurrent projects",
  /* Personal details that were removed on request and must not creep back in.
     Note "twelve months" in the privacy notice is fine — these are phrases,
     not the bare word. */
  "twelve-year-old", "twelve years old", "I am twelve", "being twelve",
  "Years old", "under eighteen", "my parents", "around school",
  "I am at school"
];
const hits = [];
[...PAGES, "404.html", "robots.txt"].forEach((f) => {
  const text = fs.readFileSync(path.join(ROOT, f), "utf8");
  BANNED.forEach((s) => { if (text.includes(s)) hits.push(f + ': "' + s + '"'); });
});
if (hits.length) {
  console.error("\nBUILD FAILED — fabricated content in the output:");
  hits.forEach((h) => console.error("  " + h));
  process.exit(1);
}
console.log("truth sweep clean (" + BANNED.length + " patterns, " + (PAGES.length + 1) + " files)");

console.log("\n" + (PAGES.length + 1) + " pages generated from home.html's chrome");
