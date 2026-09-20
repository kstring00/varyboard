/**
 * Procedural Vary Board geometry, built from the product photos.
 *
 * One modular section: 25" tall x 8" wide x ~3" deep.
 *  - BACKER: cool grey plate against the wall. Its exposed strips either side of the
 *    platform are the flanges, with small round screw holes.
 *  - POCKET PLATE: dark recessed plate under the lattice, so every hex reads as a deep
 *    pocket (this is where a carabiner clips in).
 *  - PLATFORM: teal/mint convex front. An open honeycomb of hexagonal through-holes with
 *    thick, softly chamfered walls. Flat-top hexes in three staggered vertical columns,
 *    16 / 15 / 16 = 47 cells, matching the photos.
 *  - HANDRAIL: continuous vertical rail on each side, standing off the body on posts.
 *
 * All dimensions are in inches; `IN` converts to metres for the scene.
 */
import * as THREE from "three";
import { mergeVertices, toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export const IN = 0.0254;

export const SECTION = {
  width: 8,
  height: 25,
  backerDepth: 0.85,
  pocketDepth: 0.45, // recess between platform back and pocket floor
  platformWidth: 5.4,
  platformHeight: 24.2,
  platformDepth: 1.0,
  platformCorner: 0.45,
  bevel: 0.12,
  bow: 0.3, // how far the front face bulges outward at centre
  pitch: 1.45, // vertical cell pitch
  holeRadius: 0.64, // hex hole circumradius
  columns: [16, 15, 16] as const,
  railRadius: 0.5,
  railLength: 24.4,
  railStandoff: 2.05, // post length from flange face to rail centre
  postRadius: 0.3,
  postY: [-9.5, 9.5] as const,
  screwY: [-9.5, -3.2, 3.2, 9.5] as const,
} as const;

/** Total depth of one section, wall to rail front, in inches. */
export const SECTION_DEPTH = SECTION.backerDepth + SECTION.railStandoff + SECTION.railRadius;

const cellCircumradius = SECTION.pitch / Math.sqrt(3); // flat-to-flat = pitch
const columnPitch = 1.5 * cellCircumradius;

/** Hex hole centres for one section (inches, section-local, origin at centre). */
export function holeCenters(): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  SECTION.columns.forEach((count, c) => {
    const x = (c - 1) * columnPitch;
    for (let i = 0; i < count; i++) out.push({ x, y: (i - (count - 1) / 2) * SECTION.pitch });
  });
  return out;
}

export const HOLES = holeCenters();
export const HOLE_COUNT = HOLES.length; // 47

/** Flange centre x (inches) either side of the platform. */
export const FLANGE_X = SECTION.platformWidth / 2 + (SECTION.width - SECTION.platformWidth) / 4;

function hexPath(cx: number, cy: number, r: number): THREE.Path {
  const p = new THREE.Path();
  for (let k = 0; k < 6; k++) {
    // flat-top hexagon: vertices at 0°, 60°, ... (points left/right, flat top/bottom)
    const a = (Math.PI / 3) * k;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    if (k === 0) p.moveTo(x, y);
    else p.lineTo(x, y);
  }
  p.closePath();
  return p;
}

function roundedRectShape(w: number, h: number, r: number): THREE.Shape {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

let platformCache: THREE.BufferGeometry | null = null;

/**
 * The convex honeycomb platform. Built once and shared by every section of every board.
 * Local origin: centre of the section, back face of the platform at z = 0, in metres.
 */
export function platformGeometry(): THREE.BufferGeometry {
  if (platformCache) return platformCache;
  const { platformWidth: w, platformHeight: h, platformCorner, platformDepth, bevel, bow, holeRadius } = SECTION;

  const shape = roundedRectShape(w, h, platformCorner);
  for (const c of HOLES) shape.holes.push(hexPath(c.x, c.y, holeRadius));

  let geo: THREE.BufferGeometry = new THREE.ExtrudeGeometry(shape, {
    depth: platformDepth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel * 0.85,
    bevelOffset: 0,
    bevelSegments: 3,
    curveSegments: 6,
  });
  geo.translate(0, 0, bevel); // back face to z = 0

  // Convex bow: the front face bulges outward at the centre; the back stays flat.
  const total = platformDepth + 2 * bevel;
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const hw = w / 2;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const t = THREE.MathUtils.clamp(z / total, 0, 1);
    const profile = 1 - (x / hw) ** 2;
    pos.setZ(i, z + bow * profile * t);
  }
  pos.needsUpdate = true;

  geo = mergeVertices(geo, 1e-4);
  geo = toCreasedNormals(geo, THREE.MathUtils.degToRad(38));
  geo.scale(IN, IN, IN);
  geo.computeBoundingBox();
  platformCache = geo;
  return geo;
}

let grainCache: THREE.DataTexture | null = null;

/** Very fine value-noise normal map for molded-plastic grain. Generated once, tiled. */
export function grainNormalMap(size = 256): THREE.DataTexture {
  if (grainCache) return grainCache;
  const heights = new Float32Array(size * size);
  // seeded pseudo-random so the texture is stable between renders
  let seed = 1337;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const lattice = (n: number) => {
    const g = new Float32Array(n * n);
    for (let i = 0; i < g.length; i++) g[i] = rnd();
    return g;
  };
  const octaves = [
    { n: 16, amp: 0.55 },
    { n: 48, amp: 0.3 },
    { n: 128, amp: 0.15 },
  ].map((o) => ({ ...o, g: lattice(o.n) }));
  const smooth = (t: number) => t * t * (3 - 2 * t);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let v = 0;
      for (const { n, amp, g } of octaves) {
        const fx = (x / size) * n;
        const fy = (y / size) * n;
        const x0 = Math.floor(fx) % n;
        const y0 = Math.floor(fy) % n;
        const x1 = (x0 + 1) % n;
        const y1 = (y0 + 1) % n;
        const sx = smooth(fx - Math.floor(fx));
        const sy = smooth(fy - Math.floor(fy));
        const a = g[y0 * n + x0];
        const b = g[y0 * n + x1];
        const c = g[y1 * n + x0];
        const d = g[y1 * n + x1];
        v += amp * ((a + (b - a) * sx) * (1 - sy) + (c + (d - c) * sx) * sy);
      }
      heights[y * size + x] = v;
    }
  }
  const data = new Uint8Array(size * size * 4);
  const strength = 2.2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const l = heights[y * size + ((x - 1 + size) % size)];
      const r = heights[y * size + ((x + 1) % size)];
      const u = heights[((y - 1 + size) % size) * size + x];
      const d = heights[((y + 1) % size) * size + x];
      const nx = (l - r) * strength;
      const ny = (u - d) * strength;
      const len = Math.hypot(nx, ny, 1);
      const i = (y * size + x) * 4;
      data[i] = Math.round(((nx / len) * 0.5 + 0.5) * 255);
      data[i + 1] = Math.round(((ny / len) * 0.5 + 0.5) * 255);
      data[i + 2] = Math.round(((1 / len) * 0.5 + 0.5) * 255);
      data[i + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  grainCache = tex;
  return tex;
}
