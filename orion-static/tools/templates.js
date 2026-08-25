/* Page body templates. Content lives in tools/data/, chrome in index.html. */
const esc = (s) => String(s).replace(/&(?![a-z#]+;)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function head(opts) {
  return `  <section class="pagehead" data-sec="${opts.sec}" data-zone-set="${opts.zone}">
    <div class="hero__field" aria-hidden="true"><canvas id="flow"></canvas></div>
    <div class="wash" aria-hidden="true"></div>
    <div class="shell">
      <nav class="crumb mono" aria-label="Breadcrumb">
        <a href="index.html" data-curtain="Orion">Orion</a><span aria-hidden="true">/</span>${
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

/* ---------- case study ---------- */
function caseStudy(c, prev, next) {
  return [
    head({
      sec: "CASE", zone: c.zone, crumb: c.name,
      parent: { href: "work.html", label: "Work" },
      eyebrow: c.sector,
      title: c.name,
      titleStyle: "font-size:clamp(2.5rem,9vw,7.5rem)",
      dek: c.summary,
      meta: [c.year, c.engagement, "Sample project"]
    }),

    `  <section class="section" data-sec="PLATE" data-zone-set="${c.zone}" style="padding-block:clamp(2rem,4vw,3rem)">
    <div class="shell">
      <div class="plate-wide" data-tilt="3">
        <canvas data-halftone="${c.seed}" data-tint="${c.tint}" data-mode="${c.mode}"></canvas>
        <span class="plate-wide__tag">${c.tag}</span>
      </div>
    </div>
  </section>`,

    `  <section class="section" data-sec="BRIEF" data-zone-set="${c.zone}" data-3d="5" aria-labelledby="brief-h">
      <div class="wash wash--alt" aria-hidden="true"></div>
    <div class="shell split">
      <div>
        <p class="split__label" data-scramble-in>The brief</p>
        <h2 id="brief-h" class="display mt-lg" style="font-size:clamp(1.6rem,3.4vw,2.5rem);max-width:14ch" data-kin="word">What we were asked to solve</h2>
      </div>
      <div class="prose">
        ${c.brief.map((p) => `<p>${p}</p>`).join("\n        ")}
      </div>
    </div>
  </section>`,

    `  <section class="section" data-sec="APPROACH" data-zone-set="${c.zone}" data-3d="5" aria-labelledby="did-h">
      <div class="wash" aria-hidden="true"></div>
    <div class="shell">
      <div class="sec-head">
        <span class="sec-head__idx">01</span>
        <span class="sec-head__label">What we did</span>
        <span class="sec-head__spacer"></span>
        <span class="sec-head__label">${("0" + c.did.length).slice(-2)} workstreams</span>
      </div>
      <h2 id="did-h" class="sr-only">What we did</h2>
      <ol class="steps">
        ${c.did.map((d, i) => `<li>
          <span class="steps__n">${("0" + (i + 1)).slice(-2)}</span>
          <span class="steps__k">${d[0]}</span>
          <span class="steps__v">${d[1]}</span>
        </li>`).join("\n        ")}
      </ol>
    </div>
  </section>`,

    `  <section class="section" data-sec="OUTCOME" data-zone-set="${c.zone}" data-3d="5" aria-labelledby="out-h">
      <div class="wash wash--alt" aria-hidden="true"></div>
    <div class="shell">
      <div class="sec-head">
        <span class="sec-head__idx">02</span>
        <span class="sec-head__label">Outcome</span>
        <span class="sec-head__spacer"></span>
        <span class="sec-head__label">Measured, not estimated</span>
      </div>
      <h2 id="out-h" class="sr-only">Outcome</h2>
      <div class="stds">
        ${c.outcome.map((o) => `<div class="std">
          <span class="std__n">${o[0]}${o[1] ? `<small>${o[1]}</small>` : ""}</span>
          <p class="std__l mono mono--bright">${o[2]}</p>
          <p class="std__d">${o[3]}</p>
        </div>`).join("\n        ")}
      </div>
      <div class="mt-xl">
        <p class="mono" style="margin-bottom:0.9rem">Built with</p>
        <div class="svc__tags">
          ${c.stack.map((t) => `<span class="svc__tag">${t}</span>`).join("\n          ")}
        </div>
      </div>
    </div>
  </section>`,

    `  <nav class="pager" aria-label="Other projects">
    <a class="pager__a" href="${prev.slug}.html" data-curtain="${prev.name}">
      <span class="mono">← Previous project</span>
      <span class="pager__t">${prev.name}</span>
      <span class="mono mono--bright">${prev.tag}</span>
    </a>
    <a class="pager__a pager__a--next" href="${next.slug}.html" data-curtain="${next.name}">
      <span class="mono">Next project →</span>
      <span class="pager__t">${next.name}</span>
      <span class="mono mono--bright">${next.tag}</span>
    </a>
  </nav>`,

    cta(c.zone, "Bring us a problem this shape",
      { href: "contact.html", curtain: "Contact", a: "Start a project", b: "Brief us" },
      { href: "work.html", curtain: "Work", a: "All six projects", b: "Back to work" })
  ].join("\n\n");
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
      parent: { href: "journal.html", label: "Journal" },
      eyebrow: a.category,
      title: a.title,
      titleStyle: "font-size:clamp(2.25rem,7vw,5.5rem)",
      dek: a.dek,
      meta: [a.dateLabel, a.read + " read", "Orion studio"]
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
          <a class="arrow-link" href="journal.html" data-curtain="Journal">
            All articles
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
        <span class="sec-head__label"><a href="journal.html" data-curtain="Journal">All articles</a></span>
      </div>
      <h2 id="more-h" class="sr-only">More from the journal</h2>
      <div class="jx">
        ${others.map((o) => `<a class="jx__a" href="${o.slug}.html" data-curtain="${o.title}">
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

    cta(a.zone, "We write it because we build it",
      { href: "contact.html", curtain: "Contact", a: "Start a project", b: "Brief us" },
      { href: "services.html", curtain: "Capabilities", a: "Capabilities", b: "What we do" })
  ].join("\n\n");
}

/* ---------- journal index ---------- */
function journalIndex(articles) {
  return [
    head({
      sec: "JOURNAL", zone: "violet", crumb: "Journal",
      title: "Journal",
      dek: "Notes on the problems we actually hit, written by the people who hit them. No thought leadership, no predictions for next year.",
      meta: [articles.length + " articles", "Engineering, typography, practice", "Written in-house"]
    }),

    `  <section class="section" data-sec="INDEX" data-zone-set="violet" data-3d="5" aria-labelledby="jx-h" style="padding-top:clamp(2.5rem,5vw,4rem)">
      <div class="wash wash--alt" aria-hidden="true"></div>
    <div class="shell">
      <div class="sec-head">
        <span class="sec-head__idx">01</span>
        <span class="sec-head__label">All articles</span>
        <span class="sec-head__spacer"></span>
        <span class="sec-head__label">Newest first</span>
      </div>
      <h2 id="jx-h" class="sr-only">All articles</h2>
      <div class="jx">
        ${articles.map((a) => `<a class="jx__a" href="${a.slug}.html" data-curtain="${a.title}">
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

    cta("blue", "Or skip the reading and talk to us",
      { href: "contact.html", curtain: "Contact", a: "Start a project", b: "Brief us" },
      { href: "about.html", curtain: "Studio", a: "About the studio", b: "Who we are" })
  ].join("\n\n");
}

module.exports = { head, cta, caseStudy, article, journalIndex, esc };
