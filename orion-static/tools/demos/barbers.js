/* ---------------------------------------------------------------
   Fairweather Barbers — a Business Growth demo (five pages).
   Generated from one shell so the chrome cannot drift, exactly the
   way the Orion site itself is built.

   Run via: node tools/demos/build.js
   --------------------------------------------------------------- */
const fs = require("fs");
const path = require("path");
const OUT = path.resolve(__dirname, "../../demos/barbers");

const NAV = [
  ["index.html", "Home"],
  ["about.html", "The shop"],
  ["services.html", "Cuts &amp; prices"],
  ["gallery.html", "Work"],
  ["contact.html", "Find us"]
];

const ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E" +
  "%3Crect width='32' height='32' fill='%2314110f'/%3E%3Cpath d='M-6 26 L10 -2 M2 26 L18 -2 M10 26 L26 -2 M18 26 L34 -2'" +
  " stroke='%23e0761f' stroke-width='5'/%3E%3C/svg%3E";

function shell(page, opts) {
  const nav = NAV.map(([href, label]) =>
    `<a href="${href}"${href === page ? ' aria-current="page"' : ""}>${label}</a>`).join("\n      ");
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${opts.title}</title>
<meta name="description" content="${opts.desc}" />
<meta name="robots" content="noindex, follow" />
<meta name="theme-color" content="#14110f" />
<link rel="icon" href="${ICON}" />
<link rel="preload" href="../../assets/fonts/bebas-normal-400.woff2" as="font" type="font/woff2" crossorigin />
<link rel="stylesheet" href="style.css" />
</head>
<body>

<a class="demobar" href="../../work.html">
  <span class="demobar__tag">Demo</span>
  <span class="demobar__txt"><b>Fairweather Barbers is not a real shop.</b> This is a <b>Business Growth</b> demo — five pages, built by Orion.</span>
  <span class="demobar__back">Back to Orion &rarr;</span>
</a>

<a class="skip" href="#main">Skip to content</a>

<header class="top">
  <div class="pole" aria-hidden="true"></div>
  <div class="top__in">
    <a class="mark" href="index.html">
      <span class="mark__n">Fairweather</span>
      <span class="mark__s">Barbers &middot; est. 2011</span>
    </a>
    <nav class="nav" aria-label="Main">
      ${nav}
    </nav>
    <a class="cta" href="contact.html">Book a chair</a>
    <button class="burger" type="button" id="burger" aria-expanded="false" aria-controls="nav-m" aria-label="Open menu">
      <span></span><span></span><span></span>
    </button>
  </div>
  <nav class="nav-m" id="nav-m" aria-label="Main, small screens" data-open="false">
    ${nav}
  </nav>
</header>

<main id="main">
${opts.body}
</main>

<footer class="foot">
  <div class="pole" aria-hidden="true"></div>
  <div class="foot__in">
    <div>
      <p class="foot__n">Fairweather</p>
      <p class="foot__d">42 Cross Street<br />Marbury, CH3 8QP</p>
    </div>
    <div>
      <p class="foot__k">Hours</p>
      <p class="foot__d">Tue&ndash;Fri 9&ndash;6<br />Sat 8&ndash;4 &middot; Sun&ndash;Mon closed</p>
    </div>
    <div>
      <p class="foot__k">Pages</p>
      <p class="foot__d">${NAV.map(([h, l]) => `<a href="${h}">${l}</a>`).join("<br />")}</p>
    </div>
    <div>
      <p class="foot__k">About this page</p>
      <p class="foot__d foot__d--dim">A fictional shop, invented for a demo.<br />Built by <a href="../../home.html">Orion</a>.</p>
    </div>
  </div>
</footer>

<script src="app.js" defer></script>
</body>
</html>
`;
}

/* ---------- shared blocks ---------- */
const hours = `  <section class="strip">
    <div class="wrap strip__in">
      <span class="strip__k">Open</span>
      <span class="strip__v">Tue&ndash;Fri 9&ndash;6</span>
      <span class="strip__v">Sat 8&ndash;4</span>
      <span class="strip__v strip__v--off">Sun &amp; Mon closed</span>
      <span class="strip__k strip__k--end">Walk-ins welcome, but Saturday fills by ten</span>
    </div>
  </section>`;

const cut = (n, name, len, price, note) => `        <article class="cutcard">
          <div class="cutcard__plate"><canvas data-cut="${n}" width="760" height="570"></canvas></div>
          <div class="cutcard__b">
            <h3>${name}</h3>
            <p class="cutcard__m"><span>${len}</span><b>${price}</b></p>
            <p class="cutcard__d">${note}</p>
          </div>
        </article>`;

const page = {};

/* ---------- home ---------- */
page["index.html"] = {
  title: "Fairweather Barbers — Marbury",
  desc: "A proper barbershop on Cross Street. Cuts, beards, hot towel shaves. Walk-ins welcome.",
  body: `  <section class="hero">
    <div class="hero__bg" aria-hidden="true"><canvas id="grain"></canvas></div>
    <div class="wrap hero__in hero__grid">
      <div>
      <p class="kick">Cross Street &middot; Marbury</p>
      <h1>Fourteen years<br />of getting it<br /><em>right</em> first time</h1>
      <p class="lede">
        A barbershop, not a salon. Two chairs, no music you have to shout over,
        and a cut that still looks like something three weeks later.
      </p>
      <div class="row">
        <a class="btn btn--fill" href="contact.html">Book a chair</a>
        <a class="btn" href="services.html">See the prices</a>
      </div>
      </div>
      <div class="hero__plate" aria-hidden="true">
        <canvas data-cut="3" width="760" height="570"></canvas>
        <span class="hero__cap">Fig. 01 — skin fade &amp; beard</span>
      </div>
    </div>
  </section>

${hours}

  <section class="band">
    <div class="wrap">
      <p class="kick">What we do</p>
      <h2 class="h2">Three things, properly</h2>
      <div class="three">
        <article class="tcard">
          <span class="tcard__n">01</span>
          <h3>Cuts</h3>
          <p>Scissor, clipper or both. We ask what you actually do each morning before we start, because a cut you cannot maintain is a cut that lasts a fortnight.</p>
          <p class="tcard__p">from &pound;22</p>
        </article>
        <article class="tcard">
          <span class="tcard__n">02</span>
          <h3>Beards</h3>
          <p>Shaped, lined and finished with a hot towel. Booked as its own appointment because doing it in the last four minutes of a cut is how beards go wrong.</p>
          <p class="tcard__p">from &pound;14</p>
        </article>
        <article class="tcard">
          <span class="tcard__n">03</span>
          <h3>Wet shaves</h3>
          <p>Cut-throat, two passes, hot towels either side. Forty minutes and you will not want to go back to a cartridge razor.</p>
          <p class="tcard__p">&pound;32</p>
        </article>
      </div>
    </div>
  </section>

  <section class="band band--dark">
    <div class="wrap split">
      <div>
        <p class="kick">The shop</p>
        <h2 class="h2">Two chairs, on purpose</h2>
        <p class="body">
          Ray opened Fairweather in 2011 with one chair and a secondhand mirror. There are two
          chairs now and there will never be three, because the day this becomes a place where
          nobody knows your name is the day it stops being worth running.
        </p>
        <a class="arrow" href="about.html">More about the shop &rarr;</a>
      </div>
      <dl class="stats">
        <div><dt>Chairs</dt><dd>2</dd></div>
        <div><dt>Years open</dt><dd>14</dd></div>
        <div><dt>Cuts a week</dt><dd>90</dd></div>
        <div><dt>Music, loud</dt><dd>0</dd></div>
      </dl>
    </div>
  </section>

  <section class="band">
    <div class="wrap">
      <p class="kick">Regulars ask for these</p>
      <h2 class="h2">Three we do most weeks</h2>
      <div class="cuts">
${cut(1, "The Cross Street", "Short back and sides", "£24", "Scissor on top, faded low. The one half of Marbury walks in and asks for by name.")}
${cut(2, "Grown-out crop", "Medium, textured", "£26", "For hair that has a mind of its own. Cut so it falls the right way without product.")}
${cut(3, "Skin fade &amp; beard", "Short, sharp", "£34", "Fade to skin, beard shaped to match. Book the hour, not the half.")}
      </div>
      <div class="row"><a class="btn" href="gallery.html">See more of the work</a></div>
    </div>
  </section>

  <section class="band band--amber">
    <div class="wrap endcap">
      <h2 class="h2 h2--big">Saturday goes<br />by ten. Ring<br />ahead.</h2>
      <div class="row">
        <a class="btn btn--dark" href="contact.html">Book a chair</a>
        <a class="btn btn--ghostdark" href="services.html">Prices first</a>
      </div>
    </div>
  </section>`
};

/* ---------- about ---------- */
page["about.html"] = {
  title: "The shop — Fairweather Barbers",
  desc: "Two chairs on Cross Street since 2011. Who cuts here and how the shop works.",
  body: `  <section class="phead">
    <div class="wrap">
      <p class="kick">The shop</p>
      <h1 class="phead__h">A barbershop, <em>not</em> a salon</h1>
      <p class="lede">
        Fourteen years on the same street, two chairs, and a rule that nobody gets rushed
        because the next appointment is early.
      </p>
    </div>
  </section>

  <section class="band">
    <div class="wrap split split--wide">
      <div>
        <h2 class="h2">How it started</h2>
      </div>
      <div>
        <p class="body">
          Ray Fairweather cut hair in three other people's shops for eleven years before taking
          the lease on 42 Cross Street in 2011. The first fit-out was one chair, a secondhand
          mirror off a shop closing in Chester, and a sign he painted himself. The sign is still
          up. It needs doing again and he will not let anyone touch it.
        </p>
        <p class="body">
          Priya joined in 2016 and took the second chair permanently in 2018. Between them they
          get through about ninety heads a week, which is roughly the ceiling before the thing
          people like about the place starts to go.
        </p>
        <p class="body">
          There is no receptionist, no app, and no upselling. If you want something we do not
          think will suit you, we will say so and then do it anyway, because it is your head.
        </p>
      </div>
    </div>
  </section>

  <section class="band band--dark">
    <div class="wrap">
      <p class="kick">Who cuts</p>
      <h2 class="h2">Two chairs, two barbers</h2>
      <div class="people">
        <article class="person">
          <span class="person__mono" aria-hidden="true">RF</span>
          <h3>Ray Fairweather</h3>
          <p class="person__r">Owner &middot; 25 years cutting</p>
          <p class="person__d">Scissor work and classic shapes. Will talk about Chester City for the full half hour if you let him, and can be steered onto anything else with one question.</p>
        </article>
        <article class="person">
          <span class="person__mono" aria-hidden="true">PK</span>
          <h3>Priya Kaur</h3>
          <p class="person__r">Barber &middot; 12 years cutting</p>
          <p class="person__d">Fades, texture and anything that has to survive curly hair and a motorcycle helmet. Books out furthest ahead, so ring early in the week.</p>
        </article>
      </div>
    </div>
  </section>

  <section class="band">
    <div class="wrap">
      <p class="kick">How the shop works</p>
      <h2 class="h2">Four things worth knowing</h2>
      <ol class="rules">
        <li><span>01</span><b>Walk-ins are real</b><p>We keep two slots a day unbooked. Before ten and after four are the quiet windows, and Saturday is not one of them.</p></li>
        <li><span>02</span><b>Under-12s and over-70s pay &pound;14</b><p>Always have. It is not a promotion and it does not need mentioning at the till.</p></li>
        <li><span>03</span><b>Cash or card, no minimum</b><p>Nobody is being asked to buy a &pound;7 pomade to use the card machine.</p></li>
        <li><span>04</span><b>If it is not right, come back</b><p>Within a week, no charge, no argument. It happens two or three times a year and it is fine.</p></li>
      </ol>
    </div>
  </section>

  <section class="band band--amber">
    <div class="wrap endcap">
      <h2 class="h2 h2--big">Come and see<br />what we mean</h2>
      <div class="row">
        <a class="btn btn--dark" href="contact.html">Find us</a>
        <a class="btn btn--ghostdark" href="services.html">Cuts &amp; prices</a>
      </div>
    </div>
  </section>`
};

/* ---------- services ---------- */
const priceRows = [
  ["Cuts", [
    ["Cut", "Scissor, clipper or both. Wash and finish included.", "30 min", "£24"],
    ["Cut &amp; beard", "The pair, booked together so neither gets rushed.", "45 min", "£34"],
    ["Restyle", "Longer sit-down when you want something genuinely different.", "45 min", "£30"],
    ["Skin fade", "Down to skin, blended by hand rather than by guard.", "35 min", "£26"],
    ["Under-12 / over-70", "Same cut, same time, standing price.", "30 min", "£14"],
    ["Clipper cut, one length", "In and out. No wash unless you want one.", "15 min", "£16"]
  ]],
  ["Beards", [
    ["Beard trim", "Shaped and lined, hot towel finish.", "20 min", "£14"],
    ["Beard shape-up", "Full reshape when it has got away from you.", "30 min", "£20"],
    ["Head shave", "Razor to skin, two passes, towels either side.", "30 min", "£26"],
    ["Wet shave", "Cut-throat, the proper forty minutes.", "40 min", "£32"]
  ]],
  ["Extras", [
    ["Wash &amp; style", "On its own, or added to anything above.", "15 min", "£8"],
    ["Grey blending", "Softened rather than covered. Booked with a cut.", "20 min", "£18"],
    ["Kids first cut", "Certificate, a lock in an envelope, and no hurrying.", "30 min", "£14"]
  ]]
];

page["services.html"] = {
  title: "Cuts &amp; prices — Fairweather Barbers",
  desc: "Every cut, beard and shave with the time it takes and what it costs. No hidden extras.",
  body: `  <section class="phead">
    <div class="wrap">
      <p class="kick">Cuts &amp; prices</p>
      <h1 class="phead__h">Everything, and<br />what it costs</h1>
      <p class="lede">
        The time next to each one is the time we book, not the time we hope for. Nothing on this
        list has an extra at the till.
      </p>
    </div>
  </section>

  <section class="band">
    <div class="wrap">
${priceRows.map(([group, rows]) => `      <div class="plist">
        <h2 class="plist__h">${group}</h2>
        <div class="plist__rows">
${rows.map(([n, d, t, p]) => `          <div class="prow">
            <p class="prow__n">${n}</p>
            <p class="prow__d">${d}</p>
            <p class="prow__t">${t}</p>
            <p class="prow__p">${p}</p>
          </div>`).join("\n")}
        </div>
      </div>`).join("\n")}
      <p class="note">
        Prices held since March 2024. Card and cash both fine, no minimum. If two of you come in
        together we will always try to run both chairs so nobody is sitting reading a magazine.
      </p>
    </div>
  </section>

  <section class="band band--dark">
    <div class="wrap split">
      <div>
        <p class="kick">Booking</p>
        <h2 class="h2">Ring, or walk in</h2>
        <p class="body">
          Saturdays fill by about ten and the last week before Christmas fills in November.
          Everything else you can usually get within a couple of days.
        </p>
        <p class="body">
          We hold two unbooked slots a day for walk-ins. If we cannot fit you in we will tell you
          when to come back rather than leave you sitting.
        </p>
      </div>
      <div>
        <a class="btn btn--fill" href="contact.html">Send a booking request</a>
      </div>
    </div>
  </section>`
};

/* ---------- gallery ---------- */
const GAL = [
  [1, "The Cross Street", "Short back and sides"],
  [2, "Grown-out crop", "Medium, textured"],
  [3, "Skin fade &amp; beard", "Short, sharp"],
  [4, "Scissor crop", "Softer, no clipper"],
  [5, "Long on top", "Grown out, kept shaped"],
  [6, "Full wet shave", "Cut-throat, two passes"]
];

page["gallery.html"] = {
  title: "Work — Fairweather Barbers",
  desc: "The cuts people come back for, and what each one involves.",
  body: `  <section class="phead">
    <div class="wrap">
      <p class="kick">Work</p>
      <h1 class="phead__h">The ones people<br />come back for</h1>
      <p class="lede">
        Six cuts we do most weeks. Ask for one by name and nobody here will need it explaining.
      </p>
      <p class="note note--tight">
        The plates below are drawn by code, not photographed. A real build puts the shop's own
        photography here — this demo has none to use, and inventing some would be worse.
      </p>
    </div>
  </section>

  <section class="band">
    <div class="wrap">
      <div class="cuts cuts--three">
${GAL.map(([n, name, len]) => cut(n, name, len, "", "")).join("\n")}
      </div>
    </div>
  </section>

  <section class="band band--amber">
    <div class="wrap endcap">
      <h2 class="h2 h2--big">Ask for one<br />by name</h2>
      <div class="row">
        <a class="btn btn--dark" href="contact.html">Book a chair</a>
        <a class="btn btn--ghostdark" href="services.html">Prices</a>
      </div>
    </div>
  </section>`
};

/* ---------- contact ---------- */
page["contact.html"] = {
  title: "Find us — Fairweather Barbers",
  desc: "42 Cross Street, Marbury. Opening hours, how to get here, and a booking request form.",
  body: `  <section class="phead">
    <div class="wrap">
      <p class="kick">Find us</p>
      <h1 class="phead__h">42 Cross Street,<br />Marbury</h1>
      <p class="lede">
        Between the chemist and the old post office. The blue door, not the black one.
      </p>
    </div>
  </section>

  <section class="band">
    <div class="wrap split">
      <div>
        <div class="mapwrap">
          <canvas id="map" width="900" height="620" role="img"
            aria-label="Drawn map: Fairweather Barbers sits on Cross Street, between Mill Road and the market square."></canvas>
        </div>
        <p class="note note--tight">
          This map is drawn by code so the page loads without calling anyone else's server. On a
          live build this is where the embedded map and directions go — that is the part of the
          package this demo cannot show without a third-party script.
        </p>
      </div>
      <div>
        <h2 class="h2">Getting here</h2>
        <dl class="deets">
          <div><dt>Address</dt><dd>42 Cross Street<br />Marbury, CH3 8QP</dd></div>
          <div><dt>Hours</dt><dd>Tue&ndash;Fri 9:00&ndash;18:00<br />Sat 8:00&ndash;16:00<br />Sun &amp; Mon closed</dd></div>
          <div><dt>Parking</dt><dd>Market square, two minutes. Free after 3pm and all day Saturday.</dd></div>
          <div><dt>Step-free</dt><dd>Yes, from the street. The blue door is level.</dd></div>
          <div><dt>Bus</dt><dd>7, 7A and 31 stop on Mill Road, one minute away.</dd></div>
        </dl>
      </div>
    </div>
  </section>

  <section class="band band--dark">
    <div class="wrap split">
      <div>
        <p class="kick">Booking</p>
        <h2 class="h2">Ask for a chair</h2>
        <p class="body">
          Tell us roughly when suits and we will come back with the nearest slot. If you are
          flexible, say so — it usually gets you in the same week.
        </p>
        <p class="body">
          Walk-ins are always welcome. The quiet hours are before ten and after four, every day
          except Saturday.
        </p>
      </div>
      <div>
        <form id="bk" novalidate>
          <p class="alert" id="alert" role="alert" hidden></p>
          <label class="fld"><span>Your name</span>
            <input type="text" name="name" id="bk-name" autocomplete="name" required />
            <em class="err" aria-live="polite"></em></label>
          <label class="fld"><span>Phone or email</span>
            <input type="text" name="reach" id="bk-reach" required />
            <em class="err" aria-live="polite"></em></label>
          <label class="fld"><span>What are you after?</span>
            <select name="svc" id="bk-svc" required>
              <option value="" selected disabled>Pick one</option>
              <option>Cut — £24</option>
              <option>Cut &amp; beard — £34</option>
              <option>Skin fade — £26</option>
              <option>Beard trim — £14</option>
              <option>Wet shave — £32</option>
              <option>Something else</option>
            </select>
            <em class="err" aria-live="polite"></em></label>
          <label class="fld"><span>When suits?</span>
            <input type="text" name="when" id="bk-when" placeholder="e.g. Thursday afternoon, or any morning" required />
            <em class="err" aria-live="polite"></em></label>
          <button class="btn btn--fill" type="submit">Send the request</button>
        </form>
        <div id="done" hidden tabindex="-1">
          <p class="done__h">Ready to send.</p>
          <pre class="out" id="out"></pre>
          <p class="note note--tight">
            A demo has no server behind it, so nothing was transmitted. On a live build this
            posts straight to the shop.
          </p>
          <div class="row">
            <button class="btn btn--fill" type="button" id="copy">Copy it</button>
            <button class="btn" type="button" id="again">Change something</button>
          </div>
          <p class="note note--tight" id="copied" role="status" aria-live="polite"></p>
        </div>
      </div>
    </div>
  </section>`
};

module.exports = function build() {
  fs.mkdirSync(OUT, { recursive: true });
  Object.keys(page).forEach((f) => {
    fs.writeFileSync(path.join(OUT, f), shell(f, page[f]));
    console.log("  barbers/" + f);
  });
  return Object.keys(page).length;
};
