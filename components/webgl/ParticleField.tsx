"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { pointerState } from "@/lib/pointer-state";
import { qualityState } from "@/lib/quality-state";
import { scrollState } from "@/lib/scroll-state";
import { createSpatialUniforms } from "./shaders/uniforms";
import { particlesFragment, particlesVertex } from "./shaders/particles";

/**
 * Reactive particle field with pointer physics.
 *
 * Positions are generated once and never touched again — the GPU owns all
 * motion. Count drops on low-end devices, but only at mount, because
 * reallocating the buffer mid-scroll would stall the GPU.
 */
export default function ParticleField({ count }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const { size, viewport } = useThree();

  const resolvedCount = count ?? (qualityState.tier === "high" ? 4200 : 1600);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(resolvedCount * 3);
    const seeds = new Float32Array(resolvedCount);
    const scales = new Float32Array(resolvedCount);

    for (let i = 0; i < resolvedCount; i++) {
      // Distribute across a wide, deep slab rather than a sphere so the field
      // still reads as full when the camera flies through it lengthwise.
      positions[i * 3 + 0] = (Math.random() - 0.5) * 90;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 55;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 150;
      seeds[i] = Math.random();
      // Cubed distribution: mostly fine dust, a few larger motes to catch light.
      scales[i] = 0.6 + Math.pow(Math.random(), 3) * 3.4;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    geo.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    return geo;
  }, [resolvedCount]);

  const uniforms = useMemo(() => createSpatialUniforms(), []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: uniforms as unknown as Record<string, THREE.IUniform>,
        vertexShader: particlesVertex,
        fragmentShader: particlesFragment,
        transparent: true,
        depthWrite: false,
        // Additive would blow out to white against the metal; normal blending
        // keeps the field readable as dust rather than glare.
        blending: THREE.NormalBlending,
      }),
    [uniforms],
  );

  useFrame((state, delta) => {
    const dt = Math.min(0.05, delta);
    uniforms.uTime.value += dt;
    uniforms.uPointer.value.set(pointerState.x, pointerState.y);
    uniforms.uPointerVel.value = pointerState.velocity;
    uniforms.uScroll.value = scrollState.progress;
    uniforms.uZone.value = scrollState.zone;
    uniforms.uResolution.value.set(
      size.width * viewport.dpr,
      size.height * viewport.dpr,
    );
    uniforms.uIntensity.value = qualityState.intensity;
    void state;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} frustumCulled={false} />;
}
