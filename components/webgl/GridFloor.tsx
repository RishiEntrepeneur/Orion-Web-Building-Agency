"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { pointerState } from "@/lib/pointer-state";
import { qualityState } from "@/lib/quality-state";
import { scrollState } from "@/lib/scroll-state";
import { createSpatialUniforms } from "./shaders/uniforms";
import { createGridMaterial } from "./shaders/materials";

/**
 * The glowing perspective grid the whole experience sits on.
 *
 * A single 400x400 plane laid flat. All the structure — line spacing,
 * derivative-based anti-aliasing, distance falloff, the pointer light pool and
 * the edge fade — is computed in the fragment shader, so the geometry is two
 * triangles and the grid never tiles or pops as the camera travels.
 *
 * The floor tracks the camera in X/Z, which is what makes it read as infinite:
 * the grid lines themselves are anchored to world space inside the shader, so
 * moving the plane does not drag the pattern along with it.
 */
export default function GridFloor({ y = -6 }: { y?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size, viewport, camera } = useThree();

  const uniforms = useMemo(() => createSpatialUniforms(), []);
  const material = useMemo(() => createGridMaterial(uniforms), [uniforms]);
  const geometry = useMemo(() => new THREE.PlaneGeometry(400, 400, 1, 1), []);

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
    uniforms.uIntensity.value = qualityState.intensity;

    const mesh = meshRef.current;
    if (mesh) {
      mesh.position.x = camera.position.x;
      mesh.position.z = camera.position.z;
      mesh.position.y = camera.position.y + y;
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      rotation={[-Math.PI / 2, 0, 0]}
      frustumCulled={false}
    />
  );
}
