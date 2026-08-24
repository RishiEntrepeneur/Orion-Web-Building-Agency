import * as THREE from "three";
import { ZONE_IDS } from "./scroll-state";

/**
 * The spatial layout of the experience.
 *
 * Each page section owns a zone in 3D space. The camera path and the scene
 * geometry both read these anchors, so a section's copy and the objects the
 * camera passes at that moment can never drift apart.
 *
 * The path descends and drifts laterally rather than running straight down -Z,
 * which is what makes the travel read as flying through a space instead of
 * zooming at a wall.
 */
export type Zone = {
  id: (typeof ZONE_IDS)[number];
  /** Where the camera sits when this section is centred. */
  camera: THREE.Vector3;
  /** Where it looks. Deliberately not the next camera point — that is what
      makes the rotation cinematic rather than a tangent-follow. */
  target: THREE.Vector3;
  /** Anchor the section's 3D objects cluster around. */
  anchor: THREE.Vector3;
};

export const ZONES: Zone[] = [
  {
    id: "top",
    camera: new THREE.Vector3(0, 0, 14),
    target: new THREE.Vector3(0, 0, 0),
    anchor: new THREE.Vector3(0, -0.4, 0),
  },
  {
    id: "capabilities",
    camera: new THREE.Vector3(-7.5, -3.2, -6),
    target: new THREE.Vector3(2.5, -1.5, -18),
    anchor: new THREE.Vector3(4.5, -2.2, -20),
  },
  {
    id: "packages",
    camera: new THREE.Vector3(6.2, -7.5, -26),
    target: new THREE.Vector3(-3.0, -6.0, -40),
    anchor: new THREE.Vector3(-5.0, -6.5, -42),
  },
  {
    id: "process",
    camera: new THREE.Vector3(-5.0, -12.5, -48),
    target: new THREE.Vector3(3.5, -13.5, -62),
    anchor: new THREE.Vector3(5.5, -13.0, -64),
  },
  {
    id: "faq",
    camera: new THREE.Vector3(4.0, -18.0, -70),
    target: new THREE.Vector3(-1.5, -20.5, -84),
    anchor: new THREE.Vector3(-3.0, -20.0, -86),
  },
  {
    id: "site-footer",
    camera: new THREE.Vector3(0, -24.5, -92),
    target: new THREE.Vector3(0, -27.5, -108),
    anchor: new THREE.Vector3(0, -27.0, -110),
  },
];

/** Smooth camera path through every zone. */
export const CAMERA_CURVE = new THREE.CatmullRomCurve3(
  ZONES.map((z) => z.camera),
  false,
  "catmullrom",
  0.4,
);

/** Independent aim path, so rotation leads and trails the translation. */
export const TARGET_CURVE = new THREE.CatmullRomCurve3(
  ZONES.map((z) => z.target),
  false,
  "catmullrom",
  0.4,
);

if (ZONES.length !== ZONE_IDS.length) {
  throw new Error("ZONES must define exactly one entry per ZONE_ID");
}
