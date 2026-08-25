/* ---------------------------------------------------------------
   The only place facts about Orion live.

   RULE: nothing in this file may be invented. If a value is not
   known, leave it empty — the build omits whatever depends on it
   rather than filling the gap with something plausible.
   --------------------------------------------------------------- */
module.exports = {
  name: "Orion",
  tagline: "Websites built by hand",

  /* Set this to the domain the site is published on, e.g.
     "https://orion.example". While it is empty the build emits no
     canonical links, no og:url and no sitemap, because a canonical
     URL pointing at a domain you do not own is worse than none. */
  origin: "",

  /* Set this to a real address before publishing. While it is empty
     the contact form offers "copy the brief" instead of a mailto:
     link, and no address is printed anywhere on the site. */
  email: "",

  /* Country only. Nothing narrower than this goes on a public page. */
  location: "England, United Kingdom",

  /* Shown in the footer copyright line. */
  year: "2026"
};
