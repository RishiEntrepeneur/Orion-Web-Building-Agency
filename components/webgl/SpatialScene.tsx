"use client";

import CameraRig from "./CameraRig";
import Constellation from "./Constellation";
import FloatingGeometry from "./FloatingGeometry";
import GridFloor from "./GridFloor";
import LiquidMetal from "./LiquidMetal";
import ParticleField from "./ParticleField";

/**
 * Everything inside the persistent canvas, in draw order.
 *
 * The grid is the ground plane, the geometry sits on it, particles fill the
 * volume between camera and objects, the constellation links under the cursor,
 * and the liquid metal rides in front as a hero-only lens. The camera rig is
 * last so it reads the same frame's scroll state that the shaders do.
 */
export default function SpatialScene() {
  return (
    <>
      <GridFloor />
      <FloatingGeometry />
      <ParticleField />
      <Constellation />
      <LiquidMetal />
      <CameraRig />
    </>
  );
}
