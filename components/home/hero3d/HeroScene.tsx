"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Html, Lightformer, OrbitControls } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { VaryBoard, boardHeight } from "./VaryBoardModel";
import { grainNormalMap } from "./geometry";

export type SceneQuality = "full" | "light";

export interface HeroSceneProps {
  quality: SceneQuality;
  /** Render loop only while the hero is on screen. */
  active: boolean;
  modelUrl?: string | null;
  onReady?: () => void;
  callouts?: { title: string; line: string; icon: "strength" | "mobility" | "balance" }[];
}

/* Layout of the two boards on the wall (metres). Bottoms level, like a real install. */
const FLOOR_Y = -1.0;
const MOUNT_Y = FLOOR_Y + 0.28; // bottom of both boards
const STD = { x: 0, sections: 3 as const };
const XT = { x: 0.5, sections: 4 as const };
const stdCenterY = MOUNT_Y + boardHeight(3) / 2;
const xtCenterY = MOUNT_Y + boardHeight(4) / 2;

/** Camera composition per aspect ratio. Three-quarter view from the left, slightly low. */
function composition(aspect: number) {
  if (aspect < 0.9) {
    // phone panel: standard board large and centred, XT beside it
    return { pos: new THREE.Vector3(-1.0, 0.15, 2.4), target: new THREE.Vector3(0.24, 0.32, 0), fov: 44 };
  }
  if (aspect < 1.5) {
    return { pos: new THREE.Vector3(-1.7, 0.1, 2.55), target: new THREE.Vector3(-0.2, 0.3, 0), fov: 38 };
  }
  return { pos: new THREE.Vector3(-2.0, 0.1, 2.6), target: new THREE.Vector3(-0.5, 0.3, 0), fov: 35 };
}

function CameraRig() {
  const get = useThree((s) => s.get);
  const size = useThree((s) => s.size);
  const hasControls = useThree((s) => Boolean(s.controls));
  const aspect = size.width / Math.max(1, size.height);
  const comp = useMemo(() => composition(aspect), [aspect]);
  useEffect(() => {
    // Read the live camera/controls from the store (OrbitControls is registered with makeDefault).
    const { camera, controls } = get();
    const cam = camera as THREE.PerspectiveCamera;
    const orbit = controls as OrbitControlsImpl | null;
    cam.fov = comp.fov;
    cam.position.copy(comp.pos);
    cam.updateProjectionMatrix();
    if (orbit) {
      orbit.target.copy(comp.target);
      orbit.update();
    } else {
      cam.lookAt(comp.target);
    }
  }, [get, comp, hasControls]);
  return null;
}

/** Scroll-scrubbed parallax: the whole set drifts up a little as the page scrolls. Never scroll-jacks. */
function ScrollParallax({ children, strength }: { children: React.ReactNode; strength: number }) {
  const ref = useRef<THREE.Group>(null);
  const progress = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      progress.current = THREE.MathUtils.clamp(window.scrollY / Math.max(1, window.innerHeight), 0, 1);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useFrame(() => {
    if (!ref.current) return;
    const targetY = progress.current * 0.32 * strength;
    ref.current.position.y += (targetY - ref.current.position.y) * 0.12;
  });
  return <group ref={ref}>{children}</group>;
}

function ConcreteWall() {
  const mat = useMemo(() => {
    const grain = grainNormalMap().clone();
    grain.repeat.set(14, 14);
    grain.needsUpdate = true;
    return new THREE.MeshStandardMaterial({ color: "#9c9993", roughness: 0.97, metalness: 0, normalMap: grain, normalScale: new THREE.Vector2(0.09, 0.09) });
  }, []);
  const floorMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#a29f98", roughness: 0.9, metalness: 0 }), []);
  return (
    <group>
      {/* Concrete panel behind the boards. Its left edge is where the "window" light begins. */}
      <mesh position={[1.1, 0.6, -0.001]} material={mat} receiveShadow>
        <planeGeometry args={[4.2, 5.2]} />
      </mesh>
      {/* Panel edge return, catches the key light */}
      <mesh position={[-1.0, 0.6, 0.06]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[0.12, 5.2]} />
        <meshStandardMaterial color="#b3b0a9" roughness={0.95} />
      </mesh>
      <mesh position={[0.6, FLOOR_Y, 1.5]} rotation={[-Math.PI / 2, 0, 0]} material={floorMat} receiveShadow>
        <planeGeometry args={[9, 6]} />
      </mesh>
    </group>
  );
}

function SpotOnWall() {
  const light = useRef<THREE.SpotLight>(null);
  const target = useMemo(() => {
    const t = new THREE.Object3D();
    t.position.set(0.15, 0.7, 0);
    return t;
  }, []);
  useEffect(() => {
    if (light.current) light.current.target = target;
  }, [target]);
  return (
    <>
      <primitive object={target} />
      <spotLight ref={light} position={[-2.6, 2.1, 1.9]} angle={0.62} penumbra={0.95} decay={1.6} distance={14} intensity={13} color="#fff3e2" />
    </>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.28} color="#e9eef0" />
      {/* Key: soft daylight from the left window, slightly warm */}
      <directionalLight
        position={[-3.6, 2.6, 2.4]}
        intensity={2.0}
        color="#fff4e6"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.00012}
        shadow-normalBias={0.02}
        shadow-camera-near={0.5}
        shadow-camera-far={12}
        shadow-camera-left={-2.5}
        shadow-camera-right={2.5}
        shadow-camera-top={2.6}
        shadow-camera-bottom={-1.6}
      />
      {/* Cool fill from the right, no shadow */}
      <directionalLight position={[3, 1.2, 2.5]} intensity={0.55} color="#dbe7ee" />
      {/* Soft pool of window light on the wall, falling off to the right */}
      <SpotOnWall />
      {/* Rim from behind-left to separate the boards from the wall */}
      <spotLight position={[-1.5, 2.2, -0.6]} angle={0.6} penumbra={1} intensity={6} color="#ffffff" />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3.2} color="#fff1e0" position={[-4, 1.5, 2]} rotation={[0, Math.PI / 2.4, 0]} scale={[5, 6, 1]} />
        <Lightformer form="rect" intensity={1.1} color="#dfe8ec" position={[0, 5, 1]} rotation={[Math.PI / 2, 0, 0]} scale={[8, 4, 1]} />
        <Lightformer form="rect" intensity={0.5} color="#cfd6d8" position={[5, 0.5, 2]} rotation={[0, -Math.PI / 2.2, 0]} scale={[3, 5, 1]} />
      </Environment>
    </>
  );
}

const ICONS = {
  strength: <path d="M4 10v4M20 10v4M7 8v8M17 8v8M7 12h10" />,
  mobility: <path d="M13 4a1.5 1.5 0 1 0 0 .01M6 20l3-6 3 2 2-5-3-1-2 3M11 14l4 3 2 3M14 9l3 1 2-2" />,
  balance: <path d="M12 3v18M5 21h14M3 9l3-4 3 4M3 9a3 3 0 0 0 6 0M15 9l3-4 3 4M15 9a3 3 0 0 0 6 0M8 5h8" />,
} as const;

function Callout({ position, title, line, icon, side }: { position: [number, number, number]; title: string; line: string; icon: keyof typeof ICONS; side: "left" | "right" }) {
  return (
    <Html position={position} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }} wrapperClass="hero-callout-wrap">
      <div className={`hero-callout hero-callout--${side}`} aria-hidden="true">
        <span className="hero-callout__dot" />
        <span className="hero-callout__line" />
        <div className="hero-callout__label">
          <span className="hero-callout__hex">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              {ICONS[icon]}
            </svg>
          </span>
          <span className="hero-callout__text">
            <span className="hero-callout__title">{title}</span>
            <span className="hero-callout__sub">{line}</span>
          </span>
        </div>
      </div>
    </Html>
  );
}

function Ready({ onReady }: { onReady?: () => void }) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);
  return null;
}

export default function HeroScene({ quality, active, modelUrl = null, onReady, callouts }: HeroSceneProps) {
  const full = quality === "full";
  const isTouch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const frontZ = 0.09;
  const hasGlb = Boolean(modelUrl);

  return (
    <Canvas
      shadows
      dpr={full ? [1, 1.75] : [1, 1.25]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: !full, alpha: true, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.92 }}
      camera={{ fov: 35, near: 0.1, far: 30, position: [-2.0, 0.1, 2.6] }}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden="true"
    >
      <fog attach="fog" args={["#aaa7a0", 4.5, 10]} />
      <Suspense fallback={null}>
        <Lights />
        <ScrollParallax strength={full ? 1 : 0.5}>
          <ConcreteWall />
          <VaryBoard sections={STD.sections} band position={[STD.x, stdCenterY, 0]} modelUrl={modelUrl} />
          <VaryBoard sections={XT.sections} position={[XT.x, xtCenterY, 0]} modelUrl={modelUrl} />
          {full && callouts && !hasGlb && (
            <>
              {/* Strength: the anchor with the band clipped in. Mobility: the taller XT. Balance: low on the standard board. */}
              <Callout position={[STD.x - 0.03, stdCenterY + 0.66, frontZ]} title={callouts[0].title} line={callouts[0].line} icon={callouts[0].icon} side="left" />
              <Callout position={[XT.x + 0.04, 0.6, frontZ]} title={callouts[1].title} line={callouts[1].line} icon={callouts[1].icon} side="right" />
              <Callout position={[STD.x - 0.01, -0.22, frontZ]} title={callouts[2].title} line={callouts[2].line} icon={callouts[2].icon} side="left" />
            </>
          )}
        </ScrollParallax>
        <OrbitControls
          makeDefault
          enabled={!isTouch}
          enablePan={false}
          enableZoom={false}
          enableDamping
          dampingFactor={0.06}
          rotateSpeed={0.45}
          minPolarAngle={Math.PI / 2 - 0.16}
          maxPolarAngle={Math.PI / 2 + 0.26}
          minAzimuthAngle={-0.9}
          maxAzimuthAngle={-0.18}
        />
        <CameraRig />
        {full && (
          <EffectComposer multisampling={4} enableNormalPass={false}>
            <Bloom intensity={0.28} luminanceThreshold={0.88} luminanceSmoothing={0.2} mipmapBlur radius={0.55} />
            <Vignette offset={0.22} darkness={0.42} eskil={false} />
          </EffectComposer>
        )}
        <Ready onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
