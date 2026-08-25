/* Journal articles. Content blocks: p, h, ul, quote, code. */
module.exports = [
  {
    slug: "journal-read-think-write",
    title: "Read, think, write",
    dek: "Why your scroll animation stutters, and why it is almost never the easing curve.",
    category: "Engineering",
    date: "2026-08-14",
    dateLabel: "14 August 2026",
    read: "6 min",
    zone: "blue",
    body: [
      { t: "p", c: "A scroll-linked animation that judders is usually blamed on the wrong thing. People reach for a different easing curve, then a shorter duration, then a smooth-scroll library. The curve is rarely the problem. The problem is that the browser is being asked to lay the page out twenty times in a single frame." },
      { t: "h", c: "What forces a layout" },
      { t: "p", c: "The browser batches style changes. Write to <code>style.transform</code> and nothing happens immediately — the change is queued. But ask a question whose answer depends on layout, and the browser must stop and compute everything queued so far before it can answer." },
      { t: "ul", c: ["getBoundingClientRect()", "offsetTop, offsetWidth, clientHeight", "getComputedStyle() for a computed length", "scrollWidth, scrollHeight"] },
      { t: "p", c: "One read after one write is cheap. The trouble is the shape almost everyone writes without thinking: a loop over animated elements, measuring each one and then styling it." },
      { t: "code", c: "for (const el of items) {\n  const r = el.getBoundingClientRect();   // read\n  el.style.transform = compute(r);        // write\n}                                          // ...and round again" },
      { t: "p", c: "Every iteration after the first forces a synchronous layout, because the previous iteration's write invalidated what the next read needs. Ten elements is ten full layout passes. Put four such loops in one frame and the frame budget is gone before anything is painted." },
      { t: "quote", c: "The easing curve describes the motion you asked for. Layout thrashing decides whether you get it." },
      { t: "h", c: "The fix is ordering, not cleverness" },
      { t: "p", c: "Split the frame into phases and never interleave them. Read everything, then compute everything, then write everything:" },
      { t: "code", c: "function frame(t) {\n  runPhase(readers, dt, t);   // every measurement in the app\n  runPhase(tickers, dt, t);   // maths only, no DOM\n  runPhase(writers, dt, t);   // every style and attribute\n  requestAnimationFrame(frame);\n}" },
      { t: "p", c: "Callbacks register into the phase they belong in rather than being written as one function. It reads slightly worse and runs enormously better: one layout pass per frame regardless of how many elements are animating." },
      { t: "h", c: "Two things that catch people out" },
      { t: "p", c: "First, event handlers count. A <code>pointermove</code> handler that measures an element runs between frames, and lands after that frame's writes — which is exactly the forced layout you just eliminated. Move the measurement into the read phase and use the pointer position you already track." },
      { t: "p", c: "Second, if the element sits inside a 3D-transformed subtree, <code>getBoundingClientRect()</code> returns its <em>transformed</em> size. A parent with <code>translateZ(28px)</code> under a 1500px perspective scales its children by about 2%. Measure with <code>getComputedStyle()</code> when you want layout dimensions, or the error will accumulate every time you use the result as a step." },
      { t: "h", c: "How to know it worked" },
      { t: "p", c: "Do not guess. Patch <code>getBoundingClientRect</code> and the style setters to log an R or a W tagged with the current frame, scroll the page, and count how many frames contain a read immediately after a write. The number you want is zero." }
    ]
  },
  {
    slug: "journal-didone-on-dark",
    title: "A didone on a dark ground",
    dek: "High-contrast serifs lose their hairlines when you reverse them out. Optical size is the fix.",
    category: "Typography",
    date: "2026-08-06",
    dateLabel: "6 August 2026",
    read: "5 min",
    zone: "gold",
    body: [
      { t: "p", c: "Set Bodoni large and white on black and something goes wrong that does not go wrong on paper. Hyphens vanish. The diagonal of a four disappears, so 48h reads as l8h. Thin strokes that looked crisp in the specimen are simply not there." },
      { t: "h", c: "Why it happens" },
      { t: "p", c: "A didone is defined by extreme contrast between thick and thin. At display sizes the thins are meant to be nearly invisible — that is the drama. On paper, ink spreads very slightly into the fibre and a hairline survives. On a screen, a hairline that computes to less than one device pixel is anti-aliased into near-nothing, and on a dark ground it is a faint grey line on black rather than a faint grey line on white. Dark grounds also suffer more from the eye's tendency to let light bleed into dark, thinning the stroke further." },
      { t: "quote", c: "The specimen sheet was printed. Your website is not." },
      { t: "h", c: "Optical size is the lever" },
      { t: "p", c: "Variable didones ship an <code>opsz</code> axis, and it is not a size — it is a design. Low optical sizes are drawn for small text: sturdier hairlines, looser spacing, more open counters. High optical sizes are drawn for headlines: finer hairlines, tighter fit." },
      { t: "p", c: "<code>font-optical-sizing: auto</code> matches <code>opsz</code> to the rendered size, which is right on paper-like grounds and wrong when reversed out. Switch it off and pin the axis below the rendered size:" },
      { t: "code", c: "/* rendered at 95px, drawn as if for 26px */\n.display {\n  font-optical-sizing: none;\n  font-variation-settings: \"opsz\" 26;\n}" },
      { t: "p", c: "Bands rather than a formula are easier to maintain. Something like 26 for display, 15 for headings, 9 for small numerals — then check the actual glyphs that break first." },
      { t: "h", c: "The glyphs to check" },
      { t: "p", c: "Hairlines fail in a predictable order, and none of them are the letters you would think to test:" },
      { t: "ul", c: ["The hyphen and en dash — the first casualties, and the easiest to miss in a heading", "The diagonal of 4, and the thin of 7", "The join in a lowercase e", "Thin serifs on I, l and 1, which start to read as bare stems", "Commas and apostrophes, which lose their tail"] },
      { t: "h", c: "What not to do instead" },
      { t: "p", c: "Adding weight is the obvious move and it is usually wrong: it thickens the thicks as well, and a didone with heavy thins is no longer a didone. Adding a text-shadow to fatten the strokes produces a halo. Choosing a lower-contrast serif is a legitimate answer, but it is a different design — make it a decision rather than a retreat." }
    ]
  },
  {
    slug: "journal-performance-budget",
    title: "A budget is a refusal",
    dek: "A performance target nobody is allowed to miss is a different object to one everybody agrees with.",
    category: "Practice",
    date: "2026-07-22",
    dateLabel: "22 July 2026",
    read: "4 min",
    zone: "acid",
    body: [
      { t: "p", c: "Almost every team we meet has a performance target. Almost none of them have a performance budget. The difference is not the number. It is what happens when you miss it." },
      { t: "p", c: "A target is a shared aspiration. Everyone agrees the site should be fast, the number goes in a document, and then a launch date arrives with a tag manager attached to it. Nobody decides to be slow. It happens one reasonable exception at a time." },
      { t: "quote", c: "A budget you are allowed to exceed is a target. A target is a wish with a number on it." },
      { t: "h", c: "What makes it a budget" },
      { t: "p", c: "One property: the build fails. Not a warning in a dashboard somebody reads on Thursdays — a red check that blocks the merge, on the same footing as a failing test." },
      { t: "ul", c: ["Measured on a throttled mobile profile, not the developer's laptop on office fibre", "Run on every pull request, not nightly", "Failing, not warning", "Owned by whoever wrote the change, at the moment they wrote it"] },
      { t: "p", c: "The last one carries most of the weight. A regression caught in review costs an hour. The same regression caught a month later costs a meeting, an investigation and a negotiation about whether it matters." },
      { t: "h", c: "Where the number should come from" },
      { t: "p", c: "Not from a blog post about a competitor. Pick the slowest device and connection you are willing to serve, decide what an acceptable wait is on that device, and set the budget there. Then hold it in an environment that resembles it — a mid-range Android on a throttled connection, not a desktop run of Lighthouse." },
      { t: "h", c: "The conversation it forces" },
      { t: "p", c: "The real function of a budget is not technical. It moves an argument that normally happens after launch, when it is expensive and personal, to the moment a change is proposed, when it is cheap and specific." },
      { t: "p", c: "\"This adds 180kb and 400ms\" is a decision somebody can make. \"The site feels slow\" is not. Sometimes the answer is yes, ship it, the feature is worth it — and that is fine. A budget does not forbid spending. It just insists that somebody chooses." }
    ]
  }
];
