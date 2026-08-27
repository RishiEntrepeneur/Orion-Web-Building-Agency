"use client";

import { useEffect, useRef } from "react";

type Bird = {
  x: number; y: number;      // 0..1 of viewport
  vx: number; vy: number;
  depth: number;             // 0 far .. 1 near
  phase: number;             // wing cycle offset
  tweetAt: number;           // next chirp, seconds
  tweet: number;             // 0..1 chirp envelope
};

/**
 * Birds.
 *
 * Drawn to a 2D canvas rather than as DOM nodes: a flock is dozens of moving
 * transforms a frame, and the compositor handles one canvas far better than it
 * handles forty absolutely-positioned SVGs.
 *
 * Each bird is a two-stroke silhouette whose wing angle is driven by a sine at
 * its own phase, so the flock never beats in unison — synchronised wings are
 * the single thing that makes animated birds look fake. Depth scales size,
 * speed, opacity and blur together, which is what sells the sky as deep.
 *
 * They also avoid the cursor: within a radius they bank away, then rejoin
 * their drift. That is the whole interaction — nothing to click, but the sky
 * notices you.
 */
export default function Birds({ count = 9 }: { count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const birds: Bird[] = Array.from({ length: count }, (_, i) => {
      const depth = 0.18 + (i / count) * 0.82;
      return {
        x: Math.random(),
        y: 0.10 + Math.random() * 0.52,
        vx: (0.014 + depth * 0.030) * (Math.random() < 0.28 ? -1 : 1),
        vy: 0,
        depth,
        phase: Math.random() * Math.PI * 2,
        tweetAt: 2 + Math.random() * 14,
        tweet: 0,
      };
    });

    const pointer = { x: -1, y: -1 };
    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX / window.innerWidth;
      pointer.y = e.clientY / window.innerHeight;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const resize = () => {
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    function drawBird(b: Bird, t: number, w: number, h: number) {
      const px = b.x * w;
      const py = b.y * h;
      // Wider spread than before, and smaller at the far end, so the flock has
      // depth instead of nine birds all at the same apparent distance.
      const size = 3.5 + b.depth * b.depth * 15;
      const dir = Math.sign(b.vx) || 1;

      // Wing angle. Fast on the downstroke, slower recovering, which is how a
      // real wingbeat is shaped and why a plain sine looks mechanical.
      const cycle = Math.sin(t * (5.4 - b.depth * 1.4) + b.phase);
      const flap = Math.sign(cycle) * Math.pow(Math.abs(cycle), 0.65);
      const lift = flap * 0.85;

      ctx!.save();
      ctx!.translate(px, py + Math.sin(t * 0.8 + b.phase) * 3);
      ctx!.scale(dir, 1);
      ctx!.globalAlpha = 0.18 + b.depth * 0.5;
      ctx!.fillStyle = "#2c3350";

      /* Filled, not stroked. A constant-width stroke gives every bird the same
         thin wire outline at every distance, which at this size reads as a
         pen mark rather than a bird; a silhouette that tapers from body to
         wingtip reads as one even a few pixels across. Each wing is drawn out
         along the top edge and back along a slightly lower one, so the shape
         has thickness at the shoulder and comes to a point. */
      const tipY = lift * size * 0.62;
      const bendY = -lift * size * 0.46;
      ctx!.beginPath();
      ctx!.moveTo(-size, tipY);
      ctx!.quadraticCurveTo(-size * 0.45, bendY, 0, 0);
      ctx!.quadraticCurveTo(size * 0.45, bendY, size, tipY);
      ctx!.quadraticCurveTo(
        size * 0.5,
        bendY + size * 0.2,
        0,
        size * 0.14,
      );
      ctx!.quadraticCurveTo(-size * 0.5, bendY + size * 0.2, -size, tipY);
      ctx!.closePath();
      ctx!.fill();

      /* Chirp. One faint arc, and only on the nearest birds.
         Two hard arcs on every bird in the flock at once did not read as sound
         travelling -- it read as tally marks scribbled beside each one, which
         with nine birds on screen was the loudest thing in the sky. */
      if (b.tweet > 0 && b.depth > 0.62) {
        const e = 1 - b.tweet;
        ctx!.globalAlpha = b.tweet * 0.2;
        ctx!.strokeStyle = "#2c3350";
        ctx!.lineWidth = Math.max(0.6, size * 0.05);
        ctx!.lineCap = "round";
        ctx!.beginPath();
        ctx!.arc(size * 0.9, -size * 0.3, size * (1.1 + e * 2.2), -0.7, 0.2);
        ctx!.stroke();
      }
      ctx!.restore();
    }

    let raf = 0;
    let last = performance.now();
    const t0 = performance.now();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = (now - t0) / 1000;

      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      for (const b of birds) {
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.vy *= 0.94;

        // Bank away from the cursor. Scaled by depth so near birds react
        // hardest, which reads as them being closer to you.
        if (pointer.x >= 0) {
          const dx = b.x - pointer.x;
          const dy = b.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          const r = 0.13;
          if (d2 < r * r && d2 > 0.000001) {
            const d = Math.sqrt(d2);
            const push = (1 - d / r) * 0.55 * b.depth;
            b.vy += (dy / d) * push * dt * 9;
            b.vx += (dx / d) * push * dt * 3;
          }
        }

        // Drift home to a lazy cruise so a scare does not permanently change
        // a bird's course.
        const cruise = (0.014 + b.depth * 0.030) * Math.sign(b.vx || 1);
        b.vx += (cruise - b.vx) * dt * 0.5;
        b.y += Math.sin(t * 0.35 + b.phase) * 0.004 * dt;

        if (b.x > 1.12) { b.x = -0.12; b.y = 0.08 + Math.random() * 0.54; }
        if (b.x < -0.12) { b.x = 1.12; b.y = 0.08 + Math.random() * 0.54; }
        b.y = Math.min(0.78, Math.max(0.04, b.y));

        if (t > b.tweetAt) { b.tweet = 1; b.tweetAt = t + 6 + Math.random() * 16; }
        if (b.tweet > 0) b.tweet = Math.max(0, b.tweet - dt * 1.1);

        drawBird(b, t, w, h);
      }
    };

    if (reduced) {
      const w = window.innerWidth, h = window.innerHeight;
      birds.forEach((b) => drawBird(b, 0, w, h));
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, [count]);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-[15] h-full w-full" />;
}
