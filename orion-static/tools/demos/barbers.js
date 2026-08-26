/* ---------------------------------------------------------------
   Fairweather Barbers — the Business Growth demo.

   Five pages, a gallery with a lightbox, a price list, a live
   open/closed sign, a drawn street map and an enquiry form. What a
   Growth build is: everything a real business needs, done properly,
   and nothing it does not.

   Run via: node tools/demos/build.js
   --------------------------------------------------------------- */
const fs = require("fs");
const path = require("path");
const OUT = path.resolve(__dirname, "../../demos/barbers");

const NAV = [
  ["index.html", "Home"],
  ["services.html", "Cuts &amp; prices"],
  ["gallery.html", "The work"],
  ["about.html", "The shop"],
  ["contact.html", "Find us"]
];

const ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E" +
  "%3Crect width='32' height='32' fill='%2314110f'/%3E" +
  "%3Cpath d='M11 5h10v22H11z' fill='%23efe9df'/%3E" +
  "%3Cpath d='M11 8l10-3v4l-10 3zM11 15l10-3v4l-10 3zM11 22l10-3v4l-10 3z' fill='%23c9a227'/%3E%3C/svg%3E";

const MARK = `<svg class="mark__ico" viewBox="0 0 26 30" fill="none" aria-hidden="true">
      <rect x="7" y="1.5" width="12" height="27" stroke="currentColor" stroke-width="1.4" />
      <path d="M7 6.5 19 3v3.6L7 10.1zM7 14 19 10.5v3.6L7 17.6zM7 21.5 19 18v3.6L7 25.1z" fill="var(--accent)" />
    </svg>`;

/* what is on the wall */
const PRICES = [
  { g: "The cut", items: [
    ["Cut and finish", "£24", "Forty minutes. Washed, cut, dried, and told the truth about what suits you."],
    ["Skin fade", "£28", "Clippers to a zero and blended by eye. Book fifty minutes if it is your first."],
    ["Restyle", "£34", "An hour. For when you want to look like someone else by Friday."],
    ["Under 12s", "£14", "There is a booster seat and nobody minds noise."]
  ]},
  { g: "The beard", items: [
    ["Beard trim", "£14", "Shaped, edged, oiled. Fifteen minutes."],
    ["Hot towel shave", "£30", "Cloths, badger brush, an open razor and forty-five unhurried minutes."],
    ["Cut and beard", "£34", "Both, one appointment, one price."]
  ]},
  { g: "The rest", items: [
    ["Grey blending", "£16", "Softened rather than removed. Nobody will be able to tell you did it."],
    ["Head shave", "£22", "Clippers, then razor, then balm."],
    ["Wedding morning", "From £120", "We open early and bring the coffee. Up to six of you."]
  ]}
];

/* the gallery: cut, seed, caption */
const CUTS = [
  ["fade", 2, "Skin fade, hard part"],
  ["quiff", 5, "Grown out quiff, scissor sides"],
  ["beard", 8, "Beard shaped, cheeks lined"],
  ["crop", 14, "French crop, textured"],
  ["curls", 11, "Curls, weight taken out"],
  ["shaved", 20, "Head shave and a hot towel"],
  ["long", 17, "Grown long, layered"],
  ["fade", 23, "Low fade, taper at the neck"]
];

const HOURS = [
  ["Tuesday", "09:00", "18:00"],
  ["Wednesday", "09:00", "18:00"],
  ["Thursday", "09:00", "20:00"],
  ["Friday", "08:00", "18:00"],
  ["Saturday", "08:00", "16:00"],
  ["Sunday", "", ""],
  ["Monday", "", ""]
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
<meta name="theme-color" content="#14110f" />
<meta name="color-scheme" content="dark" />
<link rel="icon" href="${ICON}" />
<link rel="preload" href="../../assets/fonts/bebas-normal-400.woff2" as="font" type="font/woff2" crossorigin />
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
  <span class="demobar__txt"><b>Fairweather Barbers is not a real shop.</b> It is a <b>Business Growth</b> demo — five pages, a gallery and a live opening-hours sign, built by Orion.</span>
  <span class="demobar__back">Back to Orion &rarr;</span>
</a>

<header class="bar" data-bar>
  <a class="mark" href="index.html" aria-label="Fairweather Barbers — home">
    ${MARK}
    <span class="mark__name">Fairweather<em>Barbers, est. 2011</em></span>
  </a>
  <nav class="nav" aria-label="Main">
        ${nav}
    <span class="sign" data-sign hidden>
      <i class="sign__dot"></i><span data-sign-text>Checking</span>
    </span>
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
        <p class="d3">Walk in, or don't.<br />Either works.</p>
        <p class="mt" style="font-size:.9375rem;max-width:32ch;opacity:.75">
          Two chairs on Sedgewick Street. No app, no membership, no upselling.
        </p>
      </div>
      <div>
        <p class="foot__h">Opening</p>
        <ul class="foot__list" data-hours-mini>
${HOURS.map(([d, a, b]) => `          <li><span>${d}</span><span>${a ? a + "–" + b : "Closed"}</span></li>`).join("\n")}
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
      <span>Fairweather Barbers &middot; a demonstration site</span>
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

const priceBlock = (groups) => groups.map((g, gi) => `
      <section class="pricegroup" aria-labelledby="pg-${gi}">
        <h2 class="pricegroup__h" id="pg-${gi}" data-rev>${g.g}</h2>
        <ul class="prices">
${g.items.map(([n, p, d], i) => `          <li class="price" data-rev="${(i % 4) * 0.05}">
            <span class="price__n">${n}</span>
            <span class="price__d">${d}</span>
            <span class="price__p">${p}</span>
          </li>`).join("\n")}
        </ul>
      </section>`).join("");

const galleryGrid = (cuts) => cuts.map(([cut, seed, cap], i) => `
        <li class="shot" data-rev="${(i % 3) * 0.07}" data-cut="${cut}">
          <button class="fig fig--4x5" data-lb data-lb-cap="${cap}">
            <canvas data-art="portrait" data-art-opts='{"cut":"${cut}","seed":${seed},"flip":${i % 2 === 1},"back":"#14110f","ink":"#f0e9dd","accent":"#c9a227"}'></canvas>
            <span class="fig__zoom" aria-hidden="true">+</span>
          </button>
          <p class="shot__cap">${cap}</p>
        </li>`).join("");

const page = {};

/* ---------------------------------------------------------- index --- */
page["index.html"] = {
  title: "Fairweather Barbers — two chairs on Sedgewick Street",
  desc: "A proper barber shop. Cut and finish £24, skin fade £28, hot towel shave £30. Walk in or book. Demo site built by Orion.",
  body: ' data-page="home"',
  body_html: `
  <section class="hero">
    <div class="hero__art" aria-hidden="true">
      <canvas data-art="portrait" data-art-opts='{"cut":"fade","seed":2,"x":0.74,"y":0.5,"scale":0.25,"flip":true,"back":"#14110f","ink":"#f0e9dd","accent":"#c9a227"}'></canvas>
    </div>
    <div class="hero__scrim" aria-hidden="true"></div>
    <div class="wrap hero__in">
      <p class="eyebrow" data-rev>Sedgewick Street &middot; two chairs &middot; since 2011</p>
      <h1 class="d1" data-rev><span data-split>A haircut, not an experience</span></h1>
      <p class="lede" data-rev="0.16">
        Forty minutes, a proper wash, and somebody who will tell you if what you
        asked for is a bad idea. Walk in, or book the chair.
      </p>
      <div class="row mt" data-rev="0.26">
        <a class="btn btn--solid" href="contact.html" data-mag="0.22">Book the chair</a>
        <a class="btn btn--ghost" href="services.html" data-mag="0.22">Cuts &amp; prices</a>
      </div>
    </div>
  </section>

  <section class="strip" aria-label="What we do">
    <div data-marquee="30">
      <div>
        <span>Cut &amp; finish</span><span class="strip__dot">&#10022;</span>
        <span>Skin fade</span><span class="strip__dot">&#10022;</span>
        <span>Hot towel shave</span><span class="strip__dot">&#10022;</span>
        <span>Beard trim</span><span class="strip__dot">&#10022;</span>
        <span>Restyle</span><span class="strip__dot">&#10022;</span>
        <span>Grey blending</span><span class="strip__dot">&#10022;</span>
      </div>
    </div>
  </section>

  <section class="band" aria-labelledby="what-h">
    <div class="wrap">
      <div class="head" data-rev>
        <span class="num">01</span>
        <span class="eyebrow head__line">What it costs</span>
        <span class="num">No surprises</span>
      </div>
      <div class="split">
        <div class="stack">
          <h2 id="what-h" class="d2" data-rev>Four prices,<br />on the wall,<br />since 2011.</h2>
          <p data-rev="0.08">
            The price on the list is the price at the till. Nobody will suggest a
            treatment you did not ask for, and nobody will sell you a bottle of
            anything on the way out.
          </p>
          <a class="lnk mt" href="services.html">The whole list <span class="lnk__ar" aria-hidden="true">&rarr;</span></a>
        </div>
        <ul class="quickprice" data-rev="0.1">
          <li><span>Cut and finish</span><b>£24</b></li>
          <li><span>Skin fade</span><b>£28</b></li>
          <li><span>Hot towel shave</span><b>£30</b></li>
          <li><span>Cut and beard</span><b>£34</b></li>
          <li><span>Under 12s</span><b>£14</b></li>
        </ul>
      </div>
    </div>
  </section>

  <section class="band band--flush" aria-labelledby="work-h">
    <div class="wrap">
      <div class="head" data-rev>
        <span class="num">02</span>
        <span class="eyebrow head__line">The work</span>
        <a class="num lnk" href="gallery.html">All of it &rarr;</a>
      </div>
      <h2 id="work-h" class="sr">Recent cuts</h2>
      <ul class="grid3">
${galleryGrid([CUTS[0], CUTS[4], CUTS[2]])}
      </ul>
    </div>
  </section>

  <section class="band" aria-labelledby="shop-h">
    <div class="wrap">
      <div class="split split--even split--flip">
        <div class="stack">
          <p class="eyebrow" data-rev>03 &middot; The shop</p>
          <h2 id="shop-h" class="d2" data-rev>Two chairs,<br />one kettle.</h2>
          <p data-rev="0.08">
            It was a bookmakers, and before that a fishmonger's, and the tiles
            behind the basins are the fishmonger's. There is a radio on, a dog
            called Bracket, and a queue on Saturday mornings that everybody has
            made their peace with.
          </p>
          <dl class="stats" data-rev="0.16">
            <div><dt>Chairs</dt><dd><span data-count="2">2</span></dd></div>
            <div><dt>Years open</dt><dd><span data-count="14">14</span></dd></div>
            <div><dt>Cuts a week</dt><dd><span data-count="130">130</span></dd></div>
          </dl>
        </div>
        <button class="fig fig--3x2" data-lb data-lb-cap="The shop, after close" data-rev="mask">
          <canvas data-art="interior" data-art-opts='{"warm":"#e8a63c","cool":"#1b2733","dark":"#100c0a","lamps":4,"seed":31}'></canvas>
          <span class="fig__zoom" aria-hidden="true">+</span>
        </button>
      </div>
    </div>
  </section>

  <section class="band band--flush" aria-labelledby="say-h">
    <div class="wrap wrap--tight">
      <h2 id="say-h" class="sr">What people say</h2>
      <blockquote class="bigquote" data-rev>
        <p class="d2">&ldquo;He told me the fade I asked for would look daft on me. He was right, and he said it nicely.&rdquo;</p>
        <footer class="eyebrow">A customer who does not exist &middot; Sedgewick Street</footer>
      </blockquote>
    </div>
  </section>

  <section class="cta" aria-labelledby="cta-h">
    <canvas class="cta__art" aria-hidden="true"
            data-art="portrait" data-art-opts='{"cut":"long","seed":17,"x":0.24,"y":0.52,"scale":0.2,"back":"#0b0908","ink":"#f0e9dd","accent":"#c9a227"}'></canvas>
    <div class="cta__scrim" aria-hidden="true"></div>
    <div class="wrap cta__in">
      <p class="eyebrow" data-rev>Tuesday to Saturday</p>
      <h2 id="cta-h" class="d1" data-rev>Come in.</h2>
      <a class="btn btn--solid mt" href="contact.html" data-mag="0.24" data-rev="0.1">Book the chair</a>
    </div>
  </section>
`
};

/* ------------------------------------------------------- services --- */
page["services.html"] = {
  title: "Cuts and prices — Fairweather Barbers",
  desc: "Every price, on one page. Cut and finish £24, skin fade £28, hot towel shave £30. Demo site built by Orion.",
  body_html: `
  <section class="pagehead">
    <canvas class="pagehead__art" aria-hidden="true"
            data-art="portrait" data-art-opts='{"cut":"crop","seed":14,"x":0.7,"y":0.5,"scale":0.22,"flip":true,"back":"#14110f","ink":"#f0e9dd","accent":"#c9a227"}'></canvas>
    <div class="pagehead__scrim" aria-hidden="true"></div>
    <div class="wrap pagehead__in">
      <p class="eyebrow" data-rev>The whole list</p>
      <h1 class="d1" data-rev><span data-split>Cuts and prices</span></h1>
      <p class="lede" data-rev="0.12">
        On the wall since 2011, and the same at the till as it is here.
      </p>
    </div>
  </section>

  <section class="band">
    <div class="wrap wrap--tight">
${priceBlock(PRICES)}

      <div class="note mt-lg" data-rev>
        Cash, card, or a phone. No booking fee, no deposit, and no charge if you
        cancel — just tell us, so the chair does not sit empty.
      </div>
    </div>
  </section>

  <section class="band band--flush">
    <div class="wrap">
      <div class="head" data-rev><span class="num">&mdash;</span><span class="eyebrow head__line">What happens</span></div>
      <ol class="steps4">
        <li data-rev="0"><span class="steps4__n">01</span><h3>You sit down</h3><p>And we ask what you have been doing with it, not what you want it to look like.</p></li>
        <li data-rev="0.06"><span class="steps4__n">02</span><h3>We wash it</h3><p>Properly, at the basin, because you cannot cut hair you cannot see the shape of.</p></li>
        <li data-rev="0.12"><span class="steps4__n">03</span><h3>We cut it</h3><p>Forty minutes for a cut and finish. Fifty if it is a first fade.</p></li>
        <li data-rev="0.18"><span class="steps4__n">04</span><h3>We show you</h3><p>Two mirrors, and time to say if it is not right, before you have paid.</p></li>
      </ol>
    </div>
  </section>
`
};

/* -------------------------------------------------------- gallery --- */
page["gallery.html"] = {
  title: "The work — Fairweather Barbers",
  desc: "Recent cuts from both chairs. Demo site built by Orion.",
  body_html: `
  <section class="pagehead pagehead--short">
    <canvas class="pagehead__art" aria-hidden="true"
            data-art="portrait" data-art-opts='{"cut":"curls","seed":11,"x":0.72,"y":0.52,"scale":0.2,"flip":true,"back":"#14110f","ink":"#f0e9dd","accent":"#c9a227"}'></canvas>
    <div class="pagehead__scrim" aria-hidden="true"></div>
    <div class="wrap pagehead__in">
      <p class="eyebrow" data-rev>Both chairs</p>
      <h1 class="d1" data-rev>The work</h1>
    </div>
  </section>

  <section class="band">
    <div class="wrap">
      <div class="filters" role="tablist" aria-label="Filter by cut">
        <button class="filters__b" type="button" role="tab" data-filter="all" aria-selected="true">Everything</button>
        <button class="filters__b" type="button" role="tab" data-filter="fade" aria-selected="false">Fades</button>
        <button class="filters__b" type="button" role="tab" data-filter="crop" aria-selected="false">Crops</button>
        <button class="filters__b" type="button" role="tab" data-filter="beard" aria-selected="false">Beards</button>
        <button class="filters__b" type="button" role="tab" data-filter="long" aria-selected="false">Longer</button>
      </div>
      <ul class="grid3 grid3--gal" id="gal">
${galleryGrid(CUTS)}
      </ul>
      <p class="card__empty" id="gal-empty" hidden>Nothing under that heading yet. Try everything.</p>
    </div>
  </section>
`
};

/* ---------------------------------------------------------- about --- */
page["about.html"] = {
  title: "The shop — Fairweather Barbers",
  desc: "A bookmakers, then a fishmonger's, then two chairs and a kettle. Demo site built by Orion.",
  body_html: `
  <section class="pagehead">
    <canvas class="pagehead__art" aria-hidden="true"
            data-art="portrait" data-art-opts='{"cut":"shaved","seed":20,"x":0.73,"y":0.5,"scale":0.24,"flip":true,"back":"#14110f","ink":"#f0e9dd","accent":"#c9a227"}'></canvas>
    <div class="pagehead__scrim" aria-hidden="true"></div>
    <div class="wrap pagehead__in">
      <p class="eyebrow" data-rev>Sedgewick Street</p>
      <h1 class="d1" data-rev><span data-split>Two chairs and a kettle</span></h1>
    </div>
  </section>

  <article class="band prose">
    <div class="wrap wrap--tight">
      <p class="drop" data-rev>
        The unit had been a bookmakers for twenty years and a fishmonger's for
        forty before that. When we pulled the carpet up there was a drain in the
        middle of the floor and white tile all the way to shoulder height, which
        is why the shop looks the way it does — we did not choose it, we just
        stopped covering it up.
      </p>
      <p data-rev>
        Two chairs, on purpose. A third would mean somebody standing behind it who
        did not train here, and the only reason the queue on Saturday is bearable
        is that everybody in it knows exactly who is cutting.
      </p>

      <figure class="pull" data-rev>
        <blockquote class="d2">If it will not sit right on a Wednesday, we will say so on the Tuesday.</blockquote>
      </figure>

      <p data-rev>
        We do not sell product. There is a shelf with three things on it, all of
        them things we use, and if you ask what to buy the honest answer is
        usually nothing.
      </p>

      <div class="split split--even mt-lg">
        <button class="fig fig--4x5" data-lb data-lb-cap="Chair one" data-rev="mask">
          <canvas data-art="portrait" data-art-opts='{"cut":"beard","seed":8,"back":"#14110f","ink":"#f0e9dd","accent":"#c9a227"}'></canvas>
          <span class="fig__zoom" aria-hidden="true">+</span>
        </button>
        <button class="fig fig--4x5" data-lb data-lb-cap="Chair two" data-rev="mask">
          <canvas data-art="portrait" data-art-opts='{"cut":"quiff","seed":5,"back":"#14110f","ink":"#f0e9dd","accent":"#c9a227"}'></canvas>
          <span class="fig__zoom" aria-hidden="true">+</span>
        </button>
      </div>

      <div class="signoff" data-rev>
        <span class="eyebrow">Both chairs</span>
        <span class="d3">— Fairweather</span>
      </div>
    </div>
  </article>
`
};

/* -------------------------------------------------------- contact --- */
page["contact.html"] = {
  title: "Find us — Fairweather Barbers",
  desc: "Sedgewick Street, Tuesday to Saturday. Walk in, or send a message. Demo site built by Orion.",
  body: ' data-page="contact"',
  body_html: `
  <section class="pagehead pagehead--short">
    <canvas class="pagehead__art" aria-hidden="true"
            data-art="map" data-art-opts='{"paper":"#17130f","road":"#2b241c","accent":"#c9a227","water":"#1b2a2e","seed":5,"mx":0.4,"my":0.42}'></canvas>
    <div class="pagehead__scrim" aria-hidden="true"></div>
    <div class="wrap pagehead__in">
      <p class="eyebrow" data-rev>Sedgewick Street</p>
      <h1 class="d1" data-rev>Find us</h1>
    </div>
  </section>

  <section class="band">
    <div class="wrap">
      <div class="split">
        <div class="stack">
          <div class="sign sign--big" data-sign hidden>
            <i class="sign__dot"></i><span data-sign-text>Checking</span>
          </div>
          <table class="hours">
            <caption class="sr">Opening hours</caption>
            <tbody>
${HOURS.map(([d, a, b], i) => `              <tr data-day="${i}"><th scope="row">${d}</th><td>${a ? a + " – " + b : "Closed"}</td></tr>`).join("\n")}
            </tbody>
          </table>
          <p class="note mt">
            Walk-ins all day. The last cut goes in forty minutes before we shut,
            and the last shave an hour before.
          </p>
        </div>

        <form class="ask" id="ask" novalidate>
          <p class="eyebrow">Or send a message</p>
          <div class="field">
            <label for="a-name">Name</label>
            <input id="a-name" name="name" type="text" autocomplete="name" required />
            <p class="field__err" data-err-for="a-name" aria-live="polite"></p>
          </div>
          <div class="field">
            <label for="a-contact">Phone or email</label>
            <input id="a-contact" name="contact" type="text" required />
            <p class="field__err" data-err-for="a-contact" aria-live="polite"></p>
          </div>
          <div class="field">
            <label for="a-what">What are you after?</label>
            <select id="a-what" name="what">
              <option>Cut and finish — £24</option>
              <option>Skin fade — £28</option>
              <option>Hot towel shave — £30</option>
              <option>Cut and beard — £34</option>
              <option>Something else</option>
            </select>
          </div>
          <div class="field">
            <label for="a-msg">Anything else</label>
            <textarea id="a-msg" name="msg" placeholder="A day that suits, a photo you have seen, a wedding in June."></textarea>
          </div>
          <button class="btn btn--solid mt" type="submit">Send it</button>
          <p class="ask__done" id="ask-done" hidden>
            That is the message written. This is a demonstration, so nothing was
            sent — on a real build it would land in the shop's inbox.
          </p>
        </form>
      </div>
    </div>
  </section>

  <section class="band band--flush">
    <div class="wrap">
      <button class="fig fig--wide" data-lb data-lb-cap="Sedgewick Street" data-rev="mask">
        <canvas data-art="map" data-art-opts='{"paper":"#17130f","road":"#2b241c","accent":"#c9a227","water":"#1b2a2e","seed":5,"mx":0.4,"my":0.42}'></canvas>
        <span class="fig__zoom" aria-hidden="true">+</span>
      </button>
      <p class="fig__cap">
        <span>Sedgewick Street &middot; two doors up from the launderette</span>
        <span>A drawn map of a street that does not exist</span>
      </p>
    </div>
  </section>
`
};

module.exports = function build() {
  fs.mkdirSync(OUT, { recursive: true });
  Object.keys(page).forEach((f) => {
    fs.writeFileSync(path.join(OUT, f), shell(f, page[f]));
    console.log("  barbers/" + f);
  });
  return Object.keys(page).length;
};
