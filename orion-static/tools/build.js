/* Regenerates services.html, work.html and contact.html from index.html's chrome
   plus the page bodies in tools/bodies/. Run: node tools/build.js */
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const { write } = require("./generate-pages.js");
const read = (f) => fs.readFileSync(path.join(__dirname, "bodies", f), "utf8");

/* the contact form is lifted straight out of index.html so it never drifts */
const index = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const start = index.indexOf('<section class="section" id="contact"');
const endMark = "\n  </section>";
const end = index.indexOf(endMark, start);
if (start < 0 || end < 0) throw new Error("cannot lift the contact section from index.html");
const contactBlock = index.slice(start, end + endMark.length)
  .replace('<span class="sec-head__idx">05</span>', '<span class="sec-head__idx">01</span>')
  .replace('data-sec="CONTACT"', 'data-sec="BRIEF"')
  .replace('<span class="sec-head__label" data-scramble-in>Start here</span>',
           '<span class="sec-head__label" data-scramble-in>Project brief</span>');

write("services.html", {
  title: "Capabilities — Orion",
  desc: "What Orion actually delivers: premium web design and build, e-commerce ecosystems, AI-driven applications, and motion and 3D systems.",
  slug: "services", current: "services.html", crumb: "Capabilities"
}, read("services.html"));

write("work.html", {
  title: "Work — Orion",
  desc: "Six representative builds across SaaS, luxury retail, industrial, finance, manufacturing and healthcare.",
  slug: "work", current: "work.html", crumb: "Work"
}, read("work.html"));

write("contact.html", {
  title: "Contact — Orion",
  desc: "Tell Orion the commercial problem. A reply from a human within one business day.",
  slug: "contact", current: "contact.html", crumb: "Contact"
}, read("head.html") + "\n" + contactBlock + "\n" + read("tail.html"));
