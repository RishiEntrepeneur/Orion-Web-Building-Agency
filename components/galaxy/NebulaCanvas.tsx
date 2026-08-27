"use client";

import { useEffect, useRef } from "react";

/**
 * The hero is a live volumetric raymarch, not a gradient.
 *
 * Every frame walks ~56 samples per pixel through a domain-warped fBm density
 * field shaped into a spiral disc, accumulating emission with front-to-back
 * alpha compositing. There is no texture, no model and no video: the whole
 * image is solved per pixel, per frame, which is the point — it is the one
 * thing on the page that could not have been dropped in from a library.
 *
 * Two things keep it affordable:
 *  - It renders to a buffer scaled below device resolution and is upscaled by
 *    the compositor. Volumetrics are fill-rate bound, so halving the linear
 *    resolution quarters the cost and the softness hides the difference.
 *  - The step count adapts. The loop measures its own frame time and drops
 *    steps until it holds budget, so a laptop integrated GPU degrades to a
 *    softer render rather than to eight frames a second.
 */
export default function NebulaCanvas({
  onTelemetry,
}: {
  onTelemetry?: (t: { fps: number; steps: number; scale: number }) => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const telemetry = useRef(onTelemetry);
  telemetry.current = onTelemetry;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
      depth: false,
      stencil: false,
    });
    if (!gl) return;

    const VERT = `#version 300 es
    in vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

    const FRAG = `#version 300 es
    precision highp float;
    out vec4 outColour;

    uniform vec2  uRes;
    uniform float uTime;
    uniform vec2  uMouse;
    uniform float uSteps;

    // -- Value noise. Cheap enough to afford five octaves inside a march loop.
    float hash(vec3 p){
      p = fract(p * 0.3183099 + 0.1);
      p *= 17.0;
      return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
    }
    float noise(vec3 x){
      vec3 i = floor(x), f = fract(x);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
            mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
        mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
            mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
    }
    float fbm(vec3 p){
      float a = 0.5, s = 0.0;
      for (int i = 0; i < 5; i++){ s += a * noise(p); p *= 2.03; a *= 0.5; }
      return s;
    }

    /* Density of the disc at a point.

       Three terms multiplied: an exponential falloff that makes it a disc
       rather than a ball, a logarithmic spiral that puts arms in it, and a
       domain-warped fBm that stops the arms looking drawn. Subtracting a
       constant at the end carves the empty lanes between arms -- without it
       the whole volume is faintly lit and reads as fog. */
    float density(vec3 p, float t){
      float r = length(p.xz);
      float a = atan(p.z, p.x);

      float arms = sin(a * 2.0 - log(max(r, 0.2)) * 3.4 + t * 0.06);
      arms = smoothstep(-0.1, 1.0, arms * 0.5 + 0.5);

      float disc = exp(-abs(p.y) * (3.2 + r * 0.5)) * exp(-r * 0.42);

      vec3 q = p * 1.15;
      q += (fbm(p * 0.55 + vec3(0.0, t * 0.015, 0.0)) - 0.5) * 2.4;
      float n = fbm(q * 1.25);

      return max(0.0, disc * (arms * 0.9 + 0.22) * n * 3.1 - 0.125);
    }

    /* Emission ramp. Hot violet-white in the core, cooling out through indigo
       to cyan at the rim, which is roughly how a real emission spectrum falls
       off with distance from the ionising source. */
    vec3 emission(float r, float d){
      vec3 core = vec3(1.00, 0.90, 0.98);
      vec3 hot  = vec3(0.86, 0.42, 1.00);
      vec3 mid  = vec3(0.36, 0.26, 1.00);
      vec3 rim  = vec3(0.00, 0.86, 1.00);
      float t = clamp(r * 0.32, 0.0, 1.0);
      vec3 c = mix(core, hot, smoothstep(0.0, 0.30, t));
      c = mix(c, mid, smoothstep(0.22, 0.62, t));
      c = mix(c, rim, smoothstep(0.52, 1.0, t));
      return c * (0.55 + d * 3.6);
    }

    // Star field, hashed on a cell grid so stars stay put between frames.
    vec3 stars(vec2 uv){
      vec2 g = floor(uv * 380.0);
      float h = fract(sin(dot(g, vec2(41.3, 289.1))) * 43758.5453);
      float s = smoothstep(0.9975, 1.0, h);
      float tw = 0.6 + 0.4 * sin(uTime * 1.6 + h * 90.0);
      return vec3(s * tw) * mix(vec3(0.7, 0.8, 1.0), vec3(1.0, 0.9, 0.85), fract(h * 7.0));
    }

    void main(){
      vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
      float t = uTime;

      // Orbit. The mouse leans the camera rather than spinning it, so the
      // structure stays legible while still answering the hand.
      float yaw   = t * 0.045 + uMouse.x * 0.55;
      float pitch = 0.40 + uMouse.y * 0.28;

      float cy = cos(yaw), sy = sin(yaw);
      float cp = cos(pitch), sp = sin(pitch);

      vec3 ro = vec3(sy * cp, sp, cy * cp) * 9.0;
      vec3 fw = normalize(-ro);
      vec3 rt = normalize(cross(vec3(0.0, 1.0, 0.0), fw));
      vec3 up = cross(fw, rt);
      vec3 rd = normalize(fw * 1.35 + rt * uv.x + up * uv.y);

      vec3 acc = vec3(0.0);
      float trans = 1.0;

      // Dither the entry point. Marching from a fixed distance every pixel
      // produces visible concentric banding; offsetting by a per-pixel hash
      // trades that for noise, which the eye forgives.
      float jitter = hash(vec3(gl_FragCoord.xy, t * 0.1));
      float dist = 3.2 + jitter * 0.25;

      int steps = int(uSteps);
      for (int i = 0; i < 96; i++){
        if (i >= steps || trans < 0.02) break;
        vec3 pos = ro + rd * dist;
        float d = density(pos, t);
        if (d > 0.001){
          float r = length(pos.xz);
          vec3 e = emission(r, d);
          float a = 1.0 - exp(-d * 0.62);
          acc += e * a * trans;
          trans *= 1.0 - a;
        }
        dist += 0.145 + dist * 0.012;
      }

      vec3 col = acc * 1.12 + stars(uv) * trans;

      // A cold bloom around the core, added rather than post-processed: one
      // extra term here is cheaper than a second pass over the framebuffer.
      float glow = 1.0 / (1.0 + length(uv) * 5.5);
      col += vec3(0.34, 0.16, 0.90) * glow * 0.62;

      // Filmic-ish curve, then a touch of grain so the gradients do not band.
      col = col / (0.82 + col * 0.92);
      col = pow(col, vec3(0.4545));
      col += (hash(vec3(gl_FragCoord.xy, t)) - 0.5) * 0.016;

      outColour = vec4(col, 1.0);
    }`;

    function compile(type: number, src: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
        console.error(gl!.getShaderInfoLog(s));
        return null;
      }
      return s;
    }

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

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    let scale = coarse ? 0.42 : 0.58;
    let steps = coarse ? 34 : 56;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    function resize() {
      const w = Math.max(1, Math.round(window.innerWidth * scale));
      const h = Math.max(1, Math.round(window.innerHeight * scale));
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w;
        canvas!.height = h;
      }
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
    }
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: PointerEvent) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let frames = 0;
    let fps = 60;
    const start = performance.now();

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      acc += dt;
      frames++;
      if (acc >= 0.5) {
        fps = frames / acc;
        acc = 0;
        frames = 0;

        /* Adapt. Volumetrics are fill-rate bound, so step count is the knob
           with the most authority and the least visible cost -- fewer samples
           is a softer galaxy, where a lower resolution is a blurry page. */
        if (fps < 45 && steps > 22) steps -= 6;
        else if (fps > 57 && steps < (coarse ? 40 : 64)) steps += 2;

        telemetry.current?.({ fps, steps, scale });
      }

      mouse.x += (mouse.tx - mouse.x) * Math.min(1, dt * 3.2);
      mouse.y += (mouse.ty - mouse.y) * Math.min(1, dt * 3.2);

      gl!.uniform2f(uRes, canvas!.width, canvas!.height);
      gl!.uniform1f(uTime, reduced ? 12 : (now - start) / 1000);
      gl!.uniform2f(uMouse, mouse.x, mouse.y);
      gl!.uniform1f(uSteps, steps);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    }

    if (reduced) {
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, 12);
      gl.uniform2f(uMouse, 0, 0);
      gl.uniform1f(uSteps, steps);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      telemetry.current?.({ fps: 0, steps, scale });
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      gl!.deleteProgram(prog);
      gl!.deleteShader(vs);
      gl!.deleteShader(fs);
      gl!.deleteBuffer(buf);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-20 h-full w-full bg-black"
    />
  );
}
