"use client";

import { useEffect, useRef } from "react";
import { scrollState, trackScroll } from "./scroll-state";

/**
 * The dream sky.
 *
 * A volumetric cloud raymarch: the primary ray walks a slab of fBm density,
 * and at every sample that hits cloud a short secondary march runs toward the
 * sun to find how much light survives to that point. That second march is the
 * entire reason clouds look like clouds — without it you get flat grey cotton,
 * because the silver lining is self-shadowing and nothing else.
 *
 * Cost is controlled the same way as any production volumetric:
 *  - the primary loop is capped and its step grows with distance;
 *  - the light march is 4 samples, not 32, and takes long strides;
 *  - it renders below device resolution and is upscaled by the compositor;
 *  - the step count adapts to measured frame time, so a weak GPU gets softer
 *    clouds rather than a slideshow.
 */
export default function CloudCanvas({
  onTelemetry,
}: {
  onTelemetry?: (t: { fps: number; steps: number; scale: number }) => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const tel = useRef(onTelemetry);
  tel.current = onTelemetry;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", {
      antialias: false, alpha: false, depth: false, stencil: false,
      powerPreference: "high-performance",
    });
    if (!gl) return;

    const VERT = `#version 300 es
    in vec2 p; void main(){ gl_Position = vec4(p,0.0,1.0); }`;

    const FRAG = `#version 300 es
    precision highp float;
    out vec4 outColour;

    uniform vec2  uRes;
    uniform float uTime;
    uniform vec2  uMouse;
    uniform float uSteps;
    uniform float uDescent;

    float hash(vec3 p){
      p = fract(p * 0.3183099 + 0.1); p *= 17.0;
      return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
    }
    float noise(vec3 x){
      vec3 i = floor(x), f = fract(x);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(mix(hash(i), hash(i+vec3(1,0,0)), f.x), mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
        mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x), mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y), f.z);
    }
    float fbm(vec3 p){
      float a = 0.5, s = 0.0;
      for (int i = 0; i < 5; i++){ s += a * noise(p); p = p * 2.02 + 19.19; a *= 0.5; }
      return s;
    }

    const vec3 SUN_DIR = normalize(vec3(0.62, 0.30, -0.72));

    /* Cloud density in a slab between y = 1.2 and y = 6.4.

       The vertical falloff is asymmetric on purpose: cumulus have flat, sharp
       bottoms where the air stops condensing and soft billowing tops, so the
       lower edge gets a hard smoothstep and the upper one a gentle exponent. */
    float clouds(vec3 p){
      // Cumulus have flat, sharp bottoms where the air stops condensing and
      // soft billowing tops, so the lower edge gets a tight ramp and the
      // upper one a long one.
      float base = smoothstep(1.0, 1.45, p.y) * (1.0 - smoothstep(2.5, 4.2, p.y));
      if (base <= 0.001) return 0.0;

      vec3 q = p * 0.30;
      q.x += uTime * 0.026;          // the whole sky drifts
      q.z += uTime * 0.010;

      float d = fbm(q);
      d += fbm(q * 3.1) * 0.16;      // a second octave set for edge detail
      d = d * base;

      // Coverage threshold. Raising it carves lanes of open sky, which is
      // what stops the field reading as one continuous ceiling of fog.
      /* Coverage. This threshold is the single most important number in the
         shader: too low and the deck closes into overcast, too high and the
         sky empties. Half the volume clearing it reads as scattered cumulus. */
      return clamp((d - 0.52) * 3.4, 0.0, 1.0);
    }

    // How much sun survives to a point: four long strides toward the light.
    float lightMarch(vec3 p){
      float t = 0.0, shade = 0.0;
      for (int i = 0; i < 4; i++){
        t += 0.34;
        shade += clouds(p + SUN_DIR * t);
      }
      return exp(-shade * 0.85);
    }

    vec3 skyColour(vec3 rd){
      float h = clamp(rd.y * 0.5 + 0.5, 0.0, 1.0);
      vec3 zenith  = mix(vec3(0.27, 0.42, 0.86), vec3(0.42, 0.44, 0.62), uDescent);
      vec3 mid     = mix(vec3(0.62, 0.74, 0.97), vec3(0.74, 0.72, 0.80), uDescent);
      vec3 horizon = mix(vec3(1.00, 0.87, 0.74), vec3(1.00, 0.82, 0.66), uDescent);
      vec3 c = mix(horizon, mid, smoothstep(0.34, 0.56, h));
      c = mix(c, zenith, smoothstep(0.54, 0.95, h));

      // Sun and its bloom, added to the sky rather than drawn as a disc.
      float s = max(0.0, dot(rd, SUN_DIR));
      c += vec3(1.00, 0.82, 0.58) * pow(s, 12.0) * 0.55;
      c += vec3(1.00, 0.90, 0.74) * pow(s, 240.0) * 2.4;
      return c;
    }

    void main(){
      vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;

      /* The descent.

         Scroll flies the camera from above the deck, down through it and out
         underneath. The pitch levels off as it falls, so you finish looking
         along the underside rather than straight at the floor -- a camera that
         keeps its entry angle all the way down reads as falling, not flying.

         Eased rather than linear: the interesting part of the shot is the
         moment inside the cloud, so the middle of the range is stretched. */
      float dsc = uDescent;
      float eased = dsc * dsc * (3.0 - 2.0 * dsc);
      vec3 ro = vec3(0.0, mix(5.6, 0.35, eased), uTime * 0.55);
      float yaw   = uMouse.x * 0.10;
      float pitch = mix(-0.115, 0.075, eased) + uMouse.y * 0.06;

      vec3 fw = normalize(vec3(sin(yaw), pitch, cos(yaw)));
      vec3 rt = normalize(cross(vec3(0.0, 1.0, 0.0), fw));
      vec3 up = cross(fw, rt);
      vec3 rd = normalize(fw * 1.25 + rt * uv.x + up * uv.y);

      vec3 col = skyColour(rd);

      /* Slab intersection, both directions.

         The camera flies *inside* the cloud layer, so a downward ray is not
         "below the clouds" -- it exits through the floor and crosses just as
         much density on the way. Testing only for upward rays drew a hard
         horizon across the frame and discarded half the sky. */
      {
        float tIn = 0.0;
        float tOut = -1.0;
        if (abs(rd.y) > 0.0015){
          float tTop = (4.2 - ro.y) / rd.y;
          float tBot = (1.0 - ro.y) / rd.y;
          tIn  = max(min(tTop, tBot), 0.0);
          tOut = min(max(tTop, tBot), 46.0);
        }

        if (tOut > tIn){
          int steps = int(uSteps);
          float span = min(tOut - tIn, 42.0);
          float dt = span / float(steps);

          // Dither entry, or the slab boundary shows as a hard arc.
          float t = tIn + dt * hash(vec3(gl_FragCoord.xy, uTime));

          float trans = 1.0;
          vec3 scatter = vec3(0.0);

          for (int i = 0; i < 96; i++){
            if (i >= steps || trans < 0.02 || t > tOut) break;
            vec3 pos = ro + rd * t;
            float d = clouds(pos);
            if (d > 0.01){
              float light = lightMarch(pos);
              // Warm in the lit parts, cool violet in shadow: skylight is what
              // fills a cloud's shaded side, and it is blue.
              vec3 lit    = vec3(1.00, 0.93, 0.80) * light * 1.62;
              vec3 shadow = vec3(0.40, 0.46, 0.74);
              vec3 c = mix(shadow, lit, light);

              float a = 1.0 - exp(-d * dt * 1.5);
              scatter += c * a * trans;
              trans *= 1.0 - a;
            }
            t += dt * (1.0 + t * 0.010);
          }
          col = col * trans + scatter;
        }
      }

      // Gentle shoulder, then grain so the big soft gradients do not band.
      col = col / (0.86 + col * 0.52);
      col = pow(col, vec3(0.4545));
      col += (hash(vec3(gl_FragCoord.xy, uTime * 0.7)) - 0.5) * 0.014;

      outColour = vec4(col, 1.0);
    }`;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    };

    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uMouse = gl.getUniformLocation(prog, "uMouse");
    const uSteps = gl.getUniformLocation(prog, "uSteps");
    const uDescent = gl.getUniformLocation(prog, "uDescent");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    const scale = coarse ? 0.40 : 0.54;
    let steps = coarse ? 26 : 44;
    const m = { x: 0, y: 0, tx: 0, ty: 0 };

    const resize = () => {
      const w = Math.max(1, Math.round(window.innerWidth * scale));
      const h = Math.max(1, Math.round(window.innerHeight * scale));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: PointerEvent) => {
      m.tx = (e.clientX / window.innerWidth) * 2 - 1;
      m.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const untrack = trackScroll();
    // Smoothed separately from the raw scroll value: wheel input arrives in
    // coarse jumps, and feeding those straight to a camera looks like a stutter
    // rather than a descent.
    let descent = scrollState.descent;

    let raf = 0, last = performance.now(), acc = 0, frames = 0, fps = 60;
    const t0 = performance.now();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      acc += dt; frames++;
      if (acc >= 0.5) {
        fps = frames / acc; acc = 0; frames = 0;
        if (fps < 45 && steps > 16) steps -= 4;
        else if (fps > 57 && steps < (coarse ? 32 : 52)) steps += 2;
        tel.current?.({ fps, steps, scale });
      }

      m.x += (m.tx - m.x) * Math.min(1, dt * 2.4);
      m.y += (m.ty - m.y) * Math.min(1, dt * 2.4);

      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, reduced ? 20 : (now - t0) / 1000);
      gl.uniform2f(uMouse, m.x, m.y);
      gl.uniform1f(uSteps, steps);
      descent += (scrollState.descent - descent) * Math.min(1, dt * 3.4);
      gl.uniform1f(uDescent, descent);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    if (reduced) {
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, 20);
      gl.uniform2f(uMouse, 0, 0);
      gl.uniform1f(uSteps, steps);
      gl.uniform1f(uDescent, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      tel.current?.({ fps: 0, steps, scale });
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      untrack();
      gl.deleteProgram(prog); gl.deleteShader(vs); gl.deleteShader(fs); gl.deleteBuffer(buf);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-20 h-full w-full" />;
}
