"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import { prefersReducedMotion, supportsWebGL } from "@/lib/webgl-support";
import { qualityState, targetIntensity } from "@/lib/quality-state";
import {
  pointerState,
  stepPointer,
  updatePointerTarget,
} from "@/lib/pointer-state";

/**
 * The persistent WebGL layer.
 *
 * One <Canvas> lives for the whole page, fixed behind the DOM. It is never
 * unmounted between sections, so the scene keeps its state and the camera can
 * fly continuously rather than restarting per section.
 *
 * Three guards, in order:
 *  1. Nothing renders during SSR — the canvas mounts only after hydration, so
 *     there is no markup mismatch and no window access at build time.
 *  2. If WebGL is unavailable the whole layer is skipped and the CSS fallback
 *     ground shows through.
 *  3. Under prefers-reduced-motion the scene renders exactly one frame and
 *     then stops, giving a still image instead of continuous animation.
 */
export default function SpatialCanvas({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [capable, setCapable] = useState(false);
  const [still, setStill] = useState(false);

  useEffect(() => {
    setCapable(supportsWebGL());
    setStill(prefersReducedMotion());
    setReady(true);

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionChange = () => setStill(motion.matches);
    motion.addEventListener("change", onMotionChange);
    return () => motion.removeEventListener("change", onMotionChange);
  }, []);

  /* Pointer feed. Lives here rather than in each shader so every consumer —
     shaders, camera parallax, DOM cursor — samples one shared value. */
  useEffect(() => {
    if (!ready || !capable) return;

    pointerState.coarse = window.matchMedia("(pointer: coarse)").matches;

    const onMove = (event: PointerEvent) =>
      updatePointerTarget(event.clientX, event.clientY, event.timeStamp);

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [ready, capable]);

  if (!ready || !capable) {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-void"
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 bg-void"
    >
      <Canvas
        // The DOM above owns all interaction; the canvas is purely visual.
        style={{ pointerEvents: "none" }}
        dpr={still ? 1 : [1, 1.75]}
        frameloop={still ? "demand" : "always"}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
          // Depth/stencil are unused: everything is drawn in painter order.
          stencil: false,
        }}
        camera={{ fov: 42, near: 0.1, far: 220, position: [0, 0, 8] }}
        onCreated={({ gl, invalidate }) => {
          gl.setClearColor(0x000000, 0);
          // Reduced motion still needs one frame so the scene is not blank.
          if (still) invalidate();
        }}
      >
        {/* Drop resolution before dropping frames on weak GPUs. */}
        {/* PerformanceMonitor writes the measured performance factor into the
            R3F store; AdaptiveDpr reads it and lowers the render resolution.
            The two must be paired — the monitor alone only reports. */}
        <PerformanceMonitor
          onDecline={() => {
            qualityState.tier = "low";
          }}
          onIncline={() => {
            qualityState.tier = "high";
          }}
        />
        <AdaptiveDpr />
        <FrameDriver still={still} />
        {children}
      </Canvas>
    </div>
  );
}

/* Advances the shared pointer smoothing once per rendered frame. Kept as its
   own component so it sits inside the R3F render loop. */
function FrameDriver({ still }: { still: boolean }) {
  useFrame((_, delta) => {
    const dt = Math.min(0.05, delta);
    // Ease toward the tier's target so a quality drop is a fade, not a pop.
    const target = targetIntensity(still);
    qualityState.intensity += (target - qualityState.intensity) * Math.min(1, dt * 2);
    if (still) return;
    stepPointer(dt);
  });
  return null;
}
