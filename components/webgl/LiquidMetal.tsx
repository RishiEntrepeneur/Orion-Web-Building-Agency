"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { pointerState } from "@/lib/pointer-state";
import { qualityState } from "@/lib/quality-state";
import { scrollState } from "@/lib/scroll-state";
import { createSpatialUniforms } from "./shaders/uniforms";
import { createLiquidMetalMaterial } from "./shaders/materials";

/**
 * Cursor-reactive liquid metal.
 *
 * A unit quad parented to the camera, so it always fills the same part of the
 * frame no matter where the camera is on its path — the metal is a lens the
 * scene is viewed through, not an object in the world.
 *
 * The whole surface is fragment work: a domain-warped noise field shaded with a
 * fake-anisotropic specular response. It bulges toward uPointer and ripples
 * harder as uPointerVel rises.
 */
export default function LiquidMetal({
  distance = 3.2,
  scale = 5.4,
}: {
  distance?: number;
  scale?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { size, viewport, camera } = useThree();

  const uniforms = useMemo(() => createSpatialUniforms(), []);
  const material = useMemo(() => createLiquidMetalMaterial(uniforms), [uniforms]);
  const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2, 1, 1), []);

  useFrame((_, delta) => {
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

    // Present in the hero, then dissolve away as the camera leaves zone 0 so it
    // never competes with the section content further down.
    const zoneFade = 1 - Math.min(1, Math.max(0, scrollState.zone / 0.85));
    uniforms.uIntensity.value = qualityState.intensity * zoneFade;

    const group = groupRef.current;
    if (!group) return;
    // Ride with the camera.
    group.position.copy(camera.position);
    group.quaternion.copy(camera.quaternion);
    group.translateZ(-distance);
    group.visible = uniforms.uIntensity.value > 0.01;
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={geometry} material={material} scale={scale} frustumCulled={false} />
    </group>
  );
}
