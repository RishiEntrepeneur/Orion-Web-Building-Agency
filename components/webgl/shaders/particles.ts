/**
 * Particle field.
 *
 * All motion happens in the vertex shader: drift, scroll-driven streaming, and
 * pointer repulsion. Nothing is animated on the CPU, so 4000 particles cost one
 * draw call and no per-frame JavaScript.
 *
 * Pointer physics are computed in screen space (compare the particle's own NDC
 * position against uPointer) but applied in view space, which is what makes the
 * field part visibly to let the cursor through regardless of depth.
 */
export const particlesVertex = /* glsl */ `
  uniform float uTime;
  uniform vec2  uPointer;
  uniform float uPointerVel;
  uniform float uScroll;
  uniform float uZone;
  uniform vec2  uResolution;
  uniform float uIntensity;
  uniform vec3  uAccent;

  attribute float aSeed;
  attribute float aScale;
  attribute float aTemp;   // 0 = cool amber .. 1 = hot blue-white

  varying float vFade;
  varying float vGlint;
  varying vec3  vTint;

  void main() {
    vec3 p = position;

    // Lazy volumetric drift — three incommensurate frequencies so the field
    // never visibly loops.
    float t = uTime * 0.09 + aSeed * 6.2831853;
    p.x += sin(t * 1.31 + aSeed * 11.0) * 0.75;
    p.y += cos(t * 1.07 + aSeed *  7.0) * 0.75;
    p.z += sin(t * 0.63 + aSeed *  3.0) * 0.55;

    // Stream toward the camera as the page scrolls, wrapping through the depth
    // slab so the field is endless.
    float depth = 150.0;
    p.z = mod(p.z + uScroll * 90.0 + depth * 0.5, depth) - depth * 0.5;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vec4 clip = projectionMatrix * mv;
    vec2 ndc = clip.xy / max(abs(clip.w), 1e-4);

    // Screen-space repulsion, aspect-corrected so the exclusion zone is round.
    vec2 d = ndc - uPointer;
    d.x *= uResolution.x / max(uResolution.y, 1.0);
    float dist = length(d);
    float push = smoothstep(0.5, 0.0, dist) * (0.3 + uPointerVel * 1.1);
    mv.xy += normalize(d + vec2(1e-5)) * push * 1.7;

    // Fade in from the far plane and out as particles pass the camera, so
    // nothing pops at either end of the slab.
    float near = smoothstep(0.0, 14.0, -mv.z);
    float far  = 1.0 - smoothstep(depth * 0.34, depth * 0.5, -mv.z);
    vFade = near * far * uIntensity;

    // Particles near the cursor catch a specular glint.
    vGlint = smoothstep(0.42, 0.0, dist);

    // Stellar colour by temperature: cool motes run amber, hot ones blue-white,
    // with the nebula's rose sitting in the middle of the ramp. Near the
    // pointer everything pulls toward the zone's own star colour.
    vec3 amber = vec3(1.000, 0.616, 0.361);
    vec3 rose  = vec3(0.878, 0.404, 0.561);
    vec3 blue  = vec3(0.624, 0.769, 1.000);
    vec3 star  = aTemp < 0.5
      ? mix(amber, rose, aTemp * 2.0)
      : mix(rose, blue, (aTemp - 0.5) * 2.0);
    vTint = mix(star, uAccent, vGlint * 0.65);

    gl_Position = projectionMatrix * mv;
    gl_PointSize = aScale * (260.0 / max(-mv.z, 0.001)) * (0.75 + push * 0.9);
  }
`;

export const particlesFragment = /* glsl */ `
  precision highp float;

  varying float vFade;
  varying float vGlint;
  varying vec3  vTint;

  void main() {
    // Round, soft-edged point with a tight bright core.
    vec2 uv = gl_PointCoord - 0.5;
    float r = length(uv);
    if (r > 0.5) discard;

    float core = smoothstep(0.5, 0.06, r);
    float halo = smoothstep(0.5, 0.22, r) * 0.35;

    // Body carries the star's own colour; the core burns out to white, which
    // is what stops a coloured particle field from looking like confetti.
    // Only the very centre burns to white; the surrounding disc keeps the
    // star's own colour, which is what makes the field read as a sky rather
    // than as grey dust.
    vec3 colour = mix(vTint, vec3(1.0), smoothstep(0.62, 1.0, core) * 0.7 + vGlint * 0.25);

    float alpha = (core * 0.92 + halo * 1.15) * vFade;
    if (alpha < 0.004) discard;

    gl_FragColor = vec4(colour, alpha);
  }
`;
