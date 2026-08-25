/* Regenerates every page except index.html (the intro landing page) and
   home.html, which is the source of truth for
   the shared chrome. Run: node tools/build.js */
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const { write } = require("./generate-pages.js");
const T = require("./templates.js");
const CASES = require("./data/cases.js");
const JOURNAL = require("./data/journal.js");
const body = (f) => fs.readFileSync(path.join(__dirname, "bodies", f), "utf8");

/* one copy of the contact form, used by contact.html */
const contactBlock = body("contact-form.html")
  .replace('<span class="sec-head__idx">05</span>', '<span class="sec-head__idx">01</span>')
  .replace('data-sec="CONTACT"', 'data-sec="BRIEF"')
  .replace('<span class="sec-head__label" data-scramble-in>Start here</span>',
           '<span class="sec-head__label" data-scramble-in>Project brief</span>');

/* ---------- hand-written pages ---------- */
write("services.html", {
  title: "Capabilities — Orion",
  desc: "What Orion actually delivers: premium web design and build, e-commerce ecosystems, AI-driven applications, and motion and 3D systems.",
  slug: "services", current: "services.html", crumb: "Capabilities"
}, body("services.html"));

write("work.html", {
  title: "Work — Orion",
  desc: "Six representative builds across SaaS, luxury retail, industrial, finance, manufacturing and healthcare.",
  slug: "work", current: "work.html", crumb: "Work"
}, body("work.html"));

write("about.html", {
  title: "Studio — Orion",
  desc: "A small team that does the whole job: what Orion believes, how the studio is shaped, and how to write to us.",
  slug: "about", current: "about.html", crumb: "Studio"
}, body("about.html"));

write("contact.html", {
  title: "Contact — Orion",
  desc: "Tell Orion the commercial problem. A reply from a human within one business day.",
  slug: "contact", current: "contact.html", crumb: "Contact"
}, body("head.html") + "\n" + contactBlock + "\n" + body("tail.html"));

write("privacy.html", {
  title: "Privacy — Orion",
  desc: "This website collects nothing: no analytics, no cookies, no third-party scripts. What happens to an enquiry, and your rights under the UK GDPR.",
  slug: "privacy", crumb: "Privacy"
}, body("privacy.html"));

write("terms.html", {
  title: "Terms — Orion",
  desc: "Terms for using the Orion website, written in plain English.",
  slug: "terms", crumb: "Terms"
}, body("terms.html"));

write("404.html", {
  title: "Page not found — Orion",
  desc: "That page is not on this site. Here is everything that is.",
  slug: "notfound", crumb: "Not found", noindex: true
}, body("notfound.html"));

/* ---------- journal ---------- */
write("journal.html", {
  title: "Journal — Orion",
  desc: "Notes on the problems we actually hit, written by the people who hit them.",
  slug: "journal", current: "journal.html", crumb: "Journal"
}, T.journalIndex(JOURNAL));

JOURNAL.forEach((a) => {
  const others = JOURNAL.filter((o) => o.slug !== a.slug);
  write(a.slug + ".html", {
    title: a.title + " — Orion Journal",
    desc: a.dek,
    slug: a.slug, current: "journal.html", crumb: a.title,
    article: a
  }, T.article(a, others));
});

/* ---------- case studies ---------- */
CASES.forEach((c, i) => {
  const prev = CASES[(i - 1 + CASES.length) % CASES.length];
  const next = CASES[(i + 1) % CASES.length];
  write(c.slug + ".html", {
    title: c.name + " — Orion",
    desc: c.summary,
    slug: c.slug, current: "work.html", crumb: c.name
  }, T.caseStudy(c, prev, next));
});

/* ---------- sitemap + robots ---------- */
const PAGES = fs.readdirSync(ROOT).filter((f) => f.endsWith(".html") && f !== "404.html").sort();
const today = process.env.BUILD_DATE || "2026-08-25";
const urls = PAGES.map((f) => {
  const loc = "https://orion.build/" + (f === "index.html" ? "" : f);
  const pri = f === "index.html" ? "1.0" : f === "home.html" ? "0.9" : f.startsWith("case-") || f.startsWith("journal-") ? "0.7" : "0.8";
  return `  <url><loc>${loc}</loc><lastmod>${today}</lastmod><priority>${pri}</priority></url>`;
}).join("\n");
fs.writeFileSync(path.join(ROOT, "sitemap.xml"),
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`);
fs.writeFileSync(path.join(ROOT, "robots.txt"),
`User-agent: *
Allow: /

Sitemap: https://orion.build/sitemap.xml
`);
console.log("wrote sitemap.xml (" + PAGES.length + " urls) and robots.txt");
console.log("\n" + (PAGES.length + 1) + " pages generated from home.html's chrome");
