/* Saltmarsh — demo build. No dependencies.
   The booking flow is real: the calendar, the availability rules and the
   validation all run here. Only the final write is missing, because a demo
   has no diary to write to. */
(function () {
  "use strict";

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

  function rng(seed) {
    var s = seed * 9301 + 49297;
    return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  }

  /* ---------- hero sky ---------- */
  var sky = document.getElementById("sky");
  if (sky) {
    var sx = sky.getContext("2d");
    var paintSky = function () {
      var w = sky.width = sky.offsetWidth, h = sky.height = sky.offsetHeight;
      if (!w || !h) return;
      sx.clearRect(0, 0, w, h);
      var r = rng(19);
      /* long low bands, the way haze sits over a flat estuary */
      for (var i = 0; i < 34; i++) {
        var y = h * (0.12 + (i / 34) * 0.9);
        var a = 0.02 + r() * 0.05;
        sx.strokeStyle = i % 5 === 0 ? "rgba(168,85,46," + (a * 1.4).toFixed(3) + ")" : "rgba(31,48,56," + a.toFixed(3) + ")";
        sx.lineWidth = 0.6 + r() * 1.4;
        sx.beginPath();
        var amp = 3 + r() * 12;
        for (var x = 0; x <= w; x += 14) {
          var yy = y + Math.sin((x / w) * Math.PI * (1.4 + r() * 0.02) + i) * amp;
          x === 0 ? sx.moveTo(x, yy) : sx.lineTo(x, yy);
        }
        sx.stroke();
      }
    };
    paintSky();
    addEventListener("resize", paintSky);
  }

  /* ---------- tide plate ---------- */
  Array.prototype.forEach.call(document.querySelectorAll("[data-tide]"), function (c) {
    var x = c.getContext("2d"), W = c.width, H = c.height;
    var r = rng(parseFloat(c.getAttribute("data-tide")) * 71 + 5);
    var g = x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#22343c");
    g.addColorStop(1, "#16232a");
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    /* channels cut by the tide across a marsh */
    for (var i = 0; i < 26; i++) {
      var y0 = H * (i / 26) + r() * 12;
      x.strokeStyle = i % 4 === 0 ? "rgba(194,104,60,.5)" : "rgba(207,217,210,.22)";
      x.lineWidth = 0.7 + r() * 2.4;
      x.beginPath();
      var amp2 = 10 + r() * 60;
      for (var px = -10; px <= W + 10; px += 12) {
        var py = y0 + Math.sin(px / (60 + r() * 40) + i * 1.7) * (amp2 * 0.12) + Math.sin(px / 220) * amp2 * 0.3;
        px === -10 ? x.moveTo(px, py) : x.lineTo(px, py);
      }
      x.stroke();
    }
    for (var k = 0; k < 1400; k++) {
      x.fillStyle = "rgba(207,217,210," + (r() * 0.05).toFixed(3) + ")";
      x.fillRect(r() * W, r() * H, 1, 1);
    }
  });

  /* ============================================================
     BOOKING
     ============================================================ */
  var bk = document.getElementById("bk");
  if (!bk) return;

  var MONTHS = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  var state = { party: 0, date: null, time: "", details: null };

  /* Today, at midnight, so "is this in the past" is a date comparison
     rather than a time-of-day one. */
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var view = new Date(today.getFullYear(), today.getMonth(), 1);
  var lastMonth = new Date(today.getFullYear(), today.getMonth() + 3, 1);

  var key = function (d) { return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); };

  /* The room opens Wednesday to Saturday for dinner and Sunday for lunch.
     Beyond that, availability is deterministic from the date, so the same
     day always shows the same tables however many times you look. */
  function serves(d) {
    var w = d.getDay();          /* 0 Sun … 6 Sat */
    return w === 0 || w >= 3;
  }
  function tablesFree(d) {
    if (!serves(d)) return 0;
    if (d < today) return 0;
    var seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    var r = rng(seed);
    r(); r();
    var n = Math.floor(r() * 12) - 1;          /* -1 … 10 */
    var soon = (d - today) / 86400000;
    if (soon < 5) n -= 3;                       /* the next few days are mostly gone */
    if (d.getDay() === 6) n -= 2;               /* Saturdays go first */
    return Math.max(0, Math.min(11, n));
  }
  function slotsFor(d) {
    var lunch = d.getDay() === 0;
    var all = lunch ? ["1:00"] : ["6:00", "6:30", "7:00", "7:30", "8:00", "8:30"];
    var seed = d.getFullYear() * 100 + d.getMonth() * 31 + d.getDate();
    var r = rng(seed + 3);
    return all.map(function (t) {
      return { t: t, open: lunch ? true : r() > 0.34 };
    });
  }

  /* ---------- party ---------- */
  var partyEl = document.getElementById("party");
  for (var n = 1; n <= 6; n++) {
    (function (v) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = String(v);
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", "false");
      b.setAttribute("aria-label", v + (v === 1 ? " person" : " people"));
      b.addEventListener("click", function () {
        state.party = v;
        Array.prototype.forEach.call(partyEl.children, function (c) {
          c.setAttribute("aria-checked", String(c === b));
        });
        sync();
      });
      partyEl.appendChild(b);
    })(n);
  }

  /* ---------- calendar ---------- */
  var grid = document.getElementById("grid");
  var monEl = document.getElementById("mon");
  var prev = document.getElementById("prev");
  var nextm = document.getElementById("nextm");

  function drawCal() {
    monEl.textContent = MONTHS[view.getMonth()] + " " + view.getFullYear();
    grid.textContent = "";
    var first = new Date(view.getFullYear(), view.getMonth(), 1);
    var lead = (first.getDay() + 6) % 7;          /* Monday-first */
    var days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    for (var i = 0; i < lead; i++) {
      var pad = document.createElement("button");
      pad.type = "button"; pad.className = "pad"; pad.tabIndex = -1; pad.disabled = true;
      grid.appendChild(pad);
    }
    for (var d = 1; d <= days; d++) {
      (function (dd) {
        var date = new Date(view.getFullYear(), view.getMonth(), dd);
        var free = tablesFree(date);
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = String(dd);
        b.disabled = free === 0;
        b.setAttribute("data-open", free > 0 ? "1" : "0");
        b.setAttribute("aria-pressed", String(!!state.date && key(state.date) === key(date)));
        b.setAttribute("aria-label",
          DAYS[date.getDay()] + " " + dd + " " + MONTHS[date.getMonth()] +
          (free === 0 ? ", closed or fully booked" : ", " + free + (free === 1 ? " table" : " tables") + " free"));
        if (free > 0) b.title = free + (free === 1 ? " table free" : " tables free");
        b.addEventListener("click", function () {
          state.date = date;
          state.time = "";
          drawCal();
          sync();
        });
        grid.appendChild(b);
      })(d);
    }
    prev.disabled = view <= new Date(today.getFullYear(), today.getMonth(), 1);
    nextm.disabled = view >= lastMonth;
  }
  prev.addEventListener("click", function () { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); drawCal(); });
  nextm.addEventListener("click", function () { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); drawCal(); });
  drawCal();

  /* ---------- steps ---------- */
  var panes = {};
  Array.prototype.forEach.call(bk.querySelectorAll("[data-pane]"), function (p) {
    panes[p.getAttribute("data-pane")] = p;
  });
  var stepsEl = document.getElementById("steps");

  function show(n2) {
    Object.keys(panes).forEach(function (k2) { panes[k2].hidden = k2 !== String(n2); });
    Array.prototype.forEach.call(stepsEl.children, function (li) {
      var s = Number(li.getAttribute("data-step"));
      li.removeAttribute("aria-current");
      li.removeAttribute("data-done");
      if (s === n2) li.setAttribute("aria-current", "step");
      else if (s < n2) li.setAttribute("data-done", "1");
    });
    stepsEl.hidden = n2 === 4;
  }

  var fmt = function (d) {
    return DAYS[d.getDay()] + " " + d.getDate() + " " + MONTHS[d.getMonth()];
  };

  function sync() {
    var ready = state.party > 0 && !!state.date;
    document.getElementById("to2").disabled = !ready;
    document.getElementById("pick1").textContent = !state.party
      ? "Choose a party size and a date."
      : !state.date
        ? "Now pick an evening — the shaded dates have tables."
        : state.party + (state.party === 1 ? " person" : " people") + ", " + fmt(state.date) + ".";
  }
  sync();

  document.getElementById("to2").addEventListener("click", function () {
    var slots = document.getElementById("slots");
    slots.textContent = "";
    var lunch = state.date.getDay() === 0;
    document.getElementById("slot-line").textContent = lunch
      ? "Sunday is one sitting, at one o'clock. The table is yours for the afternoon."
      : "Dinner sittings for " + fmt(state.date) + ". Struck-through times have gone.";
    slotsFor(state.date).forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = s.t;
      b.disabled = !s.open;
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", "false");
      if (!s.open) b.setAttribute("aria-label", s.t + ", no longer available");
      b.addEventListener("click", function () {
        state.time = s.t;
        Array.prototype.forEach.call(slots.children, function (c) { c.setAttribute("aria-checked", String(c === b)); });
        document.getElementById("to3").disabled = false;
        document.getElementById("pick2").textContent = "Table at " + s.t + ".";
      });
      slots.appendChild(b);
    });
    document.getElementById("to3").disabled = true;
    document.getElementById("pick2").textContent = "Pick a time.";
    show(2);
  });

  document.getElementById("back1").addEventListener("click", function () { show(1); });
  document.getElementById("back2").addEventListener("click", function () { show(2); });

  document.getElementById("to3").addEventListener("click", function () {
    document.getElementById("sum").innerHTML =
      "<h3>Your table so far</h3><dl>" +
      "<div><dt>Party</dt><dd>" + state.party + (state.party === 1 ? " person" : " people") + "</dd></div>" +
      "<div><dt>Date</dt><dd>" + fmt(state.date) + "</dd></div>" +
      "<div><dt>Time</dt><dd>" + state.time + "</dd></div>" +
      "<div><dt>Sitting</dt><dd>Yours for the evening</dd></div></dl>";
    show(3);
  });

  /* ---------- details ---------- */
  var form = document.getElementById("bform");
  var alertBox = document.getElementById("alert");
  var inputs = form.querySelectorAll("input, textarea");

  function wrap(i) { return i.closest(".fld"); }
  function bad(i, msg) { var w = wrap(i); w.setAttribute("data-bad", "1"); i.setAttribute("aria-invalid", "true"); w.querySelector(".err").textContent = msg; }
  function good(i) { var w = wrap(i); w.removeAttribute("data-bad"); i.setAttribute("aria-invalid", "false"); w.querySelector(".err").textContent = ""; }
  Array.prototype.forEach.call(inputs, function (i) { i.addEventListener("input", function () { good(i); }); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var problems = [];
    Array.prototype.forEach.call(inputs, function (i) {
      if (!i.required) return;
      var v = (i.value || "").trim();
      good(i);
      if (!v) { bad(i, "We need this one"); problems.push(i); return; }
      if (i.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { bad(i, "That does not look like an email address"); problems.push(i); return; }
      if (i.type === "tel" && v.replace(/\D/g, "").length < 9) { bad(i, "A number we can reach you on that evening"); problems.push(i); }
    });
    if (problems.length) {
      alertBox.hidden = false;
      alertBox.textContent = problems.length === 1 ? "One field still needs your attention." : problems.length + " fields still need your attention.";
      problems[0].focus();
      return;
    }
    alertBox.hidden = true;
    var d = new FormData(form);
    state.details = { name: d.get("name"), email: d.get("email"), phone: d.get("phone"), notes: (d.get("notes") || "").trim() };

    /* A reference built from the booking itself, so it is stable and
       readable rather than a random string. */
    var ref = "SM-" +
      String(state.date.getDate()).padStart(2, "0") +
      MONTHS[state.date.getMonth()].slice(0, 3).toUpperCase() + "-" +
      state.time.replace(":", "") + "-" + state.party;

    document.getElementById("done-h").textContent = "The table is yours, " + String(state.details.name).split(" ")[0];
    document.getElementById("ticket").innerHTML =
      '<div class="ticket__top"><span class="ticket__ref">' + ref + '</span>' +
      '<span class="ticket__k">Saltmarsh &middot; Wraith Point</span></div>' +
      '<div class="ticket__rows">' +
      row("When", fmt(state.date) + ", " + state.time) +
      row("Party", state.party + (state.party === 1 ? " person" : " people")) +
      row("Under", state.details.name) +
      row("We will write to", state.details.email) +
      row("On the night", state.details.phone) +
      (state.details.notes ? row("You told us", state.details.notes) : "") +
      "</div>";
    show(4);
    panes["4"].focus();
  });

  function row(k3, v) {
    return '<div><b>' + k3 + '</b><span class="ticket__v">' + String(v).replace(/[<>&]/g, function (c) {
      return { "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c];
    }) + "</span></div>";
  }

  document.getElementById("restart").addEventListener("click", function () {
    state = { party: 0, date: null, time: "", details: null };
    form.reset();
    Array.prototype.forEach.call(partyEl.children, function (c) { c.setAttribute("aria-checked", "false"); });
    view = new Date(today.getFullYear(), today.getMonth(), 1);
    drawCal();
    sync();
    show(1);
  });
})();
