/* =====================================================================
   FAIRWEATHER BARBERS — the parts that are this shop's
   ===================================================================== */
(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Tuesday to Saturday, indexed the way the table is printed rather than
     the way Date numbers them, because the table starts on Tuesday. */
  var HOURS = {
    2: [9, 18],    /* Tuesday */
    3: [9, 18],
    4: [9, 20],
    5: [8, 18],
    6: [8, 16]
  };
  var DAYNAME = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  /* ---------- 1. the sign in the window ------------------------------- */
  function sign() {
    var signs = $$("[data-sign]");
    if (!signs.length) return;

    function state() {
      var now = new Date();
      var d = now.getDay();
      var mins = now.getHours() * 60 + now.getMinutes();
      var today = HOURS[d];

      if (today) {
        var from = today[0] * 60, to = today[1] * 60;
        if (mins >= from && mins < to) {
          var left = to - mins;
          return {
            open: true,
            text: left <= 60 ? "Open, closing at " + pad(today[1]) + ":00" : "Open until " + pad(today[1]) + ":00"
          };
        }
        if (mins < from) return { open: false, text: "Opens at " + pad(today[0]) + ":00" };
      }
      /* the next day we are open */
      for (var i = 1; i <= 7; i++) {
        var nd = (d + i) % 7;
        if (HOURS[nd]) {
          return {
            open: false,
            text: "Closed &middot; open " + (i === 1 ? "tomorrow" : DAYNAME[nd]) + " " + pad(HOURS[nd][0]) + ":00"
          };
        }
      }
      return { open: false, text: "Closed" };
    }
    function pad(n) { return (n < 10 ? "0" : "") + n; }

    function paint() {
      var s = state();
      signs.forEach(function (el) {
        el.hidden = false;
        el.setAttribute("data-open", String(s.open));
        var t = $("[data-sign-text]", el);
        if (t) t.innerHTML = s.text;
      });
    }
    paint();
    setInterval(paint, 60000);

    /* mark today in the printed table */
    var rows = $$(".hours tr[data-day]");
    if (rows.length) {
      /* the table is printed Tuesday-first, so map the row index to a day */
      var order = [2, 3, 4, 5, 6, 0, 1];
      var today = new Date().getDay();
      rows.forEach(function (r, i) {
        r.setAttribute("data-today", String(order[i] === today));
      });
    }
  }

  /* ---------- 2. the gallery filter ----------------------------------- */
  function gallery() {
    var filters = $$(".filters__b");
    if (!filters.length) return;
    var empty = $("#gal-empty");
    filters.forEach(function (b) {
      b.addEventListener("click", function () {
        var want = b.getAttribute("data-filter");
        filters.forEach(function (o) { o.setAttribute("aria-selected", String(o === b)); });
        var shown = 0;
        $$(".shot").forEach(function (s) {
          var hit = want === "all" || s.getAttribute("data-cut") === want;
          s.hidden = !hit;
          if (hit) shown++;
        });
        if (empty) empty.hidden = shown > 0;
      });
    });
  }

  /* ---------- 3. the message ------------------------------------------ */
  function ask() {
    var form = $("#ask");
    if (!form) return;
    var done = $("#ask-done");

    function err(id, msg) {
      var p = $('[data-err-for="' + id + '"]');
      if (p) p.textContent = msg || "";
      var f = $("#" + id);
      if (f) f.setAttribute("aria-invalid", msg ? "true" : "false");
      return !msg;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = $("#a-name"), contact = $("#a-contact");
      var ok = true;
      ok = err("a-name", name.value.trim() ? "" : "We need something to call you.") && ok;
      /* either a phone number or an email will do — this is a barber, not a bank */
      var c = contact.value.trim();
      var good = /.+@.+\..+/.test(c) || /^[\d\s+()-]{7,}$/.test(c);
      ok = err("a-contact", good ? "" : "A phone number or an email address, so we can answer.") && ok;
      if (!ok) { (name.value.trim() ? contact : name).focus(); return; }
      done.hidden = false;
      form.querySelector('button[type="submit"]').disabled = true;
      done.focus && done.setAttribute("tabindex", "-1");
      done.focus && done.focus();
    });
  }

  function boot() { sign(); gallery(); ask(); }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else { boot(); }
})();
