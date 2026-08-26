/* =====================================================================
   MOTION — the moving parts the demo sites share
   =====================================================================
   One frame loop, split into a read phase and a write phase, because
   interleaving a layout read after a style write forces a synchronous
   layout and that is what actually makes scroll-linked motion stutter.

   Every behaviour is opt-in through a data attribute, so a page only
   pays for what it uses:

     data-rev            reveal on scroll (data-rev="0.15" delays it)
     data-par="0.18"     parallax, positive moves against the scroll
     data-mag="0.3"      the element leans towards the pointer
     data-count="120"    counts up when it arrives
     data-marquee        seamless horizontal loop
     data-seq            a pinned scroll sequence; progress lands on --p
     data-lift           a card that lifts and tilts under the pointer
     data-lb             opens its canvas or image in the lightbox
     data-split          splits its text into per-word spans for staggering
   ===================================================================== */
(function () {
  "use strict";

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };

  /* frame-rate independent damping: the same half-life at 30fps and 144 */
  function damp(cur, to, halfLife, dt) {
    return cur + (to - cur) * (1 - Math.pow(2, -dt / halfLife));
  }

  var readers = [], writers = [], last = 0, running = false;
  function onRead(f) { readers.push(f); return f; }
  function onWrite(f) { writers.push(f); return f; }
  function frame(t) {
    if (!running) return;
    var dt = last ? Math.min(t - last, 64) : 16.7;
    last = t;
    for (var i = 0; i < readers.length; i++) { try { readers[i](dt, t); } catch (e) {} }
    for (var j = 0; j < writers.length; j++) { try { writers[j](dt, t); } catch (e) {} }
    requestAnimationFrame(frame);
  }
  function start() { if (!running) { running = true; last = 0; requestAnimationFrame(frame); } }
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) running = false; else start();
  });

  var S = { y: 0, vh: 0, vw: 0, mx: 0, my: 0, dir: 1 };
  function measure() {
    S.vh = window.innerHeight; S.vw = window.innerWidth;
    /* Everything above the fold — the demo notice and the sticky header —
       eats into the first screen. A hero that asks for 100svh on top of
       that pushes its own call to action below the fold, so the height is
       published as --chrome and the hero subtracts it. */
    var strip = document.querySelector(".demobar");
    var bar = document.querySelector(".bar");
    var chrome = (strip ? strip.offsetHeight : 0) + (bar ? bar.offsetHeight : 0);
    document.documentElement.style.setProperty("--chrome", chrome + "px");
  }
  onRead(function () {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    S.dir = y > S.y ? 1 : y < S.y ? -1 : S.dir;
    S.y = y;
  });
  measure();
  window.addEventListener("resize", measure, { passive: true });
  window.addEventListener("pointermove", function (e) { S.mx = e.clientX; S.my = e.clientY; }, { passive: true });

  /* ---------- reveal ------------------------------------------------- */
  function reveal() {
    var els = $$("[data-rev]");
    if (!els.length) return;
    if (REDUCED || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.setAttribute("data-in", "true"); });
      return;
    }
    els.forEach(function (el) {
      var d = parseFloat(el.getAttribute("data-rev"));
      if (d) el.style.setProperty("--rd", d + "s");
    });
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.setAttribute("data-in", "true");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -9% 0px", threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
    /* anything still hidden after five seconds was never going to intersect */
    setTimeout(function () {
      els.forEach(function (el) { if (!el.hasAttribute("data-in")) el.setAttribute("data-in", "true"); });
    }, 5000);
  }

  /* ---------- split text --------------------------------------------- */
  function split() {
    $$("[data-split]").forEach(function (el) {
      if (el._split) return;
      el._split = true;
      var words = el.textContent.trim().split(/\s+/);
      el.textContent = "";
      words.forEach(function (word, i) {
        var s = document.createElement("span");
        s.className = "wd";
        s.style.setProperty("--i", i);
        s.textContent = word;
        el.appendChild(s);
        if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
      });
    });
  }

  /* ---------- parallax ------------------------------------------------ */
  function parallax() {
    var els = $$("[data-par]");
    if (!els.length || REDUCED) return;
    var items = els.map(function (el) {
      return { el: el, k: parseFloat(el.getAttribute("data-par")) || 0.15, top: 0, h: 0, cur: 0, live: false };
    });
    onRead(function () {
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        var r = it.el.getBoundingClientRect();
        it.live = r.bottom > -200 && r.top < S.vh + 200;
        if (it.live) { it.mid = r.top + r.height / 2; }
      }
    });
    onWrite(function (dt) {
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        if (!it.live) continue;
        var target = ((it.mid - S.vh / 2) / S.vh) * it.k * 100;
        it.cur = damp(it.cur, target, 90, dt);
        it.el.style.transform = "translate3d(0," + it.cur.toFixed(2) + "px,0)";
      }
    });
    start();
  }

  /* ---------- magnetic + lift ---------------------------------------- */
  function magnetic() {
    var els = $$("[data-mag]");
    if (!els.length || REDUCED || !window.matchMedia("(hover: hover)").matches) return;
    var items = els.map(function (el) {
      return { el: el, k: parseFloat(el.getAttribute("data-mag")) || 0.3, x: 0, y: 0, tx: 0, ty: 0, r: null };
    });
    onRead(function () {
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        var r = it.el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > S.vh) { it.tx = it.ty = 0; continue; }
        var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        var dx = S.mx - cx, dy = S.my - cy;
        var reach = Math.max(r.width, r.height) * 1.15;
        var d = Math.hypot(dx, dy);
        if (d > reach) { it.tx = it.ty = 0; continue; }
        var f = (1 - d / reach) * it.k;
        it.tx = dx * f; it.ty = dy * f;
      }
    });
    onWrite(function (dt) {
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        it.x = damp(it.x, it.tx, 90, dt);
        it.y = damp(it.y, it.ty, 90, dt);
        /* park exactly at zero, or the element never stops transforming */
        if (Math.abs(it.x) < 0.05 && Math.abs(it.y) < 0.05 && !it.tx && !it.ty) {
          if (it.el.style.transform) it.el.style.transform = "";
          it.x = it.y = 0;
          continue;
        }
        it.el.style.transform = "translate3d(" + it.x.toFixed(2) + "px," + it.y.toFixed(2) + "px,0)";
      }
    });
    start();
  }

  function lift() {
    var els = $$("[data-lift]");
    if (!els.length || REDUCED || !window.matchMedia("(hover: hover)").matches) return;
    els.forEach(function (el) {
      var rx = 0, ry = 0, tx = 0, ty = 0, on = false, rect = null;
      el.addEventListener("pointerenter", function () { on = true; rect = el.getBoundingClientRect(); });
      el.addEventListener("pointerleave", function () { on = false; tx = ty = 0; });
      el.addEventListener("pointermove", function (e) {
        if (!rect) rect = el.getBoundingClientRect();
        tx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        ty = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      });
      onWrite(function (dt) {
        rx = damp(rx, on ? -ty * 5 : 0, 110, dt);
        ry = damp(ry, on ? tx * 5 : 0, 110, dt);
        if (Math.abs(rx) < 0.02 && Math.abs(ry) < 0.02 && !on) {
          if (el.style.transform) el.style.transform = "";
          return;
        }
        el.style.transform = "perspective(900px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg)";
      });
    });
    start();
  }

  /* ---------- counters ------------------------------------------------ */
  function counters() {
    var els = $$("[data-count]");
    if (!els.length) return;
    els.forEach(function (el) {
      var to = parseFloat(el.getAttribute("data-count"));
      var suffix = el.getAttribute("data-count-suffix") || "";
      if (REDUCED) { el.textContent = to + suffix; return; }
      var io = new IntersectionObserver(function (en) {
        if (!en[0].isIntersecting) return;
        io.disconnect();
        var t0 = performance.now(), dur = 1100;
        (function step(t) {
          var k = clamp((t - t0) / dur, 0, 1);
          var e = 1 - Math.pow(1 - k, 3);
          el.textContent = Math.round(to * e) + suffix;
          if (k < 1) requestAnimationFrame(step);
        })(t0);
      }, { threshold: 0.5 });
      io.observe(el);
    });
  }

  /* ---------- marquee -------------------------------------------------- */
  function marquee() {
    var els = $$("[data-marquee]");
    if (!els.length) return;
    els.forEach(function (el) {
      var inner = el.firstElementChild;
      if (!inner) return;
      var clone = inner.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      el.appendChild(clone);
      if (REDUCED) return;
      var speed = parseFloat(el.getAttribute("data-marquee")) || 34;
      var x = 0, w = 0;
      onRead(function () { w = inner.offsetWidth; });
      onWrite(function (dt) {
        if (!w) return;
        x -= (speed * dt) / 1000;
        if (x <= -w) x += w;
        el.style.setProperty("--mx", x.toFixed(2) + "px");
      });
    });
    start();
  }

  /* ---------- pinned scroll sequences --------------------------------- */
  /* <div data-seq><div class="seq__pin">…</div></div>
     Progress through the track lands on --p (0..1) on the track, and is
     handed to any listener registered with Motion.onSeq(el, fn). */
  var seqSubs = [];
  function seq() {
    var tracks = $$("[data-seq]");
    if (!tracks.length) return;
    var items = tracks.map(function (el) { return { el: el, p: 0, live: false, raw: 0 }; });
    onRead(function () {
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        var r = it.el.getBoundingClientRect();
        it.live = r.bottom > -100 && r.top < S.vh + 100;
        if (!it.live) continue;
        it.raw = clamp(-r.top / Math.max(1, r.height - S.vh), 0, 1);
      }
    });
    onWrite(function (dt) {
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        if (!it.live) continue;
        it.p = REDUCED ? it.raw : damp(it.p, it.raw, 60, dt);
        it.el.style.setProperty("--p", it.p.toFixed(4));
        for (var s = 0; s < seqSubs.length; s++) {
          if (seqSubs[s].el === it.el) { try { seqSubs[s].fn(it.p, dt); } catch (e) {} }
        }
      }
    });
    start();
  }

  /* ---------- lightbox ------------------------------------------------- */
  function lightbox() {
    var triggers = $$("[data-lb]");
    if (!triggers.length) return;

    var box = document.createElement("div");
    box.className = "lb";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Enlarged image");
    box.hidden = true;
    box.innerHTML =
      '<button class="lb__close" type="button" aria-label="Close">&times;</button>' +
      '<button class="lb__nav lb__nav--prev" type="button" aria-label="Previous">&#8249;</button>' +
      '<figure class="lb__fig"><div class="lb__slot"></div><figcaption class="lb__cap"></figcaption></figure>' +
      '<button class="lb__nav lb__nav--next" type="button" aria-label="Next">&#8250;</button>';
    document.body.appendChild(box);

    var slot = $(".lb__slot", box), cap = $(".lb__cap", box);
    var at = 0, lastFocus = null;

    function show(i) {
      at = (i + triggers.length) % triggers.length;
      var src = triggers[at];
      slot.innerHTML = "";
      var art = src.querySelector("canvas[data-art]");
      if (art && window.Art) {
        var c = document.createElement("canvas");
        slot.appendChild(c);
        var opts = {};
        try { opts = JSON.parse(art.getAttribute("data-art-opts") || "{}"); } catch (e) {}
        /* the copy is a canvas the art driver has never seen, so it will not
           paint on its own: hand it over explicitly, on the next frame, once
           the slot has a size to measure */
        requestAnimationFrame(function () {
          window.Art.paintInto(c, art.getAttribute("data-art"), opts);
        });
      }
      cap.textContent = src.getAttribute("data-lb-cap") || "";
    }
    function open(i) {
      lastFocus = document.activeElement;
      box.hidden = false;
      document.documentElement.setAttribute("data-lb-open", "true");
      show(i);
      $(".lb__close", box).focus();
    }
    function close() {
      box.hidden = true;
      document.documentElement.removeAttribute("data-lb-open");
      /* drop the clone out of the paint list, or it animates forever offscreen */
      $$("canvas", slot).forEach(function (c) { if (window.Art) window.Art.forget(c); });
      slot.innerHTML = "";
      if (lastFocus) lastFocus.focus();
    }

    triggers.forEach(function (t, i) {
      t.addEventListener("click", function (e) { e.preventDefault(); open(i); });
      t.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); }
      });
    });
    $(".lb__close", box).addEventListener("click", close);
    $(".lb__nav--prev", box).addEventListener("click", function () { show(at - 1); });
    $(".lb__nav--next", box).addEventListener("click", function () { show(at + 1); });
    box.addEventListener("click", function (e) { if (e.target === box) close(); });
    document.addEventListener("keydown", function (e) {
      if (box.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(at - 1);
      if (e.key === "ArrowRight") show(at + 1);
      if (e.key === "Tab") {
        /* a modal that lets focus wander behind it is not a modal */
        var f = $$("button", box);
        var first = f[0], lastEl = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
        else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- header ---------------------------------------------------- */
  function header() {
    var bar = $("[data-bar]");
    if (!bar) return;
    var lastY = 0;
    onWrite(function () {
      bar.setAttribute("data-stuck", String(S.y > 24));
      /* hide on the way down, show the moment you go back up */
      if (S.y > 260 && S.y > lastY + 4) bar.setAttribute("data-away", "true");
      else if (S.y < lastY - 4 || S.y < 120) bar.removeAttribute("data-away");
      lastY = S.y;
    });
    start();

    var burger = $("[data-burger]");
    var drawer = $("[data-drawer]");
    if (burger && drawer) {
      burger.addEventListener("click", function () {
        var open = drawer.getAttribute("data-open") === "true";
        drawer.setAttribute("data-open", String(!open));
        burger.setAttribute("aria-expanded", String(!open));
        document.documentElement.style.overflow = !open ? "hidden" : "";
      });
      $$("a", drawer).forEach(function (a) {
        a.addEventListener("click", function () {
          drawer.setAttribute("data-open", "false");
          burger.setAttribute("aria-expanded", "false");
          document.documentElement.style.overflow = "";
        });
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && drawer.getAttribute("data-open") === "true") burger.click();
      });
    }
  }

  /* ---------- section spy ----------------------------------------------- */
  function spy() {
    var links = $$("[data-spy] a[href^='#']");
    if (!links.length) return;
    var map = links.map(function (a) {
      return { a: a, el: document.getElementById(a.getAttribute("href").slice(1)) };
    }).filter(function (m) { return m.el; });
    if (!map.length) return;
    onRead(function () {
      var best = null, bestD = Infinity;
      for (var i = 0; i < map.length; i++) {
        var r = map[i].el.getBoundingClientRect();
        var d = Math.abs(r.top - S.vh * 0.3);
        if (r.bottom > 0 && d < bestD) { bestD = d; best = map[i]; }
      }
      for (var j = 0; j < map.length; j++) {
        map[j].a.setAttribute("aria-current", String(map[j] === best));
      }
    });
    start();
  }

  /* ---------- page transition ------------------------------------------- */
  function curtain() {
    var c = document.createElement("div");
    c.className = "curtain";
    c.setAttribute("aria-hidden", "true");
    document.body.appendChild(c);
    requestAnimationFrame(function () { c.setAttribute("data-state", "in"); });

    if (REDUCED) return;
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a) return;
      var href = a.getAttribute("href");
      if (!href || href.charAt(0) === "#" || a.target === "_blank" ||
          a.hasAttribute("download") || /^(https?:|mailto:|tel:)/.test(href)) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      c.setAttribute("data-state", "out");
      setTimeout(function () { location.href = href; }, 340);
    });
    window.addEventListener("pageshow", function (e) {
      if (e.persisted) c.setAttribute("data-state", "in");
    });
  }

  /* ---------- smooth anchors -------------------------------------------- */
  function anchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[href^='#']");
      if (!a) return;
      var id = a.getAttribute("href").slice(1);
      if (!id) return;
      var el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" });
      el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: true });
      history.replaceState(null, "", "#" + id);
    });
  }

  function boot() {
    measure();
    split();
    reveal();
    parallax();
    magnetic();
    lift();
    counters();
    marquee();
    seq();
    lightbox();
    header();
    spy();
    anchors();
    curtain();
    start();
  }

  window.Motion = {
    onRead: onRead, onWrite: onWrite, start: start, state: S, damp: damp, clamp: clamp,
    reduced: REDUCED,
    onSeq: function (el, fn) { seqSubs.push({ el: el, fn: fn }); }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else { boot(); }
})();
