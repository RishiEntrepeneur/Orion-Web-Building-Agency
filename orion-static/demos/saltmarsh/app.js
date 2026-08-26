/* =====================================================================
   SALTMARSH — the parts that are this site's rather than shared
   ===================================================================== */
(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var page = document.body.getAttribute("data-page");

  /* ------------------------------------------------------------------
     1. THE TIDE FILM
     One canvas, and a scroll position that decides what time of day it
     is and how much water is in the marsh. The captions are keyed to
     the same number, so the words and the picture can never drift.
     ------------------------------------------------------------------ */
  function tide() {
    var track = $("[data-seq]");
    var art = $("#tide-art");
    if (!track || !art || !window.Motion || !window.Art) return;

    var caps = $$(".tide__cap");
    var clock = $("#tide-clock");
    var state = $("#tide-state");
    var lastCap = -1, lastPaint = 0;

    /* four o'clock in the morning to nine at night, and a tide that runs
       out and comes back once across the same span */
    function timeAt(p) {
      var mins = 280 + p * 980;
      var hh = Math.floor(mins / 60) % 24, mm = Math.floor(mins % 60);
      return (hh < 10 ? "0" : "") + hh + ":" + (mm < 10 ? "0" : "") + mm;
    }

    window.Motion.onSeq(track, function (p, dt) {
      /* the sun: dawn at 0, last light at 1 */
      var hour = 0.06 + p * 0.88;
      /* the water: high, out, and back in again */
      var tideLevel = 0.5 + Math.cos(p * Math.PI * 2) * 0.44;

      /* repainting a landscape every frame is wasteful and invisible;
         thirty times a second is more than the eye asks for here */
      var now = performance.now();
      if (now - lastPaint > 33) {
        lastPaint = now;
        window.Art.set(art, { hour: hour, tide: tideLevel });
      }

      if (clock) clock.textContent = timeAt(p);
      if (state) {
        state.textContent = tideLevel < 0.25 ? "Low water"
          : tideLevel > 0.75 ? "High water"
          : (Math.sin(p * Math.PI * 2) > 0 ? "Falling" : "Making");
      }

      var i = Math.min(caps.length - 1, Math.floor(p * caps.length * 0.999));
      if (i !== lastCap) {
        lastCap = i;
        caps.forEach(function (c, k) { c.setAttribute("data-on", String(k === i)); });
      }
      void dt;
    });

    if (window.Motion.reduced) {
      window.Art.set(art, { hour: 0.74, tide: 0.5 });
      caps.forEach(function (c) { c.setAttribute("data-on", "true"); c.style.position = "static"; });
    }
  }

  /* ------------------------------------------------------------------
     2. THE CARD — expand a dish, filter the list
     ------------------------------------------------------------------ */
  function card() {
    $$(".dish__hd").forEach(function (hd) {
      hd.addEventListener("click", function () {
        var li = hd.closest(".dish");
        var open = li.getAttribute("data-open") === "true";
        li.setAttribute("data-open", String(!open));
        hd.setAttribute("aria-expanded", String(!open));
      });
    });

    var filters = $$(".filters__b");
    if (!filters.length) return;
    var empty = $("#card-empty");
    filters.forEach(function (b) {
      b.addEventListener("click", function () {
        var want = b.getAttribute("data-filter");
        filters.forEach(function (o) { o.setAttribute("aria-selected", String(o === b)); });
        var shown = 0;
        $$(".dish").forEach(function (d) {
          var hit = want === "all" || d.getAttribute("data-cat") === want;
          d.hidden = !hit;
          if (hit) shown++;
        });
        if (empty) empty.hidden = shown > 0;
      });
    });
  }

  /* ------------------------------------------------------------------
     3. QUOTES
     ------------------------------------------------------------------ */
  function quotes() {
    var wrap = $("[data-quotes]");
    if (!wrap) return;
    var items = $$(".quote", wrap);
    var dots = $$(".quotes__dots button");
    if (items.length < 2) return;
    var at = 0, timer = 0;

    function go(i) {
      at = (i + items.length) % items.length;
      items.forEach(function (q, k) { q.setAttribute("data-on", String(k === at)); });
      dots.forEach(function (d, k) { d.setAttribute("aria-selected", String(k === at)); });
    }
    function play() {
      if (window.Motion && window.Motion.reduced) return;
      clearInterval(timer);
      timer = setInterval(function () { go(at + 1); }, 6200);
    }
    dots.forEach(function (d, i) {
      d.addEventListener("click", function () { go(i); play(); });
    });
    wrap.addEventListener("pointerenter", function () { clearInterval(timer); });
    wrap.addEventListener("pointerleave", play);
    play();
  }

  /* ------------------------------------------------------------------
     4. TODAY'S DATE, on the home page
     ------------------------------------------------------------------ */
  function today() {
    var el = $("#today-date");
    if (!el) return;
    var d = new Date();
    el.textContent = d.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
  }

  /* ------------------------------------------------------------------
     5. THE BOOKING SYSTEM
     Three steps. Availability is generated from the date itself rather
     than stored, so it is stable across reloads without a server: the
     same Tuesday is always shut, and the same Friday is always nearly
     full. A real build would ask the restaurant's system instead.
     ------------------------------------------------------------------ */
  var SITTINGS = {
    /* day of week (0 = Sunday) → the times the room runs */
    0: [["13:00", "One sitting, Sunday lunch"]],
    3: [["18:30", ""], ["19:00", ""], ["20:45", "Late table"]],
    4: [["18:30", ""], ["19:00", ""], ["19:30", ""], ["20:45", "Late table"]],
    5: [["18:30", ""], ["19:00", ""], ["19:30", ""], ["20:00", ""], ["21:00", "Late table"]],
    6: [["18:00", "Early table"], ["18:30", ""], ["19:00", ""], ["19:30", ""], ["20:00", ""], ["21:00", "Late table"]]
  };

  function seatsFor(date, time) {
    /* a deterministic pseudo-random from the date and time, so the room
       looks convincingly, and repeatably, half booked */
    var k = date.getFullYear() * 372 + date.getMonth() * 31 + date.getDate();
    var t = 0;
    for (var i = 0; i < time.length; i++) t += time.charCodeAt(i) * (i + 3);
    var n = Math.sin(k * 12.9898 + t * 78.233) * 43758.5453;
    n = n - Math.floor(n);
    return Math.round(n * 8);          /* 0 to 8 seats left at that sitting */
  }

  function dayState(date, today0) {
    if (date < today0) return "shut";
    if (!SITTINGS[date.getDay()]) return "shut";
    var total = 0;
    SITTINGS[date.getDay()].forEach(function (s) { total += seatsFor(date, s[0]); });
    if (total === 0) return "shut";
    return total < 9 ? "few" : "open";
  }

  function booking() {
    var form = $("#bk");
    if (!form) return;

    var MONTHS = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];

    var grid = $("#cal-grid"), monthLab = $("#cal-month");
    var prev = $("[data-cal-prev]"), next = $("[data-cal-next]");
    var pips = $("#pips"), slots = $("#slots"), none = $("#bk-none");
    var chosen = $("#bk-chosen"), chosen2 = $("#bk-chosen-2");
    var stepsEls = $$(".steps__i"), panes = $$(".bk__step");
    var back = $("#bk-back"), fwd = $("#bk-next");
    var done = $("#bk-done"), recap = $("#bk-recap"), again = $("#bk-again");

    var now = new Date();
    var today0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var view = new Date(today0.getFullYear(), today0.getMonth(), 1);
    var pick = { date: null, party: 2, time: null };
    var step = 1;

    function fmt(d) {
      return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
    }

    /* --- calendar --- */
    function drawCal() {
      monthLab.textContent = MONTHS[view.getMonth()] + " " + view.getFullYear();
      grid.innerHTML = "";
      var first = new Date(view.getFullYear(), view.getMonth(), 1);
      var lead = (first.getDay() + 6) % 7;                 /* weeks start Monday */
      var days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();

      for (var p = 0; p < lead; p++) {
        var pad = document.createElement("span");
        pad.className = "cal__d cal__d--pad";
        grid.appendChild(pad);
      }
      for (var d = 1; d <= days; d++) {
        var date = new Date(view.getFullYear(), view.getMonth(), d);
        var st = dayState(date, today0);
        var b = document.createElement("button");
        b.type = "button";
        b.className = "cal__d";
        b.textContent = d;
        b.setAttribute("data-state", st);
        b.setAttribute("role", "gridcell");
        b.setAttribute("aria-selected", String(!!pick.date && +pick.date === +date));
        b.setAttribute("aria-label", fmt(date) + (st === "shut" ? " — closed" : st === "few" ? " — nearly full" : " — tables available"));
        if (st === "shut") b.disabled = true;
        (function (dd) {
          b.addEventListener("click", function () {
            pick.date = dd;
            pick.time = null;
            $$(".cal__d", grid).forEach(function (o) { o.setAttribute("aria-selected", "false"); });
            b.setAttribute("aria-selected", "true");
            refresh();
          });
        })(date);
        grid.appendChild(b);
      }
      prev.disabled = view.getFullYear() === today0.getFullYear() && view.getMonth() === today0.getMonth();
    }

    prev.addEventListener("click", function () { view.setMonth(view.getMonth() - 1); drawCal(); });
    next.addEventListener("click", function () { view.setMonth(view.getMonth() + 1); drawCal(); });

    /* --- party size --- */
    for (var n = 1; n <= 8; n++) {
      (function (size) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "pip";
        b.setAttribute("role", "radio");
        b.setAttribute("aria-checked", String(size === pick.party));
        b.setAttribute("aria-label", size + (size === 1 ? " person" : " people"));
        b.textContent = size;
        b.addEventListener("click", function () {
          pick.party = size;
          pick.time = null;
          $$(".pip").forEach(function (o) { o.setAttribute("aria-checked", "false"); });
          b.setAttribute("aria-checked", "true");
          drawSlots();
          refresh();
        });
        pips.appendChild(b);
      })(n);
    }

    /* --- times --- */
    function drawSlots() {
      slots.innerHTML = "";
      if (!pick.date) return;
      var list = SITTINGS[pick.date.getDay()] || [];
      var any = false;
      list.forEach(function (s) {
        var left = seatsFor(pick.date, s[0]);
        var ok = left >= pick.party;
        if (ok) any = true;
        var b = document.createElement("button");
        b.type = "button";
        b.className = "slot";
        b.setAttribute("role", "radio");
        b.setAttribute("aria-checked", String(pick.time === s[0]));
        b.innerHTML = s[0] + (s[1] ? "<small>" + s[1] + "</small>" :
          ok ? "<small>" + left + " left</small>" : "<small>full</small>");
        b.setAttribute("aria-label", s[0] + (ok ? ", " + left + " seats left" : ", full"));
        if (!ok) b.disabled = true;
        b.addEventListener("click", function () {
          pick.time = s[0];
          $$(".slot").forEach(function (o) { o.setAttribute("aria-checked", "false"); });
          b.setAttribute("aria-checked", "true");
          refresh();
        });
        slots.appendChild(b);
      });
      if (none) none.hidden = any;
    }

    /* --- steps --- */
    function show(n2) {
      step = n2;
      panes.forEach(function (p) { p.setAttribute("data-on", String(+p.getAttribute("data-step") === step)); });
      stepsEls.forEach(function (s, i) {
        s.setAttribute("data-on", String(i + 1 === step));
        s.setAttribute("data-done", String(i + 1 < step));
      });
      back.hidden = step === 1;
      refresh();
    }

    function refresh() {
      var label = pick.date ? fmt(pick.date) : "";
      if (chosen) chosen.textContent = label;
      if (chosen2) {
        chosen2.textContent = label + (pick.time ? " · " + pick.time : "") +
          " · " + pick.party + (pick.party === 1 ? " person" : " people");
      }
      if (step === 1) {
        fwd.disabled = !pick.date;
        fwd.textContent = pick.date ? "Choose a time" : "Choose a date";
      } else if (step === 2) {
        fwd.disabled = !pick.time;
        fwd.textContent = pick.time ? "Your details" : "Choose a time";
      } else {
        fwd.disabled = false;
        fwd.textContent = "Hold the table";
      }
    }

    back.addEventListener("click", function () { if (step > 1) show(step - 1); });
    fwd.addEventListener("click", function () {
      if (step === 1) { drawSlots(); show(2); return; }
      if (step === 2) { show(3); return; }
      submit();
    });

    /* --- details --- */
    function err(id, msg) {
      var p = $('[data-err-for="' + id + '"]');
      if (p) p.textContent = msg || "";
      var f = $("#" + id);
      if (f) f.setAttribute("aria-invalid", msg ? "true" : "false");
      return !msg;
    }
    function submit() {
      var name = $("#bk-name"), email = $("#bk-email"), notes = $("#bk-notes");
      var ok = true;
      ok = err("bk-name", name.value.trim() ? "" : "We need a name for the table.") && ok;
      ok = err("bk-email", /.+@.+\..+/.test(email.value.trim()) ? "" : "That does not look like an email address.") && ok;
      if (!ok) { (name.value.trim() ? email : name).focus(); return; }

      recap.innerHTML = "";
      [["Date", fmt(pick.date)], ["Time", pick.time],
       ["Party", pick.party + (pick.party === 1 ? " person" : " people")],
       ["Name", name.value.trim()], ["Email", email.value.trim()],
       ["Notes", notes.value.trim() || "—"]].forEach(function (r) {
        var d = document.createElement("div");
        d.innerHTML = "<dt>" + r[0] + "</dt><dd></dd>";
        d.lastChild.textContent = r[1];
        recap.appendChild(d);
      });
      form.hidden = true;
      $("#steps").hidden = true;
      done.hidden = false;
      done.scrollIntoView({ behavior: window.Motion && window.Motion.reduced ? "auto" : "smooth", block: "center" });
    }

    again.addEventListener("click", function () {
      pick = { date: null, party: 2, time: null };
      $$(".cal__d").forEach(function (o) { o.setAttribute("aria-selected", "false"); });
      $$(".pip").forEach(function (o, i) { o.setAttribute("aria-checked", String(i === 1)); });
      slots.innerHTML = "";
      form.reset();
      form.hidden = false;
      $("#steps").hidden = false;
      done.hidden = true;
      show(1);
      $("#steps").scrollIntoView({ behavior: "smooth", block: "center" });
    });

    drawCal();
    show(1);
  }

  function boot() {
    if (page === "home") { tide(); quotes(); today(); }
    card();
    booking();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else { boot(); }
})();
