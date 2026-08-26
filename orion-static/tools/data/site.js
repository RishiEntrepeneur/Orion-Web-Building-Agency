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
  email: "rishvinoth@gmail.com",

  /* Country only. Nothing narrower than this goes on a public page. */
  location: "England, United Kingdom",

  /* Shown in the footer copyright line. */
  year: "2026",

  /* -------------------------------------------------------------
     PAYMENT

     One Stripe Payment Link per package. Create them in the Stripe
     dashboard (Products → Payment links) with the build fee as a
     one-time price and the monthly as a recurring price, then paste
     the https://buy.stripe.com/... URL here.

     While a link is empty its package shows the invoice route
     instead — which is the right way to start anyway. No card
     details ever touch this site either way: the link hands the
     payer to Stripe's own checkout.

     The account has to belong to an adult. Stripe's terms require
     the account holder to be 18, and in England a contract with a
     minor is generally not enforceable against them — so the
     account, and the contracts, go in a parent's name.
     ------------------------------------------------------------- */
  checkout: {
    starter: "",
    growth: "",
    premium: ""
  },

  /* -------------------------------------------------------------
     CAPACITY

     A monthly fee is a promise about future time, so these are the
     limits that keep the promise keepable. They are printed on the
     site: a cap nobody can see is a cap you will quietly break.
     ------------------------------------------------------------- */
  capacity: {
    monthlyClients: 6,      /* sites carried on a monthly plan at once */
    concurrentBuilds: 2,    /* builds running at the same time */
    noticeMonths: 3         /* notice given before winding a plan down */
  }
};
