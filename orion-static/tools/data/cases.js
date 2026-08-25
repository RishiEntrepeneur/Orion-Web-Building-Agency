/* Case study content. One entry per work item, in display order.
   These are sample projects for an unlaunched studio, not real client results —
   see the content note in README.md. */
module.exports = [
  {
    slug: "case-northwind",
    name: "Northwind Analytics",
    sector: "SaaS · Data platform",
    tag: "SaaS",
    year: "2026",
    engagement: "Project · 9 weeks",
    seed: "1.4", tint: "76,141,255", mode: "dots", zone: "blue",
    summary:
      "Every performance claim on the old site was a stock illustration. We replaced them with live, interactive charts driven by the product's own public API, so the marketing site demonstrates the thing instead of describing it.",
    brief: [
      "Northwind sells a data platform to engineering teams, to an audience that distrusts marketing copy by profession. The old site made strong claims about query speed and freshness and illustrated every one of them with a stock graphic of a person pointing at a monitor.",
      "The commercial problem was not traffic. It was that qualified visitors reached the pricing page unconvinced, and the sales team spent the first fifteen minutes of every demo re-establishing claims the site should already have proved."
    ],
    did: [
      ["Content model", "Rebuilt the site around claims that can be evidenced, and cut the ones that could not."],
      ["Live charts", "Wired the hero and three product sections to the product's own public status API, so the numbers on the page are the numbers in production."],
      ["Design system", "Twelve page templates on one token set, so the docs shell and the marketing site are visibly the same product."],
      ["Performance", "A budget enforced in CI. Charts hydrate only when scrolled into view; the first paint is text."],
      ["Handover", "Repository, written content model and two half-day sessions with the marketing team."]
    ],
    outcome: [
      ["0.7", "s", "Largest contentful paint", "Measured on a throttled mobile profile."],
      ["100", "", "Lighthouse performance", "Held in CI on every pull request."],
      ["12", "", "Page templates", "Covering marketing, docs and changelog."],
      ["0", "", "Stock illustrations", "Every graphic is generated from real data."]
    ],
    stack: ["Next.js", "TypeScript", "Sanity", "Vercel", "Public status API"]
  },
  {
    slug: "case-maison-verre",
    name: "Maison Verre",
    sector: "Luxury retail · Glassware",
    tag: "Luxury retail",
    year: "2025",
    engagement: "Project · 14 weeks",
    seed: "2.7", tint: "233,201,121", mode: "cross", zone: "gold",
    summary:
      "A made-to-order house selling objects that photograph badly and read beautifully. The product page became an essay with a configurator inside it, and the checkout was cut from four steps to one.",
    brief: [
      "Maison Verre make hand-blown glassware to order. Their pieces are commissioned as much as bought, and the decision takes weeks — but their storefront was built on the assumption of an impulse purchase, with a four-step checkout and a product page that was six photographs and a price.",
      "Photography was the trap. Glass photographs as a grey smear, so the more images they added the less desirable the product looked. The answer was to stop trying to sell with pictures."
    ],
    did: [
      ["Editorial PDP", "Rewrote the product page as a piece of writing — the maker, the method, the material — with the configurator embedded partway down rather than bolted to the top."],
      ["Configurator", "Form, finish and engraving chosen inline, with the lead time recalculated as options change so nobody is surprised at checkout."],
      ["One-page checkout", "Four steps collapsed into one, with deposit-and-balance handling for made-to-order pieces."],
      ["Three markets", "UK, EU and US pricing, tax and lead times from a single content source."],
      ["Accessibility", "WCAG 2.2 AA throughout, including the configurator, which is fully operable by keyboard."]
    ],
    outcome: [
      ["3", "", "Markets from one source", "Pricing, tax and lead time all derived, never duplicated."],
      ["1", "", "Page checkout", "Down from four steps."],
      ["AA", "", "WCAG 2.2 conformance", "Configurator included, keyboard operable."],
      ["48", "h", "To first concept", "Direction in the browser inside two working days."]
    ],
    stack: ["Shopify Hydrogen", "Sanity", "TypeScript", "Stripe", "Vercel"]
  },
  {
    slug: "case-halden",
    name: "Halden Systems",
    sector: "Industrial · Components",
    tag: "Industrial",
    year: "2025",
    engagement: "Project · 12 weeks",
    seed: "3.9", tint: "217,255,74", mode: "bars", zone: "acid",
    summary:
      "Four thousand technical SKUs previously findable only by part number, if you already knew it. We modelled the catalogue properly, indexed it for real search, and generated every spec sheet straight from the PIM.",
    brief: [
      "Halden supply precision components to manufacturers across six countries. Their catalogue held four thousand parts and their site let you find exactly one of them at a time, by typing its part number into a box.",
      "Engineers do not shop by part number. They shop by constraint — this bore, this tolerance, this material, in stock this month. Every one of those constraints existed in the PIM and none of them reached the website."
    ],
    did: [
      ["Catalogue model", "Rebuilt the taxonomy around the attributes engineers actually filter on, mapped from the existing PIM rather than re-entered."],
      ["Faceted search", "Typesense index over every attribute, with results in tens of milliseconds and filters that never return an empty page without offering a way back."],
      ["Generated spec sheets", "Every datasheet rendered from PIM data at request time, so a spec sheet can never disagree with the catalogue."],
      ["Six languages", "One source, six locales, with units and standards localised rather than merely translated."],
      ["Stock visibility", "Live availability surfaced in results, because an in-stock part is a different product to an eight-week lead time."]
    ],
    outcome: [
      ["4", "k", "SKUs made searchable", "Previously reachable only by exact part number."],
      ["40", "ms", "Median search latency", "Measured at the 50th percentile in production."],
      ["6", "", "Languages", "From one source, units and standards localised."],
      ["0", "", "Hand-authored datasheets", "All generated from the PIM."]
    ],
    stack: ["Next.js", "Postgres", "Typesense", "PIM integration", "PDF generation"]
  },
  {
    slug: "case-arden",
    name: "Arden Capital",
    sector: "Finance · Asset management",
    tag: "Finance",
    year: "2026",
    engagement: "Project · 11 weeks",
    seed: "5.1", tint: "63,217,192", mode: "dots", zone: "teal",
    summary:
      "Investor-grade restraint, with the compliance problem solved in the content model rather than in a spreadsheet. Every disclosure is versioned, dated and auditable, and nothing publishes without an approval trail.",
    brief: [
      "Arden manage money for institutions in two regulated jurisdictions. Everything they publish is a regulated communication, and their process for managing that was a shared spreadsheet, a folder of PDFs and a compliance officer with a very good memory.",
      "The risk was not that the site looked dated. It was that nobody could answer, quickly, what exactly was on the public site on a given date and who had approved it."
    ],
    did: [
      ["Disclosure model", "Made every regulated statement a first-class content object with an effective date, a version history and a named approver."],
      ["Approval workflow", "Nothing reaches production without a recorded sign-off; the trail is queryable, not archaeological."],
      ["Point-in-time view", "Any past date can be reconstructed exactly as it was published."],
      ["No blocking scripts", "Zero third-party JavaScript on the critical path, which is both a performance and a data-protection decision."],
      ["Restraint", "A visual language that reads as considered rather than loud, because the audience reads a lack of restraint as a lack of rigour."]
    ],
    outcome: [
      ["100", "%", "Disclosures with an audit trail", "Version, effective date and named approver."],
      ["2", "", "Regulated jurisdictions", "One content model serving both."],
      ["0", "", "Third-party scripts", "None on the critical path."],
      ["0.8", "s", "Largest contentful paint", "Throttled mobile profile."]
    ],
    stack: ["Next.js", "Sanity", "Custom approval workflow", "Postgres", "Vercel"]
  },
  {
    slug: "case-kestrel",
    name: "Kestrel Manufacturing",
    sector: "Manufacturing · Precision parts",
    tag: "Manufacturing",
    year: "2025",
    engagement: "Project · 16 weeks",
    seed: "6.3", tint: "169,123,255", mode: "cross", zone: "violet",
    summary:
      "Quotes took nine days and lived in PDF attachments. We built a configurator that lets a buyer set tolerances and finishes in 3D, prices it against the ERP, and returns a formal quote in about two hours.",
    brief: [
      "Kestrel machine bespoke parts. Winning work meant quoting it, and quoting it meant a buyer emailing a drawing, an estimator opening it three days later, a phone call to clarify tolerances, and a PDF nine days after the first contact.",
      "They were not losing on price. They were losing on the calendar — to competitors who answered the same day."
    ],
    did: [
      ["3D configurator", "A WebGL part configurator where tolerance, finish and material are set against a live model, so the buyer can see what they are specifying."],
      ["Live pricing", "Configuration priced against the ERP in real time, including material cost and machine time."],
      ["Quote pipeline", "A formal, versioned quote generated and issued without an estimator re-keying anything."],
      ["Escalation path", "Anything the rules cannot price is routed to a human with the configuration attached, rather than rejected."],
      ["Device tiering", "The configurator degrades to a 2D specification form on hardware that cannot run it, because buyers use the machines they have."]
    ],
    outcome: [
      ["9d", "→2h", "Quote turnaround", "First contact to a formal, priced quote."],
      ["3D", "", "Configurator", "Tolerances and finishes set against a live model."],
      ["1", "", "ERP integration", "Pricing derived, never re-keyed."],
      ["100", "%", "Quotes versioned", "Every issued quote reconstructable."]
    ],
    stack: ["React", "Three.js", "Node", "SAP integration", "Postgres"]
  },
  {
    slug: "case-meridian",
    name: "Meridian Care",
    sector: "Healthcare · Patient services",
    tag: "Healthcare",
    year: "2026",
    engagement: "Project · 13 weeks",
    seed: "7.8", tint: "255,111,176", mode: "dots", zone: "magenta",
    summary:
      "Designed for the hardest case first: an older device on a poor connection, a screen reader, one hand, and someone who is unwell. Everything else got easier once that worked.",
    brief: [
      "Meridian run patient services. Their booking flow was a single-page application that weighed 1.4 megabytes before it rendered anything, and it was used most heavily by the people least likely to be on a fast phone.",
      "The brief was not to make booking prettier. It was to make it work for someone in pain, on a bus, on a five-year-old handset, holding the phone in one hand."
    ],
    did: [
      ["Hardest case first", "Designed and tested the 2G, screen-reader, one-handed path before the comfortable one."],
      ["Progressive enhancement", "The whole flow works as plain forms; JavaScript improves it and is never required to complete a booking."],
      ["48kb first load", "Down from 1.4MB, by rendering on the server and shipping almost nothing to the client."],
      ["Triage forms", "Rewritten in plain language, tested with people who were not clinicians."],
      ["Accessibility programme", "WCAG 2.2 AA verified continuously in CI, not audited once at the end."]
    ],
    outcome: [
      ["48", "kb", "First load", "Down from 1.4MB."],
      ["2G", "", "Tested down to", "Booking completable on a throttled 2G profile."],
      ["AA", "", "WCAG 2.2 conformance", "Verified in CI on every change."],
      ["0", "", "JavaScript required", "Every step completable without it."]
    ],
    stack: ["Next.js", "Postgres", "Progressive enhancement", "Playwright", "axe-core"]
  }
];
