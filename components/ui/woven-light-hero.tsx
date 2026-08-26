"use client";

import { useAnimation, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * WovenLightHero — a full-viewport hero backed by a 50,000-point Three.js
 * particle cloud sampled off a torus knot. The points are repelled by the
 * cursor and spring back to their rest positions, so the surface behaves like
 * a woven cloth being brushed.
 *
 * Typography: the component asks for `--font-playfair` and `--font-inter`, but
 * does not load them — `next/font` is server-only and this is a client
 * component. The route that renders the hero supplies them (see
 * app/woven-light/page.tsx); standalone, it falls back to generic serif/sans
 * and still reads correctly.
 */
export interface WovenLightHeroProps {
  /** Display headline. Animated in per character, so keep it short. */
  headline?: string;
  /** Supporting line beneath the headline. */
  subtitle?: string;
  /** Label on the call to action. */
  ctaLabel?: string;
  /** Fired when the call to action is pressed. */
  onCtaClick?: () => void;
  /** Wordmark shown top-left. Pass null to drop the nav entirely. */
  brand?: string | null;
}

export const WovenLightHero = ({
  headline = "Woven by Light",
  subtitle = "An interactive tapestry of light and motion, crafted with code and creativity.",
  ctaLabel = "Explore the Weave",
  onCtaClick,
  brand = "Woven",
}: WovenLightHeroProps = {}) => {
  const textControls = useAnimation();
  const buttonControls = useAnimation();

  useEffect(() => {
    textControls.start((i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1 + 1.5,
        duration: 1.2,
        ease: [0.2, 0.65, 0.3, 0.9],
      },
    }));
    buttonControls.start({
      opacity: 1,
      transition: { delay: 2.5, duration: 1 },
    });
  }, [textControls, buttonControls]);

  const words = headline.split(" ");

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-black">
      <WovenCanvas />
      {brand !== null && <HeroNav brand={brand} />}
      <div className="relative z-10 px-4 text-center">
        <h1
          className="text-6xl text-white md:text-8xl"
          style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', serif",
            textShadow: "0 0 50px rgba(255, 255, 255, 0.3)",
          }}
        >
          {/* Each character animates on its own delay, so the line assembles
              left to right. Words stay in their own inline-block so the
              headline still wraps on whole words at narrow widths. */}
          {words.map((word, i) => (
            <span key={i} className="inline-block">
              {word.split("").map((char, j) => (
                <motion.span
                  key={j}
                  custom={i * 5 + j}
                  initial={{ opacity: 0, y: 50 }}
                  animate={textControls}
                  style={{ display: "inline-block" }}
                >
                  {char}
                </motion.span>
              ))}
              {i < words.length - 1 && <span>&nbsp;</span>}
            </span>
          ))}
        </h1>
        <motion.p
          custom={headline.length}
          initial={{ opacity: 0, y: 30 }}
          animate={textControls}
          className="mx-auto mt-6 max-w-xl text-lg text-slate-300"
          style={{ fontFamily: "var(--font-inter), 'Inter', sans-serif" }}
        >
          {subtitle}
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={buttonControls} className="mt-10">
          <button
            type="button"
            onClick={onCtaClick}
            className="rounded-full border-2 border-white/20 bg-white/10 px-8 py-3 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            style={{ fontFamily: "var(--font-inter), 'Inter', sans-serif" }}
          >
            {ctaLabel}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

/* --- Navigation --- */

const HeroNav = ({ brand }: { brand: string }) => (
  <motion.nav
    initial={{ opacity: 0 }}
    animate={{ opacity: 1, transition: { delay: 1, duration: 1 } }}
    className="absolute inset-x-0 top-0 z-20 p-6"
  >
    <div className="mx-auto flex max-w-7xl items-center justify-between">
      <div className="flex items-center gap-2">
        <span aria-hidden="true" className="text-2xl font-bold text-white">
          ⎎
        </span>
        <span
          className="text-xl font-bold text-white"
          style={{ fontFamily: "var(--font-inter), 'Inter', sans-serif" }}
        >
          {brand}
        </span>
      </div>
    </div>
  </motion.nav>
);

/* --- Three.js particle field --- */

const PARTICLE_COUNT = 50000;
/** Cursor repulsion radius, in world units. */
const REPEL_RADIUS = 1.5;

const WovenCanvas = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Capped: an uncapped 3x ratio quadruples the fragment cost on phones for
    // a point cloud that gains nothing visible above 2x.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const clock = new THREE.Clock();
    let mouseX = 0;
    let mouseY = 0;

    /* Rest positions are sampled off a torus knot; the knot itself is only a
       source of coordinates and is thrown away once they are copied out. */
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const originalPositions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);

    const torusKnot = new THREE.TorusKnotGeometry(1.5, 0.5, 200, 32);
    const knotPos = torusKnot.attributes.position;
    const color = new THREE.Color();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const v = i % knotPos.count;
      const ix = i * 3;

      positions[ix] = originalPositions[ix] = knotPos.getX(v);
      positions[ix + 1] = originalPositions[ix + 1] = knotPos.getY(v);
      positions[ix + 2] = originalPositions[ix + 2] = knotPos.getZ(v);

      color.setHSL(Math.random(), 0.8, 0.5);
      colors[ix] = color.r;
      colors[ix + 1] = color.g;
      colors[ix + 2] = color.b;
    }
    torusKnot.dispose();

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.02,
      vertexColors: true,
      transparent: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = ((event.clientX / window.innerWidth) * 2 - 1) * 3;
      mouseY = (-(event.clientY / window.innerHeight) * 2 + 1) * 3;
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    /* The simulation is written as scalar arithmetic on the typed arrays
       rather than through Vector3 helpers. The helpers would allocate four
       vectors per particle per frame — 200,000 objects a frame at this count,
       which the garbage collector cannot absorb. The forces are identical. */
    const step = () => {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const ix = i * 3;
        const iy = ix + 1;
        const iz = ix + 2;

        const px = positions[ix];
        const py = positions[iy];
        const pz = positions[iz];

        let vx = velocities[ix];
        let vy = velocities[iy];
        let vz = velocities[iz];

        // Repulsion from the cursor, which sits on the z = 0 plane.
        const dx = px - mouseX;
        const dy = py - mouseY;
        const dz = pz;
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < REPEL_RADIUS * REPEL_RADIUS && distSq > 0) {
          const dist = Math.sqrt(distSq);
          // (radius - dist) * strength, spread along the normalised direction.
          const scale = ((REPEL_RADIUS - dist) * 0.01) / dist;
          vx += dx * scale;
          vy += dy * scale;
          vz += dz * scale;
        }

        // Spring back toward the rest position, then damp.
        vx = (vx + (originalPositions[ix] - px) * 0.001) * 0.95;
        vy = (vy + (originalPositions[iy] - py) * 0.001) * 0.95;
        vz = (vz + (originalPositions[iz] - pz) * 0.001) * 0.95;

        positions[ix] = px + vx;
        positions[iy] = py + vy;
        positions[iz] = pz + vz;

        velocities[ix] = vx;
        velocities[iy] = vy;
        velocities[iz] = vz;
      }
      geometry.attributes.position.needsUpdate = true;
    };

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      step();
      points.rotation.y = clock.getElapsedTime() * 0.05;
      renderer.render(scene, camera);
    };

    if (still) {
      // One frame, so the hero shows the weave rather than an empty black box.
      renderer.render(scene, camera);
    } else {
      window.addEventListener("mousemove", handleMouseMove);
      animate();
    }
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      mount.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} aria-hidden="true" className="absolute inset-0 z-0" />;
};

export default WovenLightHero;
