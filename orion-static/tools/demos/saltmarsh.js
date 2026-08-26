/* ---------------------------------------------------------------
   Saltmarsh — the Premium Custom demo.

   Four pages, a cinematic scroll sequence, a filterable card and a
   three-step booking system. Everything a Premium build is supposed
   to buy you, on a site that has to look like a restaurant's rather
   than like a demo of one.

   Run via: node tools/demos/build.js
   --------------------------------------------------------------- */
const fs = require("fs");
const path = require("path");
const OUT = path.resolve(__dirname, "../../demos/saltmarsh");

const NAV = [
  ["index.html", "The room"],
  ["menu.html", "The card"],
  ["story.html", "Journal"],
  ["book.html", "Book a table"]
];

const ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E" +
  "%3Crect width='32' height='32' fill='%230d1214'/%3E" +
  "%3Cpath d='M2 19 Q9 13 16 19 T30 19' stroke='%23efece4' stroke-width='1.8' fill='none'/%3E" +
  "%3Cpath d='M2 25 Q9 19 16 25 T30 25' stroke='%238f3a1c' stroke-width='1.8' fill='none'/%3E%3C/svg%3E";

/* the wave mark, drawn rather than set in a typeface */
const MARK = `<svg class="mark__ico" viewBox="0 0 34 26" fill="none" aria-hidden="true">
      <path d="M1 10 Q8.5 2 17 10 T33 10" stroke="currentColor" stroke-width="1.5" />
      <path d="M1 17 Q8.5 9 17 17 T33 17" stroke="var(--accent)" stroke-width="1.5" />
      <path d="M1 24 Q8.5 16 17 24 T33 24" stroke="currentColor" stroke-width="1.5" opacity=".4" />
    </svg>`;

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
<meta name="theme-color" content="#efece4" />
<link rel="icon" href="${ICON}" />
<link rel="preload" href="../../assets/fonts/fraunces-normal-300-900.woff2" as="font" type="font/woff2" crossorigin />
<link rel="stylesheet" href="../_lib/base.css" />
<link rel="stylesheet" href="style.css" />
</head>
<body${o.body || ""}>

<a class="skip" href="#main">Skip to content</a>

<a class="demobar" href="../../demos.html">
  <span class="demobar__tag">Demo</span>
  <span class="demobar__txt"><b>Saltmarsh is not a real restaurant.</b> It is a <b>Premium Custom</b> demo — four pages, a scroll film and a working booking system, built by Orion.</span>
  <span class="demobar__back">Back to Orion &rarr;</span>
</a>

<header class="bar" data-bar>
  <a class="mark" href="index.html" aria-label="Saltmarsh — home">
    ${MARK}
    <span class="mark__name">Saltmarsh<em>Wraith Point</em></span>
  </a>
  <nav class="nav" aria-label="Main">
        ${nav}
    <a class="btn btn--solid" href="book.html">Book</a>
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
        <p class="d3" style="max-width:18ch">Whatever the boats landed, cooked over fire.</p>
        <p class="mt" style="font-size:.9375rem;max-width:34ch;opacity:.72">
          One room, twenty-two covers, at the end of the lane on Wraith Point.
        </p>
      </div>
      <div>
        <p class="foot__h">Hours</p>
        <ul class="foot__list">
          <li>Wednesday &ndash; Saturday</li>
          <li>Dinner from 6:30pm</li>
          <li>Sunday lunch, one sitting at 1pm</li>
          <li>Closed Monday and Tuesday</li>
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
      <span>Saltmarsh &middot; a demonstration site</span>
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

/* =====================================================================
   THE CARD — one list, used by the menu page and the home page preview
   ===================================================================== */
const CARD = [
  { c: "sea", n: "Oysters, seaweed vinegar", p: "£3.50 each", d: "Opened to order. The vinegar is our own, from bladderwrack picked off the point." },
  { c: "sea", n: "Cured pollock, cucumber, dill oil", p: "£12", d: "Three days in salt and sugar, sliced thin. Pollock because it was what came in." },
  { c: "land", n: "Hogget, wild garlic, burnt onion", p: "£28", d: "Over embers, rested twenty minutes, carved at the pass. Garlic from the lane." },
  { c: "sea", n: "Whole turbot for two, brown butter", p: "£62", d: "Whatever size the boat brought. We will tell you the weight before you commit." },
  { c: "green", n: "Marsh samphire, brown shrimp", p: "£9", d: "Cut on the falling tide, cooked for ninety seconds, not a minute more." },
  { c: "land", n: "Beef shin, barley, bone marrow", p: "£24", d: "Six hours in the oven that was already on. The barley does the rest." },
  { c: "green", n: "Sea beet, cream, nutmeg", p: "£7", d: "The nettle of the shoreline. Better than spinach and nobody believes us." },
  { c: "sweet", n: "Burnt honey custard", p: "£9", d: "Honey from three miles inland, taken further than is sensible." },
  { c: "sweet", n: "Blackberry, bay leaf ice", p: "£9", d: "Picked along the sea wall in September and frozen for the rest of the year." },
  { c: "sweet", n: "A wedge of something local, oatcakes", p: "£11", d: "Ask. It changes, and whoever is on the pass will have a view." }
];

const FILTERS = [
  ["all", "Everything"],
  ["sea", "From the water"],
  ["land", "From the land"],
  ["green", "From the marsh"],
  ["sweet", "To finish"]
];

const cardRows = (items) => items.map((it, i) => `
        <li class="dish" data-cat="${it.c}" data-rev="${(i % 4) * 0.05}">
          <button class="dish__hd" type="button" aria-expanded="false">
            <span class="dish__n">${it.n}</span>
            <span class="dish__dots" aria-hidden="true"></span>
            <span class="dish__p">${it.p}</span>
            <span class="dish__more" aria-hidden="true"></span>
          </button>
          <div class="dish__body"><p>${it.d}</p></div>
        </li>`).join("");

/* =====================================================================
   PAGES
   ===================================================================== */
const page = {};

/* ---------------------------------------------------------- index --- */
page["index.html"] = {
  title: "Saltmarsh — whatever the boats landed, cooked over fire",
  desc: "A twenty-two cover room at the end of the lane on Wraith Point. No fixed menu, because there is no fixed catch. Demo site built by Orion.",
  body: ' data-page="home"',
  body_html: `
  <!-- ============ HERO ============ -->
  <section class="hero">
    <div class="hero__art" aria-hidden="true">
      <canvas data-art="marsh" data-art-opts='{"hour":0.74,"tide":0.42,"seed":7,"horizon":0.56}'></canvas>
    </div>
    <div class="hero__scrim" aria-hidden="true"></div>
    <div class="wrap hero__in">
      <p class="eyebrow hero__eye" data-rev>Wraith Point &middot; twenty-two covers</p>
      <h1 class="d1 hero__h" data-rev>
        <span data-split>Whatever the boats landed,</span>
        <em data-split>cooked over fire.</em>
      </h1>
      <p class="lede hero__l" data-rev="0.18">
        There is no fixed menu because there is no fixed catch. We write the card
        at four o'clock, once we know what came in.
      </p>
      <div class="row mt" data-rev="0.28">
        <a class="btn btn--solid" href="book.html" data-mag="0.22">Book a table</a>
        <a class="btn btn--ghost" href="menu.html" data-mag="0.22">Yesterday's card</a>
      </div>
    </div>
    <a class="hero__cue" href="#tide" aria-label="Scroll">
      <span class="hero__cue-l" aria-hidden="true"></span>
      <span class="eyebrow">The tide</span>
    </a>
  </section>

  <!-- ============ THE TIDE — a film, driven by the scroll ============ -->
  <section class="tide" id="tide" data-seq aria-labelledby="tide-h">
    <div class="seq__pin">
      <canvas class="tide__art" id="tide-art" aria-hidden="true"
              data-art="marsh" data-art-opts='{"hour":0.08,"tide":0.05,"seed":12,"horizon":0.54}'></canvas>
      <div class="tide__scrim" aria-hidden="true"></div>

      <h2 id="tide-h" class="sr">A day on Wraith Point</h2>

      <div class="tide__hud wrap">
        <div class="tide__meta">
          <span class="num" id="tide-clock">04:40</span>
          <span class="num" id="tide-state">Low water</span>
        </div>
        <div class="tide__caps">
          <p class="tide__cap" data-on="true">
            <span class="eyebrow eyebrow--accent">First light</span>
            <span class="d3">The boats go out before anybody is awake.</span>
          </p>
          <p class="tide__cap">
            <span class="eyebrow eyebrow--accent">Nine o'clock</span>
            <span class="d3">The marsh drains, and the samphire beds show.</span>
          </p>
          <p class="tide__cap">
            <span class="eyebrow eyebrow--accent">Four o'clock</span>
            <span class="d3">Whatever is in the boxes becomes tonight's card.</span>
          </p>
          <p class="tide__cap">
            <span class="eyebrow eyebrow--accent">Half past six</span>
            <span class="d3">The tide is back, the fire is lit, and the room fills.</span>
          </p>
        </div>
        <div class="tide__bar" aria-hidden="true"><i></i></div>
      </div>
    </div>
  </section>

  <!-- ============ TONIGHT ============ -->
  <section class="band" aria-labelledby="tonight-h">
    <div class="wrap">
      <div class="head" data-rev>
        <span class="num">01</span>
        <span class="eyebrow head__line">Tonight, probably</span>
        <span class="num" id="today-date"></span>
      </div>
      <div class="split">
        <div class="stack" data-rev>
          <h2 id="tonight-h" class="d2">The card is written<br /><em>at four o'clock.</em></h2>
          <p>
            Four courses, one sitting, and a version of it for anyone who does not
            eat what came off the boat. If you tell us in advance we will cook for
            you properly rather than apologetically.
          </p>
          <a class="lnk mt" href="menu.html">See the whole card <span class="lnk__ar" aria-hidden="true">&rarr;</span></a>
        </div>
        <ul class="card" data-rev="0.1">
${cardRows(CARD.slice(0, 5))}
        </ul>
      </div>
    </div>
  </section>

  <!-- ============ THE ROOM ============ -->
  <section class="band band--flush" aria-labelledby="room-h">
    <div class="wrap">
      <div class="split split--even">
        <button class="fig fig--4x5" data-lb data-lb-cap="The room, before service" data-rev="mask">
          <canvas data-art="interior" data-art-opts='{"warm":"#ff9a44","cool":"#2b465e","dark":"#0b0e10","lamps":3,"seed":17}'></canvas>
          <span class="fig__zoom" aria-hidden="true">+</span>
        </button>
        <div class="stack">
          <p class="eyebrow" data-rev>02 &middot; The room</p>
          <h2 id="room-h" class="d2" data-rev>Twenty-two seats<br />and one fire.</h2>
          <p data-rev="0.08">
            It was a chandlery, then a garage, then nothing for eleven years. The
            floor is the floor it always was. Everything is cooked in the room you
            are sitting in, which means it is loud, and warm, and you will smell of
            woodsmoke on the way home.
          </p>
          <dl class="stats" data-rev="0.16">
            <div><dt>Covers</dt><dd><span data-count="22">22</span></dd></div>
            <div><dt>Tables</dt><dd><span data-count="7">7</span></dd></div>
            <div><dt>Miles to the boat</dt><dd><span data-count="2">2</span></dd></div>
          </dl>
        </div>
      </div>
    </div>
  </section>

  <!-- ============ WHAT CAME IN ============ -->
  <section class="strip" aria-label="What came in today">
    <div data-marquee="26">
      <div>
        <span>Turbot</span><span class="strip__dot">&bull;</span>
        <span>Brown shrimp</span><span class="strip__dot">&bull;</span>
        <span>Samphire</span><span class="strip__dot">&bull;</span>
        <span>Pollock</span><span class="strip__dot">&bull;</span>
        <span>Native oysters</span><span class="strip__dot">&bull;</span>
        <span>Sea beet</span><span class="strip__dot">&bull;</span>
        <span>Hogget</span><span class="strip__dot">&bull;</span>
        <span>Wild garlic</span><span class="strip__dot">&bull;</span>
      </div>
    </div>
  </section>

  <!-- ============ VOICES ============ -->
  <section class="band" aria-labelledby="voices-h">
    <div class="wrap wrap--tight">
      <h2 id="voices-h" class="sr">What people say</h2>
      <div class="quotes" data-quotes>
        <blockquote class="quote" data-on="true">
          <p class="d3">&ldquo;We drove ninety minutes for a plate of shrimp and I would do it again on Tuesday.&rdquo;</p>
          <footer class="eyebrow">A person who is not real &middot; September</footer>
        </blockquote>
        <blockquote class="quote">
          <p class="d3">&ldquo;They told us the turbot's weight before we ordered it. Nobody does that.&rdquo;</p>
          <footer class="eyebrow">Also not real &middot; August</footer>
        </blockquote>
        <blockquote class="quote">
          <p class="d3">&ldquo;One room, one fire, and the best thing I ate all year.&rdquo;</p>
          <footer class="eyebrow">Entirely invented &middot; June</footer>
        </blockquote>
      </div>
      <div class="quotes__dots" role="tablist" aria-label="Quotes">
        <button type="button" role="tab" aria-selected="true" aria-label="Quote 1"></button>
        <button type="button" role="tab" aria-selected="false" aria-label="Quote 2"></button>
        <button type="button" role="tab" aria-selected="false" aria-label="Quote 3"></button>
      </div>
    </div>
  </section>

  <!-- ============ BOOK ============ -->
  <section class="cta" aria-labelledby="cta-h">
    <canvas class="cta__art" aria-hidden="true"
            data-art="marsh" data-art-opts='{"hour":0.94,"tide":0.8,"seed":21,"horizon":0.5,"birds":false}'></canvas>
    <div class="cta__scrim" aria-hidden="true"></div>
    <div class="wrap cta__in">
      <p class="eyebrow" data-rev>Wednesday to Sunday</p>
      <h2 id="cta-h" class="d1" data-rev>Come at dusk.</h2>
      <a class="btn btn--solid mt" href="book.html" data-mag="0.24" data-rev="0.12">Book a table</a>
    </div>
  </section>
`
};

/* ----------------------------------------------------------- menu --- */
page["menu.html"] = {
  title: "The card — Saltmarsh",
  desc: "Yesterday's card, which is the closest anyone can get to tonight's. Demo site built by Orion.",
  body: ' data-page="menu"',
  body_html: `
  <section class="pagehead">
    <canvas class="pagehead__art" aria-hidden="true"
            data-art="marsh" data-art-opts='{"hour":0.36,"tide":0.62,"seed":33,"horizon":0.52}'></canvas>
    <div class="pagehead__scrim" aria-hidden="true"></div>
    <div class="wrap pagehead__in">
      <p class="eyebrow" data-rev>Yesterday's card</p>
      <h1 class="d1" data-rev><span data-split>The card, as it stood</span></h1>
      <p class="lede" data-rev="0.14">
        Tonight's is written at four. This is what we cooked yesterday, which is
        the closest anyone can honestly get to it.
      </p>
    </div>
  </section>

  <section class="band">
    <div class="wrap">
      <div class="filters" role="tablist" aria-label="Filter the card">
${FILTERS.map(([k, l], i) => `        <button class="filters__b" type="button" role="tab" data-filter="${k}" aria-selected="${i === 0}">${l}</button>`).join("\n")}
      </div>

      <ul class="card card--full" id="card-list">
${cardRows(CARD)}
      </ul>

      <p class="card__empty" id="card-empty" hidden>Nothing on the card under that heading yesterday.</p>

      <div class="note mt-lg" data-rev>
        Everything is cooked over wood in the room. If you cannot eat something,
        tell us when you book rather than when you arrive, and we will cook you
        the same number of courses rather than a plate of vegetables.
      </div>
    </div>
  </section>

  <section class="band band--flush">
    <div class="wrap">
      <div class="split split--even">
        <div class="stack">
          <p class="eyebrow" data-rev>The wine</p>
          <h2 class="d2" data-rev>Forty bottles,<br /><em>all of them tasted.</em></h2>
          <p data-rev="0.08">
            A short list on purpose. Nothing on it costs more than the food, there
            is always something under thirty pounds, and whoever is pouring has
            drunk all of it and will tell you the truth.
          </p>
        </div>
        <button class="fig fig--3x2" data-lb data-lb-cap="Low water, from the sea wall" data-rev="mask">
          <canvas data-art="marsh" data-art-opts='{"hour":0.2,"tide":0.1,"seed":44,"horizon":0.6}'></canvas>
          <span class="fig__zoom" aria-hidden="true">+</span>
        </button>
      </div>
    </div>
  </section>
`
};

/* ---------------------------------------------------------- story --- */
page["story.html"] = {
  title: "Journal — Saltmarsh",
  desc: "How a chandlery became a dining room, and why the menu is written at four o'clock. Demo site built by Orion.",
  body: ' data-page="story"',
  body_html: `
  <section class="pagehead pagehead--tall">
    <canvas class="pagehead__art" aria-hidden="true"
            data-art="marsh" data-art-opts='{"hour":0.12,"tide":0.24,"seed":55,"horizon":0.58}'></canvas>
    <div class="pagehead__scrim" aria-hidden="true"></div>
    <div class="wrap pagehead__in">
      <p class="eyebrow" data-rev>Journal &middot; number four</p>
      <h1 class="d1" data-rev><span data-split>Eleven years empty</span></h1>
    </div>
  </section>

  <article class="band prose">
    <div class="wrap wrap--tight">
      <p class="drop" data-rev>
        The building was a chandlery until 1974, a garage until 1998, and then
        nothing at all for eleven years. When we got the keys there were two feet
        of silt in the back room and a boat in the yard that nobody has ever
        claimed.
      </p>
      <p data-rev>
        We kept the floor. Not out of sentiment — it is a good floor, laid by
        somebody who expected barrels to be rolled across it, and it has taken
        everything since without complaint. The fire went in where the pit used
        to be, which is why the flue is in an odd place and why the room is warm
        at one end.
      </p>

      <figure class="pull" data-rev>
        <blockquote class="d2">The catch decides. We just have to be ready for whatever it decides.</blockquote>
      </figure>

      <p data-rev>
        People ask why there is no menu online. The answer is that a menu printed
        in March is a promise about a fish that has not been caught yet. Ours goes
        up at four o'clock, when the boxes are in and we know what we are working
        with. Sometimes that means turbot. Twice last winter it meant an awful lot
        of grey mullet and a good deal of improvisation.
      </p>

      <button class="fig fig--wide mt-lg" data-lb data-lb-cap="The point, on the falling tide" data-rev="mask">
        <canvas data-art="marsh" data-art-opts='{"hour":0.66,"tide":0.3,"seed":66,"horizon":0.55}'></canvas>
        <span class="fig__zoom" aria-hidden="true">+</span>
      </button>

      <p class="mt-lg" data-rev>
        The marsh itself does most of the work. Samphire from May, sea beet all
        year, and blackberries along the wall in September that are better than
        anything grown on purpose. None of it costs anything except the walk, and
        the walk is the best part of the day.
      </p>
      <p data-rev>
        We are open four nights and one lunch. That is not a strategy, it is
        arithmetic: two of us cook, one of us pours, and none of us wants to do it
        badly six days a week.
      </p>

      <div class="signoff" data-rev>
        <span class="eyebrow">Written on the pass</span>
        <span class="d3">— Saltmarsh</span>
      </div>
    </div>
  </article>

  <section class="cta cta--short">
    <canvas class="cta__art" aria-hidden="true"
            data-art="interior" data-art-opts='{"warm":"#ff9a44","cool":"#22384a","dark":"#0a0d0f","lamps":4,"seed":29}'></canvas>
    <div class="cta__scrim" aria-hidden="true"></div>
    <div class="wrap cta__in">
      <h2 class="d2" data-rev>Four nights and one lunch.</h2>
      <a class="btn btn--solid mt" href="book.html" data-mag="0.24" data-rev="0.1">Book a table</a>
    </div>
  </section>
`
};

/* ----------------------------------------------------------- book --- */
page["book.html"] = {
  title: "Book a table — Saltmarsh",
  desc: "Three steps: a date, a time, and who is coming. Demo booking system built by Orion.",
  body: ' data-page="book"',
  body_html: `
  <section class="pagehead pagehead--short">
    <canvas class="pagehead__art" aria-hidden="true"
            data-art="marsh" data-art-opts='{"hour":0.8,"tide":0.7,"seed":77,"horizon":0.5}'></canvas>
    <div class="pagehead__scrim" aria-hidden="true"></div>
    <div class="wrap pagehead__in">
      <p class="eyebrow" data-rev>Twenty-two covers</p>
      <h1 class="d1" data-rev>Book a table</h1>
    </div>
  </section>

  <section class="band">
    <div class="wrap wrap--tight">

      <ol class="steps" id="steps" aria-label="Booking steps">
        <li class="steps__i" data-on="true"><span class="steps__n">1</span><span>Date</span></li>
        <li class="steps__i"><span class="steps__n">2</span><span>Time &amp; party</span></li>
        <li class="steps__i"><span class="steps__n">3</span><span>Details</span></li>
      </ol>

      <form class="bk" id="bk" novalidate>

        <!-- step 1 -->
        <fieldset class="bk__step" data-step="1" data-on="true">
          <legend class="sr">Choose a date</legend>
          <div class="cal">
            <div class="cal__head">
              <button class="cal__nav" type="button" data-cal-prev aria-label="Previous month">&lsaquo;</button>
              <p class="cal__month" id="cal-month" aria-live="polite"></p>
              <button class="cal__nav" type="button" data-cal-next aria-label="Next month">&rsaquo;</button>
            </div>
            <div class="cal__dows" aria-hidden="true">
              <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
            </div>
            <div class="cal__grid" id="cal-grid" role="grid" aria-label="Available dates"></div>
            <p class="cal__key">
              <span><i class="cal__sw cal__sw--open"></i> Open</span>
              <span><i class="cal__sw cal__sw--few"></i> Nearly full</span>
              <span><i class="cal__sw cal__sw--shut"></i> Closed</span>
            </p>
          </div>
        </fieldset>

        <!-- step 2 -->
        <fieldset class="bk__step" data-step="2">
          <legend class="sr">Choose a time and a party size</legend>
          <p class="bk__chosen" id="bk-chosen"></p>

          <p class="bk__lab">How many of you?</p>
          <div class="pips" id="pips" role="radiogroup" aria-label="Party size"></div>

          <p class="bk__lab mt">What time?</p>
          <div class="slots" id="slots" role="radiogroup" aria-label="Sitting time"></div>
          <p class="bk__none" id="bk-none" hidden>Nothing left at that size on this date. Try another day, or a smaller table.</p>
        </fieldset>

        <!-- step 3 -->
        <fieldset class="bk__step" data-step="3">
          <legend class="sr">Your details</legend>
          <p class="bk__chosen" id="bk-chosen-2"></p>
          <div class="bk__fields">
            <div class="field">
              <label for="bk-name">Name</label>
              <input id="bk-name" name="name" type="text" autocomplete="name" required />
              <p class="field__err" data-err-for="bk-name" aria-live="polite"></p>
            </div>
            <div class="field">
              <label for="bk-email">Email</label>
              <input id="bk-email" name="email" type="email" autocomplete="email" required />
              <p class="field__err" data-err-for="bk-email" aria-live="polite"></p>
            </div>
            <div class="field bk__wide">
              <label for="bk-notes">Anything we should know?</label>
              <textarea id="bk-notes" name="notes" placeholder="Allergies, a birthday, a pushchair, a dog."></textarea>
            </div>
          </div>
        </fieldset>

        <div class="bk__nav">
          <button class="btn" type="button" id="bk-back" hidden>Back</button>
          <button class="btn btn--solid" type="button" id="bk-next" disabled>Choose a date</button>
        </div>
      </form>

      <div class="bk__done" id="bk-done" hidden>
        <p class="eyebrow eyebrow--accent">Held for ten minutes</p>
        <h2 class="d2">That is the table.</h2>
        <dl class="recap" id="bk-recap"></dl>
        <p class="note mt">
          This is a demonstration, so nothing was sent and no table was actually
          held. On a real build this would post to the restaurant's booking system
          and email you a confirmation.
        </p>
        <button class="btn mt" type="button" id="bk-again">Start again</button>
      </div>

    </div>
  </section>
`
};

module.exports = function build() {
  fs.mkdirSync(OUT, { recursive: true });
  Object.keys(page).forEach((f) => {
    fs.writeFileSync(path.join(OUT, f), shell(f, page[f]));
    console.log("  saltmarsh/" + f);
  });
  return Object.keys(page).length;
};
