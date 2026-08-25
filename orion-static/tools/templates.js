/* Page body templates. Content lives in tools/data/, chrome in home.html. */
const esc = (s) => String(s).replace(/&(?![a-z#]+;)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function head(opts) {
  return `  <section class="pagehead" data-sec="${opts.sec}" data-zone-set="${opts.zone}">
    <div class="hero__field" aria-hidden="true"><canvas id="flow"></canvas></div>
    <div class="wash" aria-hidden="true"></div>
    <div class="shell">
      <nav class="crumb mono" aria-label="Breadcrumb">
        <a href="home.html" data-curtain="Orion">Orion</a><span aria-hidden="true">/</span>${
          opts.parent ? `<a href="${opts.parent.href}" data-curtain="${opts.parent.label}">${opts.parent.label}</a><span aria-hidden="true">/</span>` : ""
        }<span class="mono--bright">${opts.crumb}</span>
      </nav>
      ${opts.eyebrow ? `<p class="mono mono--accent" style="margin-bottom:1rem">${opts.eyebrow}</p>` : ""}
      <h1 class="pagehead__title" data-kin="word" style="${opts.titleStyle || ""}">${opts.title}</h1>
      ${opts.dek ? `<p class="lede mt-lg" style="max-width:54ch">${opts.dek}</p>` : ""}
      <div class="pagehead__meta">
        ${opts.meta.map((m) => `<span class="mono">${m}</span>`).join("\n        ")}
      </div>
    </div>
  </section>`;
}

function cta(zone, heading, primary, secondary) {
  return `  <section class="section" data-sec="NEXT" data-zone-set="${zone}" data-3d="5">
      <div class="wash wash--alt" aria-hidden="true"></div>
    <div class="shell between">
      <h2 class="display" style="font-size:clamp(2rem,6.2vw,4.75rem);max-width:15ch" data-kin="word">${heading}</h2>
      <div class="row">
        <a class="btn btn--solid" href="${primary.href}" data-curtain="${primary.curtain}" data-magnetic="0.3">
          <span class="btn__lab"><span>${primary.a}</span><span>${primary.b}</span></span>
        </a>
        <a class="btn btn--ghost" href="${secondary.href}" data-curtain="${secondary.curtain}" data-magnetic="0.24">
          <span class="btn__lab"><span>${secondary.a}</span><span>${secondary.b}</span></span>
        </a>
      </div>
    </div>
  </section>`;
}


/* ---------- packages ---------- */
const tick = '<svg class="pk__tick" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M1.5 6.4 4.4 9.2 10.5 2.8" stroke-linecap="round" stroke-linejoin="round" /></svg>';

function packages(list) {
  return `  <section class="section" data-sec="PACKAGES" data-zone-set="gold" aria-labelledby="pk-h" data-3d="5">
      <div class="wash" aria-hidden="true"></div>
    <div class="shell">
      <div class="sec-head">
        <span class="sec-head__idx">02</span>
        <span class="sec-head__label">Packages</span>
        <span class="sec-head__spacer"></span>
        <span class="sec-head__label">${("0" + list.length).slice(-2)} to choose from</span>
      </div>
      <h2 id="pk-h" class="display mb-lg" style="font-size:clamp(2rem,5.6vw,4rem);max-width:16ch" data-kin="word">
        Three ways to start
      </h2>
      <p class="lede" style="max-width:56ch">
        A one-off fee to build it, then a monthly fee that keeps it hosted, fast and looked after.
        Cancel the monthly whenever you like — the site is yours either way.
      </p>

      <div class="pk mt-xl">
        ${list.map((k) => `<article class="pk__card${k.popular ? " pk__card--pop" : ""}" aria-labelledby="pk-${k.id}">
          ${k.popular ? '<span class="pk__badge">Most popular</span>' : ""}
          <h3 class="pk__name" id="pk-${k.id}">${k.name}</h3>
          <p class="pk__tag">${k.tagline}</p>
          <p class="pk__price"><b>${k.setup}</b><span class="pk__once">one-off build</span></p>
          <p class="pk__mo">then <b>${k.monthly}</b> a month</p>
          <ul class="pk__list">
            ${k.features.map((f) => `<li>${tick}<span>${f}</span></li>`).join("\n            ")}
          </ul>
          <p class="pk__for">${k.forWho}</p>
          <a class="btn ${k.popular ? "btn--solid" : "btn--ghost"} pk__cta" href="contact.html" data-curtain="Contact" data-magnetic="0.22">
            <span class="btn__lab"><span>Start here</span><span>${k.name}</span></span>
          </a>
        </article>`).join("\n        ")}
      </div>

      <p class="form__note mt-xl" style="max-width:62ch">
        Prices are in pounds sterling and include hosting from the month the site goes live. A
        domain name is bought in your own name and billed by whoever you buy it from, so it is not
        part of these figures — I will tell you what it costs before you buy it. If none of the
        three is the shape of what you need, say so and I will price the actual job.
      </p>
    </div>
  </section>`;
}

/* ---------- journal article ---------- */
const strip = (s) => String(s).replace(/<[^>]+>/g, "");
const slug = (s) => strip(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function block(b) {
  if (b.t === "p") return `<p>${b.c}</p>`;
  if (b.t === "h") return `<h2 id="${slug(b.c)}">${b.c}</h2>`;
  if (b.t === "ul") return `<ul>${b.c.map((i) => `<li>${i}</li>`).join("")}</ul>`;
  if (b.t === "quote") return `<p class="pull">${b.c}</p>`;
  if (b.t === "code") return `<pre><code>${esc(b.c)}</code></pre>`;
  return "";
}

function article(a, others) {
  return [
    head({
      sec: "ARTICLE", zone: a.zone, crumb: a.title,
      parent: { href: "journal.html", label: "Notes" },
      eyebrow: a.category,
      title: a.title,
      titleStyle: "font-size:clamp(2.25rem,7vw,5.5rem)",
      dek: a.dek,
      meta: [a.dateLabel, a.read + " read", "Build note"]
    }),

        /* No data-3d on this one: it applies a transform to the section, which then
       becomes the containing block and breaks position:sticky on the sidebar. */
    `  <section class="section" data-sec="READ" data-zone-set="${a.zone}">
      <div class="wash wash--alt" aria-hidden="true"></div>
    <div class="shell article-grid">
      <article class="prose">
        ${a.body.map(block).join("\n        ")}
      </article>

      <aside class="toc" aria-labelledby="toc-h">
        <div class="toc__inner">
          <h2 class="mono" id="toc-h">In this article</h2>
          <ol class="toc__list">
            ${a.body.filter((b) => b.t === "h").map((b, i) => `<li><a href="#${slug(b.c)}"><span class="toc__n">${("0" + (i + 1)).slice(-2)}</span><span>${strip(b.c)}</span></a></li>`).join("\n            ")}
          </ol>
          <dl class="toc__meta">
            <div><dt class="mono">Filed under</dt><dd class="mono mono--accent">${a.category}</dd></div>
            <div><dt class="mono">Published</dt><dd class="mono mono--bright">${a.dateLabel}</dd></div>
            <div><dt class="mono">Length</dt><dd class="mono mono--bright">${a.read}</dd></div>
          </dl>
          <a class="arrow-link" href="journal.html" data-curtain="Notes">
            All notes
            <svg width="16" height="10" viewBox="0 0 16 10" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M0 5h14M10 1l4 4-4 4" /></svg>
          </a>
        </div>
      </aside>
    </div>
  </section>`,

    `  <section class="section" data-sec="MORE" data-zone-set="violet" data-3d="5" aria-labelledby="more-h">
      <div class="wash" aria-hidden="true"></div>
    <div class="shell">
      <div class="sec-head">
        <span class="sec-head__idx">—</span>
        <span class="sec-head__label">Keep reading</span>
        <span class="sec-head__spacer"></span>
        <span class="sec-head__label"><a href="journal.html" data-curtain="Notes">All notes</a></span>
      </div>
      <h2 id="more-h" class="sr-only">More build notes</h2>
      <div class="jx">
        ${others.map((o) => `<a class="jx__a" href="${o.slug}.html" data-curtain="Notes">
          <span class="jx__cat">${o.category}</span>
          <span>
            <span class="jx__t">${o.title}</span>
            <span class="jx__d">${o.dek}</span>
          </span>
          <span class="jx__m">${o.read}</span>
        </a>`).join("\n        ")}
      </div>
    </div>
  </section>`,

    cta(a.zone, "I write it because I built it",
      { href: "contact.html", curtain: "Contact", a: "Start a project", b: "Say hello" },
      { href: "work.html", curtain: "This site", a: "How this was built", b: "Every number" })
  ].join("\n\n");
}

/* ---------- journal index ---------- */
function journalIndex(articles) {
  return [
    head({
      sec: "NOTES", zone: "violet", crumb: "Build notes",
      title: "Build notes",
      dek: "Problems I actually hit while building this site, and what fixed them. No thought leadership, no predictions for next year.",
      meta: [articles.length + " notes", "Engineering, typography, practice", "Written by me"]
    }),

    `  <section class="section" data-sec="INDEX" data-zone-set="violet" data-3d="5" aria-labelledby="jx-h" style="padding-top:clamp(2.5rem,5vw,4rem)">
      <div class="wash wash--alt" aria-hidden="true"></div>
    <div class="shell">
      <div class="sec-head">
        <span class="sec-head__idx">01</span>
        <span class="sec-head__label">All notes</span>
        <span class="sec-head__spacer"></span>
        <span class="sec-head__label">Newest first</span>
      </div>
      <h2 id="jx-h" class="sr-only">All notes</h2>
      <div class="jx">
        ${articles.map((a) => `<a class="jx__a" href="${a.slug}.html" data-curtain="Notes">
          <span class="jx__cat">${a.category}</span>
          <span>
            <span class="jx__t">${a.title}</span>
            <span class="jx__d">${a.dek}</span>
          </span>
          <span class="jx__m">${a.dateLabel}<br />${a.read}</span>
        </a>`).join("\n        ")}
      </div>
    </div>
  </section>`,

    cta("blue", "Or skip the reading and just ask",
      { href: "contact.html", curtain: "Contact", a: "Start a project", b: "Say hello" },
      { href: "about.html", curtain: "About", a: "About me", b: "Who I am" })
  ].join("\n\n");
}

module.exports = { head, cta, packages, article, journalIndex, esc };
