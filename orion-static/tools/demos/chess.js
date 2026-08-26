/* ---------------------------------------------------------------
   Alderley Chess Club — the Starter Launch demo.

   Three pages: home, about, contact. That is exactly what the
   Starter package buys, so that is exactly what this is. The
   restraint is the point — it should look like it cost less than
   the other two without looking like it was made carelessly.

   Run via: node tools/demos/build.js
   --------------------------------------------------------------- */
const fs = require("fs");
const path = require("path");
const OUT = path.resolve(__dirname, "../../demos/chess");

const NAV = [
  ["index.html", "The club"],
  ["about.html", "About"],
  ["contact.html", "Get in touch"]
];

const ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E" +
  "%3Crect width='32' height='32' fill='%23f2f0e8'/%3E%3Crect width='16' height='16' fill='%231f3a2e'/%3E" +
  "%3Crect x='16' y='16' width='16' height='16' fill='%231f3a2e'/%3E%3C/svg%3E";

const MARK = `<svg class="mark__ico" viewBox="0 0 24 24" aria-hidden="true">
      <rect width="12" height="12" fill="var(--accent)" />
      <rect x="12" y="12" width="12" height="12" fill="var(--accent)" />
      <rect x="12" width="12" height="12" fill="none" stroke="var(--accent)" stroke-width="1" />
      <rect y="12" width="12" height="12" fill="none" stroke="var(--accent)" stroke-width="1" />
    </svg>`;

const LEAGUE = [
  ["Alderley A", 9, 6, 2, 1, 14],
  ["Marchbank", 9, 6, 1, 2, 13],
  ["Thorne Institute", 9, 5, 2, 2, 12],
  ["Alderley B", 9, 3, 3, 3, 9],
  ["Cranleigh Mechanics", 9, 2, 2, 5, 6],
  ["Netherby", 9, 1, 2, 6, 4]
];

function shell(page, o) {
  const nav = NAV.map(([href, label]) =>
    `<a href="${href}"${href === page ? ' aria-current="page"' : ""}>${label}</a>`).join("\n        ");
  const drawer = NAV.map(([href, label], i) =>
    `<a href="${href}" style="--i:${i}">${label}</a>`).join("\n    ");

  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${o.title}</title>
<meta name="description" content="${o.desc}" />
<meta name="robots" content="noindex, follow" />
<meta name="theme-color" content="#f2f0e8" />
<link rel="icon" href="${ICON}" />
<link rel="preload" href="../../assets/fonts/fraunces-normal-300-900.woff2" as="font" type="font/woff2" crossorigin />
<link rel="stylesheet" href="../_lib/base.css" />
<link rel="stylesheet" href="style.css" />
<noscript><style>
  /* every reveal starts hidden and is turned on by script; with script off
     none of that applies, and the page is simply a page */
  [data-rev], .wd, .tide__cap, .quote, .sign {
    opacity: 1 !important; transform: none !important; clip-path: none !important; visibility: visible !important;
  }
  .curtain, .brw__ptr { display: none !important; }
  .tide__cap, .quote { position: static !important; }
  [data-seq] { height: auto !important; }
  .seq__pin { position: static !important; height: auto !important; min-height: 60svh; }
</style></noscript>
</head>
<body${o.body || ""}>

<a class="skip" href="#main">Skip to content</a>

<a class="demobar" href="../../demos.html">
  <span class="demobar__tag">Demo</span>
  <span class="demobar__txt"><b>Alderley Chess Club is not a real club.</b> It is a <b>Starter Launch</b> demo — three pages, built by Orion.</span>
  <span class="demobar__back">Back to Orion &rarr;</span>
</a>

<header class="bar" data-bar>
  <a class="mark" href="index.html" aria-label="Alderley Chess Club — home">
    ${MARK}
    <span class="mark__name">Alderley<em>Chess Club</em></span>
  </a>
  <nav class="nav" aria-label="Main">
        ${nav}
  </nav>
  <button class="burger" type="button" data-burger aria-expanded="false" aria-label="Menu">
    <i></i><i></i><i></i>
  </button>
</header>

<div class="drawer" data-drawer data-open="false">
    ${drawer}
</div>

<main id="main">
${o.body_html}
</main>

<footer class="foot">
  <div class="wrap">
    <div class="foot__grid">
      <div>
        <p class="d3">Thursday nights, and a board that is always free.</p>
        <p class="mt" style="font-size:.9375rem;max-width:32ch;opacity:.75">
          Alderley Village Hall, Mill Lane. Since 1974.
        </p>
      </div>
      <div>
        <p class="foot__h">When</p>
        <ul class="foot__list">
          <li>Thursdays, 7:00 &ndash; 10:30pm</li>
          <li>Doors from quarter to</li>
          <li>£3 a night, under-18s free</li>
        </ul>
      </div>
      <div>
        <p class="foot__h">Elsewhere</p>
        <ul class="foot__list">
${NAV.map(([h, l]) => `          <li><a href="${h}">${l}</a></li>`).join("\n")}
          <li><a href="../../demos.html">Built by Orion</a></li>
        </ul>
      </div>
    </div>
    <div class="foot__end">
      <span>Alderley Chess Club &middot; a demonstration site</span>
      <span>Designed and built by Orion</span>
    </div>
  </div>
</footer>

<script src="../_lib/art.js" defer></script>
<script src="../_lib/motion.js" defer></script>
<script src="app.js" defer></script>
</body>
</html>
`;
}

const page = {};

/* ---------------------------------------------------------- index --- */
page["index.html"] = {
  title: "Alderley Chess Club — Thursday nights, all strengths welcome",
  desc: "A friendly chess club meeting every Thursday evening in Alderley Village Hall. Beginners genuinely welcome. Demo site built by Orion.",
  body: ' data-page="home"',
  body_html: `
  <section class="hero">
    <div class="hero__art" aria-hidden="true">
      <canvas data-art="board" data-art-opts='{"light":"#e9e3d3","dark":"#22392f","back":"#f2f0e8","tilt":0.46,"seed":11}'></canvas>
    </div>
    <div class="hero__fade" aria-hidden="true"></div>
    <div class="wrap hero__in">
      <p class="eyebrow" data-rev>Est. 1974 &middot; Alderley Village Hall</p>
      <h1 class="d1" data-rev><span data-split>Thursday nights, and a board that is always free.</span></h1>
      <p class="lede" data-rev="0.16">
        Forty of us, every strength from &ldquo;I know how the horse moves&rdquo; to county
        league. No membership form, no grading requirement, and nobody who will
        mind if you lose.
      </p>
      <div class="row mt" data-rev="0.26">
        <a class="btn btn--solid" href="#visit" data-mag="0.2">When to come</a>
        <a class="btn" href="contact.html" data-mag="0.2">Ask a question</a>
      </div>
    </div>
  </section>

  <section class="band" id="visit" aria-labelledby="visit-h">
    <div class="wrap">
      <div class="head" data-rev>
        <span class="num">01</span>
        <span class="eyebrow head__line">Turn up, that is the whole process</span>
      </div>
      <h2 id="visit-h" class="sr">When and where</h2>
      <ul class="facts">
        <li data-rev="0"><span class="facts__k">When</span><p class="facts__v">Thursdays<br />7:00&ndash;10:30pm</p><p class="facts__d">Doors from quarter to. The first hour is casual games; the league match starts at eight if there is one on.</p></li>
        <li data-rev="0.06"><span class="facts__k">Where</span><p class="facts__v">Alderley<br />Village Hall</p><p class="facts__d">Mill Lane, the back room past the kitchen. Parking on the lane is free after six.</p></li>
        <li data-rev="0.12"><span class="facts__k">Cost</span><p class="facts__v">£3<br />a night</p><p class="facts__d">Covers the hall and the tea. Under-18s and students come free, and always have.</p></li>
        <li data-rev="0.18"><span class="facts__k">Bring</span><p class="facts__v">Nothing<br />at all</p><p class="facts__d">There are twenty sets, eight clocks, and more scoresheets than anyone could use.</p></li>
      </ul>
    </div>
  </section>

  <section class="band band--flush" aria-labelledby="board-h">
    <div class="wrap">
      <div class="split">
        <div class="stack">
          <p class="eyebrow" data-rev>02 &middot; A first opening</p>
          <h2 id="board-h" class="d2" data-rev>The Italian Game,<br /><em>four moves in.</em></h2>
          <p data-rev="0.08">
            This is what we teach on somebody's first Thursday. Step through it —
            it is the oldest opening still played, and it explains more about
            chess in four moves than an hour of talking does.
          </p>
          <div class="row mt" data-rev="0.14">
            <button class="btn" type="button" id="mv-prev" disabled>Back</button>
            <button class="btn btn--solid" type="button" id="mv-next">Next move</button>
          </div>
          <p class="movecap" id="mv-cap" aria-live="polite" data-rev="0.2"></p>
        </div>

        <div class="boardwrap" data-rev="mask">
          <div class="board" id="board" role="img" aria-label="A chess board showing the Italian Game"></div>
          <ol class="moves" id="moves" aria-label="Moves played"></ol>
        </div>
      </div>
    </div>
  </section>

  <section class="band" aria-labelledby="league-h">
    <div class="wrap">
      <div class="head" data-rev>
        <span class="num">03</span>
        <span class="eyebrow head__line">Division three, this season</span>
        <span class="num">Nine played</span>
      </div>
      <h2 id="league-h" class="sr">League table</h2>
      <div class="tablewrap" data-rev>
        <table class="league">
          <caption class="sr">Division three league table</caption>
          <thead>
            <tr><th scope="col">Club</th><th scope="col">P</th><th scope="col">W</th><th scope="col">D</th><th scope="col">L</th><th scope="col">Pts</th></tr>
          </thead>
          <tbody>
${LEAGUE.map(([n, p, w, d, l, pts]) => `            <tr${n.indexOf("Alderley") === 0 ? ' data-us="true"' : ""}><th scope="row">${n}</th><td>${p}</td><td>${w}</td><td>${d}</td><td>${l}</td><td><b>${pts}</b></td></tr>`).join("\n")}
          </tbody>
        </table>
      </div>
      <p class="note mt" data-rev>
        Two teams, and anybody who wants a league game will get one. Nobody is
        dropped for losing.
      </p>
    </div>
  </section>

  <section class="cta">
    <div class="wrap cta__in">
      <p class="eyebrow" data-rev>Any Thursday</p>
      <h2 class="d2" data-rev>Come and lose a few.</h2>
      <a class="btn btn--solid mt" href="contact.html" data-mag="0.22" data-rev="0.1">Ask a question first</a>
    </div>
  </section>
`
};

/* ---------------------------------------------------------- about --- */
page["about.html"] = {
  title: "About — Alderley Chess Club",
  desc: "Fifty years of Thursday nights in a village hall. Demo site built by Orion.",
  body_html: `
  <section class="pagehead">
    <div class="wrap">
      <p class="eyebrow" data-rev>Since 1974</p>
      <h1 class="d1" data-rev><span data-split>Fifty years of Thursdays</span></h1>
    </div>
  </section>

  <article class="band prose">
    <div class="wrap wrap--tight">
      <p class="drop" data-rev>
        The club started because two men who worked at the mill wanted somewhere
        to play that was not the pub. The village hall let them have the back
        room for fifty pence a week, and the arrangement has never really
        changed — only the fifty pence.
      </p>
      <p data-rev>
        We have been in division three for most of that time, went up once in
        1988, and came straight back down. Nobody minds. The point of the league
        is that it gives eight people a reason to concentrate for three hours on
        a Thursday, and it does that whether we win or not.
      </p>

      <figure class="pull" data-rev>
        <blockquote class="d2">Nobody here will mind if you lose. Most of us are quite good at it.</blockquote>
      </figure>

      <p data-rev>
        Beginners are genuinely welcome, and we mean it in the way that is
        occasionally embarrassing: somebody will sit with you, explain what just
        happened, and then do it again the following week. There is no beginners'
        session because there does not need to be one.
      </p>

      <div class="fig fig--3x2 mt-lg" data-rev="mask">
        <canvas data-art="board" data-art-opts='{"light":"#e9e3d3","dark":"#22392f","back":"#efece2","tilt":0.3,"seed":31}'></canvas>
      </div>
      <p class="fig__cap"><span>The board, mid-game</span><span>Drawn, not photographed</span></p>

      <p class="mt-lg" data-rev>
        Two teams play in the Marchbank &amp; District league. The A team takes it
        reasonably seriously. The B team exists so that anybody who wants a
        graded game can have one, and it has never once been short of players.
      </p>

      <div class="signoff" data-rev>
        <span class="eyebrow">The committee, such as it is</span>
        <span class="d3">— Alderley</span>
      </div>
    </div>
  </article>
`
};

/* -------------------------------------------------------- contact --- */
page["contact.html"] = {
  title: "Get in touch — Alderley Chess Club",
  desc: "Ask a question before you come, or just turn up on a Thursday. Demo site built by Orion.",
  body: ' data-page="contact"',
  body_html: `
  <section class="pagehead">
    <div class="wrap">
      <p class="eyebrow" data-rev>Mill Lane, Alderley</p>
      <h1 class="d1" data-rev><span data-split>Get in touch</span></h1>
      <p class="lede" data-rev="0.12">
        You do not have to. You can simply turn up on a Thursday. But if you
        would rather ask something first, this is the way.
      </p>
    </div>
  </section>

  <section class="band band--flush">
    <div class="wrap">
      <div class="split">
        <div class="stack">
          <h2 class="d3" data-rev>Before you come</h2>
          <dl class="qa" data-rev="0.06">
            <div><dt>Do I need to be any good?</dt><dd>No. Roughly a third of the room could not tell you what the Italian Game is.</dd></div>
            <div><dt>Do I need a set?</dt><dd>No. We have twenty.</dd></div>
            <div><dt>Can I bring a child?</dt><dd>Yes, and they come free. Under-14s need somebody with them.</dd></div>
            <div><dt>Is there parking?</dt><dd>On Mill Lane, free after six. The hall car park is four spaces and always taken.</dd></div>
          </dl>
        </div>

        <form class="ask" id="ask" novalidate>
          <p class="eyebrow">Send a message</p>
          <div class="field">
            <label for="c-name">Name</label>
            <input id="c-name" name="name" type="text" autocomplete="name" required />
            <p class="field__err" data-err-for="c-name" aria-live="polite"></p>
          </div>
          <div class="field">
            <label for="c-email">Email</label>
            <input id="c-email" name="email" type="email" autocomplete="email" required />
            <p class="field__err" data-err-for="c-email" aria-live="polite"></p>
          </div>
          <div class="field">
            <label for="c-msg">Your question</label>
            <textarea id="c-msg" name="msg" required placeholder="I have not played since school and I would like to start again."></textarea>
            <p class="field__err" data-err-for="c-msg" aria-live="polite"></p>
          </div>
          <button class="btn btn--solid mt" type="submit">Send it</button>
          <p class="ask__done" id="ask-done" hidden>
            That is the message written. This is a demonstration, so nothing was
            sent — on a real build it would land in the secretary's inbox.
          </p>
        </form>
      </div>
    </div>
  </section>
`
};

module.exports = function build() {
  fs.mkdirSync(OUT, { recursive: true });
  Object.keys(page).forEach((f) => {
    fs.writeFileSync(path.join(OUT, f), shell(f, page[f]));
    console.log("  chess/" + f);
  });
  return Object.keys(page).length;
};
