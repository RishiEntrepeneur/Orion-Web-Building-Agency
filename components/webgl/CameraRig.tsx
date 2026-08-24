"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { pointerState } from "@/lib/pointer-state";
import { scrollState } from "@/lib/scroll-state";
import { CAMERA_CURVE, TARGET_CURVE } from "@/lib/zones";

/**
 * Flies the camera along the spline as the page scrolls.
 *
 * Position and aim come from two independent curves. Following the tangent of
 * a single path makes the camera behave like a rollercoaster carriage — always
 * looking exactly where it is going. Aiming from a separate curve lets the
 * camera lead into a turn and trail out of it, which is what reads as a shot
 * rather than a ride.
 *
 * Damping is exponential and delta-based, so the weight of the move is
 * identical at 30fps and 144fps. A fixed per-frame lerp factor would make the
 * camera feel heavier on slow machines — exactly backwards.
 */
export default function CameraRig({
  positionHalfLife = 0.16,
  aimHalfLife = 0.22,
  parallax = 1.1,
}: {
  positionHalfLife?: number;
  aimHalfLife?: number;
  parallax?: number;
}) {
  const { camera } = useThree();

  const scratch = useMemo(
    () => ({
      position: new THREE.Vector3(),
      aim: new THREE.Vector3(),
      currentAim: TARGET_CURVE.getPointAt(0).clone(),
      up: new THREE.Vector3(0, 1, 0),
    }),
    [],
  );

  const initialised = useRef(false);

  useFrame((_, delta) => {
    const dt = Math.min(0.05, delta);
    const t = Math.min(1, Math.max(0, scrollState.progress));

    // getPointAt is arc-length parameterised, so the camera's speed along the
    // path stays even instead of surging through the gentler curves.
    CAMERA_CURVE.getPointAt(t, scratch.position);
    TARGET_CURVE.getPointAt(t, scratch.aim);

    // Pointer parallax rides on top of the path. Applied to the target
    // position (not the damped result) so it never fights the scroll motion.
    scratch.position.x += pointerState.x * parallax;
    scratch.position.y += pointerState.y * parallax * 0.62;

    // A slow roll tied to lateral travel, so banking through a turn is felt.
    const bank = (scratch.aim.x - scratch.position.x) * 0.012;

    if (!initialised.current) {
      camera.position.copy(scratch.position);
      scratch.currentAim.copy(scratch.aim);
      initialised.current = true;
    } else {
      // 1 - 2^(-dt/halfLife) is frame-rate-independent exponential decay.
      const kp = 1 - Math.pow(2, -dt / positionHalfLife);
      const ka = 1 - Math.pow(2, -dt / aimHalfLife);
      camera.position.lerp(scratch.position, kp);
      scratch.currentAim.lerp(scratch.aim, ka);
    }

    camera.up.set(Math.sin(bank), Math.cos(bank), 0);
    camera.lookAt(scratch.currentAim);
  });

  return null;
}
