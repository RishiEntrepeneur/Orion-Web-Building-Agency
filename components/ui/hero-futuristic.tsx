"use client";

import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import { useAspect, useTexture } from "@react-three/drei";
import { ChevronDown } from "lucide-react";
import {
  Component,
  Suspense,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as THREE from "three/webgpu";
import { bloom } from "three/examples/jsm/tsl/display/BloomNode.js";
import {
  abs,
  add,
  blendScreen,
  float,
  mix,
  mod,
  mx_cell_noise_float,
  oneMinus,
  smoothstep,
  texture,
  uniform,
  uv,
  vec2,
  vec3,
  pass,
} from "three/tsl";

import "./hero-futuristic.css";

/**
 * A WebGPU hero: a photograph and its matching depth map are drawn on a single
 * plane, the depth map both parallaxes the image against the cursor and drives
 * a red scan line that sweeps through the subject in depth rather than in
 * screen space. Bloom is applied over the top as a TSL post-processing node.
 *
 * The two textures are a matched pair — the depth map is a greyscale pass
 * generated from that exact photograph. They cannot be swapped for arbitrary
 * stock imagery independently: replacing one without the other detaches the
 * parallax and the scan from the subject. Pass both together, or neither.
 */

const DEFAULT_TEXTURE = "https://i.postimg.cc/XYwvXN8D/img-4.png";
const DEFAULT_DEPTH = "https://i.postimg.cc/2SHKQh2q/raw-4.webp";

/* R3F builds its JSX catalogue from the classic `three` entry point. This hero
   renders through `three/webgpu`, so the catalogue is re-registered from that
   module — otherwise <mesh> and <planeGeometry> would construct objects from a
   different module instance than the renderer expects. Both entry points share
   three.core.js, so the core classes themselves are identical. */
extend(THREE as unknown as Parameters<typeof extend>[0]);

/** Aspect the plane is laid out against, matching the source imagery. */
const WIDTH = 300;
const HEIGHT = 300;

/* --- Post processing --- */

const ScanPipeline = ({
  strength = 1,
  threshold = 1,
  fullScreenEffect = true,
  onFailure,
}: {
  strength?: number;
  threshold?: number;
  fullScreenEffect?: boolean;
  onFailure: () => void;
}) => {
  const { gl, scene, camera } = useThree();
  const progressRef = useRef<{ value: number }>({ value: 0 });
  const brokenRef = useRef(false);

  const pipeline = useMemo(() => {
    /* RenderPipeline, not the PostProcessing alias: that name is deprecated as
       of r183 and warns on construction. */
    const rp = new THREE.RenderPipeline(gl as unknown as THREE.Renderer);
    const scenePass = pass(scene, camera);
    const scenePassColor = scenePass.getTextureNode("output");
    const bloomPass = bloom(scenePassColor, strength, 0.5, threshold);

    const uScanProgress = uniform(0);
    progressRef.current = uScanProgress;

    // A red wash that tracks the scan line's position down the frame.
    const scanPos = float(uScanProgress.value);
    const uvY = uv().y;
    const scanWidth = float(0.05);
    const scanLine = smoothstep(0, scanWidth, abs(uvY.sub(scanPos)));
    const redOverlay = vec3(1, 0, 0).mul(oneMinus(scanLine)).mul(0.4);

    const withScanEffect = mix(
      scenePassColor,
      add(scenePassColor, redOverlay),
      fullScreenEffect ? smoothstep(0.9, 1.0, oneMinus(scanLine)) : 1.0,
    );

    rp.outputNode = withScanEffect.add(bloomPass);

    return rp;
  }, [camera, gl, scene, strength, threshold, fullScreenEffect]);

  // Each new pipeline holds GPU resources; the superseded one has to go.
  useEffect(() => () => pipeline.dispose(), [pipeline]);

  /* Priority 1 takes rendering away from R3F's automatic loop — the pipeline
     owns the frame from here, so nothing else may render.

     `render()` rather than `renderAsync()`: the latter is deprecated, and the
     renderer is already initialised by the time R3F mounts this because the gl
     factory awaits init() before handing the renderer over.

     A backend that accepts the device but rejects a draw (a three release
     newer than the browser's WebGPU implementation is the usual cause) throws
     every single frame. One failure is enough to know: report it and stop, so
     the hero falls back to the still instead of flooding the console. */
  useFrame(({ clock }) => {
    if (brokenRef.current) return;
    progressRef.current.value = Math.sin(clock.getElapsedTime() * 0.5) * 0.5 + 0.5;
    try {
      pipeline.render();
    } catch {
      brokenRef.current = true;
      onFailure();
    }
  }, 1);

  return null;
};

/* --- Scene --- */

const Scene = ({
  textureUrl,
  depthUrl,
  scaleFactor,
}: {
  textureUrl: string;
  depthUrl: string;
  scaleFactor: number;
}) => {
  const [rawMap, depthMap] = useTexture([textureUrl, depthUrl]);
  const meshRef = useRef<THREE.Mesh>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Reveal only once both textures have resolved.
    if (rawMap && depthMap) setVisible(true);
  }, [rawMap, depthMap]);

  const { material, uniforms } = useMemo(() => {
    const uPointer = uniform(new THREE.Vector2(0));
    const uProgress = uniform(0);

    const strength = 0.01;
    const tDepthMap = texture(depthMap);

    // Depth displaces the sample position, so nearer pixels swing further as
    // the cursor moves — parallax from a single flat plane.
    const tMap = texture(rawMap, uv().add(tDepthMap.r.mul(uPointer).mul(strength)));

    const aspect = float(WIDTH).div(HEIGHT);
    const tUv = vec2(uv().x.mul(aspect), uv().y);

    const tiling = vec2(120.0);
    const tiledUv = mod(tUv.mul(tiling), 2.0).sub(1.0);
    const brightness = mx_cell_noise_float(tUv.mul(tiling).div(2));

    // A dot grid, dimmed per cell by noise so the scan reads as scattered
    // points of light rather than a printed halftone.
    const dist = float(tiledUv.length());
    const dot = float(smoothstep(0.5, 0.49, dist)).mul(brightness);

    // The band is thresholded against depth, not against screen Y, so the scan
    // travels through the subject.
    const flow = oneMinus(smoothstep(0, 0.02, abs(tDepthMap.sub(uProgress))));
    const mask = dot.mul(flow).mul(vec3(10, 0, 0));

    const material = new THREE.MeshBasicNodeMaterial({
      colorNode: blendScreen(tMap, mask),
      transparent: true,
      opacity: 0,
    });

    return { material, uniforms: { uPointer, uProgress } };
  }, [rawMap, depthMap]);

  useEffect(() => () => material.dispose(), [material]);

  const [w, h] = useAspect(WIDTH, HEIGHT);

  useFrame(({ clock }) => {
    uniforms.uProgress.value = Math.sin(clock.getElapsedTime() * 0.5) * 0.5 + 0.5;

    // Ease the plane up from transparent so the first textured frame does not
    // pop in at full strength.
    const mat = meshRef.current?.material as THREE.MeshBasicNodeMaterial | undefined;
    if (mat) mat.opacity = THREE.MathUtils.lerp(mat.opacity, visible ? 1 : 0, 0.07);
  });

  useFrame(({ pointer }) => {
    uniforms.uPointer.value = pointer;
  });

  return (
    <mesh
      ref={meshRef}
      scale={[w * scaleFactor, h * scaleFactor, 1]}
      material={material}
    >
      <planeGeometry />
    </mesh>
  );
};

/* --- Failure containment --- */

/* An exception thrown while the renderer is being created propagates out of
   the Canvas and, with no boundary, takes the whole route down — a hero that
   cannot draw should degrade, not blank the page. Errors thrown later, from
   inside the frame loop, never reach a boundary at all; ScanPipeline catches
   those itself and reports through the same callback. */
class CanvasBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onFailure();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/* --- Hero --- */

export interface HeroFuturisticProps {
  /** Headline. Words animate in one at a time, so keep it to a few. */
  title?: string;
  /** Supporting line under the headline. */
  subtitle?: string;
  /** Label on the scroll affordance. Pass null to drop the button. */
  ctaLabel?: string | null;
  /** Colour map. Must be supplied together with `depthUrl`. */
  textureUrl?: string;
  /** Greyscale depth pass matching `textureUrl`. */
  depthUrl?: string;
  /** Bloom intensity over the scene. */
  bloomStrength?: number;
  /** Luminance above which bloom starts. */
  bloomThreshold?: number;
  /** Tint the whole frame with the scan, rather than only its leading edge. */
  fullScreenEffect?: boolean;
  /** Plane size as a fraction of the viewport-fitted aspect box. */
  scaleFactor?: number;
  /** Pin the renderer to the WebGL2 backend instead of letting it pick. */
  forceWebGL?: boolean;
  /** Runs instead of the default "scroll one viewport down" behaviour. */
  onExplore?: () => void;
}

export const Html = ({
  title = "Build Your Dreams",
  subtitle = "AI-powered creativity for the next generation.",
  ctaLabel = "Scroll to explore",
  textureUrl = DEFAULT_TEXTURE,
  depthUrl = DEFAULT_DEPTH,
  bloomStrength = 1,
  bloomThreshold = 1,
  fullScreenEffect = true,
  scaleFactor = 0.4,
  forceWebGL = false,
  onExplore,
}: HeroFuturisticProps = {}) => {
  const titleWords = useMemo(() => title.split(" "), [title]);
  const [visibleWords, setVisibleWords] = useState(0);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [delays, setDelays] = useState<number[]>([]);
  const [subtitleDelay, setSubtitleDelay] = useState(0);

  /* "up" while the GPU path is believed good, "down" once it has actually
     failed. It is never set optimistically from a capability probe — a browser
     can advertise WebGPU and still reject the draw — so the switch is only
     thrown by a real error, from either the boundary or the render loop. */
  const [stage, setStage] = useState<"up" | "down">("up");
  const fallBack = useCallback(() => setStage("down"), []);

  /* Jitter is generated after mount rather than during render: random values
     computed on the server would not match the client's and would trip a
     hydration mismatch. */
  useEffect(() => {
    setDelays(titleWords.map(() => Math.random() * 0.07));
    setSubtitleDelay(Math.random() * 0.1);
  }, [titleWords]);

  useEffect(() => {
    if (visibleWords < titleWords.length) {
      const timeout = setTimeout(() => setVisibleWords(visibleWords + 1), 600);
      return () => clearTimeout(timeout);
    }
    const timeout = setTimeout(() => setSubtitleVisible(true), 800);
    return () => clearTimeout(timeout);
  }, [visibleWords, titleWords.length]);

  const handleExplore = () => {
    if (onExplore) {
      onExplore();
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollBy({
      top: window.innerHeight,
      behavior: reduced ? "auto" : "smooth",
    });
  };

  return (
    <div className="relative h-svh">
      <div className="absolute z-60 flex h-svh w-full flex-col items-center justify-center px-10 uppercase pointer-events-none">
        {/* The words are separate flex items separated by margin, not by
            whitespace, so the heading's text content would run together as
            one word. The label restores it for assistive technology. */}
        <h1
          aria-label={title}
          className="text-3xl font-extrabold md:text-5xl xl:text-6xl 2xl:text-7xl"
        >
          <span aria-hidden="true" className="flex space-x-2 overflow-hidden text-white lg:space-x-6">
            {titleWords.map((word, index) => (
              <span
                key={index}
                className={index < visibleWords ? "fade-in" : ""}
                style={{
                  animationDelay: `${index * 0.13 + (delays[index] || 0)}s`,
                  opacity: index < visibleWords ? undefined : 0,
                }}
              >
                {word}
              </span>
            ))}
          </span>
        </h1>
        <p className="mt-2 overflow-hidden text-xs font-bold text-white md:text-xl xl:text-2xl 2xl:text-3xl">
          <span
            className={subtitleVisible ? "fade-in-subtitle" : ""}
            style={{
              animationDelay: `${titleWords.length * 0.13 + 0.2 + subtitleDelay}s`,
              opacity: subtitleVisible ? undefined : 0,
            }}
          >
            {subtitle}
          </span>
        </p>
      </div>

      {ctaLabel !== null && (
        <button
          type="button"
          onClick={handleExplore}
          className="explore-btn"
          style={{ animationDelay: "2.2s" }}
        >
          {ctaLabel}
          <span className="explore-arrow" aria-hidden="true">
            <ChevronDown className="arrow-svg" size={22} strokeWidth={2} />
          </span>
        </button>
      )}

      {stage === "down" ? (
        /* Still fallback: the photograph alone, no parallax and no scan. The
           headline and the button sit outside the canvas, so the hero still
           reads as a hero when the GPU path is unavailable. */
        <img
          src={textureUrl}
          alt=""
          aria-hidden="true"
          onError={(event) => {
            // A broken-image glyph over the headline is worse than no image.
            event.currentTarget.style.display = "none";
          }}
          className="absolute inset-0 z-0 h-full w-full object-contain opacity-80"
        />
      ) : (
        <CanvasBoundary onFailure={fallBack}>
          <Canvas
            flat
            gl={async (props) => {
              /* WebGPURenderer picks its own backend: WebGPU where the browser
                 offers it, WebGL2 otherwise. `forceWebGL` pins it to WebGL2,
                 which is the escape hatch when a browser advertises WebGPU but
                 its implementation is older than this build of three. */
              const renderer = new THREE.WebGPURenderer({
                ...(props as ConstructorParameters<typeof THREE.WebGPURenderer>[0]),
                forceWebGL,
              });
              await renderer.init();
              return renderer;
            }}
          >
            <ScanPipeline
              strength={bloomStrength}
              threshold={bloomThreshold}
              fullScreenEffect={fullScreenEffect}
              onFailure={fallBack}
            />
            {/* useTexture suspends until both maps decode. */}
            <Suspense fallback={null}>
              <Scene
                textureUrl={textureUrl}
                depthUrl={depthUrl}
                scaleFactor={scaleFactor}
              />
            </Suspense>
          </Canvas>
        </CanvasBoundary>
      )}
    </div>
  );
};

export const HeroFuturistic = Html;

export default Html;
