import * as THREE from "three";
import { createSpatialUniforms, type SpatialUniforms } from "./uniforms";

/**
 * Verified GLSL ES 3.00 materials.
 *
 * Both are authored against the shared uniform contract in ./uniforms and must
 * be constructed with `glslVersion: THREE.GLSL3`: three.js only injects the
 * `pc_fragColor` / `gl_FragColor` compatibility shim when glslVersion is NOT
 * GLSL3, so these fragment shaders declare their own
 * `layout(location = 0) out vec4 fragColor`.
 *
 * `fwidth`/`dFdx` are core in ESSL 3.00, so no #extension directive is needed.
 * No external textures and no three.js shader chunks are used.
 */

export const GRID_VERTEX_SHADER = /* glsl */ `
// ---------------------------------------------------------------------------
// AUREX / grid-mesh — vertex
// GLSL ES 3.00 (three.js ShaderMaterial with glslVersion: THREE.GLSL3)
// ---------------------------------------------------------------------------
precision highp float;

uniform float uTime;
uniform vec2  uPointer;
uniform float uPointerVel;
uniform float uScroll;
uniform float uZone;
uniform vec2  uResolution;
uniform float uIntensity;

out vec2  vUv;        // 0..1 across the plane, used for the soft circular edge fade
out vec2  vPlane;     // plane-local coordinates in world units (metres)
out float vViewDist;  // distance from the camera, for depth falloff
out vec4  vClip;      // clip-space position, divided by w in the fragment for screen NDC

void main() {
  vUv = uv;
  vPlane = position.xy;

  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vViewDist = -mv.z;

  vClip = projectionMatrix * mv;
  gl_Position = vClip;
}
`;

export const GRID_FRAGMENT_SHADER = /* glsl */ `
// ---------------------------------------------------------------------------
// AUREX / grid-mesh — fragment
// GLSL ES 3.00 (three.js ShaderMaterial with glslVersion: THREE.GLSL3)
// Monochrome infinite perspective grid: derivative-antialiased lines, distance
// + horizon falloff, scroll-driven travel, pointer light pool, circular edge fade.
// ---------------------------------------------------------------------------
precision highp float;

uniform float uTime;
uniform vec2  uPointer;
uniform float uPointerVel;
uniform float uScroll;
uniform float uZone;
uniform vec2  uResolution;
uniform float uIntensity;

in vec2  vUv;
in vec2  vPlane;
in float vViewDist;
in vec4  vClip;

layout(location = 0) out vec4 fragColor;

// --- monochrome palette (linear-ish, matches --color-void .. --color-chrome) --
const vec3 C_VOID   = vec3(0.027, 0.031, 0.043); // --color-void   #07080b
const vec3 C_STEEL  = vec3(0.435, 0.471, 0.537); // --color-steel  #6f7889
const vec3 C_CHROME = vec3(0.965, 0.973, 0.984); // --color-chrome #f6f8fb
const vec3 C_SPEC   = vec3(1.000, 0.992, 0.976); // hard studio white

// Analytic screen-space-antialiased grid.
// Returns .x = line coverage, .y = cell-density confidence (0 when cells fall
// below a pixel, which is what kills moire / aliasing crawl toward the horizon).
vec2 gridLine(vec2 p, float widthPx) {
  vec2 w = fwidth(p);
  vec2 aa = max(w, vec2(1e-5));
  vec2 g = abs(fract(p - 0.5) - 0.5) / aa;
  float d = min(g.x, g.y);
  float line = 1.0 - smoothstep(0.0, widthPx, d);
  // one cell must span at least ~1.6 px before we trust it
  float density = 1.0 - smoothstep(0.16, 0.60, max(w.x, w.y));
  density *= density;
  return vec2(line, density);
}

void main() {
  if (uIntensity <= 0.0) discard;

  // ---- travel -------------------------------------------------------------
  // Slow idle drift + a much larger scroll-driven push along the plane's local
  // Y axis (which is world -Z once the plane is laid flat).
  float travel = uTime * 0.65 + uScroll * 260.0;
  float sway   = sin(uZone * 1.2566) * 1.6 + sin(uTime * 0.11) * 0.7;

  vec2 p = vPlane + vec2(sway, travel);

  const float CELL_MINOR = 1.0;   // metres
  const float CELL_MAJOR = 8.0;   // metres

  vec2 minor = gridLine(p / CELL_MINOR, 1.25);
  vec2 major = gridLine(p / CELL_MAJOR, 1.55);

  // ---- pointer light pool (screen space, aspect corrected) ----------------
  vec2 ndc = vClip.xy / vClip.w;
  vec2 pd  = ndc - uPointer;
  pd.x *= max(uResolution.x, 1.0) / max(uResolution.y, 1.0);
  float pr = length(pd);
  float pool = exp(-pr * pr * 7.0);                  // soft core
  pool += exp(-pr * pr * 1.3) * 0.30;                // wide halo
  pool *= 0.72 + uPointerVel * 0.50;

  // ---- depth / horizon falloff -------------------------------------------
  float fog      = exp(-vViewDist * 0.016);           // brightness falls with distance
  float nearHold = smoothstep(0.0, 6.0, vViewDist);   // avoid a hot blowout underfoot

  // ---- circular edge fade so the plane never reads as a rectangle ---------
  float r    = length(vUv - 0.5) * 2.0;
  float edge = 1.0 - smoothstep(0.30, 0.98, r);
  edge *= edge;

  // ---- assemble -----------------------------------------------------------
  float minorI = minor.x * minor.y;
  float majorI = major.x * major.y;

  // subtle bloom: a fat, dim copy of the same lines
  vec2 minorGlow = gridLine(p / CELL_MINOR, 5.0);
  float glow = minorGlow.x * minorGlow.y * 0.085;

  float structure = minorI * 0.205 + majorI * 0.55 + glow;
  structure *= fog * edge * mix(0.25, 1.0, nearHold);

  // the light pool brightens nearby cells rather than adding a flat blob
  float lit = structure * (1.0 + pool * 2.7);

  // spec-white only in the very centre of the pool, on major lines
  float spec = majorI * major.y * pow(clamp(pool, 0.0, 1.0), 2.0) * 1.1;

  vec3 col = mix(C_STEEL, C_CHROME, clamp(pool * 0.70, 0.0, 1.0)) * lit;
  col += C_SPEC * spec * 0.38;

  // faint ground sheen so the plane is not pure void between the lines
  float sheen = pool * 0.05 * fog * edge;
  col += C_VOID * 6.0 * sheen;

  float alpha = clamp(lit * 1.7 + spec * 0.5 + sheen, 0.0, 1.0);

  // uIntensity is applied to alpha ONLY. Multiplying colour as well made the
  // master fade quadratic, so a linear ramp lost most of its visible range.
  alpha *= uIntensity;

  fragColor = vec4(col, alpha);
}
`;

/* ========================================================================== *
 *  B) LIQUID METAL
 *  Apply to a camera-facing PlaneGeometry, or an ortho fullscreen quad.
 *  Everything is computed in uv space, so the plane's aspect should roughly
 *  match uResolution's aspect for round blobs.
 * ========================================================================== */

export const LIQUID_VERTEX_SHADER = /* glsl */ `
// ---------------------------------------------------------------------------
// AUREX / liquid-metal — vertex
// GLSL ES 3.00 (three.js ShaderMaterial with glslVersion: THREE.GLSL3)
// Works on a camera-facing PlaneGeometry(w, h, 1, 1) or an ortho fullscreen quad.
// ---------------------------------------------------------------------------
precision highp float;

uniform float uTime;
uniform vec2  uPointer;
uniform float uPointerVel;
uniform float uScroll;
uniform float uZone;
uniform vec2  uResolution;
uniform float uIntensity;

out vec2 vUv;
out vec4 vClip;

void main() {
  vUv = uv;
  vClip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = vClip;
}
`;

export const LIQUID_FRAGMENT_SHADER = /* glsl */ `
// ---------------------------------------------------------------------------
// AUREX / liquid-metal — fragment
// GLSL ES 3.00 (three.js ShaderMaterial with glslVersion: THREE.GLSL3)
// Domain-warped metaball field shaded with a procedural studio environment and
// a Kajiya-Kay anisotropic streak. Monochrome: dark body, sharp silver highlight.
// ---------------------------------------------------------------------------
precision highp float;

uniform float uTime;
uniform vec2  uPointer;
uniform float uPointerVel;
uniform float uScroll;
uniform float uZone;
uniform vec2  uResolution;
uniform float uIntensity;

in vec2 vUv;
in vec4 vClip;

layout(location = 0) out vec4 fragColor;

// --------------------------- simplex noise 2D -------------------------------
// Ashima Arts / Stefan Gustavson, MIT. No textures.
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                          + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) {
    s += a * snoise(p);
    p = p * 2.03 + vec2(11.7, -5.3);
    a *= 0.5;
  }
  return s;
}

// --------------------------- the liquid field -------------------------------
// Returns a scalar potential. The iso-surface at 1.0 is the surface of the metal.
float field(vec2 p, vec2 ptr) {
  float t = uTime;

  // 1. domain warp — this is what makes it read as viscous rather than as bubbles
  vec2 w = vec2(
    fbm(p * 1.15 + vec2(0.0, t * 0.09) + uScroll * 2.0),
    fbm(p * 1.15 + vec2(4.7, -t * 0.07) - uScroll * 1.6)
  );
  vec2 q = p + w * (0.215 + uPointerVel * 0.115);

  // 2. metaballs. Each is pulled toward the pointer by a different amount, so
  //    the mass flows rather than teleports.
  float s = 0.0;
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float ph = fi * 1.2566 + uZone * 0.35;
    vec2 base = vec2(cos(t * (0.21 + fi * 0.037) + ph),
                     sin(t * (0.17 + fi * 0.043) + ph * 1.7)) * (0.20 + fi * 0.042);
    float pull = 0.30 + fi * 0.13;                 // 0.30 .. 0.82
    vec2  c    = mix(base, ptr, pull);
    float rad  = 0.300 - fi * 0.016;
    vec2  d    = q - c;
    s += (rad * rad) / (dot(d, d) + 0.010);
  }

  // 3. cursor ripples — amplitude driven entirely by pointer speed
  // Measured in UNWARPED space: taking this from the domain-warped q
  // destroyed the concentricity, so the ripple never read as rings.
  float rd = length(p - ptr);
  s += sin(rd * 20.0 - t * 7.5) * exp(-rd * 2.6) * uPointerVel * 1.35;

  // 4. fine surface chop so the highlight has something to catch
  s += fbm(q * 3.0 - vec2(0.0, t * 0.28)) * (0.024 + uPointerVel * 0.020);

  return s;
}

// procedural studio environment sampled by the reflection vector.
// A dark room with one hard horizontal strip light and a cool bounce below.
vec3 studioEnv(vec3 r) {
  float y = r.y;
  float key  = exp(-abs(y - 0.42) * 26.0) * 0.62;    // key light
  float strip = exp(-abs(y - 0.30) * 130.0) * 1.75;  // hard strip — the sharp highlight
  float bounce = smoothstep(-0.20, -0.90, y) * 0.085; // floor bounce
  float wall = smoothstep(0.55, -0.10, y) * 0.022;    // dim back wall

  // slight horizontal break-up so the strip shears as the surface moves
  float shear = 0.85 + 0.15 * sin(r.x * 3.1 + uTime * 0.4);

  float e = key * 0.55 + strip * shear + bounce + wall;
  // very slightly cool — anodised aluminium, not blue
  return vec3(e) * vec3(0.94, 0.965, 1.0);
}

void main() {
  if (uIntensity <= 0.0) discard;

  float aspect = max(uResolution.x, 1.0) / max(uResolution.y, 1.0);

  vec2 p   = (vUv - 0.5) * vec2(aspect, 1.0) * 2.0;
  vec2 ptr = uPointer * vec2(aspect, 1.0);

  // --- field + normal from central differences ------------------------------
  // Derived from the on-screen density of p, not from the viewport, so the
  // normals stay correct when the quad does not fill the screen.
  float e = max(max(fwidth(p.x), fwidth(p.y)) * 1.7, 1e-4);
  float f  = field(p, ptr);
  float fx = field(p + vec2(e, 0.0), ptr);
  float fy = field(p + vec2(0.0, e), ptr);

  const float ISO = 1.00;

  // dome height above the iso-surface -> a rounded, liquid body
  float h  = sqrt(max(f  - ISO, 0.0));
  float hx = sqrt(max(fx - ISO, 0.0));
  float hy = sqrt(max(fy - ISO, 0.0));

  vec3 n = normalize(vec3(-(hx - h) / e, -(hy - h) / e, 1.75));
  vec3 v = vec3(0.0, 0.0, 1.0);

  // soft, derivative-correct coverage mask
  float fw = fwidth(f) + 1e-4;
  float mask = smoothstep(ISO - fw * 1.2, ISO + fw * 2.2, f);

  // --- shading --------------------------------------------------------------
  vec3 r = reflect(-v, n);
  vec3 env = studioEnv(r);

  float ndv = clamp(dot(n, v), 0.0, 1.0);
  float fres = pow(1.0 - ndv, 4.0);

  // Kajiya-Kay anisotropic streak: tangent lies along the local flow direction
  vec2 flowDir = normalize(vec2(-n.y, n.x) + vec2(1e-4));
  vec3 tang = normalize(vec3(flowDir, 0.0));
  vec3 L1 = normalize(vec3(0.45, 0.78, 0.44));
  vec3 L2 = normalize(vec3(-0.70, -0.22, 0.68));

  vec3 hv1 = normalize(L1 + v);
  vec3 hv2 = normalize(L2 + v);
  float th1 = dot(tang, hv1);
  float th2 = dot(tang, hv2);
  float aniso = pow(sqrt(max(1.0 - th1 * th1, 0.0)), 46.0) * 1.00
              + pow(sqrt(max(1.0 - th2 * th2, 0.0)), 90.0) * 0.42;

  // tight GGX-ish specular for the pinpoint glint
  float sp = pow(max(dot(n, hv1), 0.0), 180.0) * 1.6
           + pow(max(dot(n, hv2), 0.0), 320.0) * 0.9;

  vec3 BODY   = vec3(0.052, 0.056, 0.064);
  vec3 CHROME = vec3(0.965, 0.973, 0.984); // --color-chrome #f6f8fb
  vec3 SPEC   = vec3(1.000, 0.992, 0.976);

  vec3 col = BODY;
  col += env * CHROME * 0.70;
  col += CHROME * aniso * 0.55;
  col += SPEC * sp * 0.85;
  col += CHROME * fres * 0.42;                       // silver rim

  // darken the very edge of the blob so it does not read as a flat cutout
  float edgeDark = smoothstep(0.0, 0.22, h);
  col *= mix(0.28, 1.0, edgeDark);

  // faint outer bloom so it sits in the scene instead of on top of it
  float halo = smoothstep(ISO - 0.55, ISO, f) * (1.0 - mask);
  col += CHROME * halo * halo * 0.055;

  // deepen the mid-tones so the body stays dark and the strip reads as the
  // only real light source — this is what sells "machined metal" over "grey blob"
  col = pow(max(col, 0.0), vec3(1.22)) * 1.18;

  float alpha = clamp(mask + halo * 0.30, 0.0, 1.0);

  // uIntensity is applied to alpha ONLY. Multiplying colour as well made the
  // master fade quadratic, so a linear ramp lost most of its visible range.
  alpha *= uIntensity;

  fragColor = vec4(col, alpha);
}
`;

/* ========================================================================== *
 *  Material factories
 * ========================================================================== */

export function createGridMaterial(uniforms: SpatialUniforms = createSpatialUniforms()) {
  return new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    vertexShader: GRID_VERTEX_SHADER,
    fragmentShader: GRID_FRAGMENT_SHADER,
    uniforms,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
}

export function createLiquidMetalMaterial(uniforms: SpatialUniforms = createSpatialUniforms()) {
  return new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    vertexShader: LIQUID_VERTEX_SHADER,
    fragmentShader: LIQUID_FRAGMENT_SHADER,
    uniforms,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
}
