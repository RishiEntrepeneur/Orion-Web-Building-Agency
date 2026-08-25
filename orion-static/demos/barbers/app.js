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
     Drawn, not photographed. Each seed gives a different comb angle,
     density and highlight, so six plates read as six different cuts
     without pretending to be photographs of anyone. */
  var plates = document.querySelectorAll("[data-cut]");
  Array.prototype.forEach.call(plates, function (c) {
    var seed = parseFloat(c.getAttribute("data-cut")) || 1;
    var r = rng(seed * 137 + 11);
    var x = c.getContext("2d");
    var W = c.width, H = c.height;

    var g = x.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#1c1715");
    g.addColorStop(1, "#0d0b0a");
    x.fillStyle = g;
    x.fillRect(0, 0, W, H);

    /* the head shape the comb follows */
    var cx = W * (0.42 + r() * 0.14), cy = H * (0.62 + r() * 0.1);
    var rad = H * (0.42 + r() * 0.1);
    var angle = -0.5 + r() * 1.0;
    var lines = 46 + Math.floor(r() * 34);

    x.save();
    x.translate(cx, cy);
    x.rotate(angle * 0.35);
    for (var i = 0; i < lines; i++) {
      var t = i / (lines - 1);
      var len = rad * (0.45 + Math.sin(t * Math.PI) * 0.95);
      var a = -Math.PI * 0.92 + t * Math.PI * 0.84;
      var fade = 0.14 + Math.sin(t * Math.PI) * 0.5;
      x.strokeStyle = i % 7 === 0
        ? "rgba(224,118,31," + (fade * 0.9).toFixed(3) + ")"
        : "rgba(242,236,225," + (fade * 0.55).toFixed(3) + ")";
      x.lineWidth = 0.8 + r() * 1.6;
      x.beginPath();
      x.moveTo(Math.cos(a) * rad * 0.18, Math.sin(a) * rad * 0.18);
      x.lineTo(Math.cos(a) * len, Math.sin(a) * len);
      x.stroke();
    }
    x.restore();

    /* a soft light from the window, and the grain of the mirror */
    var lg = x.createRadialGradient(W * 0.72, H * 0.2, 0, W * 0.72, H * 0.2, H * 1.1);
    lg.addColorStop(0, "rgba(240,145,62,0.16)");
    lg.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = lg;
    x.fillRect(0, 0, W, H);
    for (var k = 0; k < 900; k++) {
      x.fillStyle = "rgba(255,255,255," + (r() * 0.035).toFixed(3) + ")";
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
