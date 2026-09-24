import {
  ACESFilmicToneMapping,
  BoxGeometry,
  CanvasTexture,
  CapsuleGeometry,
  ClampToEdgeWrapping,
  Color,
  ColorManagement,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  type MeshStandardMaterialParameters,
  Object3D,
  PCFSoftShadowMap,
  Path,
  PerspectiveCamera,
  PlaneGeometry,
  Quaternion,
  Raycaster,
  RepeatWrapping,
  SRGBColorSpace,
  Scene,
  Shape,
  SphereGeometry,
  Texture,
  Vector2,
  Vector3,
  WebGLRenderer,
  type BufferGeometry,
} from "three";
import { fitPlanner } from "@/content/config";
import { board } from "@/content/facts";
import { roomByKey, type Material, type Piece, type RoomDef, type Side, type WallPiece } from "@/content/rooms";
import { BOARD_W, BOTTOM, MODELS, SECTION_H, SNAPS_TO_STUDS, ZONE, bestSpot, evaluate, inBounds, nearestValid, nextWall as nextWallOf, nudge as nudgeOf, positionsFor, snap, wallFrame, type ModelKey } from "@/lib/fit";

/**
 * The 3D room planner, ported from reference/room-planner.html to three r170. No React in
 * here: RoomPlanner.tsx owns the DOM around the canvas and calls into the handle below.
 * The look (scene colours, materials, camera, easing) is the prototype's. The rules live
 * in lib/fit.ts and the rooms in content/rooms.ts.
 */
export interface PlannerState {
  side: Side;
  u: number;
  dragging: boolean;
}

export interface PlannerOptions {
  canvas: HTMLCanvasElement;
  stage: HTMLElement;
  tagTop: HTMLElement;
  tagZone: HTMLElement;
  room: string;
  model: ModelKey;
  reduceMotion: boolean;
  /** Coarse pointer (phones): lighter shadow map. */
  coarse: boolean;
  onState: (s: PlannerState) => void;
  /** First drag, nudge or wall change: the "Drag the board" hint can go. */
  onInteract: () => void;
}

export interface Planner {
  setRoom(key: string): void;
  setModel(key: ModelKey): void;
  setPerson(visible: boolean): void;
  resetCamera(): void;
  nudge(dir: 1 | -1): void;
  nextWall(): void;
  /** Run the render loop (visible on screen). */
  start(): void;
  /** Pause the render loop (off screen or hidden tab). */
  stop(): void;
  dispose(): void;
}

const Y = new Vector3(0, 1, 0);
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
/* r155+ lights are physical; the prototype's r149 intensities were legacy units (x pi). */
const LEGACY = Math.PI;

/* ---------------------------------------------------------------- textures ---- */
type Draw = (g: CanvasRenderingContext2D, w: number, h: number) => void;
function rand(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}
function canvasTex(w: number, h: number, draw: Draw): Texture {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!, w, h);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.wrapS = t.wrapT = RepeatWrapping;
  t.anisotropy = 4;
  return t;
}
function planks(colors: string[], gap: string, n: number, seed: number, vertical: boolean, grain: boolean): Draw {
  return (g, w, h) => {
    const r = rand(seed);
    const s = (vertical ? w : h) / n;
    for (let i = 0; i < n; i++) {
      g.fillStyle = colors[Math.floor(r() * colors.length)];
      if (vertical) g.fillRect(i * s, 0, s, h);
      else g.fillRect(0, i * s, w, s);
      if (grain) {
        g.globalAlpha = 0.07;
        for (let k = 0; k < 7; k++) {
          g.fillStyle = r() > 0.5 ? "#000" : "#fff";
          if (vertical) g.fillRect(i * s + r() * s, 0, 1, h);
          else g.fillRect(0, i * s + r() * s, w, 1);
        }
        g.globalAlpha = 1;
        if (!vertical) {
          g.fillStyle = gap;
          g.fillRect(r() * w, i * s, 2, s);
        }
      }
      g.fillStyle = gap;
      if (vertical) g.fillRect(i * s, 0, 2, h);
      else g.fillRect(0, i * s, w, 2);
    }
  };
}
function speckle(base: string, dots: string[], seed: number): Draw {
  return (g, w, h) => {
    g.fillStyle = base;
    g.fillRect(0, 0, w, h);
    const r = rand(seed);
    for (let i = 0; i < (w * h) / 60; i++) {
      g.globalAlpha = 0.04 + r() * 0.06;
      g.fillStyle = dots[Math.floor(r() * dots.length)];
      const z = 1 + r() * 2;
      g.fillRect(r() * w, r() * h, z, z);
    }
    g.globalAlpha = 1;
  };
}
const tex = {
  oak(W: number, D: number) {
    const t = canvasTex(512, 512, planks(["#CDB293", "#C6AA88", "#D1B899", "#C1A480"], "#AE9272", 16, 11, false, true));
    t.repeat.set(W / 96, D / 96);
    return t;
  },
  concrete(W: number, D: number) {
    const t = canvasTex(512, 512, (g, w, h) => {
      speckle("#CECAC2", ["#8f8a82", "#ffffff", "#aaa59c"], 7)(g, w, h);
      g.fillStyle = "rgba(110,104,94,.35)";
      g.fillRect(0, 0, w, 2);
      g.fillRect(0, 0, 2, h);
    });
    t.repeat.set(W / 120, D / 120);
    return t;
  },
  deck(W: number, D: number) {
    const t = canvasTex(512, 512, planks(["#AC8866", "#A3805E", "#B38F6D", "#9E7B59"], "#5F4A36", 14, 5, false, true));
    t.repeat.set(W / 84, D / 84);
    return t;
  },
  vinyl(W: number, D: number) {
    const t = canvasTex(512, 512, planks(["#DBD8D1", "#D7D4CC", "#DEDBD4"], "#C7C3BA", 10, 9, false, true));
    t.repeat.set(W / 120, D / 120);
    return t;
  },
  plaster(c: string, L: number, H: number) {
    const t = canvasTex(256, 256, speckle(c, ["#ffffff", "#cfc8bb"], 3));
    t.repeat.set(L / 64, H / 64);
    return t;
  },
  siding(L: number, H: number) {
    const t = canvasTex(512, 512, planks(["#E8E2D7", "#E5DFD3"], "#C4BBAB", 16, 4, false, false));
    t.repeat.set(L / 96, H / 96);
    return t;
  },
  fence(L: number) {
    const t = canvasTex(512, 512, planks(["#B39372", "#AB8A66", "#B8997A", "#A68562"], "#6D5642", 12, 8, true, true));
    t.repeat.set(L / 72, 1);
    return t;
  },
};

/* ------------------------------------------------------------- materials ---- */
function std(color: string, rough = 0.85, extra: MeshStandardMaterialParameters = {}) {
  return new MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra });
}
function toMat(m: Material, cache: Map<Material, MeshStandardMaterial>) {
  let out = cache.get(m);
  if (!out) {
    out = new MeshStandardMaterial({
      color: m.color,
      roughness: m.rough ?? 0.85,
      metalness: m.metal ?? 0,
      ...(m.emissive ? { emissive: new Color(m.emissive), emissiveIntensity: m.emissiveIntensity ?? 1 } : {}),
      ...(m.doubleSide ? { side: DoubleSide } : {}),
    });
    cache.set(m, out);
  }
  return out;
}

/* ------------------------------------------------------ geometry helpers ---- */
type Mat = MeshStandardMaterial | MeshBasicMaterial;
function shadowed<T extends Mesh>(m: T, cast = true, receive = true) {
  m.castShadow = cast;
  m.receiveShadow = receive;
  return m;
}
function box(g: Object3D, w: number, h: number, d: number, x: number, y: number, z: number, mat: Mat) {
  const m = shadowed(new Mesh(new BoxGeometry(w, h, d), mat));
  m.position.set(x, y + h / 2, z);
  g.add(m);
  return m;
}
function boxR(g: Object3D, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, mat: Mat) {
  return box(g, x1 - x0, y1 - y0, z1 - z0, (x0 + x1) / 2, y0, (z0 + z1) / 2, mat);
}
function cyl(g: Object3D, r: number, h: number, x: number, y: number, z: number, mat: Mat, seg = 20) {
  const m = shadowed(new Mesh(new CylinderGeometry(r, r, h, seg), mat));
  m.position.set(x, y + h / 2, z);
  g.add(m);
  return m;
}
function rod(g: Object3D, a: Vector3, b: Vector3, r: number, mat: Mat) {
  const dir = b.clone().sub(a);
  const len = dir.length();
  const m = new Mesh(new CylinderGeometry(r, r, len, 14), mat);
  m.position.copy(a).addScaledVector(dir, 0.5);
  m.quaternion.setFromUnitVectors(Y, dir.normalize());
  m.castShadow = true;
  g.add(m);
  return m;
}
function sphere(g: Object3D, r: number, x: number, y: number, z: number, mat: Mat) {
  const m = shadowed(new Mesh(new SphereGeometry(r, 20, 14), mat));
  m.position.set(x, y, z);
  g.add(m);
  return m;
}

interface BuildCtx {
  def: RoomDef;
  g: Group;
  mats: Map<Material, MeshStandardMaterial>;
}
function onWall(c: BuildCtx, side: Side, a: number, b: number) {
  const f = wallFrame(c.def, side, (a + b) / 2);
  const grp = new Group();
  grp.position.set(f.p.x, f.p.y, f.p.z);
  grp.rotation.y = f.rot;
  c.g.add(grp);
  return grp;
}
function windowOn(c: BuildCtx, side: Side, a: number, b: number, y0: number, y1: number) {
  const g = onWall(c, side, a, b);
  const w = b - a;
  const h = y1 - y0;
  const frameM = std("#F7F6F2", 0.6);
  const glass = std("#CFE0E4", 0.2, { emissive: new Color("#EAF5F7"), emissiveIntensity: 0.55 });
  const gl = new Mesh(new PlaneGeometry(w - 3, h - 3), glass);
  gl.position.set(0, y0 + h / 2, 0.15);
  g.add(gl);
  box(g, w, 2, 1.6, 0, y1 - 2, 0.8, frameM);
  box(g, w, 2, 1.6, 0, y0, 0.8, frameM);
  box(g, 2, h, 1.6, -w / 2 + 1, y0, 0.8, frameM);
  box(g, 2, h, 1.6, w / 2 - 1, y0, 0.8, frameM);
  box(g, 1.4, h, 1.2, 0, y0, 0.6, frameM);
  box(g, w + 4, 1.2, 3.2, 0, y0 - 1.2, 1.6, frameM);
}
function doorOn(c: BuildCtx, side: Side, a: number, b: number) {
  const g = onWall(c, side, a, b);
  const w = b - a;
  const trim = std("#F7F6F2", 0.6);
  box(g, w - 4, 79, 1.4, 0, 0, 0.7, std("#F2EFE8", 0.55));
  box(g, w - 12, 30, 0.4, 0, 8, 1.5, std("#EAE6DE", 0.6));
  box(g, w - 12, 30, 0.4, 0, 44, 1.5, std("#EAE6DE", 0.6));
  box(g, 2, 81, 1.8, -w / 2 + 1, 0, 0.9, trim);
  box(g, 2, 81, 1.8, w / 2 - 1, 0, 0.9, trim);
  box(g, w, 2, 1.8, 0, 80, 0.9, trim);
  sphere(g, 1.1, w / 2 - 6, 38, 2.2, std("#B8A477", 0.3, { metalness: 0.7 }));
}
function plant(c: BuildCtx, x: number, z: number, r: number) {
  cyl(c.g, r, r * 1.6, x, 0, z, std("#C8BFB0", 0.8));
  const leaf = std("#7F9B78", 0.9);
  for (let i = 0; i < 5; i++) sphere(c.g, r * (0.85 + (i % 2) * 0.3), x + Math.cos(i * 1.3) * r * 0.55, r * 2.3 + i * r * 0.45, z + Math.sin(i * 1.3) * r * 0.55, leaf);
}
function addWallPiece(g: Group, p: WallPiece, c: BuildCtx) {
  const mat = toMat(p.mat, c.mats);
  if (p.kind === "box") box(g, p.w, p.h, p.d, p.at[0], p.at[1], p.at[2], mat);
  else {
    const m = new Mesh(new PlaneGeometry(p.w, p.h), mat);
    m.position.set(...p.at);
    g.add(m);
  }
}
function addPiece(c: BuildCtx, p: Piece) {
  const g = c.g;
  switch (p.kind) {
    case "box":
      boxR(g, p.x[0], p.x[1], p.y[0], p.y[1], p.z[0], p.z[1], toMat(p.mat, c.mats));
      return;
    case "cyl": {
      const m = shadowed(new Mesh(new CylinderGeometry(p.rTop ?? p.r, p.r, p.h, p.seg ?? 20, 1, p.openEnded ?? false), toMat(p.mat, c.mats)));
      m.position.set(p.at[0], p.at[1] + p.h / 2, p.at[2]);
      if (p.rot) m.rotation.set(...p.rot);
      g.add(m);
      return;
    }
    case "sphere":
      sphere(g, p.r, p.at[0], p.at[1], p.at[2], toMat(p.mat, c.mats));
      return;
    case "rod":
      rod(g, new Vector3(...p.a), new Vector3(...p.b), p.r, toMat(p.mat, c.mats));
      return;
    case "plane": {
      const m = new Mesh(new PlaneGeometry(p.w, p.h), toMat(p.mat, c.mats));
      if (p.rot) m.rotation.set(...p.rot);
      m.position.set(...p.at);
      m.receiveShadow = true;
      g.add(m);
      return;
    }
    case "tiltedBox": {
      const m = new Mesh(new BoxGeometry(p.w, p.h, p.d), toMat(p.mat, c.mats));
      m.position.set(...p.at);
      m.rotation.x = p.rotX;
      m.castShadow = true;
      g.add(m);
      return;
    }
    case "window":
      windowOn(c, p.side, p.a, p.b, p.y0, p.y1);
      return;
    case "door":
      doorOn(c, p.side, p.a, p.b);
      return;
    case "plant":
      plant(c, p.x, p.z, p.r);
      return;
    case "onWall": {
      const grp = onWall(c, p.side, p.a, p.b);
      for (const wp of p.pieces) addWallPiece(grp, wp, c);
      return;
    }
  }
}

function disposeGroup(g: Object3D) {
  const mats = new Set<Mat>();
  g.traverse((o) => {
    const m = o as Mesh;
    if (m.geometry) (m.geometry as BufferGeometry).dispose();
    if (m.material) (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => mats.add(x as Mat));
  });
  for (const m of mats) {
    const map = (m as MeshStandardMaterial).map;
    if (map) map.dispose();
    m.dispose();
  }
}

/* ------------------------------------------------------------ the board ---- */
const ANCHORS = board.anchorPointsPerSection; // 47 = 19 staggered rows of 2, 3, 2, 3 ...
const ROWS = 19;
function sectionGeometry() {
  const w = BOARD_W - 1;
  const h = SECTION_H - 0.3;
  const r = 1.2;
  const s = new Shape();
  s.moveTo(-w / 2 + r, -h / 2);
  s.lineTo(w / 2 - r, -h / 2);
  s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  s.lineTo(w / 2, h / 2 - r);
  s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  s.lineTo(-w / 2 + r, h / 2);
  s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  s.lineTo(-w / 2, -h / 2 + r);
  s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  let holes = 0;
  for (let i = 0; i < ROWS; i++) {
    const y = -11.25 + i * 1.25;
    const xs = i % 2 === 0 ? [-1.05, 1.05] : [-2.1, 0, 2.1];
    for (const x of xs) {
      const p = new Path();
      for (let k = 0; k < 6; k++) {
        const a = Math.PI / 2 + (k * Math.PI) / 3;
        const px = x + 0.7 * Math.cos(a);
        const py = y + 0.7 * Math.sin(a);
        if (k) p.lineTo(px, py);
        else p.moveTo(px, py);
      }
      p.closePath();
      s.holes.push(p);
      holes++;
    }
  }
  if (holes !== ANCHORS && process.env.NODE_ENV !== "production") console.warn(`[fit] section drawn with ${holes} anchor points, facts say ${ANCHORS}`);
  const geo = new ExtrudeGeometry(s, { depth: 0.9, bevelEnabled: true, bevelThickness: 0.14, bevelSize: 0.1, bevelSegments: 2, curveSegments: 6 });
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    pos.setZ(i, pos.getZ(i) + 0.7 * Math.max(0, 1 - (x / 3.6) ** 2));
  }
  geo.computeVertexNormals();
  return geo;
}

/* clear floor zone texture: hex grid inside a dashed rounded square */
function zoneTexture() {
  const t = canvasTex(512, 512, (g, w, h) => {
    const pad = 10;
    const r = 42;
    const rr = () => {
      g.beginPath();
      g.moveTo(pad + r, pad);
      g.arcTo(w - pad, pad, w - pad, h - pad, r);
      g.arcTo(w - pad, h - pad, pad, h - pad, r);
      g.arcTo(pad, h - pad, pad, pad, r);
      g.arcTo(pad, pad, w - pad, pad, r);
      g.closePath();
    };
    rr();
    g.fillStyle = "rgba(255,255,255,0.34)";
    g.fill();
    g.save();
    rr();
    g.clip();
    g.strokeStyle = "rgba(255,255,255,0.5)";
    g.lineWidth = 2;
    const R = 30;
    const dx = Math.sqrt(3) * R;
    const dy = 1.5 * R;
    for (let row = -1; row * dy < h + R; row++)
      for (let col = -1; col * dx < w + dx; col++) {
        const cx = col * dx + (row % 2 ? dx / 2 : 0);
        const cy = row * dy;
        g.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = Math.PI / 2 + (i * Math.PI) / 3;
          const px = cx + R * 0.86 * Math.cos(a);
          const py = cy + R * 0.86 * Math.sin(a);
          if (i) g.lineTo(px, py);
          else g.moveTo(px, py);
        }
        g.closePath();
        g.stroke();
      }
    g.restore();
    rr();
    g.setLineDash([22, 14]);
    g.lineWidth = 7;
    g.strokeStyle = "#ffffff";
    g.stroke();
  });
  t.wrapS = t.wrapT = ClampToEdgeWrapping;
  return t;
}

/* a person holding both rails; drawn at 68 in and scaled to the configured height */
function buildPerson() {
  const g = new Group();
  const mat = std("#A9B6B0", 0.9);
  const Z = 22;
  const capsule = (a: [number, number, number], b: [number, number, number], r: number) => {
    const A = new Vector3(...a);
    const B = new Vector3(...b);
    const dir = B.clone().sub(A);
    const len = dir.length();
    const m = new Mesh(new CapsuleGeometry(r, len, 6, 14), mat);
    m.position.copy(A).addScaledVector(dir, 0.5);
    m.quaternion.setFromUnitVectors(Y, dir.normalize());
    m.castShadow = true;
    g.add(m);
  };
  capsule([-3.6, 4, Z + 1], [-3.8, 33, Z], 2.9);
  capsule([3.6, 4, Z + 1], [3.8, 33, Z], 2.9);
  boxR(g, -5.4, -1.8, 0, 2.2, Z - 6, Z + 3, mat);
  boxR(g, 1.8, 5.4, 0, 2.2, Z - 6, Z + 3, mat);
  capsule([0, 37.5, Z], [0, 52, Z + 0.5], 6.6);
  capsule([0, 58, Z], [0, 60, Z], 2.2);
  sphere(g, 4.4, 0, 63.4, Z - 0.5, mat);
  capsule([-7.6, 54, Z], [-3.6, 50, 4.4], 2.1);
  capsule([7.6, 54, Z], [3.6, 50, 4.4], 2.1);
  const k = fitPlanner.personHeightIn / 68;
  g.scale.set(k, k, k);
  return g;
}

/* ================================================================ planner ==== */
export function createPlanner(o: PlannerOptions): Planner | null {
  const { canvas, stage } = o;
  ColorManagement.enabled = true;
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  } catch {
    return null;
  }
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.98;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const reduce = o.reduceMotion;
  const scene = new Scene();
  scene.background = new Color("#E8E5DE");
  const camera = new PerspectiveCamera(38, 1, 1, 6000);

  const hemi = new HemisphereLight(0xffffff, 0xd8d1c3, 0.85 * LEGACY);
  scene.add(hemi);
  const sun = new DirectionalLight(0xfff3e2, 1.15 * LEGACY);
  sun.castShadow = true;
  const shadowSize = o.coarse ? 1024 : 2048;
  sun.shadow.mapSize.set(shadowSize, shadowSize);
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.6;
  scene.add(sun);
  scene.add(sun.target);
  const fill = new DirectionalLight(0xe6f3ef, 0.3 * LEGACY);
  fill.position.set(220, 140, 320);
  scene.add(fill);

  /* ---- room ---- */
  interface Room {
    def: RoomDef;
    g: Group;
    walls: Record<Side, Mesh>;
    studs: Partial<Record<Side, { g: Group; mat: MeshBasicMaterial }>>;
  }
  let room: Room | null = null;

  function buildRoom(key: string) {
    if (room) {
      scene.remove(room.g);
      disposeGroup(room.g);
    }
    const def = roomByKey(key);
    if (!def) throw new Error(`[fit] unknown room ${key}`);
    const g = new Group();
    const c: BuildCtx = { def, g, mats: new Map() };

    const floorTex = tex[def.floor](def.W, def.D);
    const floor = new Mesh(new PlaneGeometry(def.W, def.D), std("#ffffff", 0.85, { map: floorTex }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    g.add(floor);
    const slab = new Mesh(new BoxGeometry(def.W + 2, 6, def.D + 2), std("#D1CCC2", 0.9));
    slab.position.set(0, -3.02, 0);
    g.add(slab);

    const walls = {} as Record<Side, Mesh>;
    (["back", "left", "right"] as Side[]).forEach((side) => {
      const L = side === "back" ? def.W : def.D;
      const H = def.wallH[side];
      const map = def.wall.kind === "plaster" ? tex.plaster(def.wall.color, L, H) : side === "back" ? tex.siding(L, H) : tex.fence(L);
      const m = new Mesh(new PlaneGeometry(L, H), std("#ffffff", def.wall.kind === "plaster" ? 0.95 : 0.9, { map }));
      m.receiveShadow = true;
      m.userData.side = side;
      const f = wallFrame(def, side, 0);
      m.position.set(f.p.x, H / 2, f.p.z);
      m.rotation.y = f.rot;
      g.add(m);
      walls[side] = m;
    });

    for (const p of def.pieces) addPiece(c, p);

    const studs: Room["studs"] = {};
    if (SNAPS_TO_STUDS)
      (["back", "left", "right"] as Side[]).forEach((side) => {
        const sg = new Group();
        const H = def.wallH[side];
        const mat = new MeshBasicMaterial({ color: "#2D6A60", transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
        for (const u of positionsFor(def, side)) {
          const f = wallFrame(def, side, u);
          const s = new Mesh(new PlaneGeometry(0.9, H), mat);
          s.position.set(f.p.x + f.n.x * 0.3, H / 2, f.p.z + f.n.z * 0.3);
          s.rotation.y = f.rot;
          sg.add(s);
        }
        sg.visible = false;
        g.add(sg);
        studs[side] = { g: sg, mat };
      });

    scene.add(g);
    room = { def, g, walls, studs };

    const span = Math.max(def.W, def.D);
    sun.intensity = def.light[0] * LEGACY;
    hemi.intensity = def.light[1] * LEGACY;
    sun.position.set(-def.W * 0.55, span * 1.25, def.D * 0.95);
    sun.target.position.set(0, 0, 0);
    const sc = sun.shadow.camera;
    sc.left = -span * 0.85;
    sc.right = span * 0.85;
    sc.top = span * 0.85;
    sc.bottom = -span * 0.85;
    sc.near = 1;
    sc.far = span * 4;
    sc.updateProjectionMatrix();
  }

  /* ---- board ---- */
  let modelKey: ModelKey = o.model;
  const model = () => MODELS[modelKey];
  const platformMat = std("#62BBA6", 0.45, { emissive: new Color("#9FE3D0"), emissiveIntensity: 0 });
  const backerMat = std("#2B4F4A", 0.7);
  const screwMat = std("#1D2B29", 0.35, { metalness: 0.6 });
  const SECTION_GEO = sectionGeometry();
  const BACKER_GEO = new BoxGeometry(BOARD_W, SECTION_H - 0.2, 1.0);
  const RAIL_GEO = new CapsuleGeometry(0.55, SECTION_H - 1.6, 6, 14);
  const SCREW_GEO = new CylinderGeometry(0.26, 0.26, 0.14, 14);
  const hitMat = new MeshBasicMaterial();
  let hitGeo: BoxGeometry | null = null;

  const rig = new Group();
  scene.add(rig);
  const boardGroup = new Group();
  rig.add(boardGroup);

  function buildBoard() {
    while (boardGroup.children.length) boardGroup.remove(boardGroup.children[0]);
    hitGeo?.dispose();
    const m = model();
    for (let i = 0; i < m.sections; i++) {
      const s = new Group();
      s.position.y = BOTTOM + SECTION_H / 2 + i * SECTION_H;
      const back = new Mesh(BACKER_GEO, backerMat);
      back.position.z = 0.5;
      const plat = new Mesh(SECTION_GEO, platformMat);
      plat.position.z = 1.14;
      const parts: Mesh[] = [back, plat];
      for (const x of [-3.42, 3.42]) {
        const rl = new Mesh(RAIL_GEO, platformMat);
        rl.position.set(x, 0, 1.75);
        parts.push(rl);
      }
      for (const y of [-11.25, 11.25]) {
        const sc = new Mesh(SCREW_GEO, screwMat);
        sc.rotation.x = Math.PI / 2;
        sc.position.set(0, y, 2.86);
        parts.push(sc);
      }
      for (const p of parts) s.add(shadowed(p));
      boardGroup.add(s);
    }
    hitGeo = new BoxGeometry(18, m.h + 8, 12);
    const hit = new Mesh(hitGeo, hitMat);
    hit.position.set(0, BOTTOM + m.h / 2, 6);
    hit.visible = false;
    boardGroup.add(hit);
  }

  const zoneMat = new MeshBasicMaterial({ map: zoneTexture(), color: "#3E9C88", transparent: true, depthWrite: false, toneMapped: false });
  const zone = new Mesh(new PlaneGeometry(ZONE, ZONE), zoneMat);
  zone.rotation.x = -Math.PI / 2;
  zone.position.set(0, 0.4, ZONE / 2);
  zone.renderOrder = 2;
  rig.add(zone);

  const person = buildPerson();
  rig.add(person);

  /* ---- placement ---- */
  const place: { side: Side; u: number } = { side: "left", u: 0 };
  let lastValid = { ...place };
  const rigTarget = { pos: new Vector3(), quat: new Quaternion() };
  function setRigTarget(snapNow = false) {
    if (!room) return;
    const f = wallFrame(room.def, place.side, place.u);
    rigTarget.pos.set(f.p.x, f.p.y, f.p.z);
    rigTarget.quat.setFromAxisAngle(Y, f.rot);
    if (snapNow) {
      rig.position.copy(rigTarget.pos);
      rig.quaternion.copy(rigTarget.quat);
    }
  }

  let dragging = false;
  let liftGoal = 0;
  let glowGoal = 0;
  const current = () => evaluate(room!.def, model(), place.side, place.u);

  function refresh() {
    if (!room) return;
    const e = current();
    zoneMat.color.set(e.zoneOK ? "#3E9C88" : "#C9503C");
    if (dragging) {
      platformMat.emissive.set(e.wallOK ? "#9FE3D0" : "#E0513F");
      glowGoal = e.wallOK ? 0.22 : 0.45;
    } else if (!e.wallOK || !e.heightOK) {
      platformMat.emissive.set("#E0513F");
      glowGoal = 0.32;
    } else glowGoal = 0;
    o.tagTop.classList.toggle("fit-tag--bad", !e.heightOK);
    o.tagZone.classList.toggle("fit-tag--bad", !e.zoneOK);
    o.onState({ side: place.side, u: place.u, dragging });
  }

  /* ---- camera ---- */
  const cam = { yaw: 0.3, pitch: 0.34, radius: 300, target: new Vector3(0, 40, 0) };
  const camGoal = { yaw: 0.3, pitch: 0.34, radius: 300, target: new Vector3(0, 40, 0) };
  let baseRadius = 300;
  function computeBase() {
    const d = room!.def;
    const a = camera.aspect || 1.5;
    return (Math.max(d.W, d.D * 0.9) * 1.02 + 50) * Math.max(1, 1.35 / a);
  }
  function resetCamera(snapNow = false) {
    if (!room) return;
    baseRadius = computeBase();
    camGoal.yaw = room.def.yaw;
    camGoal.pitch = 0.34;
    camGoal.radius = baseRadius;
    camGoal.target.set(0, 40, -room.def.D * 0.08);
    if (snapNow) {
      cam.yaw = camGoal.yaw;
      cam.pitch = camGoal.pitch;
      cam.radius = camGoal.radius;
      cam.target.copy(camGoal.target);
    }
  }
  const clampR = (r: number) => clamp(r, baseRadius * 0.5, baseRadius * 1.4);

  function resize() {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (room) {
      const old = baseRadius;
      baseRadius = computeBase();
      camGoal.radius = clampR((camGoal.radius * baseRadius) / old);
    }
    if (!running) renderOnce();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(stage);

  /* ---- interaction ---- */
  const raycaster = new Raycaster();
  const ndc = new Vector2();
  function setRay(e: { clientX: number; clientY: number }) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
  }
  const overBoard = () => raycaster.intersectObject(boardGroup, true).length > 0;

  function dragTo() {
    if (!room) return;
    const hits = raycaster.intersectObjects(Object.values(room.walls), false);
    if (!hits.length) return;
    const h = hits[0];
    const side = h.object.userData.side as Side;
    const u = side === "back" ? h.point.x : h.point.z;
    const best = snap(room.def, side, u);
    if (best === null) return;
    if (side !== place.side || best !== place.u) {
      place.side = side;
      place.u = best;
      setRigTarget();
      refresh();
    }
  }
  function endDrag() {
    if (!dragging || !room) return;
    dragging = false;
    liftGoal = 0;
    canvas.style.cursor = "default";
    if (!current().wallOK) {
      const n = nearestValid(room.def, place.side, place.u);
      if (n !== null) place.u = n;
      else {
        place.side = lastValid.side;
        place.u = lastValid.u;
      }
      setRigTarget();
    }
    lastValid = { ...place };
    o.onInteract();
    refresh();
  }

  const pointers = new Map<number, { x: number; y: number }>();
  let mode: "drag" | "orbit" | "pinch" | null = null;
  let orbitStart = { x: 0, y: 0, yaw: 0, pitch: 0 };
  let pinchStart = { d: 1, r: 300 };
  const onDown = (e: PointerEvent) => {
    canvas.focus({ preventScroll: true });
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {}
    if (pointers.size === 2) {
      endDrag();
      mode = "pinch";
      const [a, b] = [...pointers.values()];
      pinchStart = { d: Math.hypot(a.x - b.x, a.y - b.y), r: camGoal.radius };
      return;
    }
    setRay(e);
    if (overBoard()) {
      mode = "drag";
      dragging = true;
      liftGoal = 2.5;
      canvas.style.cursor = "grabbing";
      refresh();
    } else {
      mode = "orbit";
      orbitStart = { x: e.clientX, y: e.clientY, yaw: camGoal.yaw, pitch: camGoal.pitch };
    }
  };
  const onMove = (e: PointerEvent) => {
    if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (mode === "drag") {
      setRay(e);
      dragTo();
    } else if (mode === "orbit") {
      camGoal.yaw = clamp(orbitStart.yaw - (e.clientX - orbitStart.x) * 0.005, -0.95, 0.95);
      camGoal.pitch = clamp(orbitStart.pitch + (e.clientY - orbitStart.y) * 0.004, 0.06, 0.95);
    } else if (mode === "pinch" && pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      camGoal.radius = clampR((pinchStart.r * pinchStart.d) / Math.max(Math.hypot(a.x - b.x, a.y - b.y), 1));
    } else if (!mode && e.pointerType === "mouse") {
      setRay(e);
      canvas.style.cursor = overBoard() ? "grab" : "default";
    }
  };
  const onUp = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    if (mode === "drag") endDrag();
    if (!pointers.size || mode === "pinch") mode = null;
  };
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    camGoal.radius = clampR(camGoal.radius * (1 + e.deltaY * 0.0012));
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      nudge(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      nudge(1);
    } else if (e.key === "n" || e.key === "N") {
      e.preventDefault();
      nextWall();
    }
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
  canvas.addEventListener("wheel", onWheel, { passive: false });
  canvas.addEventListener("keydown", onKey);

  function nudge(dir: 1 | -1) {
    if (!room) return;
    const next = nudgeOf(room.def, place.side, place.u, dir);
    if (next === null) return;
    place.u = next;
    lastValid = { ...place };
    setRigTarget();
    o.onInteract();
    refresh();
  }
  function nextWall() {
    if (!room) return;
    const n = nextWallOf(room.def, model(), place.side);
    if (n) {
      place.side = n.side;
      place.u = n.u;
    }
    lastValid = { ...place };
    setRigTarget();
    o.onInteract();
    refresh();
  }
  function selectRoom(key: string) {
    buildRoom(key);
    const def = room!.def;
    place.side = def.start.side;
    place.u = def.start.u;
    lastValid = { ...place };
    boardGroup.position.z = 0;
    setRigTarget(true);
    resetCamera(!running);
    refresh();
  }

  /* ---- loop ---- */
  const vTmp = new Vector3();
  function placeTag(el: HTMLElement, local: Vector3, lift: string) {
    vTmp.copy(local);
    rig.localToWorld(vTmp);
    vTmp.project(camera);
    if (vTmp.z > 1 || Math.abs(vTmp.x) > 1.1 || Math.abs(vTmp.y) > 1.1) {
      el.hidden = true;
      return;
    }
    el.hidden = false;
    const x = ((vTmp.x + 1) / 2) * stage.clientWidth;
    const y = ((1 - vTmp.y) / 2) * stage.clientHeight;
    el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,${lift})`;
  }
  const zoneLocal = new Vector3(0, 0, ZONE + 1);
  const topLocal = new Vector3(0, 0, 3);
  let last = 0;
  let running = false;
  let raf = 0;

  function step(dt: number) {
    if (!room) return;
    const k = reduce ? 1 : 1 - Math.exp(-dt * 12);
    const kc = reduce ? 1 : 1 - Math.exp(-dt * 6);
    cam.yaw += (camGoal.yaw - cam.yaw) * kc;
    cam.pitch += (camGoal.pitch - cam.pitch) * kc;
    cam.radius += (camGoal.radius - cam.radius) * kc;
    cam.target.lerp(camGoal.target, kc);
    const cp = Math.cos(cam.pitch);
    camera.position.set(cam.target.x + Math.sin(cam.yaw) * cp * cam.radius, cam.target.y + Math.sin(cam.pitch) * cam.radius, cam.target.z + Math.cos(cam.yaw) * cp * cam.radius);
    camera.lookAt(cam.target);
    rig.position.lerp(rigTarget.pos, k);
    rig.quaternion.slerp(rigTarget.quat, k);
    boardGroup.position.z += (liftGoal - boardGroup.position.z) * k;
    platformMat.emissiveIntensity += (glowGoal - platformMat.emissiveIntensity) * k;
    for (const s of Object.keys(room.studs) as Side[]) {
      const st = room.studs[s]!;
      const goal = dragging && s === place.side ? 0.3 : 0;
      st.mat.opacity += (goal - st.mat.opacity) * k;
      st.g.visible = st.mat.opacity > 0.01;
    }
    renderer.render(scene, camera);
    topLocal.y = BOTTOM + model().h + 1;
    placeTag(o.tagTop, topLocal, "-130%");
    placeTag(o.tagZone, zoneLocal, "10%");
  }
  function tick(now: number) {
    if (!running) return;
    raf = requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    step(dt);
  }
  function renderOnce() {
    step(1); // k = 1: land on the goals, then draw one frame
  }

  /* ---- boot ---- */
  buildBoard();
  resize();
  selectRoom(o.room);
  resetCamera(true);
  renderOnce();

  return {
    setRoom: (key) => {
      if (room?.def.key !== key) selectRoom(key);
    },
    setModel: (key) => {
      if (key === modelKey) return;
      modelKey = key;
      buildBoard();
      refresh();
      if (!running) renderOnce();
    },
    setPerson: (v) => {
      person.visible = v;
      if (!running) renderOnce();
    },
    resetCamera: () => {
      resetCamera(reduce || !running);
      if (!running) renderOnce();
    },
    nudge,
    nextWall,
    start: () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    },
    stop: () => {
      running = false;
      cancelAnimationFrame(raf);
    },
    dispose: () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("keydown", onKey);
      if (room) {
        scene.remove(room.g);
        disposeGroup(room.g);
        room = null;
      }
      disposeGroup(rig);
      [SECTION_GEO, BACKER_GEO, RAIL_GEO, SCREW_GEO].forEach((g) => g.dispose());
      hitGeo?.dispose();
      [platformMat, backerMat, screwMat, hitMat].forEach((m) => m.dispose());
      zoneMat.map?.dispose();
      zoneMat.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}

/** A room's start spot, for the poster and the status panel before the scene mounts. */
export function startSpot(def: RoomDef, model: ModelKey): { side: Side; u: number } {
  const s = def.start;
  if (inBounds(def, s.side, s.u)) return s;
  return { side: s.side, u: bestSpot(def, MODELS[model], s.side) ?? s.u };
}
