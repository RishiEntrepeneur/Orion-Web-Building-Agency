/* Fairweather Barbers — demo build. No dependencies. */
(function () {
  "use strict";
  var REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- small-screen menu ---------- */
  var burger = document.getElementById("burger");
  var navM = document.getElementById("nav-m");
  if (burger && navM) {
    burger.addEventListener("click", function () {
      var open = navM.getAttribute("data-open") === "true";
      navM.setAttribute("data-open", String(!open));
      burger.setAttribute("aria-expanded", String(!open));
    });
  }

  /* ---------- deterministic noise ----------
     A seeded generator, so every plate looks the same on every load and
     nothing shifts about between screenshots. */
  function rng(seed) {
    var s = seed * 9301 + 49297;
    return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  }

  /* ---------- hero grain ---------- */
  var grain = document.getElementById("grain");
  if (grain) {
    var gx = grain.getContext("2d");
    var paintGrain = function () {
      var w = grain.width = grain.offsetWidth;
      var h = grain.height = grain.offsetHeight;
      if (!w || !h) return;
      var r = rng(7);
      gx.clearRect(0, 0, w, h);
      /* diagonal comb lines, the way clipper marks fall */
      gx.lineWidth = 1;
      for (var i = -h; i < w + h; i += 9) {
        gx.strokeStyle = "rgba(224,118,31," + (0.03 + r() * 0.07).toFixed(3) + ")";
        gx.beginPath();
        gx.moveTo(i, 0);
        gx.lineTo(i + h * 0.55, h);
        gx.stroke();
      }
      for (var j = 0; j < 220; j++) {
        gx.fillStyle = "rgba(242,236,225," + (0.02 + r() * 0.05).toFixed(3) + ")";
        gx.fillRect(r() * w, r() * h, 1.5, 1.5);
      }
    };
    paintGrain();
    addEventListener("resize", paintGrain);
  }

  /* ---------- cut plates ----------
     A barbershop with no photographs is a problem, and faking one with stock
     imagery would be worse. So each plate is a real halftone: a profile is
     drawn as a silhouette on an offscreen canvas, the pixels are read back,
     and a dot grid is sized by the coverage of each cell — the same process
     a newspaper used, done in code.

     The head is a point outline rather than hand-placed bezier handles: a
     nose is four coordinates you can reason about, and two control points
     you cannot. The curve is drawn through the midpoints, which rounds the
     skull without softening the profile. */

  /* Facing left, normalised. Forehead → crown → nape is one run so the hair
     can be built by offsetting that stretch outwards. */
  var SKULL = [
    [0.320, 0.206], [0.350, 0.144], [0.410, 0.100], [0.492, 0.080],
    [0.578, 0.090], [0.652, 0.134], [0.698, 0.198], [0.716, 0.276],
    [0.708, 0.344], [0.684, 0.398], [0.654, 0.438]
  ];
  /* Stylised, the way a barber's shop sign is. At this dot pitch a nose is
     four cells across, so an anatomically ambitious one renders as a dent —
     a confident simplified profile reads far better than an accurate one
     the halftone cannot resolve. */
  var FACE = [
    /* nape and neck, down the back */
    [0.636, 0.484], [0.622, 0.548], [0.640, 0.600],
    /* shoulders: flatter than they want to be, or they read as a bell */
    [0.762, 0.648], [0.880, 0.700], [0.968, 0.780], [1.010, 0.900],
    [1.010, 1.010], [-0.010, 1.010], [-0.010, 0.906], [0.048, 0.792],
    [0.146, 0.716], [0.268, 0.668],
    /* front of the neck, jaw, chin */
    [0.344, 0.628], [0.368, 0.576], [0.372, 0.542],
    [0.330, 0.512], [0.296, 0.486],
    /* mouth as one plane, not three */
    [0.268, 0.452], [0.264, 0.424],
    /* the nose: tip, then straight back up the bridge */
    [0.238, 0.390], [0.272, 0.362], [0.300, 0.330],
    /* brow and forehead */
    [0.290, 0.276], [0.300, 0.240]
  ];

  /* Draw a closed curve through a list of points using quadratics between
     midpoints — smooth, and every point is a real coordinate. */
  function through(x, pts, W, H) {
    var p = pts.map(function (q) { return [q[0] * W, q[1] * H]; });
    var n = p.length;
    var mid = function (i, j) { return [(p[i][0] + p[j][0]) / 2, (p[i][1] + p[j][1]) / 2]; };
    var m0 = mid(n - 1, 0);
    x.beginPath();
    x.moveTo(m0[0], m0[1]);
    for (var i = 0; i < n; i++) {
      var m = mid(i, (i + 1) % n);
      x.quadraticCurveTo(p[i][0], p[i][1], m[0], m[1]);
    }
    x.closePath();
  }

  /* Hair is the skull run pushed outwards from the head's centre. The push
     varies along the run, which is what makes a crop a crop and a fade a
     fade rather than a hat. */
  function hairShape(cut) {
    var crown = cut[0], back = cut[1], fade = cut[2];
    var CX = 0.505, CY = 0.272;
    var outer = SKULL.map(function (p, i) {
      var t = i / (SKULL.length - 1);              /* 0 forehead → 1 nape */
      var bump = Math.sin(Math.min(1, t * 1.18) * Math.PI * 0.92);
      var th = crown * bump + back * t * t;
      th *= 1 - fade * Math.max(0, (t - 0.52) / 0.48);
      th = Math.max(th, 0.002);
      var dx = p[0] - CX, dy = p[1] - CY;
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      return [p[0] + (dx / len) * th, p[1] + (dy / len) * th];
    });
    return outer.concat(SKULL.slice().reverse());
  }

  /* [crown, back, fade, beard] */
  var CUTS = {
    1: [0.052, 0.014, 0.72, 0.00],   /* short back and sides */
    2: [0.092, 0.040, 0.34, 0.00],   /* grown-out crop */
    3: [0.044, 0.006, 0.98, 0.85],   /* skin fade and beard */
    4: [0.068, 0.026, 0.46, 0.00],   /* scissor crop */
    5: [0.126, 0.078, 0.16, 0.00],   /* long on top */
    6: [0.046, 0.012, 0.78, 0.00]    /* wet shave */
  };

  /* A beard is a mass sitting on the jaw, not a stroke along it. Two matching
     runs — one on the face, one outside it — and the amount lerps between
     them, so a stubble and a full beard are the same shape at two depths. */
  /* The inner run sits INSIDE the face, up on the cheek — a beard is growth
     on a jaw, so most of it has to land on the head rather than beside it.
     The outer run is only a little proud of the outline. */
  var BEARD_IN = [
    [0.470, 0.418], [0.432, 0.496], [0.372, 0.498],
    [0.320, 0.470], [0.288, 0.442], [0.274, 0.420]
  ];
  var BEARD_OUT = [
    [0.478, 0.404], [0.390, 0.566], [0.334, 0.534],
    [0.300, 0.502], [0.262, 0.462], [0.256, 0.422]
  ];
  function beardShape(amount) {
    var outer = BEARD_OUT.map(function (o, i) {
      var p = BEARD_IN[i];
      return [p[0] + (o[0] - p[0]) * amount, p[1] + (o[1] - p[1]) * amount];
    });
    return outer.concat(BEARD_IN.slice().reverse());
  }

  var plates = document.querySelectorAll("[data-cut]");
  Array.prototype.forEach.call(plates, function (c) {
    var seed = parseFloat(c.getAttribute("data-cut")) || 1;
    var cut = CUTS[seed] || CUTS[1];
    var r = rng(seed * 137 + 11);
    var x = c.getContext("2d");
    var W = c.width, H = c.height;

    /* --- 1. the mask, offscreen: skin white, hair mid-grey --- */
    var off = document.createElement("canvas");
    off.width = W; off.height = H;
    var o = off.getContext("2d");
    o.fillStyle = "#000"; o.fillRect(0, 0, W, H);
    o.fillStyle = "#fff";
    through(o, SKULL.concat(FACE), W, H); o.fill();
    o.fillStyle = "#8a8a8a";
    through(o, hairShape(cut), W, H); o.fill();
    if (cut[3] > 0) { o.fillStyle = "#8a8a8a"; through(o, beardShape(cut[3]), W, H); o.fill(); }
    var px = o.getImageData(0, 0, W, H).data;

    /* --- 2. ground --- */
    var g = x.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#1d1816");
    g.addColorStop(1, "#0c0a09");
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    var lg = x.createRadialGradient(W * 0.80, H * 0.16, 0, W * 0.80, H * 0.16, H * 1.2);
    lg.addColorStop(0, "rgba(240,145,62,0.18)");
    lg.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = lg; x.fillRect(0, 0, W, H);

    /* --- 3. the halftone --- */
    var CELL = Math.max(4, W / 104);
    var maxR = CELL * 0.60;
    for (var gy = 0; gy < H; gy += CELL) {
      for (var gx = 0; gx < W; gx += CELL) {
        var sum = 0, hair = 0, n = 0;
        for (var sy = 0; sy < CELL; sy += 1.6) {
          for (var sx = 0; sx < CELL; sx += 1.6) {
            var yy = (gy + sy) | 0, xx = (gx + sx) | 0;
            if (yy >= H || xx >= W) continue;
            var v = px[(yy * W + xx) * 4];
            if (v > 200) sum += 1;
            else if (v > 60) { sum += 1; hair += 1; }
            n++;
          }
        }
        if (!n || !sum) continue;
        var cover = sum / n;
        var shade = 0.58 + 0.42 * (1 - gy / H);
        var rad = maxR * Math.sqrt(cover) * shade;
        if (rad < 0.3) continue;
        var isHair = hair / sum > 0.5;
        x.fillStyle = isHair
          ? "rgba(224,118,31," + (0.5 + cover * 0.5).toFixed(3) + ")"
          : "rgba(242,236,225," + (0.38 + cover * 0.5).toFixed(3) + ")";
        x.beginPath();
        x.arc(gx + CELL / 2, gy + CELL / 2, rad, 0, Math.PI * 2);
        x.fill();
      }
    }

    /* --- 4. the grain of the mirror --- */
    for (var k = 0; k < 700; k++) {
      x.fillStyle = "rgba(255,255,255," + (r() * 0.028).toFixed(3) + ")";
      x.fillRect(r() * W, r() * H, 1, 1);
    }
  });

  /* ---------- the drawn map ----------
     No third-party script, so the streets are drawn from a small table
     of segments. It is a diagram, and the page says so. */
  var map = document.getElementById("map");
  if (map) {
    var m = map.getContext("2d");
    var W = map.width, H = map.height;
    var roads = [
      /* [x1,y1,x2,y2,width,name,labelAt] in canvas units */
      [0, 300, 900, 268, 34, "Cross Street", 0.42],
      [330, 0, 372, 620, 26, "Mill Road", 0.16],
      [0, 96, 900, 74, 18, "Union Terrace", 0.72],
      [620, 0, 660, 620, 20, "Chapel Lane", 0.82],
      [0, 512, 900, 486, 22, "Market Way", 0.3]
    ];

    m.fillStyle = "#141110";
    m.fillRect(0, 0, W, H);

    /* blocks between the roads */
    var r2 = rng(31);
    m.fillStyle = "#1b1715";
    for (var b = 0; b < 26; b++) {
      var bx = r2() * W, by = r2() * H;
      m.fillRect(bx, by, 40 + r2() * 90, 30 + r2() * 70);
    }

    /* the market square */
    m.fillStyle = "#1f2a20";
    m.fillRect(690, 330, 175, 130);
    m.strokeStyle = "#2f3d30";
    m.lineWidth = 1;
    m.strokeRect(690, 330, 175, 130);

    roads.forEach(function (rd) {
      m.strokeStyle = "#2a2422";
      m.lineWidth = rd[4];
      m.lineCap = "round";
      m.beginPath(); m.moveTo(rd[0], rd[1]); m.lineTo(rd[2], rd[3]); m.stroke();
      m.strokeStyle = "#3a332f";
      m.lineWidth = rd[4] - 8;
      m.beginPath(); m.moveTo(rd[0], rd[1]); m.lineTo(rd[2], rd[3]); m.stroke();
    });

    /* road names, set along the road */
    m.font = "500 15px 'IBM Plex Mono', ui-monospace, monospace";
    m.fillStyle = "#9d9284";
    roads.forEach(function (rd) {
      var t = rd[6];
      var lx = rd[0] + (rd[2] - rd[0]) * t;
      var ly = rd[1] + (rd[3] - rd[1]) * t;
      var ang = Math.atan2(rd[3] - rd[1], rd[2] - rd[0]);
      m.save();
      m.translate(lx, ly);
      m.rotate(Math.abs(ang) > Math.PI / 2 ? ang - Math.PI : ang);
      m.fillText(rd[5].toUpperCase(), -m.measureText(rd[5].toUpperCase()).width / 2, 5);
      m.restore();
    });
    m.fillStyle = "#6f6a63";
    m.fillText("MARKET SQUARE", 700, 400);

    /* the shop */
    var px = 452, py = 285;
    m.strokeStyle = "#e0761f";
    m.lineWidth = 3;
    m.beginPath(); m.arc(px, py, 26, 0, Math.PI * 2); m.stroke();
    m.fillStyle = "#e0761f";
    m.beginPath(); m.arc(px, py, 9, 0, Math.PI * 2); m.fill();
    m.beginPath(); m.moveTo(px, py + 26); m.lineTo(px - 9, py + 46); m.lineTo(px + 9, py + 46); m.closePath(); m.fill();
    m.font = "500 17px 'IBM Plex Mono', ui-monospace, monospace";
    m.fillStyle = "#f2ece1";
    m.fillText("FAIRWEATHER — 42", px + 40, py + 6);
    m.font = "500 13px 'IBM Plex Mono', ui-monospace, monospace";
    m.fillStyle = "#9d9284";
    m.fillText("THE BLUE DOOR", px + 40, py + 26);

    /* compass */
    m.strokeStyle = "#4a423d";
    m.lineWidth = 2;
    m.beginPath(); m.moveTo(60, 580); m.lineTo(60, 545); m.stroke();
    m.beginPath(); m.moveTo(60, 545); m.lineTo(55, 555); m.lineTo(65, 555); m.closePath();
    m.fillStyle = "#4a423d"; m.fill();
    m.font = "500 12px 'IBM Plex Mono', ui-monospace, monospace";
    m.fillText("N", 56, 598);
  }

  /* ---------- booking request ---------- */
  var f = document.getElementById("bk");
  if (!f) return;
  var alertBox = document.getElementById("alert");
  var done = document.getElementById("done");
  var out = document.getElementById("out");
  var copied = document.getElementById("copied");
  var text = "";
  var inputs = f.querySelectorAll("input, select");

  function wrap(i) { return i.closest(".fld"); }
  function bad(i, msg) { var w = wrap(i); w.setAttribute("data-bad", "1"); i.setAttribute("aria-invalid", "true"); w.querySelector(".err").textContent = msg; }
  function good(i) { var w = wrap(i); w.removeAttribute("data-bad"); i.setAttribute("aria-invalid", "false"); w.querySelector(".err").textContent = ""; }

  Array.prototype.forEach.call(inputs, function (i) {
    i.addEventListener("input", function () { good(i); });
    i.addEventListener("change", function () { good(i); });
  });

  f.addEventListener("submit", function (e) {
    e.preventDefault();
    var problems = [];
    Array.prototype.forEach.call(inputs, function (i) {
      if (!i.required) return;
      var v = (i.value || "").trim();
      good(i);
      if (!v) { bad(i, "We need this one"); problems.push(i); return; }
      if (i.id === "bk-reach" && v.length < 6) { bad(i, "A phone number or an email, so we can reply"); problems.push(i); }
    });
    if (problems.length) {
      alertBox.hidden = false;
      alertBox.textContent = problems.length === 1 ? "One field still needs filling in." : problems.length + " fields still need filling in.";
      problems[0].focus();
      return;
    }
    alertBox.hidden = true;
    var d = new FormData(f);
    text = [
      "FAIRWEATHER BARBERS — BOOKING REQUEST",
      "=====================================",
      "",
      "NAME:    " + d.get("name"),
      "REACH:   " + d.get("reach"),
      "WANTS:   " + d.get("svc"),
      "WHEN:    " + d.get("when")
    ].join("\n");
    out.textContent = text;
    f.hidden = true;
    done.hidden = false;
    copied.textContent = "";
    done.focus();
  });

  document.getElementById("again").addEventListener("click", function () {
    done.hidden = true; f.hidden = false; document.getElementById("bk-name").focus();
  });
  document.getElementById("copy").addEventListener("click", function () {
    function say(ok) { copied.textContent = ok ? "Copied to your clipboard." : "Could not copy — select the text above instead."; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { say(true); }, function () { say(false); });
    } else { say(false); }
  });
  void REDUCED;

})();

/* ---------- reveal on scroll ----------
   Its own IIFE on purpose: the module above returns early on pages that have
   no form, and this used to sit after that return — so the reveal ran on two
   pages out of ten and nobody noticed, because the failure mode is "no
   animation" rather than "error".

   data-rv is applied here and never in the markup, so with JavaScript off
   the page shows everything instead of nothing. */
(function () {
  var items = document.querySelectorAll("h1, .phead__h, .h2, .lede, .three, .stats, .cutcard, .person, .rules li, .plist, .deets, .mapwrap, .hero__plate, .row, .body");
  if (!items.length) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!("IntersectionObserver" in window)) return;

  var watch = [];
  Array.prototype.forEach.call(items, function (el) {
    /* Anything inside a collapsed pane never intersects, so it would sit at
       opacity 0 for ever and be invisible when the pane finally opens. */
    if (el.closest("[hidden]")) return;
    watch.push(el);
  });
  watch.forEach(function (el, i) {
    el.setAttribute("data-rv", "");
    el.style.setProperty("--rv-d", ((i % 6) * 55) + "ms");
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.setAttribute("data-in", "true");
      io.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  watch.forEach(function (el) { io.observe(el); });

  /* Belt and braces: anything still unrevealed after five seconds gets shown.
     A reveal system that can strand content is worse than no reveal system. */
  window.setTimeout(function () {
    watch.forEach(function (el) { el.setAttribute("data-in", "true"); });
  }, 5000);
})();
