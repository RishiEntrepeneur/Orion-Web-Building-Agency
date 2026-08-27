"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { pointerState } from "@/lib/pointer-state";
import { qualityState } from "@/lib/quality-state";
import { scrollState } from "@/lib/scroll-state";
import { routeState } from "@/lib/routes";
import { accentAt } from "@/lib/zone-accents";

/**
 * The weave — the home page's hero object.
 *
 * A torus knot resampled as a cloud of points that the cursor pushes through
 * and that springs back into shape. It is scaled to overflow the frame, so the
 * opening screen reads as standing inside the object rather than looking at it.
 *
 * It lives inside the persistent canvas rather than in a second one of its own,
 * so it shares the site's camera path, its smoothed pointer, its quality
 * tiering and its accent light: the weave is an object in the same space as
 * everything else, not an effect layered on top.
 *
 * It is the home route's object, so it is built only there and dissolves as the
 * camera leaves the hero, the same way the liquid metal lens does.
 */
export default function WeaveKnot({
  radius = 4.3,
  tube = 1.4,
}: {
  radius?: number;
  tube?: number;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const { camera } = useThree();

  /* Density is fixed at mount. Resizing the buffers mid-scroll would stall the
     GPU, and the count is the one knob that actually decides whether a weak
     device holds its frame rate. */
  const count = useMemo(
    () => Math.max(4800, Math.round(40000 * qualityState.density)),
    [],
  );

  const { geometry, positions, rest, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const rest = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    const knot = new THREE.TorusKnotGeometry(radius, tube, 260, 40);
    const kp = knot.attributes.position;

    /* Colour comes off the route's accent rather than a full-spectrum random
       hue. The site's whole premise is that one light source lit every surface,
       and a rainbow here would read as a widget dropped into the page. The
       spread is in lightness with only a narrow hue drift, which is how a real
       cloud of lit motes varies. */
    const accent = new THREE.Color().setRGB(...accentAt(0));
    const hsl = { h: 0, s: 0, l: 0 };
    accent.getHSL(hsl);
    const colour = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const v = i % kp.count;
      const ix = i * 3;

      positions[ix] = rest[ix] = kp.getX(v);
      positions[ix + 1] = rest[ix + 1] = kp.getY(v);
      positions[ix + 2] = rest[ix + 2] = kp.getZ(v);

      // Cubed so most motes sit near the accent and only a few flare bright.
      const lift = Math.pow(Math.random(), 3);
      colour.setHSL(
        (hsl.h + (Math.random() - 0.5) * 0.06 + 1) % 1,
        Math.min(1, hsl.s * (0.75 + Math.random() * 0.4)),
        // Rigel already sits at l 0.81, so an unweighted spread pushes almost
        // every mote to white and the accent stops reading as a colour at all.
        Math.min(0.94, hsl.l * (0.38 + Math.random() * 0.34) + lift * 0.34),
      );
      colors[ix] = colour.r;
      colors[ix + 1] = colour.g;
      colors[ix + 2] = colour.b;
    }
    knot.dispose();

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    // The knot is authored around the origin and never leaves its own bounds by
    // much; a computed sphere saves the per-frame bounds check from the loop.
    geometry.boundingSphere = new THREE.Sphere(
      new THREE.Vector3(0, 0, 0),
      (radius + tube) * 1.6,
    );

    return { geometry, positions, rest, velocities };
  }, [count, radius, tube]);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.075,
        vertexColors: true,
        transparent: true,
        // Normal blending, matching the particle field: additive would blow the
        // dense passes of the knot out to a white mass.
        blending: THREE.NormalBlending,
        depthWrite: false,
        opacity: 0,
      }),
    [],
  );

  /** Cursor repulsion radius, in world units. */
  const REPEL = radius * 0.62;

  useFrame((_, delta) => {
    const points = pointsRef.current;
    if (!points) return;

    /* Home is the only route with a weave in it. Off-route the object is left
       mounted but invisible and unsimulated — cheaper than tearing the buffers
       down and rebuilding them on the way back. */
    const onHome = routeState.index === 0;
    const zoneFade = 1 - Math.min(1, Math.max(0, scrollState.zone / 0.85));
    const opacity = onHome ? qualityState.intensity * zoneFade : 0;

    material.opacity = opacity;
    points.visible = opacity > 0.01;
    if (!points.visible) return;

    const dt = Math.min(0.05, delta);
    points.rotation.y += dt * 0.05;

    /* The pointer arrives in normalised device coordinates. Converting it into
       the knot's own space needs the frame's world extent at the knot's depth,
       which is two trig calls a frame rather than a per-particle unprojection.
       The camera aims at the origin through the hero, which is the only stretch
       where the weave is visible, so the plane approximation holds where it is
       actually used. */
    const persp = camera as THREE.PerspectiveCamera;
    const dist = Math.max(1, camera.position.distanceTo(points.position));
    const halfH = Math.tan((persp.fov * Math.PI) / 360) * dist;
    const halfW = halfH * persp.aspect;

    // Undo the object's own spin so the cursor pushes where it is on screen.
    const spin = -points.rotation.y;
    const cos = Math.cos(spin);
    const sin = Math.sin(spin);
    const wx = pointerState.x * halfW;
    const wy = pointerState.y * halfH;
    const mx = wx * cos;
    const mz = -wx * sin;
    const my = wy;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const iy = ix + 1;
      const iz = ix + 2;

      const px = positions[ix];
      const py = positions[iy];
      const pz = positions[iz];

      let vx = velocities[ix];
      let vy = velocities[iy];
      let vz = velocities[iz];

      const dx = px - mx;
      const dy = py - my;
      const dz = pz - mz;
      const distSq = dx * dx + dy * dy + dz * dz;

      if (distSq < REPEL * REPEL && distSq > 0) {
        const d = Math.sqrt(distSq);
        const scale = ((REPEL - d) * 0.022) / d;
        vx += dx * scale;
        vy += dy * scale;
        vz += dz * scale;
      }

      // Spring home, then damp. Written as scalar arithmetic on the buffers so
      // the loop allocates nothing at all — a Vector3 per particle per frame
      // would be tens of thousands of objects a frame for the collector.
      vx = (vx + (rest[ix] - px) * 0.0022) * 0.95;
      vy = (vy + (rest[iy] - py) * 0.0022) * 0.95;
      vz = (vz + (rest[iz] - pz) * 0.0022) * 0.95;

      positions[ix] = px + vx;
      positions[iy] = py + vy;
      positions[iz] = pz + vz;

      velocities[ix] = vx;
      velocities[iy] = vy;
      velocities[iz] = vz;
    }

    geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
      position={[0, -0.4, 0]}
      frustumCulled={false}
    />
  );
}
