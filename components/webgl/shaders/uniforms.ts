import * as THREE from "three";

/**
 * The uniform contract every custom material in this scene shares.
 *
 * One shape for all shaders means a single per-frame update function can drive
 * the whole scene, and any layer can be faded independently through
 * `uIntensity` without touching its own logic.
 */
export type SpatialUniforms = {
  /** Seconds since scene start. */
  uTime: { value: number };
  /** Smoothed pointer in NDC, -1..1, y up. */
  uPointer: { value: THREE.Vector2 };
  /** 0..1 pointer speed. */
  uPointerVel: { value: number };
  /** 0..1 document scroll progress. */
  uScroll: { value: number };
  /** Fractional section index. */
  uZone: { value: number };
  /** Drawing-buffer size in pixels. */
  uResolution: { value: THREE.Vector2 };
  /** 0..1 master fade. 0 renders nothing. */
  uIntensity: { value: number };
  /** The current zone's Orion accent, blended across zone boundaries, so the
      light in the scene matches the accent the interface is using. */
  uAccent: { value: THREE.Color };
};

export function createSpatialUniforms(): SpatialUniforms {
  return {
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector2(0, 0) },
    uPointerVel: { value: 0 },
    uScroll: { value: 0 },
    uZone: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uIntensity: { value: 1 },
    uAccent: { value: new THREE.Color(0.624, 0.769, 1.0) },
  };
}
