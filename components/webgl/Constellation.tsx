"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { pointerState } from "@/lib/pointer-state";
import { qualityState } from "@/lib/quality-state";
import { scrollState } from "@/lib/scroll-state";
import { accentAt } from "@/lib/zone-accents";

/**
 * Cursor constellation.
 *
 * A field of stars rides with the camera at a fixed distance. Wherever the
 * pointer goes, the stars within reach of it link up — the further from the
 * cursor, the fainter the link, so the figure assembles under the cursor and
 * dissolves behind it. For a studio called Orion, the constellation is the
 * obvious motif, and it is the one part of the scene that responds to the
 * pointer as a discrete gesture rather than as a continuous field.
 *
 * The cost is bounded and small: with 90 nodes the pair search is ~4000 checks
 * a frame, and only the buffer's draw range is updated, never its allocation.
 */

const NODE_COUNT = 90;
const MAX_LINKS = 260;

export default function Constellation({
  distance = 9,
  /** Pointer reach, as a fraction of the visible height at `distance`. */
  reach = 0.55,
  /** Longest link, as a fraction of the visible height. */
  linkSpan = 0.19,
}: {
  distance?: number;
  reach?: number;
  linkSpan?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const starsRef = useRef<THREE.Points>(null);
  const { camera, size } = useThree();

  /* Nodes live in the group's local XY plane. Generated once. */
  const nodes = useMemo(() => {
    const arr: { x: number; y: number; z: number; sx: number; sy: number; seed: number }[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        z: (Math.random() - 0.5) * 0.35,
        sx: (Math.random() - 0.5) * 0.05,
        sy: (Math.random() - 0.5) * 0.05,
        seed: Math.random() * 6.283,
      });
    }
    return arr;
  }, []);

  const lineGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(MAX_LINKS * 6), 3));
    g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(MAX_LINKS * 6), 3));
    g.setDrawRange(0, 0);
    return g;
  }, []);

  const starGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(NODE_COUNT * 3), 3));
    g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(NODE_COUNT * 3), 3));
    return g;
  }, []);

  const lineMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  const starMaterial = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 4.4,
        sizeAttenuation: false,
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  const scratch = useMemo(() => ({ accent: new THREE.Color() }), []);

  useFrame((state, delta) => {
    const group = groupRef.current;
    const lines = linesRef.current;
    const stars = starsRef.current;
    if (!group || !lines || !stars) return;

    const dt = Math.min(0.05, delta);
    const t = state.clock.elapsedTime;

    // Ride with the camera so the field is always in frame.
    group.position.copy(camera.position);
    group.quaternion.copy(camera.quaternion);
    group.translateZ(-distance);

    // World extent of the plane at this distance, so `reach` and `linkSpan`
    // stay visually constant across viewport sizes and aspect ratios.
    const perspective = camera as THREE.PerspectiveCamera;
    const halfH = Math.tan((perspective.fov * Math.PI) / 360) * distance;
    const halfW = halfH * (size.width / Math.max(1, size.height));

    const [ar, ag, ab] = accentAt(scrollState.zone);
    scratch.accent.setRGB(ar, ag, ab);

    // Pointer, projected onto the same plane.
    const px = pointerState.x * halfW;
    const py = pointerState.y * halfH;
    const reachDist = halfH * reach * 2;
    const linkDist = halfH * linkSpan * 2;

    const master = qualityState.intensity * (pointerState.active && !pointerState.coarse ? 1 : 0);
    group.visible = master > 0.01;
    if (!group.visible) return;

    // Advance node drift and write star positions.
    const starPos = starGeometry.attributes.position.array as Float32Array;
    const starCol = starGeometry.attributes.color.array as Float32Array;
    const live: { x: number; y: number; z: number; w: number }[] = [];

    for (let i = 0; i < NODE_COUNT; i++) {
      const n = nodes[i];
      n.x += n.sx * dt;
      n.y += n.sy * dt;
      if (n.x > 1 || n.x < -1) n.sx *= -1;
      if (n.y > 1 || n.y < -1) n.sy *= -1;

      const wx = n.x * halfW + Math.sin(t * 0.3 + n.seed) * 0.06 * halfH;
      const wy = n.y * halfH + Math.cos(t * 0.26 + n.seed) * 0.06 * halfH;
      const wz = n.z;

      starPos[i * 3] = wx;
      starPos[i * 3 + 1] = wy;
      starPos[i * 3 + 2] = wz;

      // Proximity to the pointer decides whether this star is "awake".
      const d = Math.hypot(wx - px, wy - py);
      const w = Math.max(0, 1 - d / reachDist);
      const eased = w * w * master;

      const glow = eased * 1.7;
      starCol[i * 3] = scratch.accent.r * glow;
      starCol[i * 3 + 1] = scratch.accent.g * glow;
      starCol[i * 3 + 2] = scratch.accent.b * glow;

      if (eased > 0.02) live.push({ x: wx, y: wy, z: wz, w: eased });
    }
    starGeometry.attributes.position.needsUpdate = true;
    starGeometry.attributes.color.needsUpdate = true;

    // Link awake stars that are close enough to each other.
    const linePos = lineGeometry.attributes.position.array as Float32Array;
    const lineCol = lineGeometry.attributes.color.array as Float32Array;
    let link = 0;

    for (let i = 0; i < live.length && link < MAX_LINKS; i++) {
      for (let j = i + 1; j < live.length && link < MAX_LINKS; j++) {
        const a = live[i];
        const b = live[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d > linkDist) continue;

        // Fade with link length and with the weaker of the two endpoints, so
        // the figure frays at its edges instead of ending on a hard boundary.
        const strength = (1 - d / linkDist) * Math.min(a.w, b.w);
        if (strength < 0.015) continue;

        const o = link * 6;
        linePos[o] = a.x; linePos[o + 1] = a.y; linePos[o + 2] = a.z;
        linePos[o + 3] = b.x; linePos[o + 4] = b.y; linePos[o + 5] = b.z;

        const gain = strength * 1.9;
        const cr = scratch.accent.r * gain;
        const cg = scratch.accent.g * gain;
        const cb = scratch.accent.b * gain;
        lineCol[o] = cr; lineCol[o + 1] = cg; lineCol[o + 2] = cb;
        lineCol[o + 3] = cr; lineCol[o + 4] = cg; lineCol[o + 5] = cb;

        link++;
      }
    }

    lineGeometry.setDrawRange(0, link * 2);
    lineGeometry.attributes.position.needsUpdate = true;
    lineGeometry.attributes.color.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <lineSegments ref={linesRef} geometry={lineGeometry} material={lineMaterial} frustumCulled={false} />
      <points ref={starsRef} geometry={starGeometry} material={starMaterial} frustumCulled={false} />
    </group>
  );
}
