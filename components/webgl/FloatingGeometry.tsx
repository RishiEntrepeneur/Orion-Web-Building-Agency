"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { pointerState } from "@/lib/pointer-state";
import { qualityState } from "@/lib/quality-state";
import { scrollState } from "@/lib/scroll-state";
import { ZONES } from "@/lib/zones";

/**
 * The solid objects the camera flies past.
 *
 * Each zone gets its own cluster, anchored to the same coordinates the camera
 * path uses, so an object is always in frame when its section is on screen.
 *
 * Lighting is a locally generated studio environment — lightformers rendered
 * to a small cube target at runtime. That is what makes the metal read as
 * metal; a metallic surface with no environment to reflect renders black. It
 * also means no HDR file is fetched, so the scene has no network dependency.
 */

type Shape = "icosahedron" | "octahedron" | "box" | "torus" | "knot" | "monolith";

type Piece = {
  zone: number;
  shape: Shape;
  offset: [number, number, number];
  scale: number;
  roughness: number;
  spin: [number, number, number];
};

const PIECES: Piece[] = [
  // Hero — one dominant form, held slightly off-centre.
  { zone: 0, shape: "knot", offset: [2.6, 0.4, -3.5], scale: 1.35, roughness: 0.18, spin: [0.03, 0.05, 0.01] },
  { zone: 0, shape: "octahedron", offset: [-4.2, -1.8, -6.0], scale: 0.75, roughness: 0.32, spin: [0.05, -0.03, 0.02] },

  // Capabilities — planes and shards, echoing the depth-layer idea.
  { zone: 1, shape: "monolith", offset: [1.4, 0.8, -2.0], scale: 1.0, roughness: 0.22, spin: [0.01, 0.06, 0.0] },
  { zone: 1, shape: "icosahedron", offset: [-3.4, -1.2, 1.5], scale: 0.62, roughness: 0.4, spin: [0.04, 0.03, -0.02] },

  // Packages — boxes, three of them.
  { zone: 2, shape: "box", offset: [-1.8, 1.1, -1.2], scale: 0.78, roughness: 0.15, spin: [0.02, 0.045, 0.015] },
  { zone: 2, shape: "box", offset: [2.4, -0.9, -3.4], scale: 0.55, roughness: 0.3, spin: [-0.03, 0.05, 0.01] },
  { zone: 2, shape: "box", offset: [0.4, 2.6, -5.0], scale: 0.42, roughness: 0.45, spin: [0.05, -0.02, 0.03] },

  // Process — rings, for a cycle.
  { zone: 3, shape: "torus", offset: [-2.2, 0.6, -1.0], scale: 1.05, roughness: 0.2, spin: [0.05, 0.02, 0.0] },
  { zone: 3, shape: "torus", offset: [3.0, -1.6, -4.2], scale: 0.68, roughness: 0.35, spin: [-0.04, 0.03, 0.02] },

  // FAQ — a scattered, unresolved cluster.
  { zone: 4, shape: "icosahedron", offset: [1.9, 1.4, -1.6], scale: 0.85, roughness: 0.26, spin: [0.03, 0.04, 0.01] },
  { zone: 4, shape: "octahedron", offset: [-2.6, -1.0, -3.8], scale: 0.6, roughness: 0.38, spin: [0.05, -0.04, 0.0] },

  // Footer — a single monolith to close on.
  { zone: 5, shape: "monolith", offset: [0, 0.2, -2.5], scale: 1.6, roughness: 0.14, spin: [0.0, 0.02, 0.0] },
];

function geometryFor(shape: Shape): THREE.BufferGeometry {
  switch (shape) {
    case "icosahedron":
      return new THREE.IcosahedronGeometry(1, 0);
    case "octahedron":
      return new THREE.OctahedronGeometry(1, 0);
    case "box":
      return new THREE.BoxGeometry(1.4, 1.4, 1.4, 1, 1, 1);
    case "torus":
      return new THREE.TorusGeometry(1, 0.28, 24, 96);
    case "knot":
      return new THREE.TorusKnotGeometry(1, 0.3, 160, 24);
    case "monolith":
      return new THREE.BoxGeometry(0.24, 3.4, 2.1);
  }
}

export default function FloatingGeometry() {
  return (
    <>
      <StudioEnvironment />
      {PIECES.map((piece, index) => (
        <MetalPiece key={index} piece={piece} index={index} />
      ))}
    </>
  );
}

/**
 * Three-point studio lighting built from lightformers and baked into an
 * environment map once. Key above, cool rim behind, dim fill opposite — the
 * arrangement that gives brushed metal its long directional highlight.
 */
function StudioEnvironment() {
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={["#050609"]} />
      {/* Key: a long soft strip overhead, which is what draws the streak
          down a metal edge. */}
      <Lightformer
        form="rect"
        intensity={5}
        color="#ffffff"
        position={[0, 6, 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[12, 5, 1]}
      />
      {/* Rim: narrow and hot, behind and to one side. */}
      <Lightformer
        form="rect"
        intensity={9}
        color="#dfe6f2"
        position={[-6, 1, -6]}
        rotation={[0, Math.PI / 3, 0]}
        scale={[3, 8, 1]}
      />
      {/* Fill: broad and weak, keeps the shadow side from going pure black. */}
      <Lightformer
        form="rect"
        intensity={1.1}
        color="#8b93a4"
        position={[7, -2, 4]}
        rotation={[0, -Math.PI / 4, 0]}
        scale={[9, 9, 1]}
      />
      {/* A single point glint for a moving specular hotspot. */}
      <Lightformer form="circle" intensity={6} color="#ffffff" position={[3, 4, -8]} scale={2} />
    </Environment>
  );
}

function MetalPiece({ piece, index }: { piece: Piece; index: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const zone = ZONES[piece.zone];

  const geometry = useMemo(() => geometryFor(piece.shape), [piece.shape]);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#c9ced8"),
        metalness: 1,
        roughness: piece.roughness,
        envMapIntensity: 1.15,
      }),
    [piece.roughness],
  );

  const base = useMemo(
    () =>
      new THREE.Vector3(
        zone.anchor.x + piece.offset[0],
        zone.anchor.y + piece.offset[1],
        zone.anchor.z + piece.offset[2],
      ),
    [zone, piece.offset],
  );

  const phase = index * 1.37;

  useFrame((state, delta) => {
    const mesh = ref.current;
    if (!mesh) return;
    const dt = Math.min(0.05, delta);
    const t = state.clock.elapsedTime;

    mesh.rotation.x += piece.spin[0] * dt * 6;
    mesh.rotation.y += piece.spin[1] * dt * 6;
    mesh.rotation.z += piece.spin[2] * dt * 6;

    // Buoyant drift, plus a gentle lean toward the pointer so the objects feel
    // aware of the cursor without chasing it.
    const bobY = Math.sin(t * 0.5 + phase) * 0.34;
    const bobX = Math.cos(t * 0.37 + phase) * 0.22;
    mesh.position.set(
      base.x + bobX + pointerState.x * 0.5,
      base.y + bobY + pointerState.y * 0.35,
      base.z,
    );

    // Scroll velocity stretches the pieces very slightly along travel, which
    // reads as speed rather than as a wobble.
    const stretch = 1 + Math.min(0.14, Math.abs(scrollState.velocity) * 0.14);
    const s = piece.scale * qualityState.intensity;
    mesh.scale.set(s, s, s * stretch);
  });

  return <mesh ref={ref} geometry={geometry} material={material} position={base} />;
}
