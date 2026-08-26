/* =====================================================================
   ART — pictures, drawn rather than photographed
   =====================================================================
   These demo sites have no photographs, and a site for a restaurant or a
   barber that has no pictures does not read as a real site — it reads as
   a wireframe. So the pictures are generated: layered landscapes, duotone
   portraits, a board under studio light. Everything here is 2D canvas and
   arithmetic. No library, no network, no image files.

   Usage:
     <canvas data-art="marsh" data-art-opts='{"hour":0.72}'></canvas>
   A canvas is painted the first time it comes near the viewport, repainted
   on resize, and — if its painter declares itself animated — driven by the
   shared frame loop while it is on screen.
   ===================================================================== */
(function () {
  "use strict";

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var TAU = Math.PI * 2;

  /* ---------- 1. noise ------------------------------------------------
     Value noise with smoothstep interpolation, and fBm over it. Not
     Perlin: for landscape silhouettes and cloud bands the difference is
     invisible and this is a third of the code. */
  function hash(x, y, s) {
    var n = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453123;
    return n - Math.floor(n);
  }
  function smooth(t) { return t * t * (3 - 2 * t); }
  function noise2(x, y, s) {
    var xi = Math.floor(x), yi = Math.floor(y);
    var xf = x - xi, yf = y - yi;
    var u = smooth(xf), v = smooth(yf);
    var a = hash(xi, yi, s), b = hash(xi + 1, yi, s);
    var c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s);
    return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
  }
  function fbm(x, y, oct, s) {
    var v = 0, amp = 0.5, f = 1, norm = 0;
    for (var i = 0; i < (oct || 4); i++) {
      v += noise2(x * f, y * f, s + i * 17) * amp;
      norm += amp; amp *= 0.5; f *= 2.03;
    }
    return v / norm;
  }

  /* ---------- 2. colour ---------------------------------------------- */
  function hex(h) {
    h = h.replace("#", "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function mix(a, b, t) {
    return [
      Math.round(a[0] + (b[0] - a[0]) * t),
      Math.round(a[1] + (b[1] - a[1]) * t),
      Math.round(a[2] + (b[2] - a[2]) * t)
    ];
  }
  function rgba(c, a) { return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")"; }

  /* A ramp is a list of [stop, "#hex"]. ramp(list, t) samples it. */
  function ramp(list, t) {
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    for (var i = 0; i < list.length - 1; i++) {
      if (t <= list[i + 1][0]) {
        var span = list[i + 1][0] - list[i][0] || 1;
        return mix(hex(list[i][1]), hex(list[i + 1][1]), (t - list[i][0]) / span);
      }
    }
    return hex(list[list.length - 1][1]);
  }

  /* ---------- 3. shared surfaces ------------------------------------- */
  /* One 96px tile of noise, built once and tiled as a pattern.

     It has to be drawImage/fill rather than putImageData: putImageData
     REPLACES pixels — it ignores globalCompositeOperation, globalAlpha and
     the current transform — so stamping grain that way wipes the picture
     underneath it instead of sitting on top. */
  var GRAIN = null;
  function grainTile() {
    if (GRAIN) return GRAIN;
    var N = 96;
    var c = document.createElement("canvas");
    c.width = c.height = N;
    var g = c.getContext("2d");
    var img = g.createImageData(N, N);
    var d = img.data;
    for (var i = 0; i < d.length; i += 4) {
      var v = Math.round(hash(i * 0.019, i * 0.0071, 3) * 255);
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    GRAIN = c;
    return c;
  }
  function grain(ctx, w, h, amount, seed) {
    var tile = grainTile();
    ctx.save();
    ctx.globalCompositeOperation = "overlay";
    ctx.globalAlpha = Math.min(0.5, (amount == null ? 0.5 : amount) * 0.14);
    var pat = ctx.createPattern(tile, "repeat");
    if (pat) {
      /* offset the tile per picture so two canvases side by side do not
         share a visibly identical speckle */
      var off = (seed || 0) % 96;
      ctx.translate(-off, -off);
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, w + 96, h + 96);
    }
    ctx.restore();
  }
  function vignette(ctx, w, h, strength, col) {
    var g = ctx.createRadialGradient(w / 2, h * 0.46, Math.min(w, h) * 0.24, w / 2, h * 0.5, Math.max(w, h) * 0.78);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, rgba(col || [0, 0, 0], strength == null ? 0.42 : strength));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  /* ---------- 4. painters -------------------------------------------- */
  var PAINTERS = {};
  function register(name, fn, animated) { PAINTERS[name] = { fn: fn, animated: !!animated }; }

  /* --- 4a. THE ESTUARY -------------------------------------------------
     Sky, sun, cloud bands, three noise-perturbed horizons, water with a
     specular path, reeds, birds, mist. `hour` runs 0 (first light) to 1
     (last light) and drives every colour in the picture. */
  var SKY = {
    dawn:  [[0, "#1c2740"], [0.42, "#6a5570"], [0.68, "#c98a6d"], [0.86, "#e8b98d"], [1, "#f3d7b4"]],
    day:   [[0, "#4d7fa8"], [0.45, "#8fb4cc"], [0.75, "#cadbe4"], [1, "#e9eef0"]],
    dusk:  [[0, "#16203a"], [0.36, "#3d3a5c"], [0.6, "#8c5566"], [0.8, "#d5794f"], [1, "#efb97c"]],
    night: [[0, "#080d1c"], [0.5, "#111a30"], [0.8, "#1e2942"], [1, "#33415e"]]
  };
  function skyAt(hour) {
    /* four keyed skies, cross-faded — cheaper and calmer than blending
       every stop of a dozen ramps */
    if (hour < 0.22) return { a: SKY.night, b: SKY.dawn, t: hour / 0.22 };
    if (hour < 0.42) return { a: SKY.dawn, b: SKY.day, t: (hour - 0.22) / 0.2 };
    if (hour < 0.68) return { a: SKY.day, b: SKY.dusk, t: (hour - 0.42) / 0.26 };
    return { a: SKY.dusk, b: SKY.night, t: (hour - 0.68) / 0.32 };
  }
  function skyColour(hour, v) {
    var s = skyAt(hour);
    return mix(ramp(s.a, v), ramp(s.b, v), smooth(Math.min(1, Math.max(0, s.t))));
  }

  register("marsh", function (ctx, w, h, o, t) {
    var hour = o.hour == null ? 0.66 : o.hour;
    var tide = o.tide == null ? 0.35 : o.tide;          /* 0 = mud, 1 = full */
    var seed = o.seed == null ? 7 : o.seed;
    var drift = REDUCED ? 0 : (t || 0) * 0.00004;
    var hz = h * (o.horizon == null ? 0.58 : o.horizon);

    /* sky */
    var g = ctx.createLinearGradient(0, 0, 0, hz);
    for (var i = 0; i <= 8; i++) {
      var v = i / 8;
      g.addColorStop(v, rgba(skyColour(hour, 1 - v), 1));
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, hz + 1);

    /* sun: low and huge near the ends of the day */
    var sunT = Math.abs(hour - 0.45) * 2;
    var sunX = w * (0.18 + hour * 0.62);
    var sunY = hz - h * (0.42 - sunT * 0.42);
    var sunR = Math.min(w, h) * (0.035 + sunT * 0.035);
    var warm = hour < 0.2 || hour > 0.8 ? [255, 238, 210] : mix([255, 246, 214], [255, 168, 96], sunT);
    var halo = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 11);
    halo.addColorStop(0, rgba(warm, 0.5));
    halo.addColorStop(0.16, rgba(warm, 0.16));
    halo.addColorStop(1, rgba(warm, 0));
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, w, hz + 1);
    if (sunY < hz) {
      ctx.fillStyle = rgba(mix(warm, [255, 255, 255], 0.4), 0.92);
      ctx.beginPath(); ctx.arc(sunX, sunY, sunR, 0, TAU); ctx.fill();
    }

    /* cloud bands — stretched fBm, so they streak the way estuary cloud does */
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    var bands = 26;
    for (var c = 0; c < bands; c++) {
      var by = (c / bands) * hz * 0.94;
      var n = fbm(by * 0.02 + drift * 40, c * 0.6, 3, seed + 40);
      var alpha = Math.pow(1 - by / hz, 1.4) * n * 0.3;
      if (alpha < 0.012) continue;
      var cw = w * (0.3 + n * 0.85);
      var cx = ((c * 137 + n * 600 + drift * 9000) % (w * 1.6)) - w * 0.3;
      var cg = ctx.createLinearGradient(cx, 0, cx + cw, 0);
      var cc = mix(skyColour(hour, 0.25), [255, 255, 255], 0.42);
      cg.addColorStop(0, rgba(cc, 0));
      cg.addColorStop(0.5, rgba(cc, alpha));
      cg.addColorStop(1, rgba(cc, 0));
      ctx.fillStyle = cg;
      ctx.fillRect(cx, by, cw, hz * 0.035);
    }
    ctx.restore();

    /* the far bank, drawn BEFORE the water: it is behind it. The old order
       painted three horizons over the top of the water and buried it. */
    var far = mix(skyColour(hour, 0.28), [10, 18, 14], 0.62);
    ctx.fillStyle = rgba(far, 1);
    ctx.beginPath();
    ctx.moveTo(0, hz + h * 0.06);
    for (var fx = 0; fx <= w; fx += 3) {
      ctx.lineTo(fx, hz - (fbm(fx * 0.0042, 3.1, 3, seed + 31) - 0.5) * h * 0.03);
    }
    ctx.lineTo(w, hz + h * 0.06);
    ctx.closePath();
    ctx.fill();

    var far2 = mix(skyColour(hour, 0.22), [14, 24, 19], 0.7);
    ctx.fillStyle = rgba(far2, 1);
    ctx.beginPath();
    ctx.moveTo(0, hz + h * 0.09);
    for (var fx2 = 0; fx2 <= w; fx2 += 3) {
      ctx.lineTo(fx2, hz + h * 0.014 - (fbm(fx2 * 0.0028, 8.7, 4, seed + 52) - 0.5) * h * 0.038);
    }
    ctx.lineTo(w, hz + h * 0.09);
    ctx.closePath();
    ctx.fill();

    /* water */
    var wtop = hz + h * 0.055;
    var deep = mix(skyColour(hour, 0.35), [10, 16, 22], 0.5);
    var shallow = mix(skyColour(hour, 0.85), [24, 30, 30], 0.24);
    var wg = ctx.createLinearGradient(0, wtop, 0, h);
    wg.addColorStop(0, rgba(mix(shallow, far2, 0.45), 1));
    wg.addColorStop(0.35, rgba(shallow, 1));
    wg.addColorStop(1, rgba(deep, 1));
    ctx.fillStyle = wg;
    ctx.fillRect(0, wtop, w, h - wtop);

    /* the sun's path on the water, broken into ripples */
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (var r = 0; r < 90; r++) {
      var ry = wtop + Math.pow(r / 90, 1.7) * (h - wtop);
      var spread = 8 + Math.pow(r / 90, 1.5) * w * 0.26;
      var wob = (noise2(r * 0.35, drift * 220, seed) - 0.5) * spread * 1.4;
      var a = Math.pow(1 - r / 90, 1.4) * 0.4 * (0.35 + sunT);
      ctx.fillStyle = rgba(warm, a);
      ctx.fillRect(sunX - spread / 2 + wob, ry, spread, Math.max(1, (h - wtop) / 130));
    }
    ctx.restore();

    /* ripple hatching across the water */
    ctx.strokeStyle = rgba(mix(shallow, [255, 255, 255], 0.55), 0.11);
    ctx.lineWidth = 1;
    for (var q = 0; q < 46; q++) {
      var qy = wtop + Math.pow(q / 46, 1.6) * (h - wtop);
      ctx.beginPath();
      for (var x = 0; x <= w; x += 14) {
        var yy = qy + (noise2(x * 0.008, q * 0.4 + drift * 90, seed + 9) - 0.5) * 5;
        if (x === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }

    /* the near bank: mud at low water, covered as the tide comes back */
    var mudY = h - (h - wtop) * (0.44 - tide * 0.36);
    var mud = mix(skyColour(hour, 0.5), [46, 40, 30], 0.7);
    ctx.fillStyle = rgba(mud, 1);
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (var mx = 0; mx <= w; mx += 4) {
      ctx.lineTo(mx, mudY + (fbm(mx * 0.006, 2.2, 3, seed + 7) - 0.5) * h * 0.03);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    /* channels cut into the mud — which is what a saltmarsh actually is */
    ctx.strokeStyle = rgba(mix(shallow, [255, 255, 255], 0.35), 0.26 + tide * 0.34);
    for (var ch = 0; ch < 7; ch++) {
      ctx.lineWidth = 1 + hash(ch, 2, seed) * 3.5;
      ctx.beginPath();
      var chx = w * (0.06 + hash(ch, 5, seed) * 0.9);
      ctx.moveTo(chx, h);
      for (var cy2 = h; cy2 > mudY; cy2 -= 8) {
        chx += (noise2(cy2 * 0.02, ch * 3.3, seed) - 0.5) * 16;
        ctx.lineTo(chx, cy2);
      }
      ctx.stroke();
    }

    /* a line of rotting groyne posts running out into the water. Nothing
       says estuary like them, and they are what gives the middle distance
       a sense of scale. */
    if (o.posts !== false) {
      var pcol = mix(skyColour(hour, 0.18), [24, 18, 12], 0.86);
      for (var pp = 0; pp < 11; pp++) {
        var k = pp / 10;
        var pxx = w * (0.06 + k * 0.5) + Math.pow(k, 1.6) * w * 0.3;
        var pby = wtop + Math.pow(k, 1.55) * (h - wtop) * 0.92;
        var pht = h * (0.022 + Math.pow(k, 1.5) * 0.13);
        var pw = Math.max(1.4, h * (0.003 + Math.pow(k, 1.4) * 0.012));
        var lean = (hash(pp, 7, seed) - 0.5) * pht * 0.22;
        ctx.fillStyle = rgba(pcol, 0.94);
        ctx.beginPath();
        ctx.moveTo(pxx - pw, pby);
        ctx.lineTo(pxx + pw, pby);
        ctx.lineTo(pxx + pw * 0.62 + lean, pby - pht);
        ctx.lineTo(pxx - pw * 0.62 + lean, pby - pht);
        ctx.closePath();
        ctx.fill();
        /* the reflection, which is what makes them stand in water */
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.moveTo(pxx - pw, pby);
        ctx.lineTo(pxx + pw, pby);
        ctx.lineTo(pxx + pw * 0.6, pby + pht * 0.6);
        ctx.lineTo(pxx - pw * 0.6, pby + pht * 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    /* reeds along the near bank */
    var reedCol = mix(skyColour(hour, 0.2), [6, 12, 10], 0.92);
    ctx.strokeStyle = rgba(reedCol, 0.9);
    var reeds = Math.round(w / 7);
    for (var rr = 0; rr < reeds; rr++) {
      var rx = (rr / reeds) * w + (hash(rr, 3, seed) - 0.5) * 10;
      var rh = h * (0.03 + hash(rr, 9, seed) * 0.085);
      var base = h - h * 0.004 - hash(rr, 5, seed) * h * 0.03;
      var sway = REDUCED ? 0 : Math.sin((t || 0) * 0.0011 + rr * 0.7) * rh * 0.14;
      ctx.lineWidth = 0.8 + hash(rr, 11, seed) * 1.1;
      ctx.beginPath();
      ctx.moveTo(rx, base);
      ctx.quadraticCurveTo(rx + sway * 0.5, base - rh * 0.6, rx + sway, base - rh);
      ctx.stroke();
    }

    /* birds */
    if (o.birds !== false) {
      ctx.strokeStyle = rgba(mix(skyColour(hour, 0.4), [0, 0, 0], 0.72), 0.62);
      ctx.lineWidth = 1.3;
      for (var bd = 0; bd < 7; bd++) {
        var bx = w * (0.1 + hash(bd, 2, seed) * 0.8) + (REDUCED ? 0 : ((t || 0) * 0.012 * (0.5 + hash(bd, 6, seed))) % (w * 1.4)) - w * 0.2;
        var by2 = hz * (0.14 + hash(bd, 4, seed) * 0.5);
        var bw = 5 + hash(bd, 8, seed) * 7;
        var flap = REDUCED ? 0.5 : 0.28 + Math.abs(Math.sin((t || 0) * 0.006 + bd)) * 0.5;
        ctx.beginPath();
        ctx.moveTo(bx - bw, by2 + bw * flap);
        ctx.quadraticCurveTo(bx - bw * 0.3, by2 - bw * 0.15, bx, by2);
        ctx.quadraticCurveTo(bx + bw * 0.3, by2 - bw * 0.15, bx + bw, by2 + bw * flap);
        ctx.stroke();
      }
    }

    /* mist bands over the water line */
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (var m = 0; m < 5; m++) {
      var my = hz - h * 0.03 + m * h * 0.02;
      var mg = ctx.createLinearGradient(0, my - h * 0.02, 0, my + h * 0.03);
      var mc = mix(skyColour(hour, 0.8), [255, 255, 255], 0.55);
      mg.addColorStop(0, rgba(mc, 0));
      mg.addColorStop(0.5, rgba(mc, 0.09 + noise2(m, drift * 60, seed) * 0.07));
      mg.addColorStop(1, rgba(mc, 0));
      ctx.fillStyle = mg;
      ctx.fillRect(0, my - h * 0.02, w, h * 0.05);
    }
    ctx.restore();

    vignette(ctx, w, h, 0.34, mix(skyColour(hour, 0.1), [0, 0, 0], 0.7));
    grain(ctx, w, h, 0.5, seed);
  }, true);

  /* --- 4b. DUOTONE PORTRAIT -------------------------------------------
     A head and shoulders, built from control points, rendered as a
     halftone dot field over a two-colour gradient. The `cut` parameter
     changes the hairline, which is the only thing that has to change for
     six of these to read as six different people. */
  /* A head in profile. Front-on ovals read as the placeholder avatar every
     piece of software draws when it has no photograph; a profile reads as a
     person, and — the point, for a barber — it shows the shape of the cut.

     Everything is in units of `u` (one head width), so the whole drawing
     scales from one number. */
  function profilePath(ctx, w, h, cut, seed, place) {
    place = place || {};
    var u = Math.min(w * (place.scale || 0.4), h * 0.44);
    var cx = w * (place.x == null ? 0.5 : place.x), cy = h * (place.y == null ? 0.44 : place.y);
    function P(x, y) { return [cx + x * u, cy + y * u]; }
    function M(p) { ctx.moveTo(p[0], p[1]); }
    function L(p) { ctx.lineTo(p[0], p[1]); }
    function C(a1, a2, a3) { ctx.bezierCurveTo(a1[0], a1[1], a2[0], a2[1], a3[0], a3[1]); }

    /* Each part is begun, closed and filled on its own. Filling head, hair
       and beard as one path lets their winding directions cancel where they
       overlap, and nonzero then punches a hole through the crown. */
    ctx.beginPath();
    M(P(0.06, -0.74));                                  /* crown */
    C(P(0.44, -0.72), P(0.52, -0.34), P(0.50, -0.04));  /* back of the skull */
    C(P(0.49, 0.22), P(0.44, 0.34), P(0.34, 0.42));     /* behind the ear */
    C(P(0.30, 0.56), P(0.26, 0.64), P(0.24, 0.74));     /* down to the neck */
    L(P(0.30, 1.06));
    C(P(0.62, 1.14), P(0.86, 1.30), P(0.94, 1.5));      /* shoulder, back */
    L(P(-1.05, 1.5));
    C(P(-0.98, 1.28), P(-0.70, 1.12), P(-0.40, 1.04));  /* shoulder, front */
    L(P(-0.30, 0.78));
    C(P(-0.34, 0.70), P(-0.36, 0.62), P(-0.34, 0.54));  /* under the chin */
    C(P(-0.44, 0.46), P(-0.50, 0.40), P(-0.52, 0.32));  /* chin */
    C(P(-0.56, 0.26), P(-0.54, 0.22), P(-0.50, 0.20));  /* lower lip */
    C(P(-0.54, 0.16), P(-0.55, 0.14), P(-0.52, 0.11));  /* mouth */
    C(P(-0.56, 0.06), P(-0.58, 0.04), P(-0.56, 0.01));  /* upper lip */
    C(P(-0.66, -0.02), P(-0.72, -0.06), P(-0.70, -0.10));/* under the nose */
    C(P(-0.74, -0.18), P(-0.64, -0.26), P(-0.55, -0.30));/* bridge of the nose */
    C(P(-0.52, -0.34), P(-0.52, -0.38), P(-0.50, -0.42));/* the dip */
    C(P(-0.52, -0.52), P(-0.44, -0.62), P(-0.34, -0.68));/* brow and forehead */
    C(P(-0.24, -0.74), P(-0.10, -0.76), P(0.06, -0.74));
    ctx.closePath();
    ctx.fill();

    /* ---- the cut: the only thing that separates one of these from another ---- */
    var t = 0.0;
    ctx.beginPath();
    ctx.moveTo.apply(ctx, P(-0.36, -0.66));
    if (cut === "quiff") {
      C(P(-0.46, -1.06), P(-0.08, -1.28), P(0.16, -1.04));
      C(P(0.34, -0.90), P(0.52, -0.56), P(0.51, -0.16));
      C(P(0.44, -0.42), P(0.34, -0.60), P(0.06, -0.62));
      C(P(-0.12, -0.64), P(-0.28, -0.66), P(-0.36, -0.66));
    } else if (cut === "crop") {
      C(P(-0.44, -0.86), P(-0.10, -0.94), P(0.14, -0.88));
      C(P(0.40, -0.80), P(0.53, -0.50), P(0.51, -0.10));
      C(P(0.45, -0.40), P(0.34, -0.58), P(0.06, -0.62));
      C(P(-0.12, -0.64), P(-0.28, -0.66), P(-0.36, -0.66));
    } else if (cut === "curls") {
      var n = 13;
      for (var k = 0; k <= n; k++) {
        var a2 = Math.PI * (1.06 - (k / n) * 1.06);
        var bump = 0.90 + hash(k, 4, seed) * 0.26;
        ctx.lineTo(cx + Math.cos(a2) * u * 0.62 * bump, cy - u * 0.16 - Math.sin(a2) * u * 0.72 * bump);
      }
      C(P(0.45, -0.38), P(0.32, -0.58), P(0.06, -0.62));
      C(P(-0.12, -0.64), P(-0.28, -0.66), P(-0.36, -0.66));
    } else if (cut === "long") {
      C(P(-0.50, -0.92), P(-0.06, -1.02), P(0.24, -0.84));
      C(P(0.62, -0.60), P(0.72, 0.10), P(0.62, 0.62));
      C(P(0.56, 0.80), P(0.44, 0.78), P(0.42, 0.60));
      C(P(0.48, 0.20), P(0.50, -0.24), P(0.34, -0.50));
      C(P(0.20, -0.66), P(-0.14, -0.68), P(-0.36, -0.66));
    } else if (cut === "shaved") {
      C(P(-0.40, -0.76), P(-0.16, -0.82), P(0.02, -0.80));
      C(P(0.28, -0.76), P(0.46, -0.52), P(0.50, -0.20));
      C(P(0.45, -0.42), P(0.32, -0.60), P(0.04, -0.63));
      C(P(-0.14, -0.65), P(-0.28, -0.66), P(-0.36, -0.66));
    } else { /* fade — short at the sides, weight left on top */
      C(P(-0.46, -0.94), P(-0.04, -1.02), P(0.18, -0.90));
      C(P(0.42, -0.76), P(0.53, -0.48), P(0.51, -0.14));
      C(P(0.46, -0.44), P(0.34, -0.60), P(0.06, -0.63));
      C(P(-0.12, -0.65), P(-0.28, -0.66), P(-0.36, -0.66));
    }
    ctx.closePath();
    ctx.fill();
    void t;

    /* ---- beard, when the cut carries one ---- */
    if (cut === "beard" || cut === "long") {
      ctx.beginPath();
      ctx.moveTo.apply(ctx, P(-0.56, 0.04));
      C(P(-0.72, 0.30), P(-0.68, 0.62), P(-0.46, 0.78));
      C(P(-0.24, 0.94), P(0.10, 0.86), P(0.24, 0.62));
      C(P(0.30, 0.50), P(0.30, 0.44), P(0.30, 0.38));
      C(P(0.10, 0.62), P(-0.24, 0.60), P(-0.40, 0.42));
      C(P(-0.48, 0.32), P(-0.50, 0.18), P(-0.56, 0.04));
      ctx.closePath();
      ctx.fill();
    }
  }

  register("portrait", function (ctx, w, h, o) {
    var back = hex(o.back || "#141210");
    var ink = hex(o.ink || "#efe9df");
    var accent = hex(o.accent || "#c9a227");
    var cut = o.cut || "fade";
    var seed = o.seed == null ? 5 : o.seed;

    /* ground: a studio sweep, lit from the side the face is turned towards */
    var g = ctx.createLinearGradient(0, h, w, 0);
    g.addColorStop(0, rgba(mix(back, [0, 0, 0], 0.45), 1));
    g.addColorStop(0.5, rgba(back, 1));
    g.addColorStop(1, rgba(mix(back, accent, 0.2), 1));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    var glow = ctx.createRadialGradient(w * 0.24, h * 0.34, 0, w * 0.3, h * 0.42, Math.max(w, h) * 0.7);
    glow.addColorStop(0, rgba(mix(back, ink, 0.2), 0.9));
    glow.addColorStop(1, rgba(back, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    /* the silhouette, offscreen, so coverage can be sampled per halftone cell */
    var off = document.createElement("canvas");
    off.width = Math.max(1, Math.round(w)); off.height = Math.max(1, Math.round(h));
    var oc = off.getContext("2d");
    oc.fillStyle = "#000"; oc.fillRect(0, 0, w, h);
    oc.fillStyle = "#fff";
    var place = { x: o.flip ? 1 - (o.x == null ? 0.5 : o.x) : o.x, y: o.y, scale: o.scale };
    if (o.flip) { oc.save(); oc.translate(w, 0); oc.scale(-1, 1); }
    profilePath(oc, w, h, cut, seed, place);   /* fills as it goes */
    if (o.flip) oc.restore();

    var src = oc.getImageData(0, 0, off.width, off.height).data;
    /* A fractional cell puts every dot on a different sub-pixel phase, and
       the phase drifts across the picture — which beats against the pixel
       grid and draws faint dark lines through the halftone. A whole number
       of pixels holds one phase everywhere. */
    var cell = Math.max(4, Math.round(Math.min(w, h) / 78));
    var rows = Math.ceil(h / cell), cols = Math.ceil(w / cell);
    /* One key light, high and in front of the face. Both terms matter: the
       falloff alone gives a flat disc, the direction alone gives a hard edge.
       Together the cheek catches it and the back of the skull rolls off. */
    var hx = w * (o.x == null ? 0.5 : o.x);
    var faceDir = o.flip ? 1 : -1;
    var lightX = hx + faceDir * Math.min(w, h) * 0.34, lightY = h * 0.16, reach = Math.max(w, h) * 0.82;

    for (var ry = 0; ry < rows; ry++) {
      for (var rx = 0; rx < cols; rx++) {
        var x0 = Math.round(rx * cell), y0 = Math.round(ry * cell);
        var sum = 0, n = 0;
        for (var yy = 0; yy < cell; yy += 1.6) {
          var py = y0 + (yy | 0);
          if (py >= off.height) break;
          for (var xx = 0; xx < cell; xx += 1.6) {
            var px = x0 + (xx | 0);
            if (px >= off.width) break;
            sum += src[(py * off.width + px) * 4]; n++;
          }
        }
        if (!n) continue;
        var cov = sum / n / 255;
        if (cov < 0.04) continue;
        /* one key light: dots fatten towards it and thin into the shadow */
        var fall = 1 - Math.min(1, Math.hypot(x0 - lightX, y0 - lightY) / reach);
        var edge0 = hx + faceDir * Math.min(w, h) * 0.3;
        var dir = 1 - Math.min(1, Math.max(0, ((x0 - edge0) * faceDir * -1) / (w * 0.62)));
        var lit = Math.min(1, Math.max(0, fall * 0.45 + dir * 0.75));
        var r = (cell * 0.66) * Math.pow(cov, 0.45) * (0.1 + lit * 1.3);
        if (r < 0.3) continue;
        var col = mix(mix(back, ink, 0.6 + lit * 0.42), accent, Math.max(0, lit - 0.78) * 0.9);
        ctx.fillStyle = rgba(col, 0.3 + cov * 0.42 + lit * 0.2);
        ctx.beginPath();
        ctx.arc(x0 + cell / 2, y0 + cell / 2, Math.min(r, cell * 0.62), 0, TAU);
        ctx.fill();
      }
    }

    /* the ear and the jaw line, drawn over the dots rather than cut out of
       them — a hole in the silhouette reads as damage, a line reads as a face */
    var u2 = Math.min(w * (o.scale || 0.4), h * 0.44);
    var ex = w * (o.x == null ? 0.5 : o.x), ey = h * (o.y == null ? 0.44 : o.y);
    ctx.save();
    if (o.flip) { ctx.translate(w, 0); ctx.scale(-1, 1); ex = w - ex; }
    ctx.fillStyle = rgba(mix(back, ink, 0.5), 0.55);
    ctx.beginPath();
    ctx.moveTo(ex + 0.10 * u2, ey - 0.05 * u2);
    ctx.bezierCurveTo(ex + 0.21 * u2, ey - 0.10 * u2, ex + 0.23 * u2, ey + 0.08 * u2, ex + 0.15 * u2, ey + 0.14 * u2);
    ctx.bezierCurveTo(ex + 0.11 * u2, ey + 0.17 * u2, ex + 0.08 * u2, ey + 0.05 * u2, ex + 0.10 * u2, ey - 0.05 * u2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = rgba(mix(back, ink, 0.22), 0.7);
    ctx.lineWidth = Math.max(1, u2 * 0.013);
    ctx.beginPath();
    ctx.moveTo(ex + 0.13 * u2, ey - 0.03 * u2);
    ctx.quadraticCurveTo(ex + 0.18 * u2, ey + 0.01 * u2, ex + 0.14 * u2, ey + 0.08 * u2);
    ctx.stroke();

    /* the brow and the eye. Two short strokes, and the profile stops being a
       shape and starts being somebody. */
    ctx.lineWidth = Math.max(1.2, u2 * 0.028);
    ctx.beginPath();
    ctx.moveTo(ex - 0.46 * u2, ey - 0.30 * u2);
    ctx.quadraticCurveTo(ex - 0.34 * u2, ey - 0.36 * u2, ex - 0.20 * u2, ey - 0.32 * u2);
    ctx.stroke();
    ctx.lineWidth = Math.max(1, u2 * 0.02);
    ctx.beginPath();
    ctx.moveTo(ex - 0.42 * u2, ey - 0.19 * u2);
    ctx.quadraticCurveTo(ex - 0.33 * u2, ey - 0.235 * u2, ex - 0.25 * u2, ey - 0.19 * u2);
    ctx.quadraticCurveTo(ex - 0.33 * u2, ey - 0.15 * u2, ex - 0.42 * u2, ey - 0.19 * u2);
    ctx.stroke();
    ctx.fillStyle = rgba(mix(back, ink, 0.28), 0.9);
    ctx.beginPath();
    ctx.arc(ex - 0.335 * u2, ey - 0.192 * u2, u2 * 0.026, 0, TAU);
    ctx.fill();

    ctx.restore();

    vignette(ctx, w, h, 0.52, mix(back, [0, 0, 0], 0.65));
    grain(ctx, w, h, 0.7, seed + 2);
  });

  /* --- 4b-ii. A ROOM, AT NIGHT ------------------------------------------
     The first version of this drew the whole room — walls, window, floor,
     tables — and read as a diagram of a restaurant rather than a picture
     of one. A dark room photographs as almost entirely black with two or
     three things catching the light, so that is what this draws: a table
     in the foreground, a candle on it, and everything else falling away.

     `warm` is the light, `cool` is whatever is left of the day, `dark` is
     the room. A restaurant at dusk and a barber's at closing time are the
     same drawing with different numbers. */
  register("interior", function (ctx, w, h, o, t) {
    var warm = hex(o.warm || "#ffa04a");
    var cool = hex(o.cool || "#2d4a63");
    var dark = hex(o.dark || "#0b0d0f");
    var seed = o.seed == null ? 17 : o.seed;
    var flick = REDUCED ? 1 : 0.9 + Math.sin((t || 0) * 0.0062) * 0.055 + Math.sin((t || 0) * 0.019) * 0.045;
    var tableY = h * 0.62;

    /* the room: black, with the fire bleeding in from one side */
    var g = ctx.createLinearGradient(0, 0, w, h * 0.7);
    g.addColorStop(0, rgba(mix(dark, warm, 0.1), 1));
    g.addColorStop(0.5, rgba(dark, 1));
    g.addColorStop(1, rgba(mix(dark, [0, 0, 0], 0.5), 1));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.globalCompositeOperation = "screen";

    /* the last of the daylight, high and cold */
    var day = ctx.createLinearGradient(w * 0.78, 0, w, h * 0.5);
    day.addColorStop(0, rgba(cool, 0.16));
    day.addColorStop(1, rgba(cool, 0));
    ctx.fillStyle = day;
    ctx.fillRect(w * 0.6, 0, w * 0.4, h * 0.55);

    /* the fire, off to the left and out of frame */
    var fire = ctx.createRadialGradient(-w * 0.08, h * 0.5, 0, -w * 0.05, h * 0.48, w * 0.62);
    fire.addColorStop(0, rgba(warm, 0.4 * flick));
    fire.addColorStop(0.35, rgba(warm, 0.1 * flick));
    fire.addColorStop(1, rgba(warm, 0));
    ctx.fillStyle = fire;
    ctx.fillRect(0, 0, w, h);

    /* pendant bulbs: small, bright, tight. Big soft discs read as blobs. */
    var lamps = o.lamps == null ? 3 : o.lamps;
    for (var i = 0; i < lamps; i++) {
      var lx = w * (0.24 + (i / Math.max(1, lamps - 1)) * 0.56) + (hash(i, 2, seed) - 0.5) * w * 0.04;
      var ly = h * (0.17 + hash(i, 5, seed) * 0.1);
      var lr = Math.min(w, h) * (0.055 + hash(i, 8, seed) * 0.02);
      var lg = ctx.createRadialGradient(lx, ly, 0, lx, ly, lr);
      lg.addColorStop(0, rgba(mix(warm, [255, 250, 236], 0.75), 0.95));
      lg.addColorStop(0.11, rgba(mix(warm, [255, 236, 200], 0.4), 0.55));
      lg.addColorStop(0.42, rgba(warm, 0.11));
      lg.addColorStop(1, rgba(warm, 0));
      ctx.fillStyle = lg;
      ctx.beginPath(); ctx.arc(lx, ly, lr, 0, TAU); ctx.fill();
    }

    /* candles on the tables behind, out of focus */
    for (var c = 0; c < 4; c++) {
      var bx = w * (0.16 + hash(c, 3, seed) * 0.76);
      var by = h * (0.44 + hash(c, 7, seed) * 0.13);
      var br = Math.min(w, h) * (0.03 + hash(c, 11, seed) * 0.025);
      var bg = ctx.createRadialGradient(bx, by, 0, bx, by, br);
      bg.addColorStop(0, rgba(mix(warm, [255, 240, 210], 0.5), 0.5 * flick));
      bg.addColorStop(1, rgba(warm, 0));
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.arc(bx, by, br, 0, TAU); ctx.fill();
    }
    ctx.restore();

    /* chair backs, barely there */
    ctx.fillStyle = rgba(mix(dark, [0, 0, 0], 0.55), 0.9);
    for (var ch = 0; ch < 4; ch++) {
      var cx2 = w * (0.1 + hash(ch, 13, seed) * 0.8);
      var cw = w * (0.045 + hash(ch, 17, seed) * 0.028);
      var chh = h * (0.07 + hash(ch, 19, seed) * 0.035);
      /* they sit behind the table, so only the tops of the backs show */
      var cy3 = h * 0.655 - hash(ch, 23, seed) * h * 0.03;
      ctx.beginPath();
      ctx.moveTo(cx2 - cw, cy3);
      ctx.lineTo(cx2 + cw, cy3);
      ctx.lineTo(cx2 + cw * 0.86, cy3 - chh);
      ctx.quadraticCurveTo(cx2, cy3 - chh * 1.14, cx2 - cw * 0.86, cy3 - chh);
      ctx.closePath();
      ctx.fill();
    }

    /* ---- the table, and the three things on it ---- */
    var top = ctx.createLinearGradient(0, tableY, 0, h);
    top.addColorStop(0, rgba(mix(dark, warm, 0.2), 1));
    top.addColorStop(0.2, rgba(mix(dark, warm, 0.09), 1));
    top.addColorStop(1, rgba(mix(dark, [0, 0, 0], 0.6), 1));
    ctx.fillStyle = top;
    ctx.beginPath();
    ctx.moveTo(-w * 0.05, tableY + h * 0.04);
    ctx.quadraticCurveTo(w * 0.5, tableY - h * 0.03, w * 1.05, tableY + h * 0.04);
    ctx.lineTo(w * 1.05, h);
    ctx.lineTo(-w * 0.05, h);
    ctx.closePath();
    ctx.fill();

    /* the sheen along the near edge */
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.strokeStyle = rgba(mix(warm, [255, 240, 214], 0.5), 0.26);
    ctx.lineWidth = Math.max(1.5, h * 0.004);
    ctx.beginPath();
    ctx.moveTo(-w * 0.05, tableY + h * 0.04);
    ctx.quadraticCurveTo(w * 0.5, tableY - h * 0.03, w * 1.05, tableY + h * 0.04);
    ctx.stroke();
    ctx.restore();

    /* a plate */
    var px = w * 0.36, py = tableY + h * 0.15;
    var prx = w * 0.15, pry = prx * 0.3;
    var pg = ctx.createLinearGradient(px - prx, py - pry, px + prx, py + pry);
    pg.addColorStop(0, rgba(mix(dark, mix([246, 240, 228], warm, 0.2), 0.34), 1));
    pg.addColorStop(0.5, rgba(mix(dark, mix([246, 240, 228], warm, 0.34), 0.52), 1));
    pg.addColorStop(1, rgba(mix(dark, warm, 0.12), 1));
    ctx.fillStyle = pg;
    ctx.beginPath(); ctx.ellipse(px, py, prx, pry, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = rgba(mix(warm, [255, 255, 255], 0.6), 0.3);
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.ellipse(px, py, prx * 0.72, pry * 0.72, 0, 0, TAU); ctx.stroke();

    /* cutlery: two bright hairlines, which is all cutlery ever is at night */
    ctx.strokeStyle = rgba(mix(warm, [255, 252, 240], 0.72), 0.5);
    ctx.lineCap = "round";
    [-1, 1].forEach(function (side) {
      var kx0 = px + side * prx * 1.28;
      /* a handle, then a wider head — enough to read as a knife and a fork */
      ctx.lineWidth = Math.max(1.4, w * 0.0032);
      ctx.beginPath();
      ctx.moveTo(kx0, py + pry * 1.2);
      ctx.lineTo(kx0 - side * prx * 0.03, py - pry * 0.35);
      ctx.stroke();
      ctx.lineWidth = Math.max(2.4, w * 0.0058);
      ctx.beginPath();
      ctx.moveTo(kx0 - side * prx * 0.03, py - pry * 0.4);
      ctx.lineTo(kx0 - side * prx * 0.05, py - pry * 1.15);
      ctx.stroke();
    });

    /* a glass, with the candle caught in it */
    var gx = w * 0.63, gy = tableY + h * 0.055;
    var gw = w * 0.045, gh = h * 0.15;
    ctx.fillStyle = rgba(mix(dark, [190, 200, 205], 0.14), 0.9);
    ctx.beginPath();
    ctx.moveTo(gx - gw, gy);
    ctx.bezierCurveTo(gx - gw, gy + gh * 0.46, gx - gw * 0.16, gy + gh * 0.5, gx - gw * 0.13, gy + gh * 0.62);
    ctx.lineTo(gx + gw * 0.13, gy + gh * 0.62);
    ctx.bezierCurveTo(gx + gw * 0.16, gy + gh * 0.5, gx + gw, gy + gh * 0.46, gx + gw, gy);
    ctx.closePath();
    ctx.fill();
    /* the wine in it */
    ctx.fillStyle = rgba(mix([92, 18, 26], warm, 0.24), 0.82);
    ctx.beginPath();
    ctx.moveTo(gx - gw * 0.82, gy + gh * 0.14);
    ctx.bezierCurveTo(gx - gw * 0.8, gy + gh * 0.42, gx - gw * 0.16, gy + gh * 0.46, gx, gy + gh * 0.46);
    ctx.bezierCurveTo(gx + gw * 0.16, gy + gh * 0.46, gx + gw * 0.8, gy + gh * 0.42, gx + gw * 0.82, gy + gh * 0.14);
    ctx.closePath();
    ctx.fill();
    /* stem and foot */
    ctx.fillStyle = rgba(mix(dark, [190, 200, 205], 0.12), 0.85);
    ctx.fillRect(gx - gw * 0.05, gy + gh * 0.62, gw * 0.1, gh * 0.28);
    ctx.beginPath(); ctx.ellipse(gx, gy + gh * 0.9, gw * 0.52, gh * 0.035, 0, 0, TAU); ctx.fill();
    /* the highlight down one side */
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.strokeStyle = rgba(mix(warm, [255, 255, 255], 0.8), 0.4);
    ctx.lineWidth = Math.max(1.2, w * 0.0026);
    ctx.beginPath();
    ctx.moveTo(gx - gw * 0.78, gy + gh * 0.06);
    ctx.bezierCurveTo(gx - gw * 0.78, gy + gh * 0.36, gx - gw * 0.3, gy + gh * 0.44, gx - gw * 0.16, gy + gh * 0.5);
    ctx.stroke();
    ctx.restore();

    /* the candle: the brightest thing in the picture */
    var kx = w * 0.83, ky = tableY + h * 0.1;
    var kh = h * 0.14;
    ctx.fillStyle = rgba(mix(dark, [236, 228, 210], 0.42), 1);
    ctx.fillRect(kx - w * 0.011, ky, w * 0.022, kh);
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    var fl = ctx.createRadialGradient(kx, ky - h * 0.018, 0, kx, ky - h * 0.012, Math.min(w, h) * 0.16);
    fl.addColorStop(0, rgba([255, 252, 240], 0.98 * flick));
    fl.addColorStop(0.06, rgba(mix(warm, [255, 244, 214], 0.6), 0.8 * flick));
    fl.addColorStop(0.34, rgba(warm, 0.2 * flick));
    fl.addColorStop(1, rgba(warm, 0));
    ctx.fillStyle = fl;
    ctx.beginPath(); ctx.arc(kx, ky - h * 0.014, Math.min(w, h) * 0.16, 0, TAU); ctx.fill();
    /* the flame itself */
    ctx.fillStyle = rgba([255, 250, 232], 0.95 * flick);
    ctx.beginPath();
    ctx.moveTo(kx - w * 0.005, ky - h * 0.004);
    ctx.quadraticCurveTo(kx - w * 0.006, ky - h * 0.026, kx, ky - h * 0.038 * flick);
    ctx.quadraticCurveTo(kx + w * 0.006, ky - h * 0.026, kx + w * 0.005, ky - h * 0.004);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    vignette(ctx, w, h, 0.66, mix(dark, [0, 0, 0], 0.8));
    grain(ctx, w, h, 0.55, seed);
  }, true);

  /* --- 4c. THE BOARD ---------------------------------------------------
     A board seen from a low angle under one soft light, with turned
     pieces standing on it. The perspective is a straight quad map, which
     is all a flat board needs. */
  var PIECE = {
    /* silhouette profiles in a 0..1 box, x from the centre line */
    pawn:   [[0.00,1],[0.20,1],[0.20,0.94],[0.13,0.88],[0.15,0.62],[0.10,0.50],[0.13,0.44],[0.00,0.44]],
    rook:   [[0.00,1],[0.25,1],[0.25,0.93],[0.18,0.86],[0.19,0.40],[0.27,0.34],[0.27,0.18],[0.20,0.18],[0.20,0.27],[0.13,0.27],[0.13,0.18],[0.06,0.18],[0.06,0.27],[0.00,0.27]],
    knight: [[0.00,1],[0.26,1],[0.26,0.92],[0.19,0.86],[0.22,0.60],[0.30,0.44],[0.28,0.28],[0.18,0.16],[0.04,0.14],[0.00,0.20]],
    bishop: [[0.00,1],[0.24,1],[0.24,0.93],[0.17,0.87],[0.19,0.56],[0.13,0.44],[0.15,0.30],[0.08,0.16],[0.00,0.11]],
    queen:  [[0.00,1],[0.28,1],[0.28,0.92],[0.20,0.85],[0.22,0.52],[0.15,0.42],[0.26,0.24],[0.20,0.16],[0.10,0.22],[0.00,0.12]],
    king:   [[0.00,1],[0.28,1],[0.28,0.92],[0.20,0.85],[0.22,0.50],[0.15,0.40],[0.24,0.26],[0.18,0.18],[0.09,0.18],[0.09,0.08],[0.00,0.08]]
  };

  register("board", function (ctx, w, h, o) {
    var light = hex(o.light || "#e8e2d4");
    var dark = hex(o.dark || "#25382f");
    var back = hex(o.back || "#f1efe8");
    var seed = o.seed == null ? 11 : o.seed;
    var tilt = o.tilt == null ? 0.42 : o.tilt;

    /* the table it stands on */
    var tg = ctx.createLinearGradient(0, 0, 0, h);
    tg.addColorStop(0, rgba(mix(back, dark, 0.26), 1));
    tg.addColorStop(0.44, rgba(back, 1));
    tg.addColorStop(1, rgba(mix(back, [0, 0, 0], 0.14), 1));
    ctx.fillStyle = tg;
    ctx.fillRect(0, 0, w, h);

    /* the board quad: a trapezoid, near edge wide */
    var cx = w * 0.5;
    var nearW = w * 0.96, farW = nearW * (1 - tilt * 0.52);
    var nearY = h * 0.97, farY = h * 0.50;
    function quad(u, v) {
      /* v: 0 far, 1 near — perspective-correct in v so squares foreshorten */
      var vv = v / (v + (1 - v) * (farW / nearW));
      var y = farY + (nearY - farY) * vv;
      var half = (farW + (nearW - farW) * vv) / 2;
      return [cx + (u - 0.5) * half * 2, y];
    }

    /* squares */
    for (var r = 0; r < 8; r++) {
      for (var c = 0; c < 8; c++) {
        var p0 = quad(c / 8, r / 8), p1 = quad((c + 1) / 8, r / 8);
        var p2 = quad((c + 1) / 8, (r + 1) / 8), p3 = quad(c / 8, (r + 1) / 8);
        var isDark = (r + c) % 2 === 1;
        var base = isDark ? dark : light;
        /* grain of the timber, and the light falling off towards the far edge */
        var shade = 0.72 + (r / 7) * 0.28 + (noise2(c * 1.7, r * 1.7, seed) - 0.5) * 0.12;
        ctx.fillStyle = rgba(mix(mix(base, [0, 0, 0], 0.14), base, shade), 1);
        ctx.beginPath();
        ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]); ctx.lineTo(p3[0], p3[1]);
        ctx.closePath(); ctx.fill();
      }
    }

    /* the frame */
    var f0 = quad(-0.035, -0.03), f1 = quad(1.035, -0.03), f2 = quad(1.035, 1.03), f3 = quad(-0.035, 1.03);
    ctx.strokeStyle = rgba(mix(dark, [0, 0, 0], 0.42), 0.9);
    ctx.lineWidth = Math.max(2, w * 0.006);
    ctx.beginPath();
    ctx.moveTo(f0[0], f0[1]); ctx.lineTo(f1[0], f1[1]);
    ctx.lineTo(f2[0], f2[1]); ctx.lineTo(f3[0], f3[1]);
    ctx.closePath(); ctx.stroke();

    /* pieces */
    var men = o.men || [
      ["king", 4, 7, 0], ["queen", 3, 7, 0], ["bishop", 2, 7, 0], ["knight", 6, 7, 0], ["rook", 0, 7, 0],
      ["pawn", 4, 4, 0], ["pawn", 3, 6, 0], ["pawn", 5, 6, 0],
      ["king", 4, 0, 1], ["queen", 3, 0, 1], ["knight", 2, 2, 1], ["bishop", 5, 3, 1], ["rook", 7, 0, 1],
      ["pawn", 4, 3, 1], ["pawn", 2, 1, 1], ["pawn", 6, 1, 1]
    ];
    men.sort(function (a, b) { return a[2] - b[2]; });
    men.forEach(function (m) {
      var kind = m[0], file = m[1], rank = m[2], side = m[3];
      var foot = quad((file + 0.5) / 8, (rank + 0.85) / 8);
      var span = quad((file + 1) / 8, (rank + 0.85) / 8)[0] - quad(file / 8, (rank + 0.85) / 8)[0];
      var ph = span * (kind === "pawn" ? 1.45 : kind === "king" || kind === "queen" ? 2.05 : 1.78);
      var prof = PIECE[kind];

      /* the shadow it throws */
      ctx.save();
      ctx.fillStyle = "rgba(20,26,22,0.3)";
      ctx.beginPath();
      ctx.ellipse(foot[0] + span * 0.24, foot[1], span * 0.44, span * 0.15, 0, 0, TAU);
      ctx.fill();
      ctx.restore();

      var body = side ? mix(dark, [0, 0, 0], 0.34) : mix(light, [255, 255, 255], 0.28);
      var lit = side ? mix(body, [255, 255, 255], 0.3) : mix(body, [255, 255, 255], 0.75);
      var lg = ctx.createLinearGradient(foot[0] - span * 0.4, foot[1] - ph, foot[0] + span * 0.4, foot[1]);
      lg.addColorStop(0, rgba(lit, 1));
      lg.addColorStop(0.45, rgba(body, 1));
      lg.addColorStop(1, rgba(mix(body, [0, 0, 0], 0.45), 1));
      ctx.fillStyle = lg;

      ctx.beginPath();
      for (var i = 0; i < prof.length; i++) {
        var px = foot[0] - prof[i][0] * span, py = foot[1] - (1 - prof[i][1]) * ph;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      for (var j = prof.length - 1; j >= 0; j--) {
        ctx.lineTo(foot[0] + prof[j][0] * span, foot[1] - (1 - prof[j][1]) * ph);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = rgba(mix(body, [0, 0, 0], 0.55), 0.55);
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    /* one soft light, from over the left shoulder */
    var lgl = ctx.createRadialGradient(w * 0.3, h * 0.1, 0, w * 0.4, h * 0.35, Math.max(w, h) * 0.95);
    lgl.addColorStop(0, "rgba(255,250,236,0.3)");
    lgl.addColorStop(0.5, "rgba(255,250,236,0.05)");
    lgl.addColorStop(1, "rgba(20,26,22,0.34)");
    ctx.fillStyle = lgl;
    ctx.fillRect(0, 0, w, h);
    grain(ctx, w, h, 0.42, seed);
  });

  /* --- 4c-ii. A STREET MAP ----------------------------------------------
     Blocks, then the roads between them, then one marker. Generated from
     a seed so it is a plausible town rather than a real one — putting a
     real street plan on a demo for a shop that does not exist would be
     claiming an address. */
  register("map", function (ctx, w, h, o) {
    var paper = hex(o.paper || "#17130f");
    var road = hex(o.road || "#2b241c");
    var line = hex(o.line || "#3d3428");
    var accent = hex(o.accent || "#c9a227");
    var water = hex(o.water || "#1b2a2e");
    var seed = o.seed == null ? 3 : o.seed;

    ctx.fillStyle = rgba(paper, 1);
    ctx.fillRect(0, 0, w, h);

    /* the river, cutting a corner off */
    ctx.fillStyle = rgba(water, 1);
    ctx.beginPath();
    ctx.moveTo(w * 1.05, h * 0.1);
    for (var rx = 1.05; rx >= -0.05; rx -= 0.04) {
      ctx.lineTo(w * rx, h * (0.72 + Math.sin(rx * 3.1 + seed) * 0.09));
    }
    ctx.lineTo(-w * 0.05, h * 1.05);
    ctx.lineTo(w * 1.05, h * 1.05);
    ctx.closePath();
    ctx.fill();

    /* a grid of roads, jittered off the square */
    var cols = 6, rows = 5;
    var vx = [], hy = [];
    for (var c = 0; c <= cols; c++) vx.push(w * (c / cols) + (hash(c, 1, seed) - 0.5) * w * 0.07);
    for (var r = 0; r <= rows; r++) hy.push(h * (r / rows) + (hash(r, 2, seed) - 0.5) * h * 0.07);

    /* blocks first, so the roads sit on top */
    ctx.fillStyle = rgba(mix(paper, [255, 255, 255], 0.045), 1);
    for (var bc = 0; bc < cols; bc++) {
      for (var br = 0; br < rows; br++) {
        if (hy[br] > h * 0.66 && hash(bc, br + 9, seed) > 0.3) continue;   /* the far bank */
        var pad = Math.min(w, h) * 0.012;
        ctx.fillRect(vx[bc] + pad, hy[br] + pad, vx[bc + 1] - vx[bc] - pad * 2, hy[br + 1] - hy[br] - pad * 2);
      }
    }

    ctx.strokeStyle = rgba(road, 1);
    ctx.lineCap = "square";
    for (var v = 0; v <= cols; v++) {
      ctx.lineWidth = v % 3 === 1 ? Math.max(5, w * 0.011) : Math.max(2.5, w * 0.005);
      ctx.beginPath(); ctx.moveTo(vx[v], -10); ctx.lineTo(vx[v] + (hash(v, 5, seed) - 0.5) * w * 0.05, h + 10); ctx.stroke();
    }
    for (var hh = 0; hh <= rows; hh++) {
      if (hy[hh] > h * 0.7) continue;
      ctx.lineWidth = hh % 2 === 0 ? Math.max(5, w * 0.011) : Math.max(2.5, w * 0.005);
      ctx.beginPath(); ctx.moveTo(-10, hy[hh]); ctx.lineTo(w + 10, hy[hh] + (hash(hh, 7, seed) - 0.5) * h * 0.05); ctx.stroke();
    }

    /* centre lines on the two main roads */
    ctx.strokeStyle = rgba(line, 1);
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 8]);
    ctx.beginPath(); ctx.moveTo(vx[1], -10); ctx.lineTo(vx[1] + (hash(1, 5, seed) - 0.5) * w * 0.05, h + 10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-10, hy[2]); ctx.lineTo(w + 10, hy[2] + (hash(2, 7, seed) - 0.5) * h * 0.05); ctx.stroke();
    ctx.setLineDash([]);

    /* the marker */
    var mx = o.mx == null ? w * 0.42 : w * o.mx;
    var my = o.my == null ? h * 0.44 : h * o.my;
    var mr = Math.min(w, h) * 0.055;
    var halo = ctx.createRadialGradient(mx, my, 0, mx, my, mr * 3.4);
    halo.addColorStop(0, rgba(accent, 0.32));
    halo.addColorStop(1, rgba(accent, 0));
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(mx, my, mr * 3.4, 0, TAU); ctx.fill();

    ctx.fillStyle = rgba(accent, 1);
    ctx.beginPath();
    ctx.moveTo(mx, my + mr * 1.5);
    ctx.bezierCurveTo(mx - mr * 1.05, my + mr * 0.15, mx - mr, my - mr * 1.1, mx, my - mr * 1.1);
    ctx.bezierCurveTo(mx + mr, my - mr * 1.1, mx + mr * 1.05, my + mr * 0.15, mx, my + mr * 1.5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = rgba(paper, 1);
    ctx.beginPath(); ctx.arc(mx, my - mr * 0.28, mr * 0.34, 0, TAU); ctx.fill();

    grain(ctx, w, h, 0.4, seed);
  });

  /* --- 4d. FIELD -------------------------------------------------------
     A quiet full-bleed texture for section grounds: two colours, fBm, a
     few contour threads. Cheap, and it stops a page being flat paper. */
  register("field", function (ctx, w, h, o, t) {
    var a = hex(o.a || "#12100e"), b = hex(o.b || "#2a231c");
    var line = hex(o.line || "#c9a227");
    var seed = o.seed == null ? 21 : o.seed;
    var drift = REDUCED ? 0 : (t || 0) * 0.00003;
    var step = Math.max(6, Math.round(Math.min(w, h) / 90));

    for (var y = 0; y < h; y += step) {
      for (var x = 0; x < w; x += step) {
        var n = fbm(x * 0.0035, y * 0.0035 + drift * 30, 4, seed);
        n = smooth(Math.min(1, Math.max(0, (n - 0.28) / 0.44)));
        ctx.fillStyle = rgba(mix(a, b, n), 1);
        ctx.fillRect(x, y, step + 1, step + 1);
      }
    }
    ctx.strokeStyle = rgba(line, 0.24);
    ctx.lineWidth = 1;
    for (var lv = 0.34; lv < 0.72; lv += 0.055) {
      ctx.beginPath();
      var started = false;
      for (var sx = 0; sx <= w; sx += 5) {
        var v = fbm(sx * 0.0035, drift * 30, 4, seed);
        var sy = h * (0.5 + (v - lv) * 5.5);
        if (sy < -h || sy > h * 2) { started = false; continue; }
        if (!started) { ctx.moveTo(sx, sy); started = true; } else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    }
    grain(ctx, w, h, 0.4, seed);
  }, true);

  /* ---------- 5. the driver ------------------------------------------ */
  /* Two independent frame loops interleave as read-write-read-write, so a
     canvas measuring itself in its own loop still measures after the other
     loop has written. When Motion is on the page, Art rides its phases
     instead of running a loop of its own — one read pass, then one draw
     pass, for everything. */
  var live = [];
  var running = false;
  var joined = false;
  var queue = [];

  function measure(entry) {
    var c = entry.canvas;
    entry.w = c.clientWidth || c.offsetWidth || 0;
    entry.h = c.clientHeight || c.offsetHeight || 0;
  }

  function paint(entry, t) {
    var c = entry.canvas, p = entry.painter;
    var dpr = Math.min(window.devicePixelRatio || 1, entry.opts.dpr || 2);
    if (!entry.w || !entry.h) measure(entry);
    var w = entry.w, h = entry.h;
    if (!w || !h) return;
    var nw = Math.round(w * dpr), nh = Math.round(h * dpr);
    if (c.width !== nw || c.height !== nh) { c.width = nw; c.height = nh; }
    var ctx = c.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    try { p.fn(ctx, w, h, entry.opts, t || 0); } catch (e) {}
    c.setAttribute("data-painted", "true");
  }

  function readAll() {
    for (var i = 0; i < queue.length; i++) measure(queue[i]);
    if (REDUCED) return;
    for (var j = 0; j < live.length; j++) {
      if (live[j].painter.animated && live[j].onscreen) measure(live[j]);
    }
  }
  function drawAll(dt, t) {
    var now = t || performance.now();
    while (queue.length) paint(queue.shift(), now);
    if (REDUCED) return;
    for (var i = 0; i < live.length; i++) {
      if (live[i].painter.animated && live[i].onscreen) paint(live[i], now);
    }
  }

  function frame(t) {
    if (!running) return;
    /* A deferred script runs while readyState is already "interactive", so
       art.js boots before motion.js has even executed and Motion is not there
       to join yet. Keep checking: the moment it appears, hand the phases over
       and stop this loop, or the two loops interleave read-write-read-write
       and every paint measures after somebody else's write. */
    if (!joined && window.Motion && window.Motion.onRead) {
      running = false;
      wake();
      return;
    }
    readAll();
    drawAll(16.7, t);
    requestAnimationFrame(frame);
  }

  function wake() {
    /* Motion's loop always runs, so joining it also covers canvases that come
       into view while nothing is animating */
    if (window.Motion && window.Motion.onRead) {
      if (!joined) {
        joined = true;
        window.Motion.onRead(readAll);
        window.Motion.onWrite(drawAll);
      }
      window.Motion.start();
      return;
    }
    if (running) return;
    running = true;
    requestAnimationFrame(frame);
  }

  function boot() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll("canvas[data-art]"));
    if (!nodes.length) return;

    nodes.forEach(function (c) {
      var name = c.getAttribute("data-art");
      var p = PAINTERS[name];
      if (!p) return;
      var opts = {};
      try { opts = JSON.parse(c.getAttribute("data-art-opts") || "{}"); } catch (e) {}
      var entry = { canvas: c, painter: p, opts: opts, onscreen: false, done: false, w: 0, h: 0 };
      live.push(entry);
      c._art = entry;
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var e = en.target._art;
        if (!e) return;
        e.onscreen = en.isIntersecting;
        /* an observer callback lands after this frame's writes, so the first
           paint is queued rather than done here */
        if (en.isIntersecting && !e.done) { e.done = true; queue.push(e); }
      });
      wake();
    }, { rootMargin: "220px" });

    live.forEach(function (e) { io.observe(e.canvas); });

    var rt = 0;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        live.forEach(function (e) { if (e.done) queue.push(e); });
        wake();
      }, 180);
    }, { passive: true });

    wake();
  }

  window.Art = {
    register: register, noise2: noise2, fbm: fbm,
    hex: hex, mix: mix, rgba: rgba, ramp: ramp, grain: grain, vignette: vignette,

    /* Repaints are queued, not done on the spot: a caller is usually inside a
       scroll writer, and painting there would measure after a write. */
    repaint: function (sel) {
      var c = typeof sel === "string" ? document.querySelector(sel) : sel;
      if (c && c._art) { queue.push(c._art); wake(); }
    },
    set: function (sel, opts) {
      var c = typeof sel === "string" ? document.querySelector(sel) : sel;
      if (!c || !c._art) return;
      for (var k in opts) c._art.opts[k] = opts[k];
      /* an animated painter is already being drawn every frame */
      if (!c._art.painter.animated) { queue.push(c._art); wake(); }
    },
    /* paint a canvas that was never in the document at boot — the lightbox
       clones one, and a clone has no entry in `live` to look up */
    paintInto: function (canvas, name, opts) {
      var painter = PAINTERS[name];
      if (!painter || !canvas) return;
      var entry = { canvas: canvas, painter: painter, opts: opts || {}, onscreen: true, done: true, w: 0, h: 0 };
      canvas._art = entry;
      live.push(entry);
      queue.push(entry);
      wake();
    },
    forget: function (canvas) {
      for (var i = live.length - 1; i >= 0; i--) if (live[i].canvas === canvas) live.splice(i, 1);
      for (var j = queue.length - 1; j >= 0; j--) if (queue[j].canvas === canvas) queue.splice(j, 1);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else { boot(); }
})();
