"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoundedBox, useGLTF } from "@react-three/drei";
import { FLANGE_X, HOLES, HOLE_COUNT, IN, SECTION, grainNormalMap, platformGeometry } from "./geometry";

/** Brand mint/ocean teal, deepened slightly for richness against the photos. */
export const COLORS = {
  platform: "#6aa6a3",
  backer: "#8d9498",
  pocket: "#23282c",
  rail: "#33383c",
  band: "#3f5f95",
  carabiner: "#1d1f22",
} as const;

export interface BoardProps {
  /** 3 = Vary Board (75"), 4 = Vary Board XT (100"). */
  sections?: 3 | 4;
  /** Show a resistance band clipped into a top anchor point. */
  band?: boolean;
  /** Optional real model. When present it replaces the procedural build. */
  modelUrl?: string | null;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

const sectionH = SECTION.height * IN;

function useMaterials() {
  return useMemo(() => {
    const grain = grainNormalMap();
    grain.repeat.set(9, 28);
    const platform = new THREE.MeshPhysicalMaterial({
      color: COLORS.platform,
      roughness: 0.55,
      metalness: 0,
      clearcoat: 0.18,
      clearcoatRoughness: 0.5,
      normalMap: grain,
      normalScale: new THREE.Vector2(0.18, 0.18),
      sheen: 0.15,
      sheenRoughness: 0.8,
      sheenColor: new THREE.Color("#dff1ee"),
    });
    const backerGrain = grain.clone();
    backerGrain.repeat.set(14, 44);
    backerGrain.needsUpdate = true;
    const backer = new THREE.MeshPhysicalMaterial({
      color: COLORS.backer,
      roughness: 0.62,
      metalness: 0,
      clearcoat: 0.08,
      clearcoatRoughness: 0.6,
      normalMap: backerGrain,
      normalScale: new THREE.Vector2(0.15, 0.15),
    });
    const pocket = new THREE.MeshStandardMaterial({ color: COLORS.pocket, roughness: 0.85, metalness: 0 });
    const rail = new THREE.MeshPhysicalMaterial({ color: COLORS.rail, roughness: 0.42, metalness: 0.05, clearcoat: 0.3, clearcoatRoughness: 0.35 });
    const band = new THREE.MeshPhysicalMaterial({ color: COLORS.band, roughness: 0.65, sheen: 0.4, sheenColor: new THREE.Color("#9fb6e0") });
    const carabiner = new THREE.MeshStandardMaterial({ color: COLORS.carabiner, roughness: 0.35, metalness: 0.6 });
    return { platform, backer, pocket, rail, band, carabiner };
  }, []);
}

/** One 25" modular section. Origin at its centre; wall at z = 0. */
function Section({ mats }: { mats: ReturnType<typeof useMaterials> }) {
  const platform = useMemo(() => platformGeometry(), []);
  const pocketZ = SECTION.backerDepth * IN;
  const platformZ = (SECTION.backerDepth + SECTION.pocketDepth) * IN;
  const railZ = (SECTION.backerDepth + SECTION.railStandoff) * IN;

  const screwRef = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = screwRef.current;
    if (!m) return;
    const o = new THREE.Object3D();
    let i = 0;
    for (const sx of [-FLANGE_X, FLANGE_X]) {
      for (const sy of SECTION.screwY) {
        o.position.set(sx * IN, sy * IN, SECTION.backerDepth * IN + 0.0004);
        o.rotation.set(Math.PI / 2, 0, 0);
        o.updateMatrix();
        m.setMatrixAt(i++, o.matrix);
      }
    }
    m.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <group>
      {/* Backer plate (its exposed strips are the flanges) */}
      <RoundedBox
        args={[SECTION.width * IN, SECTION.height * IN, SECTION.backerDepth * IN]}
        radius={0.12 * IN}
        smoothness={3}
        position={[0, 0, (SECTION.backerDepth * IN) / 2]}
        material={mats.backer}
        castShadow
        receiveShadow
      />
      {/* Dark recessed pocket plate under the lattice */}
      <mesh position={[0, 0, pocketZ + (SECTION.pocketDepth * IN) / 2]} material={mats.pocket} receiveShadow>
        <boxGeometry args={[(SECTION.platformWidth - 0.3) * IN, (SECTION.platformHeight - 0.3) * IN, SECTION.pocketDepth * IN]} />
      </mesh>
      {/* Convex honeycomb platform */}
      <mesh geometry={platform} material={mats.platform} position={[0, 0, platformZ]} castShadow receiveShadow />
      {/* Screw holes on the flanges */}
      <instancedMesh ref={screwRef} args={[undefined, undefined, 8]} material={mats.pocket}>
        <cylinderGeometry args={[0.14 * IN, 0.14 * IN, 0.06 * IN, 14]} />
      </instancedMesh>
      {/* Handrails on posts, both sides */}
      {[-FLANGE_X, FLANGE_X].map((x) => (
        <group key={x} position={[x * IN, 0, 0]}>
          <mesh position={[0, 0, railZ]} material={mats.rail} castShadow>
            <capsuleGeometry args={[SECTION.railRadius * IN, SECTION.railLength * IN, 6, 18]} />
          </mesh>
          {SECTION.postY.map((y) => (
            <mesh
              key={y}
              position={[0, y * IN, SECTION.backerDepth * IN + (SECTION.railStandoff * IN) / 2]}
              rotation={[Math.PI / 2, 0, 0]}
              material={mats.rail}
              castShadow
            >
              <cylinderGeometry args={[SECTION.postRadius * IN, SECTION.postRadius * IN, SECTION.railStandoff * IN, 16]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/** A looped resistance band clipped by a carabiner into one anchor point. */
function Band({ hole, sectionIndex, sections, mats }: { hole: { x: number; y: number }; sectionIndex: number; sections: number; mats: ReturnType<typeof useMaterials> }) {
  const geo = useMemo(() => {
    const yBase = (sectionIndex - (sections - 1) / 2) * sectionH;
    const hx = hole.x * IN;
    const hy = yBase + hole.y * IN;
    const zf = (SECTION.backerDepth + SECTION.pocketDepth + SECTION.platformDepth + SECTION.bow) * IN;
    const pts = [
      new THREE.Vector3(hx - 0.012, hy + 0.004, zf - 0.02),
      new THREE.Vector3(hx - 0.02, hy - 0.05, zf + 0.03),
      new THREE.Vector3(hx - 0.028, hy - 0.3, zf + 0.045),
      new THREE.Vector3(hx - 0.01, hy - 0.52, zf + 0.05),
      new THREE.Vector3(hx + 0.016, hy - 0.5, zf + 0.048),
      new THREE.Vector3(hx + 0.026, hy - 0.28, zf + 0.04),
      new THREE.Vector3(hx + 0.018, hy - 0.05, zf + 0.03),
      new THREE.Vector3(hx + 0.012, hy + 0.004, zf - 0.02),
    ];
    const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal", 0.6);
    return new THREE.TubeGeometry(curve, 96, 0.0105, 12, false);
  }, [hole, sectionIndex, sections]);

  const yBase = (sectionIndex - (sections - 1) / 2) * sectionH;
  const zf = (SECTION.backerDepth + SECTION.pocketDepth + SECTION.platformDepth * 0.6) * IN;
  return (
    <group>
      <mesh geometry={geo} material={mats.band} castShadow />
      <mesh position={[hole.x * IN, yBase + hole.y * IN - 0.004, zf]} rotation={[0, 0, Math.PI / 2]} material={mats.carabiner} castShadow>
        <torusGeometry args={[0.026, 0.0038, 10, 40]} />
      </mesh>
    </group>
  );
}

/** Stacked procedural board. Origin at the board's centre, wall at z = 0. */
function ProceduralBoard({ sections = 3, band = false, mats }: { sections: 3 | 4; band: boolean; mats: ReturnType<typeof useMaterials> }) {
  const topSection = sections - 1;
  // Top-right cell of the top section, three cells down from the top edge.
  const anchorHole = HOLES[HOLE_COUNT - 4];
  return (
    <group>
      {Array.from({ length: sections }, (_, i) => (
        <group key={i} position={[0, (i - (sections - 1) / 2) * sectionH, 0]}>
          <Section mats={mats} />
        </group>
      ))}
      {band && <Band hole={anchorHole} sectionIndex={topSection} sections={sections} mats={mats} />}
    </group>
  );
}

function GlbBoard({ url, sections }: { url: string; sections: 3 | 4 }) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => {
    const s = scene.clone(true);
    const box = new THREE.Box3().setFromObject(s);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const targetH = sections * sectionH;
    const k = targetH / size.y;
    s.scale.setScalar(k);
    s.position.set(-center.x * k, -center.y * k, -box.min.z * k);
    s.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    return s;
  }, [scene, sections]);
  return <primitive object={cloned} />;
}

export function VaryBoard({ sections = 3, band = false, modelUrl = null, position = [0, 0, 0], rotation = [0, 0, 0] }: BoardProps) {
  const mats = useMaterials();
  return (
    <group position={position} rotation={rotation}>
      {modelUrl ? <GlbBoard url={modelUrl} sections={sections} /> : <ProceduralBoard sections={sections} band={band} mats={mats} />}
    </group>
  );
}

/** Height of a board in metres. */
export function boardHeight(sections: 3 | 4): number {
  return sections * sectionH;
}
