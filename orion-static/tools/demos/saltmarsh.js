/* ---------------------------------------------------------------
   Saltmarsh — a Premium Custom demo (four pages + a booking system).
   Generated from one shell. Run via: node tools/demos/build.js
   --------------------------------------------------------------- */
const fs = require("fs");
const path = require("path");
const OUT = path.resolve(__dirname, "../../demos/saltmarsh");

const NAV = [
  ["index.html", "The room"],
  ["menu.html", "Menu"],
  ["story.html", "Journal"],
  ["book.html", "Book a table"]
];

const ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E" +
  "%3Crect width='32' height='32' fill='%23e8eae4'/%3E%3Cpath d='M0 20 Q8 15 16 20 T32 20' stroke='%231f3038' stroke-width='2' fill='none'/%3E" +
  "%3Cpath d='M0 26 Q8 21 16 26 T32 26' stroke='%23a8552e' stroke-width='2' fill='none'/%3E%3C/svg%3E";

function shell(page, opts) {
  const nav = NAV.map(([href, label]) =>
    `<a href="${href}"${href === page ? ' aria-current="page"' : ""}${href === "book.html" ? ' class="nav__book"' : ""}>${label}</a>`).join("\n      ");
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${opts.title}</title>
<meta name="description" content="${opts.desc}" />
<meta name="robots" content="noindex, follow" />
<meta name="theme-color" content="#e8eae4" />
<link rel="icon" href="${ICON}" />
<link rel="preload" href="../../assets/fonts/cormorant-normal-300-700.woff2" as="font" type="font/woff2" crossorigin />
<link rel="stylesheet" href="style.css" />
</head>
<body>

<a class="demobar" href="../../work.html">
  <span class="demobar__tag">Demo</span>
  <span class="demobar__txt"><b>Saltmarsh is not a real restaurant.</b> This is a <b>Premium Custom</b> demo — four pages and a working booking system, built by Orion.</span>
  <span class="demobar__back">Back to Orion &rarr;</span>
</a>

<a class="skip" href="#main">Skip to content</a>

<header class="top">
  <a class="mark" href="index.html">
    <svg class="mark__w" viewBox="0 0 60 20" aria-hidden="true" fill="none">
      <path d="M0 12 Q10 5 20 12 T40 12 T60 12" stroke="currentColor" stroke-width="1.2" />
      <path d="M0 17 Q10 10 20 17 T40 17 T60 17" stroke="currentColor" stroke-width="1.2" opacity=".45" />
    </svg>
    <span class="mark__n">Saltmarsh</span>
  </a>
  <nav class="nav" aria-label="Main">
    ${nav}
  </nav>
  <button class="burger" type="button" id="burger" aria-expanded="false" aria-controls="nav-m" aria-label="Open menu">
    <span></span><span></span>
  </button>
</header>
<nav class="nav-m" id="nav-m" aria-label="Main, small screens" data-open="false">
  ${nav}
</nav>

<main id="main">
${opts.body}
</main>

<footer class="foot">
  <div class="wrap foot__in">
    <div>
      <p class="foot__n">Saltmarsh</p>
      <p class="foot__d">The Old Netting Shed<br />Harbour Road, Wraith Point</p>
    </div>
    <div>
      <p class="foot__k">Service</p>
      <p class="foot__d">Wed&ndash;Sat, dinner from 6<br />Sunday lunch, one sitting at 1</p>
    </div>
    <div>
      <p class="foot__k">Pages</p>
      <p class="foot__d">${NAV.map(([h, l]) => `<a href="${h}">${l}</a>`).join("<br />")}</p>
    </div>
    <div>
      <p class="foot__k">About this page</p>
      <p class="foot__d foot__d--dim">A fictional restaurant, invented for a demo.<br />Built by <a href="../../home.html">Orion</a>.</p>
    </div>
  </div>
</footer>

<script src="app.js" defer></script>
</body>
</html>
`;
}

const page = {};

/* ---------- home ---------- */
page["index.html"] = {
  title: "Saltmarsh — Wraith Point",
  desc: "Twenty-two covers in an old netting shed. Whatever the boats landed, cooked over fire.",
  body: `  <section class="hero">
    <div class="hero__sky" aria-hidden="true"><canvas id="sky"></canvas></div>
    <div class="wrap hero__in">
      <p class="kick">Wraith Point &middot; twenty-two covers</p>
      <h1>Whatever the<br />boats landed,<br /><em>cooked over fire</em></h1>
      <p class="lede">
        There is no fixed menu because there is no fixed catch. We write the card at four
        o'clock, once we know what came in, and we cook it in one room with the sea behind it.
      </p>
      <div class="row">
        <a class="btn btn--fill" href="book.html">Book a table</a>
        <a class="btn" href="menu.html">Yesterday's card</a>
      </div>
    </div>
    <div class="horizon" aria-hidden="true"></div>
  </section>

  <section class="band">
    <div class="wrap thirds">
      <article>
        <p class="kick">The room</p>
        <h2 class="h2">One room, one fire</h2>
        <p class="body">Eleven tables in a shed the netting crews used until 1978. The floor is the original brick and the acoustics are terrible, which is why nobody books it for a party of twenty.</p>
      </article>
      <article>
        <p class="kick">The card</p>
        <h2 class="h2">Written at four</h2>
        <p class="body">Six or seven plates, whatever the day gave us. If you have an allergy, tell us when you book and we will build around it rather than apologise on the night.</p>
      </article>
      <article>
        <p class="kick">The sitting</p>
        <h2 class="h2">Yours for the evening</h2>
        <p class="body">One sitting a night. The table is yours until you are done with it, and nobody will bring you a bill you did not ask for.</p>
      </article>
    </div>
  </section>

  <section class="band band--deep">
    <div class="wrap feature">
      <div class="feature__plate"><canvas data-tide="1" width="640" height="800"></canvas></div>
      <div>
        <p class="kick">Since 2019</p>
        <h2 class="h2 h2--big">We buy from four boats<br />and one grower</h2>
        <p class="body">
          The <em>Wraith Belle</em>, the <em>Kittiwake</em>, the <em>Ann Hardy</em> and the
          <em>Sea Pink</em> land at the point most mornings. Everything green comes from a
          market garden four miles inland that has been in one family since the war.
        </p>
        <p class="body">
          That is the entire supply chain. It means some nights there is no fish at all and we
          cook mutton and roots instead, and it means we can tell you the name of the boat that
          caught what is on your plate.
        </p>
        <dl class="facts">
          <div><dt>Covers a night</dt><dd>22</dd></div>
          <div><dt>Boats</dt><dd>4</dd></div>
          <div><dt>Sittings</dt><dd>1</dd></div>
          <div><dt>Miles to the grower</dt><dd>4</dd></div>
        </dl>
      </div>
    </div>
  </section>

  <section class="band">
    <div class="wrap">
      <div class="head-row">
        <div>
          <p class="kick">From the journal</p>
          <h2 class="h2">What we have been thinking about</h2>
        </div>
        <a class="arrow" href="story.html">All entries &rarr;</a>
      </div>
      <div class="jlist">
        <a class="jrow" href="story.html#gurnard">
          <span class="jrow__d">14 August</span>
          <span class="jrow__t">In praise of the ugliest fish on the quay</span>
          <span class="jrow__x">Gurnard is bony, spiny, and better than most of what gets flown in. Here is how we cook it.</span>
        </a>
        <a class="jrow" href="story.html#fire">
          <span class="jrow__d">2 August</span>
          <span class="jrow__t">Why everything goes over fire</span>
          <span class="jrow__x">Not for the theatre. Because a hard, dry heat does something to a fillet that a pan cannot.</span>
        </a>
        <a class="jrow" href="story.html#closed">
          <span class="jrow__d">19 July</span>
          <span class="jrow__t">The week we shut with no notice</span>
          <span class="jrow__x">A storm kept every boat in for six days. What we did instead, and what we learned from it.</span>
        </a>
      </div>
    </div>
  </section>

  <section class="band band--rust">
    <div class="wrap endcap">
      <h2 class="h2 h2--big">Wednesday to Saturday.<br />One sitting. Book early.</h2>
      <a class="btn btn--pale" href="book.html">Book a table</a>
    </div>
  </section>`
};

/* ---------- menu ---------- */
const COURSE = [
  ["To begin", [
    ["Brown crab, cold, on toast", "Wraith Belle, landed yesterday. Dressed with nothing but lemon and its own brown meat.", "£11"],
    ["Grilled sardines, fennel, burnt lemon", "Four to a plate, straight off the coals.", "£9"],
    ["Cured pollock, cucumber, dill oil", "Three days in salt and sugar. The oil is from the garden.", "£10"],
    ["Sourdough, cultured butter", "The bread is ours. The butter is not, and we are not pretending.", "£4"]
  ]],
  ["Over the fire", [
    ["Whole gurnard, sea beet, brown butter", "For one, on the bone. Ask and we will fillet it at the table.", "£24"],
    ["Turbot on the crown, for two", "The whole crown over embers, forty minutes, carved in the room.", "£62"],
    ["Hogget chop, wild garlic, anchovy", "For nights the boats stay in. Twenty-eight days hung.", "£27"],
    ["Sea vegetables and hen's egg", "The garden's whole basket, charred, with an egg cooked in the ash.", "£19"]
  ]],
  ["Alongside", [
    ["Potatoes in beef fat", "", "£6"],
    ["Buttered greens, brown shrimp", "", "£7"],
    ["Tomatoes, if it has been sunny", "", "£6"]
  ]],
  ["To finish", [
    ["Burnt honey custard", "The honey is from the point. It tastes of gorse and it should.", "£8"],
    ["Blackcurrant leaf ice, shortbread", "Made the morning of.", "£8"],
    ["A wedge of something from the trolley", "Three cheeses, all within sixty miles.", "£10"]
  ]]
];

page["menu.html"] = {
  title: "Menu — Saltmarsh",
  desc: "Yesterday's card, written at four o'clock once the boats came in.",
  body: `  <section class="phead">
    <div class="wrap">
      <p class="kick">Menu</p>
      <h1 class="phead__h">Yesterday's card</h1>
      <p class="lede">
        Written at four, cooked at six. Tonight's will be close to this but not the same — that
        is rather the point. Prices have not moved since March.
      </p>
      <p class="note">
        Everything is cooked over one fire in an open room. If you need something adapted, tell
        us when you book and it will be built into the card rather than worked around on the night.
      </p>
    </div>
    <div class="horizon" aria-hidden="true"></div>
  </section>

  <section class="band">
    <div class="wrap menu">
${COURSE.map(([c, rows]) => `      <section class="course">
        <h2 class="course__h">${c}</h2>
${rows.map(([n, d, p]) => `        <div class="dish">
          <p class="dish__n">${n}<span class="dish__leader" aria-hidden="true"></span><b>${p}</b></p>
${d ? `          <p class="dish__d">${d}</p>` : ""}
        </div>`).join("\n")}
      </section>`).join("\n")}
      <p class="note">
        A discretionary 10% goes to the room and the kitchen in equal shares. Take it off if you
        would rather; nobody will mind and nobody will ask why.
      </p>
    </div>
  </section>

  <section class="band band--rust">
    <div class="wrap endcap">
      <h2 class="h2 h2--big">Tonight's card is<br />written at four</h2>
      <a class="btn btn--pale" href="book.html">Book a table</a>
    </div>
  </section>`
};

/* ---------- journal ---------- */
const POSTS = [
  ["gurnard", "14 August", "In praise of the ugliest fish on the quay", [
    "Gurnard has a head like a helmet, spines that will draw blood if you are careless, and about forty per cent waste once it is dressed. For thirty years it went for pot bait. It is also, cooked properly, better than most of what arrives at a restaurant in a polystyrene box with a flight number on it.",
    "The flesh is firm enough to take a hard fire without falling through the bars, which almost nothing else this size will do. It is sweet, closer to monkfish than to cod, and the bones make the best stock on the coast — you can build a whole sauce out of what most kitchens bin.",
    "We buy it whole, off the Kittiwake, at a price that still feels like a mistake in our favour. It goes over the embers on the bone with sea beet and a brown butter we finish with the roe. If you have never eaten one, order it and do not fillet it first."
  ]],
  ["fire", "2 August", "Why everything goes over fire", [
    "People assume the fire is theatre. It is not — we would happily cook where nobody could see it. The fire is there because a hard dry radiant heat does something to protein that a pan will not do, and because it is the only way to cook twenty-two covers out of a room this size.",
    "A pan heats by conduction: the metal is hot, the fish touches the metal, the heat travels in. It is even, controllable and slightly dull. Embers heat by radiation, which arrives everywhere on the surface at once. You get a crust in ninety seconds while the middle is barely warm, and that gap is the whole dish.",
    "The cost is that you cannot walk away from it, and that the fire is different at half past nine to how it was at six. So the last table of the night eats something slightly different to the first, and we would rather tell you that than pretend otherwise."
  ]],
  ["closed", "19 July", "The week we shut with no notice", [
    "A storm sat over the point for six days in February and not one boat went out. We had eleven tables booked on the Thursday and nothing to give them that we would have been happy to serve.",
    "So we shut. We rang every booking ourselves rather than sending an email, and about half of them said some version of \"well, obviously\" — which told us something about who books a place like this.",
    "What we did instead: rebuilt the fire, which needed doing, and cooked for ourselves out of the freezer and the garden every night at the same table by the window. The week cost us more than we would like to write down. We would do exactly the same again."
  ]]
];

page["story.html"] = {
  title: "Journal — Saltmarsh",
  desc: "Notes from the room: what we cook, why we cook it that way, and what happens when the boats stay in.",
  body: `  <section class="phead">
    <div class="wrap">
      <p class="kick">Journal</p>
      <h1 class="phead__h">Notes from<br />the room</h1>
      <p class="lede">
        Occasional, unedited, and written by whoever had something to say. No recipes you could
        follow at home without a fire pit.
      </p>
    </div>
    <div class="horizon" aria-hidden="true"></div>
  </section>

${POSTS.map((p, i) => `  <section class="band${i % 2 ? " band--deep" : ""}" id="${p[0]}">
    <div class="wrap post">
      <div class="post__meta">
        <p class="kick">${p[1]}</p>
        <p class="post__no">Entry ${("0" + (POSTS.length - i)).slice(-2)}</p>
      </div>
      <article>
        <h2 class="h2">${p[2]}</h2>
${p[3].map((para) => `        <p class="body body--wide">${para}</p>`).join("\n")}
      </article>
    </div>
  </section>`).join("\n")}

  <section class="band band--rust">
    <div class="wrap endcap">
      <h2 class="h2 h2--big">Better read<br />at the table</h2>
      <a class="btn btn--pale" href="book.html">Book a table</a>
    </div>
  </section>`
};

/* ---------- booking ---------- */
page["book.html"] = {
  title: "Book a table — Saltmarsh",
  desc: "One sitting a night, Wednesday to Saturday, and Sunday lunch. Choose a date, a time and a table.",
  body: `  <section class="phead phead--tight">
    <div class="wrap">
      <p class="kick">Book a table</p>
      <h1 class="phead__h">Three steps,<br />no account</h1>
      <p class="lede">
        Wednesday to Saturday evenings, and one sitting for Sunday lunch. Eleven tables, so the
        good dates go about five weeks out.
      </p>
    </div>
    <div class="horizon" aria-hidden="true"></div>
  </section>

  <section class="band">
    <div class="wrap">
      <ol class="steps" id="steps">
        <li data-step="1" aria-current="step"><span>1</span>Party &amp; date</li>
        <li data-step="2"><span>2</span>Time</li>
        <li data-step="3"><span>3</span>Your details</li>
      </ol>

      <div class="bk" id="bk">

        <!-- step 1 -->
        <section class="pane" data-pane="1">
          <div class="pane__grid">
            <div>
              <h2 class="h2">How many of you?</h2>
              <div class="party" id="party" role="radiogroup" aria-label="Party size"></div>
              <p class="note note--tight" id="party-note">
                Tables of seven or more take the whole end of the room, so we handle those by
                phone. Ring the shed and ask for Nell.
              </p>
              <div class="aside">
                <p class="aside__k">One sitting a night</p>
                <p class="aside__d">
                  The table is yours from the time you choose until you are done with it. Nobody
                  is waiting for it and nobody will bring you a bill you did not ask for.
                </p>
                <p class="aside__k">If you are late</p>
                <p class="aside__d">
                  Ring us. We hold a table twenty-five minutes on a normal night and rather longer
                  if the trains are being the trains.
                </p>
              </div>
            </div>
            <div>
              <h2 class="h2">Which evening?</h2>
              <div class="cal" id="cal">
                <div class="cal__bar">
                  <button type="button" id="prev" aria-label="Previous month">&larr;</button>
                  <p id="mon" aria-live="polite">&nbsp;</p>
                  <button type="button" id="nextm" aria-label="Next month">&rarr;</button>
                </div>
                <div class="cal__dow" aria-hidden="true"><i>M</i><i>T</i><i>W</i><i>T</i><i>F</i><i>S</i><i>S</i></div>
                <div class="cal__grid" id="grid" role="grid" aria-label="Available dates"></div>
              </div>
              <p class="legend"><i class="legend__on"></i>Open &nbsp; <i class="legend__off"></i>Closed or full</p>
            </div>
          </div>
          <div class="pane__foot">
            <p class="pick" id="pick1">Choose a party size and a date.</p>
            <button class="btn btn--fill" type="button" id="to2" disabled>Choose a time</button>
          </div>
        </section>

        <!-- step 2 -->
        <section class="pane" data-pane="2" hidden>
          <h2 class="h2">What time suits?</h2>
          <p class="body" id="slot-line">&nbsp;</p>
          <div class="slots" id="slots" role="radiogroup" aria-label="Available times"></div>
          <div class="pane__foot">
            <button class="btn" type="button" id="back1">Back</button>
            <p class="pick" id="pick2">Pick a time.</p>
            <button class="btn btn--fill" type="button" id="to3" disabled>Add your details</button>
          </div>
        </section>

        <!-- step 3 -->
        <section class="pane" data-pane="3" hidden>
          <div class="pane__grid">
            <div>
              <h2 class="h2">And who shall we expect?</h2>
              <form id="bform" novalidate>
                <p class="alert" id="alert" role="alert" hidden></p>
                <label class="fld"><span>Name the table is under</span>
                  <input type="text" name="name" id="b-name" autocomplete="name" required />
                  <em class="err" aria-live="polite"></em></label>
                <label class="fld"><span>Email</span>
                  <input type="email" name="email" id="b-email" autocomplete="email" required />
                  <em class="err" aria-live="polite"></em></label>
                <label class="fld"><span>Phone, for the night itself</span>
                  <input type="tel" name="phone" id="b-phone" autocomplete="tel" required />
                  <em class="err" aria-live="polite"></em></label>
                <label class="fld"><span>Allergies, or anything we should know</span>
                  <textarea name="notes" id="b-notes" rows="3"></textarea>
                  <em class="err" aria-live="polite"></em></label>
                <div class="pane__foot pane__foot--form">
                  <button class="btn" type="button" id="back2">Back</button>
                  <button class="btn btn--fill" type="submit">Confirm the table</button>
                </div>
              </form>
            </div>
            <aside class="sum" id="sum" aria-label="Your booking so far"></aside>
          </div>
        </section>

        <!-- done -->
        <section class="pane pane--done" data-pane="4" hidden tabindex="-1">
          <p class="kick">Confirmed</p>
          <h2 class="h2 h2--big" id="done-h">The table is yours</h2>
          <div class="ticket" id="ticket"></div>
          <p class="note">
            This demo has no server, so nothing was actually reserved and no email was sent. On a
            live build this writes to the diary, emails you a confirmation and texts you on the
            morning. Everything above it is real — the calendar, the availability rules and the
            validation all run in your browser.
          </p>
          <div class="row">
            <button class="btn" type="button" id="restart">Book another</button>
            <a class="btn" href="menu.html">See the menu</a>
          </div>
        </section>

      </div>
    </div>
  </section>`
};

module.exports = function build() {
  fs.mkdirSync(OUT, { recursive: true });
  Object.keys(page).forEach((f) => {
    fs.writeFileSync(path.join(OUT, f), shell(f, page[f]));
    console.log("  saltmarsh/" + f);
  });
  return Object.keys(page).length;
};
