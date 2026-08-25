/* ============================================================
   ORION — motion system
   Vanilla ES2020. No dependencies. One rAF loop.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 0. ENV ---------- */
  var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var REDUCED = motionQuery.matches;
  var COARSE = window.matchMedia("(pointer: coarse)").matches;
  var LOWTIER =
    (navigator.hardwareConcurrency || 8) <= 4 ||
    (navigator.deviceMemory || 8) <= 4 ||
    window.innerWidth < 720;

  motionQuery.addEventListener("change", function (e) {
    REDUCED = e.matches;
    document.documentElement.setAttribute("data-reduced", String(REDUCED));
  });
  document.documentElement.setAttribute("data-reduced", String(REDUCED));

  /* ---------- 1. MATH ---------- */
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  /* frame-rate independent damping: halfLife in ms */
  function damp(cur, target, halfLife, dt) {
    if (halfLife <= 0) return target;
    return lerp(cur, target, 1 - Math.pow(2, -dt / halfLife));
  }
  function map(v, a, b, c, d) { return c + ((clamp(v, a, b) - a) / (b - a)) * (d - c); }
  function smoothstep(t) { return t * t * (3 - 2 * t); }
  /* deterministic hash noise — no libraries */
  function hash2(x, y) {
    var n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
    return n - Math.floor(n);
  }
  function vnoise(x, y) {
    var xi = Math.floor(x), yi = Math.floor(y);
    var xf = x - xi, yf = y - yi;
    var u = smoothstep(xf), v = smoothstep(yf);
    var a = hash2(xi, yi), b = hash2(xi + 1, yi);
    var c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
    return lerp(lerp(a, b, u), lerp(c, d, u), v);
  }
  function fbm(x, y) {
    return vnoise(x, y) * 0.55 + vnoise(x * 2.03, y * 2.03) * 0.28 + vnoise(x * 4.07, y * 4.07) * 0.17;
  }

  /* ---------- 2. CENTRAL LOOP ----------
     Three phases per frame: every layout READ, then all the maths, then every
     style WRITE. Interleaving a read after a write forces a synchronous layout,
     and with a dozen animated elements that is dozens of layouts per frame —
     which is what actually makes scroll-linked motion stutter. */
  var readers = [];
  var tickers = [];
  var writers = [];
  var lastT = 0;
  var running = false;

  function addReader(fn) { readers.push(fn); return fn; }
  function addTicker(fn) { tickers.push(fn); return fn; }
  function addWriter(fn) { writers.push(fn); return fn; }
  function removeTicker(fn) {
    [readers, tickers, writers].forEach(function (list) {
      var i = list.indexOf(fn);
      if (i > -1) list.splice(i, 1);
    });
  }
  function runPhase(list, dt, t) {
    for (var i = 0; i < list.length; i++) {
      try { list[i](dt, t); } catch (err) { /* one bad ticker must not kill the loop */ }
    }
  }
  /* Rolling frame cost, used to step canvas work down on hardware that cannot
     hold 60fps. Stepping down is permanent for the session: oscillating between
     tiers is more distracting than simply running lighter. */
  var Q = { avg: 16.7, tier: 1, checked: 0, samples: 0 };

  function frame(t) {
    if (!running) return;
    var dt = lastT ? Math.min(t - lastT, 64) : 16.7;
    lastT = t;
    Q.avg += (dt - Q.avg) * 0.045;
    Q.samples++;
    if (Q.samples > 90 && t - Q.checked > 2500) {
      Q.checked = t;
      if (Q.avg > 26 && Q.tier > 0.4) { Q.tier = Q.tier > 0.7 ? 0.62 : 0.4; }
    }
    runPhase(readers, dt, t);
    runPhase(tickers, dt, t);
    runPhase(writers, dt, t);
    requestAnimationFrame(frame);
  }
  function startLoop() {
    if (running) return;
    running = true; lastT = 0;
    requestAnimationFrame(frame);
  }
  function stopLoop() { running = false; }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stopLoop(); else startLoop();
  });

  /* ---------- 3. SHARED STATE (never triggers layout in tickers) ---------- */
  var S = {
    y: 0,            /* scrollY */
    yPrev: 0,
    vel: 0,          /* smoothed scroll velocity px/frame */
    progress: 0,     /* 0..1 document progress */
    vh: window.innerHeight,
    vw: window.innerWidth,
    max: 1,
    ySmooth: 0,      /* damped scroll — a wheel notch is a ~100px jump */
    progressSmooth: 0,
    px: 0, py: 0,    /* pointer, px */
    nx: 0.5, ny: 0.5,/* pointer normalised */
    sx: 0, sy: 0,    /* smoothed pointer */
    down: false
  };

  function measure() {
    S.vh = window.innerHeight;
    S.vw = window.innerWidth;
    S.max = Math.max(1, document.documentElement.scrollHeight - S.vh);
  }
  function readScroll() {
    S.y = window.scrollY || window.pageYOffset || 0;
    S.progress = clamp(S.y / S.max, 0, 1);
  }

  window.addEventListener("scroll", readScroll, { passive: true });
  window.addEventListener("resize", function () { measure(); readScroll(); }, { passive: true });
  window.addEventListener("pointermove", function (e) {
    S.px = e.clientX; S.py = e.clientY;
    S.nx = e.clientX / Math.max(1, S.vw);
    S.ny = e.clientY / Math.max(1, S.vh);
  }, { passive: true });
  window.addEventListener("pointerdown", function () { S.down = true; }, { passive: true });
  window.addEventListener("pointerup", function () { S.down = false; }, { passive: true });

  addTicker(function (dt) {
    var raw = S.y - S.yPrev;
    S.yPrev = S.y;
    S.vel = damp(S.vel, raw, 110, dt);
    S.ySmooth = damp(S.ySmooth, S.y, 55, dt);
    S.progressSmooth = damp(S.progressSmooth, S.progress, 55, dt);
    S.sx = damp(S.sx, S.px, 60, dt);
    S.sy = damp(S.sy, S.py, 60, dt);
  });

  /* ---------- 4. UTIL ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function on(el, ev, fn, opts) { if (el) el.addEventListener(ev, fn, opts); }

  /* ============================================================
     5. PRELOADER — boot sequence
     ============================================================ */
  function initBoot() {
    var boot = $("#boot");
    if (!boot) { document.body.setAttribute("data-booted", "true"); return Promise.resolve(); }

    var pct = $("#boot-pct", boot);
    var log = $("#boot-log", boot);
    var bar = $("#boot-bar i", boot);
    var slats = $$(".boot__slat", boot);
    var lines = [
      "INITIALISING RENDER TARGET",
      "COMPILING MOTION GRAPH",
      "LOADING TYPE — ANTON / INTER TIGHT",
      "PLOTTING CONSTELLATION ORIONIS",
      "CALIBRATING COLOUR SIGNAL",
      "SYSTEMS NOMINAL"
    ];

    document.body.setAttribute("data-locked", "true");

    if (REDUCED) {
      boot.hidden = true;
      document.body.removeAttribute("data-locked");
      document.body.setAttribute("data-booted", "true");
      return Promise.resolve();
    }

    return new Promise(function (resolve) {
      var v = 0;
      var target = 0;
      var stage = 0;
      var settled = false;
      var start = performance.now();

      /* real signals push the target forward; time is only the floor */
      var ready = Promise.all([
        document.fonts && document.fonts.ready ? document.fonts.ready.catch(function () {}) : Promise.resolve(),
        new Promise(function (r) {
          if (document.readyState === "complete") r();
          else window.addEventListener("load", r, { once: true });
        })
      ]);
      ready.then(function () { settled = true; });

      var tick = addTicker(function (dt, t) {
        var elapsed = t - start;
        var floor = clamp(elapsed / 1600, 0, 0.92) * 100;
        target = settled ? 100 : Math.max(target, floor);
        v = damp(v, target, 130, dt);
        if (target - v < 0.4 && target >= 100) v = 100;

        var shown = Math.floor(v);
        if (pct) pct.textContent = shown < 100 ? ("00" + shown).slice(-3) : "100";
        if (bar) bar.style.width = v.toFixed(2) + "%";

        var wantStage = clamp(Math.floor((v / 100) * lines.length), 0, lines.length - 1);
        if (wantStage !== stage) { stage = wantStage; if (log) log.textContent = lines[stage]; }

        if (v >= 99.6) {
          removeTicker(tick);
          if (log) log.textContent = lines[lines.length - 1];
          finish();
        }
      });

      function finish() {
        boot.setAttribute("data-done", "true");
        slats.forEach(function (s, i) {
          s.style.transition = "transform 0.62s cubic-bezier(0.7,0,0.2,1) " + i * 40 + "ms";
          s.style.transform = "scaleY(0)";
        });
        var core = $(".boot__core", boot);
        var foot = $(".boot__foot", boot);
        [core, foot].forEach(function (el) {
          if (!el) return;
          el.style.transition = "opacity 0.32s ease, transform 0.5s cubic-bezier(0.16,1,0.3,1)";
          el.style.opacity = "0";
          el.style.transform = "translateY(-14px)";
        });
        if (window.OrionAudio) window.OrionAudio.boot();
        window.setTimeout(function () {
          boot.hidden = true;
          document.body.removeAttribute("data-locked");
          document.body.setAttribute("data-booted", "true");
          resolve();
        }, 620 + slats.length * 40);
      }
    });
  }

  /* ============================================================
     6. CURSOR — stateful, blend-mode ring
     ============================================================ */
  function initCursor() {
    if (COARSE || REDUCED) return;
    var root = $("#cursor");
    if (!root) return;
    var dot = $(".cur__dot", root);
    var ring = $(".cur__ring", root);
    var label = $(".cur__label", root);

    var dx = S.vw / 2, dy = S.vh / 2;
    var rx = dx, ry = dy;
    var scale = 1;

    addTicker(function (dt) {
      dx = damp(dx, S.px, 22, dt);
      dy = damp(dy, S.py, 22, dt);
      rx = damp(rx, S.px, 78, dt);
      ry = damp(ry, S.py, 78, dt);
      scale = damp(scale, S.down ? 0.78 : 1, 70, dt);
      dot.style.transform = "translate3d(" + dx + "px," + dy + "px,0)";
      ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0) scale(" + scale.toFixed(3) + ")";
    });

    var shown = false;
    on(document, "pointermove", function () {
      if (shown) return;
      shown = true;
      document.body.setAttribute("data-cursor", "on");
    }, { passive: true });
    on(document, "pointerleave", function () {
      shown = false;
      document.body.removeAttribute("data-cursor");
    });

    function setState(state, text) {
      if (state) document.body.setAttribute("data-cursor-state", state);
      else document.body.removeAttribute("data-cursor-state");
      if (label) label.textContent = text || "";
    }

    /* delegate so dynamically added nodes work too */
    on(document, "pointerover", function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var cue = t.closest("[data-cursor-text]");
      if (cue) { setState(cue.getAttribute("data-cursor-state") || "view", cue.getAttribute("data-cursor-text")); return; }
      if (t.closest("input, textarea, select")) { setState("text", ""); return; }
      if (t.closest("a, button, [role='button'], label")) { setState("link", ""); return; }
      setState(null, "");
    }, { passive: true });
  }

  /* ============================================================
     7. MAGNETIC ELEMENTS
     ============================================================ */
  function initMagnetic() {
    if (COARSE || REDUCED) return;
    var els = $$("[data-magnetic]");
    if (!els.length) return;

    var items = els.map(function (el) {
      return {
        el: el,
        strength: parseFloat(el.getAttribute("data-magnetic")) || 0.34,
        radius: parseFloat(el.getAttribute("data-magnetic-radius")) || 110,
        x: 0, y: 0, tx: 0, ty: 0, live: true
      };
    });


    addReader(function () {
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        var r = it.el.getBoundingClientRect();
        it.live = !(r.bottom < -200 || r.top > S.vh + 200);
        if (!it.live) { it.tx = 0; it.ty = 0; continue; }
        var ddx = S.px - (r.left + r.width / 2);
        var ddy = S.py - (r.top + r.height / 2);
        var dist = Math.sqrt(ddx * ddx + ddy * ddy);
        var reach = Math.max(it.radius, Math.max(r.width, r.height) * 0.75);
        if (dist < reach) {
          var f = 1 - dist / reach;
          it.tx = ddx * it.strength * f;
          it.ty = ddy * it.strength * f;
        } else { it.tx = 0; it.ty = 0; }
      }
    });

    addWriter(function (dt) {
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        if (!it.live && it.x === 0 && it.y === 0) continue;
        it.x = damp(it.x, it.tx, 110, dt);
        it.y = damp(it.y, it.ty, 110, dt);
        if (Math.abs(it.x) < 0.02 && Math.abs(it.y) < 0.02) {
          if (it.x !== 0 || it.y !== 0) { it.x = 0; it.y = 0; it.el.style.transform = ""; }
        } else {
          it.el.style.transform = "translate3d(" + it.x.toFixed(2) + "px," + it.y.toFixed(2) + "px,0)";
        }
      }
    });

  }

  /* ============================================================
     8. NAV + DRAWER
     ============================================================ */
  function initNav() {
    var nav = $("#nav");
    if (!nav) return;
    var lastDir = 0;
    addWriter(function () {
      nav.setAttribute("data-stuck", String(S.y > 24));
      var open = $("#drawer") && $("#drawer").getAttribute("data-open") === "true";
      if (open) { nav.setAttribute("data-hidden", "false"); return; }
      var dir = S.vel > 1.4 ? 1 : S.vel < -1.4 ? -1 : lastDir;
      lastDir = dir;
      nav.setAttribute("data-hidden", String(dir === 1 && S.y > 460));
    });
  }

  function initDrawer() {
    var btn = $("#burger");
    var drawer = $("#drawer");
    if (!btn || !drawer) return;
    var links = $$("a, button", drawer);
    var lastFocus = null;

    function open() {
      lastFocus = document.activeElement;
      drawer.setAttribute("data-open", "true");
      drawer.removeAttribute("inert");
      btn.setAttribute("aria-expanded", "true");
      btn.setAttribute("aria-label", "Close navigation menu");
      document.body.setAttribute("data-locked", "true");
      if (window.OrionAudio) window.OrionAudio.open();
      window.setTimeout(function () { if (links[0]) links[0].focus(); }, 260);
    }
    function close(restore) {
      drawer.setAttribute("data-open", "false");
      drawer.setAttribute("inert", "");
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-label", "Open navigation menu");
      document.body.removeAttribute("data-locked");
      if (window.OrionAudio) window.OrionAudio.close();
      if (restore !== false && lastFocus && lastFocus.focus) lastFocus.focus();
    }

    drawer.setAttribute("inert", "");
    on(btn, "click", function () {
      if (drawer.getAttribute("data-open") === "true") close(); else open();
    });
    on(drawer, "click", function (e) {
      if (e.target.closest("a")) close(false);
    });
    on(document, "keydown", function (e) {
      if (e.key !== "Escape") return;
      if (drawer.getAttribute("data-open") === "true") { e.preventDefault(); close(); }
    });
    on(drawer, "keydown", function (e) {
      if (e.key !== "Tab" || drawer.getAttribute("data-open") !== "true") return;
      var f = links.filter(function (el) { return el.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    var mq = window.matchMedia("(min-width: 960px)");
    mq.addEventListener("change", function (e) { if (e.matches) close(false); });
  }

  /* ============================================================
     9. HUD READOUT + PROGRESS BAR
     ============================================================ */
  function initHud() {
    var bar = $("#progress i");
    var readY = $("#read-y");
    var readX = $("#read-x");
    var readP = $("#read-p");
    var readS = $("#read-sec");
    var idx = $("#hud-index");
    if (!bar && !readY) return;

    var sections = $$("main [data-sec]");
    var shownSec = "";

    var best = sections[0] || null;
    addReader(function () {
      if (!sections.length) return;
      best = sections[0];
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].getBoundingClientRect().top <= S.vh * 0.42) best = sections[i];
      }
    });

    addWriter(function () {
      /* the smoothed value keeps the bar from stepping with each wheel notch */
      if (bar) bar.style.transform = "scaleX(" + S.progressSmooth.toFixed(4) + ")";
      if (readP) readP.textContent = ("00" + Math.round(S.progress * 100)).slice(-3);
      if (readX) readX.textContent = S.nx.toFixed(3);
      if (readY) readY.textContent = S.ny.toFixed(3);

      if (!best) return;
      var name = best.getAttribute("data-sec");
      if (name !== shownSec) {
        shownSec = name;
        if (readS) readS.textContent = name;
        if (idx) idx.textContent = ("0" + (sections.indexOf(best) + 1)).slice(-2) + " / " + ("0" + sections.length).slice(-2);
        var zone = best.getAttribute("data-zone-set");
        if (zone) {
          document.documentElement.setAttribute("data-zone", zone);
          if (window.OrionAudio) window.OrionAudio.zone(zone);
        }
        var id = best.id;
        if (id) {
          $$("[data-nav-link]").forEach(function (a) {
            var href = a.getAttribute("href") || "";
            a.setAttribute("aria-current", href === "#" + id ? "true" : "false");
          });
        }
      }
    });
  }

  /* ============================================================
     10. KINETIC TEXT — split into masked words / chars
     ============================================================ */
  function splitKinetic(el) {
    if (el.getAttribute("data-kin-ready") === "true") return;
    var byChar = el.getAttribute("data-kin") === "char";
    var nodes = [];
    /* Never descend into a self-contained animation or screen-reader-only text.
       Wrapping the cycler's own words in masks desynchronised it from its track
       pitch and let neighbouring words bleed through. */
    var SKIP = "[data-kin-skip], .cycler, .sr-only";
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        var host = node.parentElement;
        if (host && host.closest(SKIP)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n;
    while ((n = walker.nextNode())) { nodes.push(n); }

    var counter = 0;
    nodes.forEach(function (textNode) {
      var parts = textNode.nodeValue.split(/(\s+)/);
      var frag = document.createDocumentFragment();
      parts.forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        var mask = document.createElement("span");
        mask.className = "kw";
        var inner = document.createElement("i");
        if (byChar) {
          for (var c = 0; c < part.length; c++) {
            var b = document.createElement("b");
            b.textContent = part[c];
            b.style.setProperty("--i", counter++);
            inner.appendChild(b);
          }
        } else {
          inner.textContent = part;
        }
        mask.style.setProperty("--i", byChar ? 0 : counter++);
        mask.appendChild(inner);
        frag.appendChild(mask);
      });
      textNode.parentNode.replaceChild(frag, textNode);
    });

    if (byChar) {
      $$(".kw > i > b", el).forEach(function (b, i) {
        b.style.transitionDelay = i * 26 + "ms";
      });
    }
    el.classList.add("kin");
    el.setAttribute("data-kin-ready", "true");
  }

  /* ============================================================
     11. REVEAL OBSERVER
     ============================================================ */
  function initReveals() {
    var targets = $$("[data-kin], .rv, .wipe, .draw-rule, .draw-svg, .std, [data-count], [data-stagger]");
    if (!targets.length) return;

    /* prep svg dash lengths so the draw animation has a real length */
    $$(".draw-svg").forEach(function (svg) {
      $$("path, line, circle, rect, polyline", svg).forEach(function (shape, i) {
        var len = 0;
        try { len = shape.getTotalLength ? shape.getTotalLength() : 0; } catch (e) { len = 0; }
        if (!len) {
          var bb = shape.getBBox ? shape.getBBox() : { width: 100, height: 100 };
          len = (bb.width + bb.height) * 2 || 400;
        }
        shape.style.setProperty("--len", Math.ceil(len + 2));
        shape.style.setProperty("--i", i);
      });
    });

    $$("[data-kin]").forEach(splitKinetic);

    $$("[data-stagger]").forEach(function (group) {
      Array.prototype.forEach.call(group.children, function (child, i) {
        child.classList.add("rv");
        child.style.setProperty("--d", i * (parseInt(group.getAttribute("data-stagger"), 10) || 70));
      });
    });

    function show(el) {
      el.setAttribute("data-in", "true");
      if (el.hasAttribute("data-count")) runCounter(el);
    }

    /* anything already in view at load paints immediately — an element held at
       opacity:0 does not count as painted, which wrecks LCP */
    var deferred = [];
    targets.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (REDUCED) { show(el); return; }
      if (r.top < S.vh * 0.94 && r.bottom > 0) {
        el.classList.add("rv--instant");
        show(el);
        window.setTimeout(function () { el.classList.remove("rv--instant"); }, 60);
      } else {
        deferred.push(el);
      }
    });

    if (!deferred.length || REDUCED) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        show(entry.target);
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });
    deferred.forEach(function (el) { io.observe(el); });
  }

  /* ============================================================
     12. TEXT SCRAMBLE
     ============================================================ */
  var GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\<>*#%@+=-_:.";
  function scrambleTo(el, finalText, duration) {
    if (REDUCED) { el.textContent = finalText; return; }
    if (el._scrambleTicker) { removeTicker(el._scrambleTicker); el._scrambleTicker = null; }
    var dur = duration || 620;
    var start = performance.now();
    var len = finalText.length;
    var seeds = [];
    for (var i = 0; i < len; i++) seeds.push(Math.random() * 0.55);

    el._scrambleTicker = addTicker(function (dt, t) {
      var p = clamp((t - start) / dur, 0, 1);
      var out = "";
      for (var i = 0; i < len; i++) {
        var ch = finalText[i];
        if (ch === " ") { out += " "; continue; }
        var reveal = seeds[i] + 0.45;
        if (p >= reveal) out += ch;
        else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      el.textContent = out;
      if (p >= 1) {
        el.textContent = finalText;
        removeTicker(el._scrambleTicker);
        el._scrambleTicker = null;
      }
    });
  }

  function initScramble() {
    $$("[data-scramble]").forEach(function (el) {
      var final = el.textContent.trim();
      el.setAttribute("data-text", final);
      var host = el.closest("[data-scramble-host]") || el;
      var busy = false;
      on(host, "pointerenter", function () {
        if (busy) return;
        busy = true;
        scrambleTo(el, final, 560);
        window.setTimeout(function () { busy = false; }, 600);
      });
      on(host, "focusin", function () { if (!busy) { busy = true; scrambleTo(el, final, 560); window.setTimeout(function () { busy = false; }, 600); } });
    });

    /* on-view scramble for mono labels */
    var onView = $$("[data-scramble-in]");
    if (!onView.length || REDUCED) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        scrambleTo(e.target, e.target.textContent.trim(), 700);
        io.unobserve(e.target);
      });
    }, { threshold: 0.6 });
    onView.forEach(function (el) { io.observe(el); });
  }

  /* ============================================================
     13. COUNTERS
     ============================================================ */
  function runCounter(el) {
    var node = $("[data-count-val]", el) || el;
    var target = parseFloat(el.getAttribute("data-count"));
    if (isNaN(target)) return;
    var decimals = parseInt(el.getAttribute("data-count-dec"), 10) || 0;
    var pad = parseInt(el.getAttribute("data-count-pad"), 10) || 0;
    var dur = parseInt(el.getAttribute("data-count-dur"), 10) || 1500;

    function render(v) {
      var s = v.toFixed(decimals);
      if (pad) {
        var intPart = s.split(".")[0];
        while (intPart.length < pad) { s = "0" + s; intPart = "0" + intPart; }
      }
      node.textContent = s;
    }

    if (REDUCED) { render(target); return; }
    var start = performance.now();
    var tick = addTicker(function (dt, t) {
      var p = clamp((t - start) / dur, 0, 1);
      var e = 1 - Math.pow(1 - p, 3);
      render(target * e);
      if (p >= 1) { render(target); removeTicker(tick); }
    });
  }

  /* ============================================================
     14. WORD CYCLER
     ============================================================ */
  function initCycler() {
    var el = $("#cycler");
    if (!el) return;
    var track = $(".cycler__track", el);
    var items = $$(".cycler__item", el);
    if (items.length < 2) return;

    /* width follows the active word so the headline reflows honestly */
    /* Split so the measurement lands in the read phase and the width in the
       write phase — the interval below fires between frames, and measuring
       there would force a layout after that frame's writes. */
    var wantSize = -1, nextWidth = -1;
    function sizeTo(i) { wantSize = i; }
    addReader(function () {
      if (wantSize < 0) return;
      var probe = items[wantSize];
      /* Computed style, not getBoundingClientRect: the headline sits inside a
         perspective layer, so a client rect comes back scaled by the 3D
         transform and the error accumulates across steps. */
      var cs = getComputedStyle(probe);
      /* italics overhang their advance width, so the mask needs a buffer or the
         last letter is sheared off */
      var pad = parseFloat(getComputedStyle(el).fontSize) * 0.15;
      nextWidth = parseFloat(cs.width) + pad;
      wantSize = -1;
    });
    addWriter(function () {
      if (nextWidth < 0) return;
      el.style.width = nextWidth + "px";
      nextWidth = -1;
    });
    var idx = 0;
    el.style.transition = "width 0.85s cubic-bezier(0.76,0,0.24,1)";
    sizeTo(0);
    window.addEventListener("resize", function () { sizeTo(idx); step(); }, { passive: true });

    /* Measure the real item height rather than hard-coding the em step. A
       hard-coded step silently desynchronises the moment the CSS height
       changes, leaving the previous word half-visible above the current one. */
    var stepPx = 0, needStep = true;
    function step() { needStep = true; }
    addReader(function () {
      if (!needStep) return;
      stepPx = parseFloat(getComputedStyle(items[0]).height) || 0;
      if (stepPx) needStep = false;
    });

    if (REDUCED) return;
    window.setInterval(function () {
      if (document.hidden) return;
      idx = (idx + 1) % items.length;
      if (!stepPx) return;
      track.style.transform = "translateY(-" + (idx * stepPx).toFixed(2) + "px)";
      sizeTo(idx);
    }, 2600);
  }

  /* ============================================================
     15. MARQUEE — velocity reactive, seamless
     ============================================================ */
  function initMarquees() {
    var marqs = $$("[data-marquee]");
    if (!marqs.length) return;

    marqs.forEach(function (marq) {
      var track = $(".marq__track", marq);
      var group = $(".marq__grp", track);
      if (!track || !group) return;

      var dir = marq.getAttribute("data-marquee") === "rtl" ? -1 : 1;
      var baseSpeed = parseFloat(marq.getAttribute("data-marquee-speed")) || 0.055;
      var offset = 0;
      var groupW = 0;
      var clones = [];

      function build() {
        clones.forEach(function (c) { c.remove(); });
        clones = [];
        groupW = group.getBoundingClientRect().width;
        if (!groupW) return;
        var need = Math.ceil(S.vw / groupW) + 1;
        for (var i = 0; i < need; i++) {
          var c = group.cloneNode(true);
          c.setAttribute("aria-hidden", "true");
          track.appendChild(c);
          clones.push(c);
        }
      }
      build();
      window.addEventListener("resize", build, { passive: true });

      if (REDUCED) return;
      var live = false, boost = 0;
      addReader(function () {
        if (!groupW) build();
        var r = marq.getBoundingClientRect();
        live = !(r.bottom < -100 || r.top > S.vh + 100);
      });
      addWriter(function (dt) {
        if (!live || !groupW) return;
        /* speed reacts to scroll velocity, but no skew: skewing a full-width
           strip re-rasterises it every frame for very little visual gain */
        boost = damp(boost, clamp(Math.abs(S.vel) * 0.06, 0, 2.6), 130, dt);
        offset -= dir * (baseSpeed + baseSpeed * boost) * dt;
        if (offset <= -groupW) offset += groupW;
        if (offset > 0) offset -= groupW;
        track.style.transform = "translate3d(" + offset.toFixed(2) + "px,0,0)";
      });
    });
  }

  /* ============================================================
     16. PARALLAX
     ============================================================ */
  function initParallax() {
    if (REDUCED) return;
    var els = $$("[data-parallax]");
    if (!els.length) return;
    var items = els.map(function (el) {
      return {
        el: el,
        amt: parseFloat(el.getAttribute("data-parallax")) || 0.12,
        rot: parseFloat(el.getAttribute("data-parallax-rot")) || 0,
        cur: 0, delta: 0, live: false
      };
    });
    addReader(function () {
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        var r = it.el.getBoundingClientRect();
        it.live = !(r.bottom < -300 || r.top > S.vh + 300);
        if (!it.live) continue;
        it.delta = (r.top + r.height / 2 - S.vh / 2) / S.vh;
      }
    });

    addWriter(function (dt) {
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        if (!it.live) continue;
        it.cur = damp(it.cur, -it.delta * it.amt * S.vh, 80, dt);
        var t = "translate3d(0," + it.cur.toFixed(2) + "px,0)";
        if (it.rot) t += " rotate(" + (it.delta * it.rot).toFixed(2) + "deg)";
        it.el.style.transform = t;
      }
    });
  }

  /* ============================================================
     17. TILT
     ============================================================ */
  function initTilt() {
    if (COARSE || REDUCED) return;
    $$("[data-tilt]").forEach(function (el) {
      var max = parseFloat(el.getAttribute("data-tilt")) || 5;
      var rx = 0, ry = 0, tx = 0, ty = 0, active = false;
      var box = null;
      on(el, "pointerenter", function () { active = true; });
      on(el, "pointerleave", function () { active = false; tx = 0; ty = 0; box = null; });

      /* The rect is measured in the read phase, not in the pointermove handler.
         A handler that measures runs between frames and lands after the frame's
         writes, which is exactly the forced layout the phasing exists to avoid. */
      addReader(function () {
        if (!active) return;
        var r = el.getBoundingClientRect();
        box = r;
        tx = ((S.py - r.top) / r.height - 0.5) * -2 * max;
        ty = ((S.px - r.left) / r.width - 0.5) * 2 * max;
      });

      addWriter(function (dt) {
        if (!active && Math.abs(rx) < 0.01 && Math.abs(ry) < 0.01) return;
        rx = damp(rx, tx, 110, dt);
        ry = damp(ry, ty, 110, dt);
        el.style.transform = "perspective(900px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg)";
      });
    });
  }

  /* ============================================================
     18. GENERATIVE ART — hero flow field
     ============================================================ */
  function initFlowField() {
    var canvas = $("#flow");
    if (!canvas) return;
    var ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    var host = canvas.parentElement;
    var dpr = 1;
    var W = 0, H = 0;
    var particles = [];
    var COUNT = REDUCED ? 0 : LOWTIER ? 260 : 760;
    var lastTier = 1;

    var PALETTE = [
      [233, 201, 121],  /* gold    */
      [76, 141, 255],   /* blue    */
      [169, 123, 255],  /* violet  */
      [63, 217, 192],   /* teal    */
      [255, 111, 176],  /* magenta */
      [255, 122, 69],   /* flare   */
      [217, 255, 74]    /* acid    */
    ];
    /* weighted so gold and violet carry the field and the hotter hues punctuate */
    function pickColour(i) {
      var r = hash2(i * 7.13, i * 3.71);
      if (r > 0.97) return PALETTE[6];
      if (r > 0.93) return PALETTE[5];
      if (r > 0.86) return PALETTE[4];
      if (r > 0.74) return PALETTE[3];
      if (r > 0.55) return PALETTE[2];
      if (r > 0.30) return PALETTE[1];
      return PALETTE[0];
    }

    function resize() {
      var r = host.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, LOWTIER ? 1 : 1.5);
      W = Math.max(1, Math.round(r.width));
      H = Math.max(1, Math.round(r.height));
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#06060a";
      ctx.fillRect(0, 0, W, H);
      spawn();
    }

    function reseed(p, i) {
      p.x = hash2(i * 1.7 + seedShift, i * 9.1) * W;
      p.y = hash2(i * 4.3, i * 2.9 + seedShift) * H;
      p.px = p.x; p.py = p.y;
      p.life = 60 + hash2(i * 5.5, seedShift) * 220;
      p.age = 0;
    }
    var seedShift = 0;

    function spawn() {
      particles.length = 0;
      var n = Math.round(COUNT * Q.tier * clamp((W * H) / (1440 * 800), 0.35, 1.25));
      for (var i = 0; i < n; i++) {
        var p = { x: 0, y: 0, px: 0, py: 0, life: 0, age: 0, c: pickColour(i), w: hash2(i, 11.3) > 0.9 ? 1.6 : 0.85 };
        reseed(p, i);
        particles.push(p);
      }
    }

    if (REDUCED) {
      /* one static plot rather than a blank rectangle */
      resize();
      COUNT = 260; spawn();
      for (var s = 0; s < 90; s++) step(16.7, s * 16.7, true);
      return;
    }

    var visible = true;
    var hostLeft = 0, hostTop = 0;
    var io = new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }, { threshold: 0 });
    io.observe(host);

    function step(dt, t, silent) {
      var time = t * 0.00013;
      ctx.fillStyle = "rgba(6,6,10,0.035)";
      ctx.fillRect(0, 0, W, H);

      var mx = 0, my = 0;
      if (!silent) { mx = S.sx - hostLeft; my = S.sy - hostTop; }
      var scrollWarp = S.ySmooth * 0.0009;

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        var nx = p.x * 0.0021;
        var ny = p.y * 0.0021 + scrollWarp;
        var a = (fbm(nx, ny + time * 6) * 2.2 + Math.sin(nx * 2.1 - time * 4) * 0.6) * Math.PI * 2;

        var vx = Math.cos(a);
        var vy = Math.sin(a);

        if (!silent) {
          var ddx = p.x - mx, ddy = p.y - my;
          var d2 = ddx * ddx + ddy * ddy;
          if (d2 < 34000 && d2 > 0.01) {
            var d = Math.sqrt(d2);
            var force = (1 - d / 185) * 3.2;
            vx += (ddx / d) * force;
            vy += (ddy / d) * force;
          }
        }

        p.px = p.x; p.py = p.y;
        var sp = 0.62 * (dt / 16.7);
        p.x += vx * sp;
        p.y += vy * sp;
        p.age += dt / 16.7;

        if (p.x < -8 || p.x > W + 8 || p.y < -8 || p.y > H + 8 || p.age > p.life) {
          seedShift += 0.013;
          reseed(p, i);
          continue;
        }

        var fade = Math.sin((p.age / p.life) * Math.PI);
        ctx.strokeStyle = "rgba(" + p.c[0] + "," + p.c[1] + "," + p.c[2] + "," + (0.62 * fade).toFixed(3) + ")";
        ctx.lineWidth = p.w;
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
    }

    addReader(function () {
      if (!visible) return;
      var r = host.getBoundingClientRect();
      hostLeft = r.left; hostTop = r.top;
    });
    addWriter(function (dt, t) {
      if (!visible) return;
      if (Q.tier !== lastTier) { lastTier = Q.tier; spawn(); }
      step(dt, t, false);
    });
    window.addEventListener("resize", resize, { passive: true });
    resize();
  }

  /* ============================================================
     19. GENERATIVE ART — ASCII constellation (Orionis)
     ============================================================ */
  function initAscii() {
    var pre = $("#ascii");
    if (!pre) return;

    /* x right, y up, z depth — plate coordinates of the real constellation */
    var STARS = [
      { n: "BETELGEUSE", x: -0.55, y: 0.62, z: 0.16, m: 0.5 },
      { n: "BELLATRIX", x: 0.52, y: 0.72, z: -0.14, m: 1.6 },
      { n: "ALNITAK", x: -0.28, y: 0.02, z: 0.06, m: 1.7 },
      { n: "ALNILAM", x: 0.00, y: 0.09, z: 0.00, m: 1.7 },
      { n: "MINTAKA", x: 0.28, y: 0.15, z: -0.06, m: 2.2 },
      { n: "SAIPH", x: -0.50, y: -0.72, z: 0.11, m: 2.1 },
      { n: "RIGEL", x: 0.62, y: -0.68, z: -0.18, m: 0.1 },
      { n: "MEISSA", x: 0.02, y: 1.04, z: 0.02, m: 3.4 },
      { n: "M42", x: -0.04, y: -0.30, z: 0.03, m: 4.0 }
    ];
    var LINKS = [[0, 1], [0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6], [5, 6], [7, 0], [7, 1], [3, 8]];
    var STAR_CH = ["@", "#", "*", "+", "o", ".", "."];

    var frameW = (pre.parentElement || pre).getBoundingClientRect().width || 420;
    var wantRows = parseInt(pre.getAttribute("data-rows"), 10) || 0;
    var COLS = clamp(Math.round(frameW / (wantRows ? 9.5 : 7.4)), 44, wantRows ? 190 : 86);
    var ROWS = wantRows || Math.round(COLS * 0.52);
    var buf = new Array(COLS * ROWS);
    var yaw = 0, pitch = 0;
    var lastPaint = 0;

    function project(s, cy, sy, cp, sp) {
      var x1 = s.x * cy - s.z * sy;
      var z1 = s.x * sy + s.z * cy;
      var y1 = s.y * cp - z1 * sp;
      var z2 = s.y * sp + z1 * cp;
      var d = 3.4;
      var f = d / (d + z2);
      return { x: x1 * f, y: y1 * f, s: f };
    }
    /* one shared unit for both axes, doubled horizontally because a character
       cell is about twice as tall as it is wide. Without this the figure
       stretches to whatever the container's aspect happens to be. */
    function toGrid(p) {
      var unit = (ROWS - 1) * 0.46;
      return {
        c: Math.round(COLS / 2 + p.x * unit * 2.05),
        r: Math.round(ROWS / 2 - p.y * unit),
        s: p.s
      };
    }
    function put(c, r, ch, weight) {
      if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return;
      var i = r * COLS + c;
      var cur = buf[i];
      if (!cur || weight >= cur.w) buf[i] = { ch: ch, w: weight };
    }
    function line(a, b) {
      var dx = Math.abs(b.c - a.c), dy = Math.abs(b.r - a.r);
      var sx = a.c < b.c ? 1 : -1, sy = a.r < b.r ? 1 : -1;
      var err = dx - dy, c = a.c, r = a.r, guard = 0;
      var ch = dx > dy * 2 ? "-" : dy > dx * 2 ? "|" : (b.c - a.c) * (b.r - a.r) > 0 ? "\\" : "/";
      while (guard++ < 400) {
        put(c, r, ch, 1);
        if (c === b.c && r === b.r) break;
        var e2 = 2 * err;
        if (e2 > -dy) { err -= dy; c += sx; }
        if (e2 < dx) { err += dx; r += sy; }
      }
    }

    function paint(t) {
      for (var i = 0; i < buf.length; i++) buf[i] = null;

      /* faint deterministic starfield */
      for (var k = 0; k < COLS * ROWS * 0.07; k++) {
        var h = hash2(k * 3.1, k * 7.7);
        var h2 = hash2(k * 5.3, k * 1.9);
        put(Math.floor(h * COLS), Math.floor(h2 * ROWS), h > 0.5 ? "." : "`", 0);
      }

      var cy = Math.cos(yaw), sy = Math.sin(yaw);
      var cp = Math.cos(pitch), sp = Math.sin(pitch);
      var pts = STARS.map(function (s) { return toGrid(project(s, cy, sy, cp, sp)); });

      for (var l = 0; l < LINKS.length; l++) line(pts[LINKS[l][0]], pts[LINKS[l][1]]);

      for (var s2 = 0; s2 < STARS.length; s2++) {
        var st = STARS[s2];
        var g = pts[s2];
        var idx = clamp(Math.round(st.m * 1.25 - (g.s - 1) * 4), 0, STAR_CH.length - 1);
        put(g.c, g.r, STAR_CH[idx], 3);
        if (st.m < 1.8) {
          put(g.c - 1, g.r, "-", 2); put(g.c + 1, g.r, "-", 2);
        }
      }

      var out = "";
      for (var r2 = 0; r2 < ROWS; r2++) {
        for (var c2 = 0; c2 < COLS; c2++) {
          var cell = buf[r2 * COLS + c2];
          out += cell ? cell.ch : " ";
        }
        if (r2 < ROWS - 1) out += "\n";
      }
      pre.textContent = out;
    }

    /* paint once up front: an empty <pre> has no height, so an observer watching
       it would never report it visible and it could never paint itself into being */
    yaw = 0.25; pitch = 0.1;
    paint(0);
    if (REDUCED) return;

    var visible = true;
    var io = new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }, { threshold: 0 });
    io.observe(pre.parentElement || pre);

    var tYaw = 0, tPitch = 0;
    addTicker(function (dt, t) {
      if (!visible) return;
      tYaw += dt * 0.00016;
      var targetYaw = tYaw + (S.nx - 0.5) * 0.85;
      var targetPitch = (S.ny - 0.5) * -0.55 + S.progress * 0.5;
      yaw = damp(yaw, targetYaw, 180, dt);
      pitch = damp(pitch, targetPitch, 180, dt);
      if (t - lastPaint < 45 / Q.tier) return;   /* ~22fps is plenty for text-mode art */
      lastPaint = t;
      paint(t);
    });
  }

  /* ============================================================
     20. GENERATIVE ART — halftone plates
     ============================================================ */
  function initHalftone() {
    var plates = $$("[data-halftone]");
    if (!plates.length) return;

    plates.forEach(function (canvas, index) {
      var ctx = canvas.getContext("2d");
      if (!ctx) return;
      var host = canvas.parentElement;
      var seed = parseFloat(canvas.getAttribute("data-halftone")) || index + 1;
      var tint = (canvas.getAttribute("data-tint") || "59,130,246").trim();
      var mode = canvas.getAttribute("data-mode") || "dots";
      var W = 0, H = 0, dpr = 1;
      var cell = LOWTIER ? 13 : 10;
      var hover = 0, hoverT = 0;

      function resize() {
        var r = host.getBoundingClientRect();
        if (!r.width || !r.height) return;
        dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        W = Math.round(r.width); H = Math.round(r.height);
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      function field(x, y, t) {
        var nx = x / W, ny = y / H;
        var v = fbm(nx * 3.2 + seed * 4.7, ny * 3.2 + seed * 2.1 + t * 0.22);
        v += 0.34 * Math.sin((nx * 6.5 + ny * 2.2 + seed) * Math.PI + t * 0.8);
        var edge = 1 - Math.pow(Math.abs(ny - 0.5) * 2, 2.1) * 0.75;
        return clamp(v * 0.72 * edge, 0, 1);
      }

      var hostLeft = 0, hostTop = 0;
      function draw(t) {
        if (!W) return;
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = "#08080d";
        ctx.fillRect(0, 0, W, H);

        var time = t * 0.0004;
        var mx = S.sx - hostLeft, my = S.sy - hostTop;

        for (var y = cell * 0.5; y < H; y += cell) {
          for (var x = cell * 0.5; x < W; x += cell) {
            var v = field(x, y, time);
            if (hover > 0.01) {
              var dx = x - mx, dy = y - my;
              var d = Math.sqrt(dx * dx + dy * dy);
              v += hover * clamp(1 - d / 170, 0, 1) * 0.55;
            }
            v = clamp(v, 0, 1);
            if (v < 0.08) continue;
            var alpha = 0.16 + v * 0.72;
            if (mode === "bars") {
              ctx.fillStyle = "rgba(" + tint + "," + (alpha * 0.85).toFixed(3) + ")";
              ctx.fillRect(x - cell * 0.5, y - 0.5, cell * v * 1.6, Math.max(1, cell * 0.18));
            } else if (mode === "cross") {
              var len = v * cell * 0.62;
              ctx.strokeStyle = "rgba(" + tint + "," + alpha.toFixed(3) + ")";
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(x - len, y); ctx.lineTo(x + len, y);
              ctx.moveTo(x, y - len); ctx.lineTo(x, y + len);
              ctx.stroke();
            } else {
              var rad = v * cell * 0.52;
              ctx.fillStyle = "rgba(" + tint + "," + alpha.toFixed(3) + ")";
              ctx.beginPath();
              ctx.arc(x, y, rad, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      resize();
      window.addEventListener("resize", resize, { passive: true });

      if (REDUCED) { draw(2400); return; }

      on(host, "pointerenter", function () { hoverT = 1; });
      on(host, "pointerleave", function () { hoverT = 0; });

      var visible = false;
      var io = new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }, { threshold: 0 });
      io.observe(host);
      var last = 0;
      addReader(function () {
        if (!visible) return;
        if (!W) resize();
        if (hover < 0.01) return;
        var r = host.getBoundingClientRect();
        hostLeft = r.left; hostTop = r.top;
      });
      addWriter(function (dt, t) {
        hover = damp(hover, hoverT, 140, dt);
        if (!visible) return;
        if (t - last < (LOWTIER ? 66 : 33) / Q.tier) return;   /* 15–30fps: plenty for a plate */
        last = t;
        draw(t);
      });
    });
  }

  /* ============================================================
     21. THE ORION METHOD — pinned, scroll-driven
     ============================================================ */
  function initMethod() {
    var track = $("#method-track");
    if (!track) return;
    var nums = $$(".method__num");
    var panels = $$(".method__panel");
    var ticks = $$(".method__tick");
    var n = panels.length;
    if (!n) return;

    if (REDUCED) {
      panels.forEach(function (p) { p.setAttribute("data-active", "true"); });
      ticks.forEach(function (t) { t.setAttribute("data-fill", "true"); });
      return;
    }

    var current = -1;
    var frac = -1;
    addReader(function () {
      var r = track.getBoundingClientRect();
      if (r.bottom < 0 || r.top > S.vh) { frac = -1; return; }
      frac = clamp(-r.top / Math.max(1, r.height - S.vh), 0, 1) * n;
    });

    addWriter(function () {
      if (frac < 0) return;
      var f = frac;
      var i = clamp(Math.floor(f - 0.0001), 0, n - 1);

      for (var j = 0; j < ticks.length; j++) {
        ticks[j].setAttribute("data-fill", String(f > j + 0.08));
      }
      if (i === current) return;
      current = i;
      for (var k = 0; k < n; k++) {
        panels[k].setAttribute("data-active", String(k === i));
        panels[k].setAttribute("aria-hidden", String(k !== i));
        if (nums[k]) {
          nums[k].setAttribute("data-active", String(k === i));
          nums[k].setAttribute("data-past", String(k < i));
        }
      }
    });
  }

  /* ============================================================
     22. WORK — horizontal scroll lane
     ============================================================ */
  function initWorkScroll() {
    var track = $("#work-track");
    var lane = $("#work-lane");
    if (!track || !lane) return;

    if (REDUCED) { track.style.height = "auto"; return; }

    var shift = 0, target = 0, maxShift = 0;

    function measureLane() {
      maxShift = Math.max(0, lane.scrollWidth - S.vw + 16);
      /* pin length scales with how much lane there is to travel */
      var vhNeeded = clamp(100 + (maxShift / Math.max(1, S.vw)) * 105, 160, 460);
      track.style.height = vhNeeded + "svh";
    }
    measureLane();
    window.addEventListener("resize", measureLane, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureLane).catch(function () {});

    var laneLive = false;
    addReader(function () {
      var r = track.getBoundingClientRect();
      laneLive = !(r.bottom < -50 || r.top > S.vh + 50);
      if (laneLive) target = -clamp(-r.top / Math.max(1, r.height - S.vh), 0, 1) * maxShift;
    });

    addWriter(function (dt) {
      if (!laneLive) return;
      shift = damp(shift, target, 75, dt);
      lane.style.transform = "translate3d(" + shift.toFixed(2) + "px,0,0)";
    });
  }

  /* ============================================================
     23. CONTACT FORM
     ============================================================ */
  function initForm() {
    var form = $("#brief");
    if (!form) return;
    var alertBox = $("#brief-alert");
    var success = $("#brief-success");
    var out = $("#brief-out");
    var mailBtn = $("#brief-mail");
    var resetBtn = $("#brief-reset");
    var INBOX = "studio@orion.build";

    var fields = $$(".field", form);
    fields.forEach(function (field) {
      var input = $(".field__input, .field__area, .field__select", field);
      if (!input) return;
      function sync() { field.setAttribute("data-filled", String(!!input.value)); }
      on(input, "input", function () { sync(); clearError(field); });
      on(input, "change", sync);
      on(input, "blur", sync);
      sync();
    });

    function setError(field, msg) {
      field.setAttribute("data-invalid", "true");
      var input = $(".field__input, .field__area, .field__select", field);
      var err = $(".field__err", field);
      if (input) input.setAttribute("aria-invalid", "true");
      if (err) err.textContent = msg;
    }
    function clearError(field) {
      field.removeAttribute("data-invalid");
      var input = $(".field__input, .field__area, .field__select", field);
      var err = $(".field__err", field);
      if (input) input.setAttribute("aria-invalid", "false");
      if (err) err.textContent = "";
    }

    function validate() {
      var problems = [];
      fields.forEach(function (field) {
        var input = $(".field__input, .field__area, .field__select", field);
        if (!input || !input.required) return;
        var v = (input.value || "").trim();
        clearError(field);
        if (!v) { setError(field, "Required"); problems.push(field); return; }
        if (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
          setError(field, "Enter a valid business email"); problems.push(field); return;
        }
        if (input.id === "brief-details" && v.length < 24) {
          setError(field, "A little more detail, please (24+ characters)"); problems.push(field);
        }
      });
      return problems;
    }

    function typeOut(node, text) {
      if (REDUCED) { node.textContent = text; return; }
      node.textContent = "";
      var i = 0;
      var chunk = Math.max(2, Math.round(text.length / 90));
      var tick = addTicker(function () {
        i = Math.min(text.length, i + chunk);
        node.textContent = text.slice(0, i);
        if (i >= text.length) removeTicker(tick);
      });
    }

    on(form, "submit", function (e) {
      e.preventDefault();
      var problems = validate();
      if (problems.length) {
        if (alertBox) {
          alertBox.hidden = false;
          alertBox.textContent = problems.length + (problems.length === 1 ? " field needs attention." : " fields need attention.");
        }
        if (window.OrionAudio) window.OrionAudio.error();
        var first = $(".field__input, .field__area, .field__select", problems[0]);
        if (first) first.focus();
        return;
      }
      if (alertBox) alertBox.hidden = true;

      var data = new FormData(form);
      var name = (data.get("name") || "").toString().trim();
      var email = (data.get("email") || "").toString().trim();
      var company = (data.get("company") || "").toString().trim();
      var budget = (data.get("budget") || "").toString().trim();
      var details = (data.get("details") || "").toString().trim();

      var body = [
        "ORION — PROJECT BRIEF",
        "=====================",
        "",
        "NAME:     " + name,
        "EMAIL:    " + email,
        "COMPANY:  " + (company || "—"),
        "BUDGET:   " + budget,
        "",
        "DETAILS",
        "-------",
        details,
        "",
        "-- assembled by orion.build --"
      ].join("\n");

      var href = "mailto:" + INBOX +
        "?subject=" + encodeURIComponent("Project brief — " + (company || name)) +
        "&body=" + encodeURIComponent(body);

      if (mailBtn) mailBtn.setAttribute("href", href);
      form.hidden = true;
      if (window.OrionAudio) window.OrionAudio.success();
      if (success) {
        success.hidden = false;
        success.focus();
      }
      if (out) typeOut(out, body);
    });

    on(resetBtn, "click", function () {
      if (success) success.hidden = true;
      form.hidden = false;
      var first = $(".field__input", form);
      if (first) first.focus();
    });
  }

  /* ============================================================
     24. PAGE TRANSITION CURTAIN
     ============================================================ */
  function initCurtain() {
    var curtain = $("#curtain");
    if (!curtain) return;
    var word = $(".curtain__word", curtain);

    /* entry sweep */
    if (!REDUCED) {
      curtain.setAttribute("data-state", "in");
      window.setTimeout(function () { curtain.setAttribute("data-state", "idle"); }, 950);
    }

    if (REDUCED) return;

    on(document, "click", function (e) {
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a) return;
      if (a.target === "_blank" || a.hasAttribute("download")) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      var url;
      try { url = new URL(a.href, location.href); } catch (err) { return; }
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.hash) return;   /* in-page anchor */
      if (url.href === location.href) return;
      if (/^(mailto|tel):/i.test(a.getAttribute("href") || "")) return;

      e.preventDefault();
      if (word) word.textContent = (a.getAttribute("data-curtain") || "Orion");
      if (window.OrionAudio) window.OrionAudio.whoosh();
      curtain.setAttribute("data-state", "out");
      window.setTimeout(function () { location.href = url.href; }, 640);
    });

    /* bfcache restore must not leave the curtain down */
    window.addEventListener("pageshow", function (ev) {
      if (ev.persisted) curtain.setAttribute("data-state", "idle");
    });
  }

  /* ============================================================
     25. SMOOTH ANCHORS
     ============================================================ */
  function initAnchors() {
    on(document, "click", function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.getElementById(id.slice(1));
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + S.y - 84;
      window.scrollTo({ top: top, behavior: REDUCED ? "auto" : "smooth" });
      history.replaceState(null, "", id);
      window.setTimeout(function () {
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }, REDUCED ? 0 : 620);
    });
  }

  /* ============================================================
     26. SUNDRIES
     ============================================================ */
  function initYear() {
    $$("[data-year]").forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
  }

  function initClock() {
    var el = $("#hud-clock");
    if (!el) return;
    function paint() {
      var d = new Date();
      var utc = ("0" + d.getUTCHours()).slice(-2) + ":" + ("0" + d.getUTCMinutes()).slice(-2) + ":" + ("0" + d.getUTCSeconds()).slice(-2);
      el.textContent = utc + " UTC";
    }
    paint();
    window.setInterval(paint, 1000);
  }

  function initBeltLogo() {
    if (COARSE || REDUCED) return;
    $$("[data-belt]").forEach(function (svg) {
      var stars = $$("circle", svg);
      if (!stars.length) return;
      var cx = 0, cy = 0, tx = 0, ty = 0, live = false;
      addReader(function () {
        var r = svg.getBoundingClientRect();
        live = !(r.bottom < 0 || r.top > S.vh);
        if (!live) return;
        tx = clamp((S.px - (r.left + r.width / 2)) / 260, -1, 1);
        ty = clamp((S.py - (r.top + r.height / 2)) / 260, -1, 1);
      });
      addWriter(function (dt) {
        if (!live) return;
        cx = damp(cx, tx, 135, dt);
        cy = damp(cy, ty, 135, dt);
        stars.forEach(function (s, i) {
          var depth = [1.6, 1, 2.2][i % 3];
          s.setAttribute("transform", "translate(" + (cx * depth).toFixed(2) + "," + (cy * depth).toFixed(2) + ")");
        });
      });
    });
  }


  /* ============================================================
     26b. FAQ ACCORDION
     ============================================================ */
  function initFaq() {
    var items = $$("[data-faq]");
    if (!items.length) return;
    items.forEach(function (item) {
      var btn = $(".faq__q", item);
      var panel = $(".faq__a", item);
      if (!btn || !panel) return;
      panel.setAttribute("inert", "");
      on(btn, "click", function () {
        var open = btn.getAttribute("aria-expanded") === "true";
        if (item.getAttribute("data-faq") === "exclusive") {
          items.forEach(function (other) {
            if (other === item) return;
            var ob = $(".faq__q", other), op = $(".faq__a", other);
            if (ob) ob.setAttribute("aria-expanded", "false");
            if (op) { op.setAttribute("data-open", "false"); op.setAttribute("inert", ""); }
          });
        }
        btn.setAttribute("aria-expanded", String(!open));
        panel.setAttribute("data-open", String(!open));
        if (open) panel.setAttribute("inert", ""); else panel.removeAttribute("inert");
      });
    });
  }


  /* ============================================================
     28. THE 3D RIG — scroll planes, pointer scene tilt, chroma
     ============================================================ */
  function init3D() {
    if (REDUCED) return;

    /* A transform makes an element the containing block for its descendants,
       which silently breaks position:sticky inside it. Rather than rely on
       remembering that, refuse to tilt any section that contains a sticky
       element. This costs one pass at startup and prevents a whole class of
       bug that presents as "the sidebar just scrolls away". */
    function holdsSticky(el) {
      var kids = el.querySelectorAll("*");
      for (var i = 0; i < kids.length; i++) {
        if (getComputedStyle(kids[i]).position === "sticky") return true;
      }
      return false;
    }

    /* --- scroll-driven plane tilt --- */
    var planes = $$("[data-3d]").filter(function (el) {
      if (!holdsSticky(el)) return true;
      el.removeAttribute("data-3d");
      el.style.removeProperty("--rx");
      el.style.removeProperty("--tz");
      return false;
    }).map(function (el) {
      return {
        el: el,
        rx: 0, tz: 0, delta: 0, live: false,
        maxRx: parseFloat(el.getAttribute("data-3d")) || 6,
        maxTz: parseFloat(el.getAttribute("data-3d-depth")) || 110
      };
    });

    /* --- pointer scene tilt --- */
    var scenes = $$(".tilt-scene").map(function (el) {
      return { el: el, x: 0, y: 0, live: false, amt: parseFloat(el.getAttribute("data-tilt-amount")) || 3.2 };
    });

    /* --- chromatic split driven by scroll velocity --- */
    var chromas = $$(".chroma");
    var chroma = 0;

    addReader(function () {
      for (var i = 0; i < planes.length; i++) {
        var p = planes[i];
        var r = p.el.getBoundingClientRect();
        p.live = !(r.bottom < -240 || r.top > S.vh + 240);
        if (p.live) p.delta = clamp((r.top + r.height / 2 - S.vh / 2) / S.vh, -1.15, 1.15);
      }
      for (var j = 0; j < scenes.length; j++) {
        var sr = scenes[j].el.getBoundingClientRect();
        scenes[j].live = sr.bottom > 0 && sr.top < S.vh;
      }
    });

    addWriter(function (dt) {
      for (var i = 0; i < planes.length; i++) {
        var p = planes[i];
        if (!p.live) continue;
        p.rx = damp(p.rx, p.delta * p.maxRx, 115, dt);
        p.tz = damp(p.tz, -Math.abs(p.delta) * p.maxTz, 115, dt);
        p.el.style.setProperty("--rx", p.rx.toFixed(3) + "deg");
        p.el.style.setProperty("--tz", p.tz.toFixed(1) + "px");
      }

      for (var j = 0; j < scenes.length; j++) {
        var sc = scenes[j];
        var tx = sc.live ? (0.5 - S.ny) * sc.amt : 0;
        var ty = sc.live ? (S.nx - 0.5) * sc.amt : 0;
        sc.x = damp(sc.x, tx, 150, dt);
        sc.y = damp(sc.y, ty, 150, dt);
        sc.el.style.setProperty("--tilt-x", sc.x.toFixed(3) + "deg");
        sc.el.style.setProperty("--tilt-y", sc.y.toFixed(3) + "deg");
      }

      if (chromas.length) {
        chroma = damp(chroma, clamp(Math.abs(S.vel) * 0.055, 0, 3.2), 90, dt);
        for (var k = 0; k < chromas.length; k++) {
          chromas[k].style.setProperty("--chroma", chroma.toFixed(2));
        }
      }
    });
  }

  /* ============================================================
     29. WORK CARDS — rotate in Y as they cross the lane
     ============================================================ */
  function initCard3D() {
    if (REDUCED) return;
    var cards = $$(".work__card");
    if (!cards.length) return;
    var state = cards.map(function () { return { ry: 0, d: 0, live: false }; });
    addReader(function () {
      for (var i = 0; i < cards.length; i++) {
        var r = cards[i].getBoundingClientRect();
        state[i].live = !(r.right < -300 || r.left > S.vw + 300);
        if (state[i].live) state[i].d = clamp((r.left + r.width / 2 - S.vw / 2) / (S.vw / 2), -1, 1);
      }
    });
    addWriter(function (dt) {
      for (var i = 0; i < cards.length; i++) {
        if (!state[i].live) continue;
        state[i].ry = damp(state[i].ry, -state[i].d * 15, 95, dt);
        cards[i].style.setProperty("--card-ry", state[i].ry.toFixed(2) + "deg");
      }
    });
  }

  /* ============================================================
     30. ORBIT PLATE — software 3D armillary sphere
     Real perspective projection, no library.
     ============================================================ */
  function initOrbit() {
    var canvas = $("#orbit");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var host = canvas.parentElement;
    var W = 0, H = 0, dpr = 1;

    /* three graduated rings in different planes, plus Orion inside */
    var SEG = LOWTIER ? 56 : 96;
    function ring(tiltX, tiltZ, radius) {
      var pts = [];
      for (var i = 0; i <= SEG; i++) {
        var a = (i / SEG) * Math.PI * 2;
        var x = Math.cos(a) * radius, y = 0, z = Math.sin(a) * radius;
        /* tilt about X */
        var y1 = y * Math.cos(tiltX) - z * Math.sin(tiltX);
        var z1 = y * Math.sin(tiltX) + z * Math.cos(tiltX);
        /* tilt about Z */
        var x2 = x * Math.cos(tiltZ) - y1 * Math.sin(tiltZ);
        var y2 = x * Math.sin(tiltZ) + y1 * Math.cos(tiltZ);
        pts.push([x2, y2, z1]);
      }
      return pts;
    }
    var RINGS = [
      { pts: ring(0, 0, 1), w: 1.15, ticks: 24 },
      { pts: ring(Math.PI / 2, 0, 0.985), w: 0.8, ticks: 0 },
      { pts: ring(Math.PI / 2, Math.PI / 2, 0.97), w: 0.8, ticks: 0 },
      { pts: ring(0.42, 0.32, 0.72), w: 0.65, ticks: 12 },
      { pts: ring(-0.55, 0.9, 0.5), w: 0.55, ticks: 0 }
    ];
    var STARS = [
      [-0.42, 0.40, 0.10], [0.40, 0.47, -0.09], [-0.21, 0.01, 0.04],
      [0.00, 0.06, 0.00], [0.21, 0.10, -0.04], [-0.38, -0.47, 0.07],
      [0.47, -0.44, -0.12], [0.01, 0.68, 0.01], [-0.03, -0.20, 0.02]
    ];
    var LINKS = [[0,1],[0,2],[1,4],[2,3],[3,4],[2,5],[4,6],[5,6],[7,0],[7,1],[3,8]];

    var yaw = 0.6, pitch = 0.35, roll = 0;
    var accent = [233, 201, 121];

    function resize() {
      var r = host.getBoundingClientRect();
      if (!r.width || !r.height) return;
      dpr = Math.min(window.devicePixelRatio || 1, LOWTIER ? 1 : 1.75);
      W = Math.round(r.width); H = Math.round(r.height);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function readAccent() {
      var v = getComputedStyle(host).getPropertyValue("--accent").trim();
      var m = v.match(/^#?([0-9a-f]{6})$/i);
      if (!m) return;
      var n = parseInt(m[1], 16);
      accent = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }

    /* rotate then project — d is the eye distance in scene units */
    function project(p) {
      var cy = Math.cos(yaw), sy = Math.sin(yaw);
      var cp = Math.cos(pitch), sp = Math.sin(pitch);
      var cr = Math.cos(roll), sr = Math.sin(roll);
      var x = p[0] * cy - p[2] * sy;
      var z = p[0] * sy + p[2] * cy;
      var y = p[1] * cp - z * sp;
      z = p[1] * sp + z * cp;
      var x2 = x * cr - y * sr;
      var y2 = x * sr + y * cr;
      var d = 3.6;
      var f = d / (d + z);
      var scale = Math.min(W, H) * 0.42;
      return [W / 2 + x2 * f * scale, H / 2 + y2 * f * scale, z, f];
    }

    function draw() {
      if (!W) { resize(); if (!W) return; }
      ctx.clearRect(0, 0, W, H);

      var a = accent;
      /* rings, back half first so the front reads as in front */
      for (var pass = 0; pass < 2; pass++) {
        for (var r = 0; r < RINGS.length; r++) {
          var R = RINGS[r];
          ctx.lineWidth = R.w;
          ctx.beginPath();
          var drawing = false;
          for (var i = 0; i < R.pts.length; i++) {
            var pr = project(R.pts[i]);
            var back = pr[2] > 0;
            if ((pass === 0) !== back) { drawing = false; continue; }
            if (!drawing) { ctx.moveTo(pr[0], pr[1]); drawing = true; }
            else ctx.lineTo(pr[0], pr[1]);
          }
          ctx.strokeStyle = pass === 0
            ? "rgba(" + a[0] + "," + a[1] + "," + a[2] + ",0.2)"
            : "rgba(" + a[0] + "," + a[1] + "," + a[2] + ",0.78)";
          ctx.stroke();

          /* graduation ticks on the marked rings */
          if (R.ticks) {
            for (var t = 0; t < R.ticks; t++) {
              var idx = Math.round((t / R.ticks) * SEG);
              var p0 = R.pts[idx];
              var pin = project([p0[0] * 0.94, p0[1] * 0.94, p0[2] * 0.94]);
              var pout = project([p0[0] * 1.06, p0[1] * 1.06, p0[2] * 1.06]);
              if ((pass === 0) !== (pin[2] > 0)) continue;
              ctx.beginPath();
              ctx.moveTo(pin[0], pin[1]); ctx.lineTo(pout[0], pout[1]);
              ctx.strokeStyle = "rgba(" + a[0] + "," + a[1] + "," + a[2] + "," + (pass === 0 ? 0.16 : 0.55) + ")";
              ctx.stroke();
            }
          }
        }
      }

      /* the constellation suspended inside the armature */
      var proj = STARS.map(project);
      ctx.lineWidth = 0.7;
      for (var l = 0; l < LINKS.length; l++) {
        var A = proj[LINKS[l][0]], Bp = proj[LINKS[l][1]];
        ctx.beginPath();
        ctx.moveTo(A[0], A[1]); ctx.lineTo(Bp[0], Bp[1]);
        ctx.strokeStyle = "rgba(246,242,233,0.24)";
        ctx.stroke();
      }
      for (var s2 = 0; s2 < proj.length; s2++) {
        var q = proj[s2];
        var rad = Math.max(0.9, 2.6 * q[3]);
        var glow = ctx.createRadialGradient(q[0], q[1], 0, q[0], q[1], rad * 5);
        glow.addColorStop(0, "rgba(246,242,233,0.95)");
        glow.addColorStop(0.35, "rgba(" + a[0] + "," + a[1] + "," + a[2] + ",0.45)");
        glow.addColorStop(1, "rgba(" + a[0] + "," + a[1] + "," + a[2] + ",0)");
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(q[0], q[1], rad * 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(246,242,233,0.98)";
        ctx.beginPath(); ctx.arc(q[0], q[1], rad, 0, Math.PI * 2); ctx.fill();
      }
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });
    readAccent();

    if (REDUCED) { draw(); return; }

    var visible = true;
    var io = new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }, { threshold: 0 });
    io.observe(host);

    var spin = 0, accentTick = 0;
    addWriter(function (dt) {
      if (!visible) return;
      spin += dt * 0.00021;
      yaw = damp(yaw, spin + (S.nx - 0.5) * 1.15, 200, dt);
      pitch = damp(pitch, 0.32 + (S.ny - 0.5) * -0.7 + S.progress * 0.45, 200, dt);
      roll = damp(roll, (S.nx - 0.5) * 0.16, 260, dt);
      accentTick += dt;
      if (accentTick > 400) { accentTick = 0; readAccent(); }
      draw();
    });
  }


  /* ============================================================
     31. AUDIO — synthesised, no files, off by default
     Everything is generated with oscillators and shaped noise, so the site
     stays dependency-free and adds no bytes. The AudioContext is not created
     until the visitor turns sound on, which is itself a user gesture — the
     only moment a browser will let one start unsuspended.
     ============================================================ */
  var OrionAudio = (function () {
    var ctx = null, master = null, wet = null, comp = null;
    var enabled = false;
    var built = false;
    var lastHover = 0;

    /* A minor pentatonic, so any sequence the page plays stays consonant. */
    var ZONE_NOTE = {
      gold: 220.00, violet: 261.63, teal: 293.66, blue: 329.63,
      magenta: 392.00, acid: 440.00, flare: 523.25
    };
    var HOVER_POOL = [659.25, 783.99, 880.00, 1046.50];

    function store(v) {
      try { localStorage.setItem("orion-sound", v ? "1" : "0"); } catch (e) {}
    }
    function restore() {
      try { return localStorage.getItem("orion-sound") === "1"; } catch (e) { return false; }
    }

    /* A short synthetic impulse response. Reverb is what stops synthesised
       tones sounding like a 1990s system beep. */
    function makeVerb() {
      var len = Math.floor(ctx.sampleRate * 1.9);
      var buf = ctx.createBuffer(2, len, ctx.sampleRate);
      for (var c = 0; c < 2; c++) {
        var d = buf.getChannelData(c);
        for (var i = 0; i < len; i++) {
          var decay = Math.pow(1 - i / len, 2.6);
          d[i] = (Math.random() * 2 - 1) * decay;
        }
      }
      var conv = ctx.createConvolver();
      conv.buffer = buf;
      return conv;
    }

    function build() {
      if (built) return true;
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      try { ctx = new AC(); } catch (e) { return false; }

      comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.ratio.value = 8;
      comp.attack.value = 0.003;
      comp.release.value = 0.25;

      master = ctx.createGain();
      master.gain.value = 0.0;

      var conv = makeVerb();
      wet = ctx.createGain();
      wet.gain.value = 0.34;
      wet.connect(conv);
      conv.connect(master);

      master.connect(comp);
      comp.connect(ctx.destination);
      built = true;
      return true;
    }

    function now() { return ctx.currentTime; }

    function env(node, t0, peak, attack, hold, release) {
      var g = node.gain;
      g.cancelScheduledValues(t0);
      g.setValueAtTime(0.0001, t0);
      g.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t0 + attack);
      g.setValueAtTime(Math.max(peak, 0.0002), t0 + attack + hold);
      g.exponentialRampToValueAtTime(0.0001, t0 + attack + hold + release);
    }

    function tone(opts) {
      if (!enabled || !built) return;
      var t0 = now() + (opts.delay || 0);
      var osc = ctx.createOscillator();
      osc.type = opts.type || "sine";
      osc.frequency.setValueAtTime(opts.freq, t0);
      if (opts.glide) osc.frequency.exponentialRampToValueAtTime(opts.glide, t0 + (opts.dur || 0.3));
      if (opts.detune) osc.detune.value = opts.detune;

      var g = ctx.createGain();
      var filt = ctx.createBiquadFilter();
      filt.type = "lowpass";
      filt.frequency.value = opts.cutoff || 5200;
      filt.Q.value = opts.q || 0.7;

      var pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      if (pan) pan.pan.value = opts.pan || 0;

      osc.connect(filt); filt.connect(g);
      if (pan) { g.connect(pan); pan.connect(master); pan.connect(wet); }
      else { g.connect(master); g.connect(wet); }

      var a = opts.attack != null ? opts.attack : 0.006;
      var h = opts.hold != null ? opts.hold : 0.01;
      var r = opts.release != null ? opts.release : (opts.dur || 0.3);
      env(g, t0, opts.gain != null ? opts.gain : 0.22, a, h, r);
      osc.start(t0);
      osc.stop(t0 + a + h + r + 0.08);
    }

    function noise(opts) {
      if (!enabled || !built) return;
      var t0 = now() + (opts.delay || 0);
      var dur = opts.dur || 0.35;
      var len = Math.max(1, Math.floor(ctx.sampleRate * dur));
      var buf = ctx.createBuffer(1, len, ctx.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      var src = ctx.createBufferSource();
      src.buffer = buf;

      var filt = ctx.createBiquadFilter();
      filt.type = opts.filter || "bandpass";
      filt.frequency.setValueAtTime(opts.from || 700, t0);
      filt.frequency.exponentialRampToValueAtTime(opts.to || 3000, t0 + dur);
      filt.Q.value = opts.q || 1.1;

      var g = ctx.createGain();
      src.connect(filt); filt.connect(g);
      g.connect(master); g.connect(wet);
      env(g, t0, opts.gain != null ? opts.gain : 0.1, 0.01, dur * 0.2, dur * 0.7);
      src.start(t0);
      src.stop(t0 + dur + 0.05);
    }

    function fadeMaster(to, time) {
      if (!built) return;
      master.gain.cancelScheduledValues(now());
      master.gain.setValueAtTime(master.gain.value, now());
      master.gain.linearRampToValueAtTime(to, now() + (time || 0.25));
    }

    var api = {
      get on() { return enabled; },

      /* called from the toggle, which is always a real user gesture */
      toggle: function () {
        if (!enabled) {
          if (!build()) return false;
          if (ctx.state === "suspended") ctx.resume();
          enabled = true;
          fadeMaster(0.24, 0.4);
          store(true);
          api.chord([392.00, 523.25, 659.25], 0.05);
        } else {
          enabled = false;
          fadeMaster(0, 0.25);
          store(false);
        }
        return enabled;
      },
      wanted: restore,

      hover: function () {
        var t = performance.now();
        if (t - lastHover < 55) return;   /* moving fast across a nav should not machine-gun */
        lastHover = t;
        tone({ freq: HOVER_POOL[Math.floor(Math.random() * HOVER_POOL.length)],
               type: "sine", gain: 0.05, attack: 0.004, hold: 0.005, release: 0.14, cutoff: 6000 });
      },
      click: function () {
        tone({ freq: 523.25, type: "triangle", gain: 0.14, attack: 0.002, hold: 0.006, release: 0.16, cutoff: 4200 });
        tone({ freq: 1046.50, type: "sine", gain: 0.06, attack: 0.002, hold: 0.004, release: 0.1 });
      },
      chord: function (freqs, spread) {
        freqs.forEach(function (f, i) {
          tone({ freq: f, type: "sine", gain: 0.11, delay: i * (spread || 0.06),
                 attack: 0.01, hold: 0.03, release: 0.85, cutoff: 4000, pan: (i - 1) * 0.25 });
        });
      },
      open: function () {
        api.chord([329.63, 440.00, 587.33], 0.05);
        noise({ from: 400, to: 2600, dur: 0.4, gain: 0.05 });
      },
      close: function () {
        api.chord([587.33, 440.00, 329.63], 0.045);
      },
      zone: function (name) {
        var f = ZONE_NOTE[name];
        if (!f) return;
        tone({ freq: f, type: "sine", gain: 0.1, attack: 0.012, hold: 0.04, release: 1.5, cutoff: 3200 });
        tone({ freq: f * 2, type: "sine", gain: 0.035, attack: 0.014, hold: 0.02, release: 1.1, cutoff: 5000 });
      },
      whoosh: function () {
        noise({ from: 260, to: 4200, dur: 0.55, gain: 0.07, filter: "bandpass", q: 0.8 });
      },
      boot: function () {
        api.chord([220.00, 329.63, 440.00, 659.25], 0.09);
      },
      success: function () {
        api.chord([440.00, 554.37, 659.25, 880.00], 0.07);
      },
      error: function () {
        tone({ freq: 138.59, type: "sawtooth", gain: 0.1, attack: 0.005, hold: 0.05, release: 0.4, cutoff: 900 });
        tone({ freq: 146.83, type: "sawtooth", gain: 0.08, attack: 0.005, hold: 0.05, release: 0.4, cutoff: 900, detune: 12 });
      }
    };
    return api;
  })();
  window.OrionAudio = OrionAudio;

  function initAudio() {
    var btn = $$("[data-sound-toggle]");
    if (!btn.length) return;

    function paint() {
      btn.forEach(function (b) {
        b.setAttribute("aria-pressed", String(OrionAudio.on));
        b.setAttribute("aria-label", OrionAudio.on ? "Turn sound off" : "Turn sound on");
        var label = $("[data-sound-label]", b);
        if (label) label.textContent = OrionAudio.on ? "Sound on" : "Sound off";
      });
    }
    paint();

    btn.forEach(function (b) {
      on(b, "click", function () { OrionAudio.toggle(); paint(); });
    });

    /* If they turned it on last visit, arm it on their first interaction —
       browsers will not let a page start audio before one. */
    if (OrionAudio.wanted()) {
      var arm = function () {
        document.removeEventListener("pointerdown", arm);
        document.removeEventListener("keydown", arm);
        OrionAudio.toggle();
        paint();
      };
      document.addEventListener("pointerdown", arm, { once: true });
      document.addEventListener("keydown", arm, { once: true });
    }

    /* interaction sounds, delegated so they cover everything on the page */
    on(document, "pointerover", function (e) {
      if (!OrionAudio.on || !e.target.closest) return;
      if (e.target.closest("a, button, [role='button'], .svc__row, .work__card")) OrionAudio.hover();
    }, { passive: true });

    on(document, "click", function (e) {
      if (!OrionAudio.on || !e.target.closest) return;
      var t = e.target.closest("a, button, [role='button']");
      if (!t || t.hasAttribute("data-sound-toggle")) return;
      OrionAudio.click();
    }, { passive: true });
  }


  /* ============================================================
     32. ARTICLE CONTENTS — highlight the section being read
     ============================================================ */
  function initToc() {
    var links = $$(".toc__list a");
    if (!links.length) return;
    var targets = links.map(function (a) {
      return { link: a, el: document.getElementById((a.getAttribute("href") || "#").slice(1)) };
    }).filter(function (t) { return t.el; });
    if (!targets.length) return;

    var active = -1, want = 0;
    addReader(function () {
      var best = 0;
      for (var i = 0; i < targets.length; i++) {
        if (targets[i].el.getBoundingClientRect().top <= S.vh * 0.35) best = i;
      }
      want = best;
    });
    addWriter(function () {
      if (want === active) return;
      active = want;
      for (var i = 0; i < targets.length; i++) {
        targets[i].link.setAttribute("aria-current", String(i === active));
      }
    });
  }


  /* ============================================================
     33. INTRO — the typed question, then the build
     A cue list evaluated against elapsed time, so "skip" is just
     "run every cue that has not fired yet and jump to the end".
     ============================================================ */
  function initIntro() {
    var stage = $("#intro-stage");
    if (!stage) return;

    var QUERY = "how to build a website";
    var root = document.documentElement;
    var box = $("#ask-box");
    var text = $("#ask-text");
    var ask = $("#ask");
    var srch = $("#srch");
    var rows = $$(".srch__row", $("#sugg"));
    var serp = $("#serp");
    var paper = $("#paper");
    var invert = $("#invert");
    var build = $("#build");
    var wires = $$(".wire", build);
    var enter = $("#intro-enter");
    var prog = $("#intro-prog i");
    var status = $("#intro-status");

    var ZONE_FILL = ["--gold", "--violet", "--teal", "--blue", "--magenta", "--acid", "--flare"];

    /* Two separate things: the fixed chrome has to flip while the circle is
       mid-sweep (it paints above the invert layer), but the light ground must
       survive until the circle has actually covered it — otherwise the paper
       fades out underneath and there is nothing left to sweep over. */
    function flipChrome() { root.removeAttribute("data-act"); }
    function dropPaper() { if (paper) paper.setAttribute("data-gone", "true"); }

    /* Reduced motion gets the destination, not the journey. */
    if (REDUCED) {
      text.textContent = QUERY;
      ask.setAttribute("data-in", "true");
      box.setAttribute("data-state", "sent");
      ask.setAttribute("data-searched", "true");
      rows.forEach(function (r) { r.setAttribute("data-in", "true"); });
      serp.setAttribute("data-in", "true");
      serp.removeAttribute("aria-hidden");
      ask.setAttribute("data-done", "true");
      serp.setAttribute("data-done", "true");
      flipChrome();
      dropPaper();
      if (invert) { invert.setAttribute("data-on", "true"); invert.setAttribute("data-off", "true"); }
      build.setAttribute("data-in", "true");
      wires.forEach(function (w, i) {
        w.setAttribute("data-in", "true");
        w.setAttribute("data-fill", "true");
        w.style.setProperty("--wire-fill", "var(" + ZONE_FILL[i % ZONE_FILL.length] + ")");
      });
      enter.setAttribute("data-in", "true");
      if (prog) prog.style.transform = "scaleX(1)";
      if (status) status.textContent = "Ready";
      return;
    }

    root.setAttribute("data-act", "ask");

    /* As the landing page this runs on every visit to the root, which gets old
       fast. Once it has played, later visits in the same session land on the
       final frame instead. Not a redirect: bouncing the root to another page
       traps the back button. */
    var alreadySeen = false;
    try { alreadySeen = sessionStorage.getItem("orion-intro") === "1"; } catch (e) {}
    function remember() { try { sessionStorage.setItem("orion-intro", "1"); } catch (e) {} }

    /* --- typing with human-ish rhythm ------------------------------- */
    var typed = 0;
    var nextKeyAt = 0;
    function keyDelay(ch, prev) {
      if (prev === " ") return 38 + hash2(typed, 3.1) * 42;
      if (ch === " ") return 85 + hash2(typed, 7.7) * 70;
      return 42 + hash2(typed, 1.3) * 78;
    }

    /* rows appear once the query is specific enough to complete */
    var shown = 0;
    function showSuggestions(len) {
      if (len >= 6) srch.setAttribute("data-open", "true");
      var want = len < 6 ? 0 : Math.min(rows.length, Math.floor((len - 4) / 4));
      while (shown < want) { rows[shown].setAttribute("data-in", "true"); shown++; }
    }

    var DONE_AT = 8550;
    var typing = false;
    var cues = [
      /* Reveal on the first frame, not a quarter of a second in: as the landing
         page this element is the LCP candidate, and anything held at opacity 0
         does not count as painted. */
      [0,    function () { ask.setAttribute("data-in", "true"); if (status) status.textContent = "Listening"; }],
      [760,  function () { typing = true; box.setAttribute("data-state", "typing"); if (status) status.textContent = "Typing"; }],
      [2500, function () {
        typing = false;
        text.textContent = QUERY;
        showSuggestions(QUERY.length);
        box.setAttribute("data-state", "armed");
        ask.setAttribute("data-armed", "true");
      }],
      [2950, function () {
        rows.forEach(function (r, i) { if (i < rows.length - 1) r.setAttribute("data-gone", "true"); });
      }],
      [3250, function () {
        box.setAttribute("data-state", "sent");
        if (status) status.textContent = "Searching";
        if (window.OrionAudio) window.OrionAudio.click();
      }],
      [3700, function () {
        /* the query stays in the field — a results page never empties it */
        ask.setAttribute("data-searched", "true");
        srch.removeAttribute("data-open");
        serp.setAttribute("data-in", "true");
        serp.removeAttribute("aria-hidden");
        if (status) status.textContent = "One result";
      }],
      [5000, function () {
        if (invert) invert.setAttribute("data-on", "true");
        if (window.OrionAudio) window.OrionAudio.whoosh();
      }],
      /* The bar paints above the invert layer, so it has to flip — but only once
         the circle has actually reached the top corners, or it is grey-on-white
         for half a second. Centre is 50%/45%, so the corners fall at about 81%
         of the final radius, which the eased tween reaches around here. */
      [5600, function () { flipChrome(); }],
      [5760, function () {
        dropPaper();
        /* the whole light act leaves with the paper */
        ask.setAttribute("data-done", "true");
        serp.setAttribute("data-done", "true");
        serp.removeAttribute("data-in");
        if (invert) invert.setAttribute("data-off", "true");
        build.setAttribute("data-in", "true");
        wires.forEach(function (w) { w.setAttribute("data-in", "true"); });
        if (status) status.textContent = "Building";
      }],
      [6950, function () {
        wires.forEach(function (w, i) {
          w.setAttribute("data-fill", "true");
          w.style.setProperty("--wire-fill", "var(" + ZONE_FILL[i % ZONE_FILL.length] + ")");
        });
        if (window.OrionAudio) window.OrionAudio.chord([220.00, 329.63, 440.00, 659.25], 0.08);
      }],
      [7850, function () { build.setAttribute("data-rush", "true"); }],
      [8300, function () {
        enter.setAttribute("data-in", "true");
        if (status) status.textContent = "Ready";
        if (window.OrionAudio) window.OrionAudio.success();
      }]
    ];

    var fired = 0;
    var start = 0;
    var finished = false;

    function fireThrough(ms) {
      while (fired < cues.length && cues[fired][0] <= ms) {
        try { cues[fired][1](); } catch (e) {}
        fired++;
      }
    }

    var tick = addWriter(function (dt, t) {
      if (!start) start = t;
      var ms = t - start;
      fireThrough(ms);

      if (typing && typed < QUERY.length && ms >= nextKeyAt) {
        var ch = QUERY[typed];
        typed++;
        text.textContent = QUERY.slice(0, typed);
        nextKeyAt = ms + keyDelay(ch, QUERY[typed - 2]);
        if (window.OrionAudio && window.OrionAudio.on) window.OrionAudio.hover();
        showSuggestions(typed);
      }

      if (prog) prog.style.transform = "scaleX(" + clamp(ms / DONE_AT, 0, 1).toFixed(4) + ")";
      if (ms >= DONE_AT && !finished) { finished = true; remember(); removeTicker(tick); }
    });

    function skip() {
      remember();
      typing = false;
      typed = QUERY.length;
      text.textContent = QUERY;
      showSuggestions(QUERY.length);
      fireThrough(DONE_AT);
      if (prog) prog.style.transform = "scaleX(1)";
      removeTicker(tick);
      finished = true;
    }

    if (alreadySeen) { skip(); }

    /* "Skip" means skip to the site, so it stays an ordinary link and the page
       curtain handles it. Escape jumps to the end of the sequence instead, for
       anyone who wants to see where it lands without leaving. */
    on(document, "keydown", function (e) {
      var onControl = e.target && e.target.closest && e.target.closest("a, button, input, textarea, select");
      if (e.key === "Escape") { e.preventDefault(); skip(); return; }
      if (e.key === "Enter" && !onControl) {
        e.preventDefault();
        if (finished) location.href = "home.html"; else skip();
      }
    });
  }

  /* ============================================================
     27. BOOT
     ============================================================ */
  function boot() {
    measure();
    readScroll();
    S.yPrev = S.y;
    startLoop();

    initCursor();
    initNav();
    initDrawer();
    initHud();
    initCurtain();
    initAnchors();
    initYear();
    initClock();
    initBeltLogo();
    initForm();
    initFlowField();
    initAscii();
    initHalftone();
    initMethod();
    initWorkScroll();
    initCycler();
    initMarquees();
    initParallax();
    initTilt();
    initMagnetic();
    initScramble();
    initFaq();
    initAudio();
    initToc();
    initIntro();
    init3D();
    initCard3D();
    initOrbit();

    initBoot().then(function () {
      /* reveals run after the curtain lifts so the stagger is actually seen */
      measure();
      initReveals();
      window.setTimeout(measure, 400);
    });

    /* layout settles once fonts land */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { measure(); }).catch(function () {});
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
