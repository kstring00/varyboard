/**
 * Shared math for the scroll-build hero: the placeholder mannequin rig and its poses, the
 * scroll timeline, and the board drawing's geometry. Pure functions, used by the server markup
 * (initial state) and the client choreography (every frame), so both draw the same thing.
 * Ported from reference/varyboard-scroll-build.html.
 */

/* --------------------------------------------------------------------- easing ---- */
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a), 0, 1);
export const ease = (t: number) => 1 - Math.pow(1 - t, 3);
export const smooth = (t: number) => t * t * (3 - 2 * t);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Pointy-top hexagon points around (cx, cy). */
export const hexPts = (cx: number, cy: number, r: number, digits = 2) => {
  let s = "";
  for (let i = 0; i < 6; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / 3;
    s += (cx + r * Math.cos(a)).toFixed(digits) + "," + (cy + r * Math.sin(a)).toFixed(digits) + " ";
  }
  return s.trim();
};

/* ------------------------------------------ mannequin rig (front view, inches, y up) ---- */
export type Pt = [number, number];
export type Joint = "head" | "neck" | "sa" | "sb" | "ea" | "eb" | "ha" | "hb" | "pa" | "pb" | "ka" | "kb" | "fa" | "fb" | "ta" | "tb";
export type Pose = Record<Joint, Pt>;

const STAND: Pose = {
  head: [0, 63.6], neck: [0, 57.8], sa: [-7.4, 55.4], sb: [7.4, 55.4], ea: [-8.6, 44.2], eb: [8.6, 44.2], ha: [-9.2, 33], hb: [9.2, 33],
  pa: [-4.2, 35.5], pb: [4.2, 35.5], ka: [-4.1, 19], kb: [4.1, 19], fa: [-4, 3], fb: [4, 3], ta: [-5.2, 0.6], tb: [5.2, 0.6],
};
export const POSES = {
  STAND,
  STRETCH: { ...STAND, head: [-6.8, 61.8], neck: [-4.6, 56.6], sa: [-11.2, 52.6], sb: [2.8, 57.8], ea: [-12.8, 41.8], ha: [-12.4, 30.5], eb: [-3.2, 68.2], hb: [-14.2, 73.5], pa: [-3.6, 35.4], pb: [4.6, 35.8], ka: [-4.3, 19], kb: [4.3, 19] },
  PULL_START: { ...STAND, head: [-0.8, 63.6], ea: [-11.4, 65.8], ha: [-13.8, 74.5], eb: [11.5, 45], hb: [6.5, 38] },
  PULL_END: { ...STAND, head: [0.4, 63.5], ea: [-12.2, 47.5], ha: [-11.8, 57.8], eb: [11.5, 45], hb: [6.5, 38] },
  SIT: {
    head: [0, 47.8], neck: [0, 42], sa: [-7.4, 39.8], sb: [7.4, 39.8], ea: [-12.6, 37.8], ha: [-13.6, 32.5], eb: [10.8, 31.5], hb: [7.2, 24.5],
    pa: [-4.4, 21], pb: [4.4, 21], ka: [-5.6, 18.8], kb: [5.6, 18.8], fa: [-5.2, 3], fb: [5.2, 3], ta: [-6.2, 0.6], tb: [6.2, 0.6],
  },
  STAND_RAIL: { ...STAND, ea: [-10.8, 44], ha: [-13.6, 32.5] },
  BALANCE: {
    head: [-1.2, 63.6], neck: [-1.2, 57.8], sa: [-8.6, 55.4], sb: [6.2, 55.6], ea: [-12, 47], ha: [-13.6, 42], eb: [12.2, 48.5], hb: [16.8, 43.5],
    pa: [-5, 35.5], pb: [3.4, 35.8], ka: [-4.4, 19], kb: [5.2, 27.5], fa: [-3.8, 3], fb: [4.8, 13.5], ta: [-5, 0.6], tb: [6.2, 12.2],
  },
} satisfies Record<string, Pose>;
export type PoseName = keyof typeof POSES;

export const lerpPose = (A: Pose, B: Pose, t: number): Pose => {
  const o = {} as Pose;
  for (const k in A) {
    const j = k as Joint;
    o[j] = [lerp(A[j][0], B[j][0], t), lerp(A[j][1], B[j][1], t)];
  }
  return o;
};

/** Rig colors: a neutral gray-teal figure. Placeholder illustrations, not people. */
export const FIG = { base: "#A9BFC0", dark: "#7E999B", hi: "#DCE7E6" } as const;

/** Limb segments [from, to, width in inches], in paint order around the torso and head. */
export const LEGS: [Joint, Joint, number][] = [["kb", "fb", 3.7], ["pb", "kb", 4.9], ["fb", "tb", 2.5], ["ka", "fa", 3.7], ["pa", "ka", 4.9], ["fa", "ta", 2.5], ["pa", "pb", 6.2]];
export const NECK: [Joint, Joint, number] = ["neck", "head", 2.8];
export const ARM_B: [Joint, Joint, number][] = [["sb", "eb", 3.3], ["eb", "hb", 2.8]];
export const ARM_A: [Joint, Joint, number][] = [["sa", "ea", 3.3], ["ea", "ha", 2.8]];
/** All segments in the order the figure's <line> triples appear in the SVG. */
export const SEGMENTS = [...LEGS, NECK, ...ARM_B, ...ARM_A];

export interface FigureFrame {
  M: Record<Joint, Pt>;
  segs: { x1: string; y1: string; x2: string; y2: string }[];
  torso: string;
  hi: { x1: number; y1: number; x2: number; y2: number };
  head: Pt;
  headHi: Pt;
  ha: Pt;
  hb: Pt;
}

/** Everything needed to draw a pose at scale `u` (px per inch) with the feet at (ox, oy). */
export function figureFrame(pose: Pose, u: number, ox: number, oy: number): FigureFrame {
  const M = {} as Record<Joint, Pt>;
  for (const k in pose) {
    const j = k as Joint;
    M[j] = [ox + pose[j][0] * u, oy - pose[j][1] * u];
  }
  const segs = SEGMENTS.map(([a, b]) => ({ x1: M[a][0].toFixed(1), y1: M[a][1].toFixed(1), x2: M[b][0].toFixed(1), y2: M[b][1].toFixed(1) }));
  const w = (p: Pt, q: Pt, t: number): Pt => [lerp(p[0], q[0], t), lerp(p[1], q[1], t)];
  const wa = w(M.sa, M.pa, 0.62), wb = w(M.sb, M.pb, 0.62), wa2 = w(wa, wb, 0.1), wb2 = w(wb, wa, 0.1);
  const sa2 = w(M.sa, M.sb, 0.05), sb2 = w(M.sb, M.sa, 0.05);
  const torso = [sa2, sb2, wb2, M.pb, M.pa, wa2].map((q) => q[0].toFixed(1) + "," + q[1].toFixed(1)).join(" ");
  const h1 = w(M.sa, M.sb, 0.3), h2 = w(wa2, wb2, 0.25);
  return {
    M,
    segs,
    torso,
    hi: { x1: h1[0], y1: h1[1] + u, x2: h2[0], y2: h2[1] },
    head: M.head,
    headHi: [M.head[0] - 1.4 * u, M.head[1] - 1.5 * u],
    ha: M.ha,
    hb: M.hb,
  };
}

/* ------------------------------------------------------------ scroll timeline ---- */
/** Figure keyframes on the build timeline: walk in, side stretch, band pulldown. */
export const KEYS: [number, PoseName][] = [[0.46, "STAND"], [0.49, "STAND"], [0.52, "STRETCH"], [0.545, "STRETCH"], [0.575, "PULL_START"], [0.59, "PULL_START"], [0.62, "PULL_END"], [0.665, "PULL_END"]];
export function poseAt(p: number): Pose {
  if (p <= KEYS[0][0]) return POSES[KEYS[0][1]];
  for (let i = 0; i < KEYS.length - 1; i++)
    if (p <= KEYS[i + 1][0]) return lerpPose(POSES[KEYS[i][1]], POSES[KEYS[i + 1][1]], smooth((p - KEYS[i][0]) / (KEYS[i + 1][0] - KEYS[i][0])));
  return POSES[KEYS[KEYS.length - 1][1]];
}

/**
 * Raw scroll progress -> build timeline. The anchors run fast with no copy; the reference's old
 * balance section (build timeline .665-.83) is skipped by the jump at .72.
 */
export const KN: [number, number][] = [[0, 0], [0.17, 0.095], [0.34, 0.3], [0.4, 0.46], [0.55, 0.56], [0.72, 0.665], [0.7201, 0.83], [1, 1]];
export const toBuild = (r: number) => {
  for (let i = 1; i < KN.length; i++) if (r <= KN[i][0]) return lerp(KN[i - 1][1], KN[i][1], (r - KN[i - 1][0]) / (KN[i][0] - KN[i - 1][0]));
  return 1;
};
/** Raw scroll progress where each copy beat starts. */
export const BEAT_STARTS = [0, 0.08, 0.17, 0.4, 0.55, 0.72];

/* --------------------------------------------------- finale mini demos (inches) ---- */
const wave = (t: number) => smooth(clamp((0.5 - 0.5 * Math.cos(2 * Math.PI * t) - 0.12) / 0.76, 0, 1));
const P = POSES;
/** One looping demo per genre, in GENRE_LIST order: climb, strengthen, stretch, loosen, steady, rise. */
export const MINI: ((t: number) => Pose)[] = [
  (t) => {
    const k = wave(t);
    return { ...P.STAND, head: [-0.6, 63.6], ea: [lerp(-11.8, -11.4, k), lerp(52, 65.8, k)], ha: [-14.4, lerp(58, 74.5, k)] };
  },
  (t) => lerpPose(P.PULL_START, P.PULL_END, wave(t)),
  (t) => lerpPose(P.STAND, P.STRETCH, wave(t)),
  (t) => {
    const a = 2 * Math.PI * t;
    return { ...P.STAND_RAIL, eb: [14.5 + 1.2 * Math.cos(a), 52 + 1.2 * Math.sin(a)], hb: [21 + 2.8 * Math.cos(a), 51 + 2.8 * Math.sin(a)] };
  },
  (t) => lerpPose(P.STAND_RAIL, { ...P.BALANCE, ha: [-13.6, 38], ea: [-11.6, 46] }, 0.55 + 0.45 * wave(t)),
  (t) => lerpPose(P.SIT, P.STAND_RAIL, wave(t)),
];
/** Loop length and per-hexagon phase offset. */
export const MINI_PERIOD_MS = 4200;
export const MINI_OFFSET = 0.17;
/** The resting frame for reduced motion and the server render. */
export const MINI_REST = 0.5;

/* ------------------------------------------------ board drawing (viewBox units) ---- */
/** 8 viewBox units per inch. The figure stands at (OX, OY). The wall's floor line is y = 600. */
export const VB = { x: -70, y: -20, w: 420, h: 760 } as const;
export const U = 8;
export const OX = 168;
export const OY = 636;
export const FLOOR_Y = 600;
/** One section: 25 in tall x 8 in wide (200 x 64 units), 3 sections, 2-unit seams. */
export const SEC_H = 200;
export const SEC_W = 64;
export const SEC_GAP = 2;
/** Anchor rows per section, alternating 2 and 3 hexagons: 10 x 2 + 9 x 3 = 47. */
export const ROWS = 19;

export interface Hole {
  section: number;
  x: number;
  y: number;
  /** Order the anchors light in: bottom of the board first. */
  rank: number;
}

export function boardHoles(): Hole[] {
  const holes: Hole[] = [];
  for (let s = 0; s < 3; s++) {
    const y0 = FLOOR_Y - (s + 1) * SEC_H - s * SEC_GAP;
    for (let i = 0; i < ROWS; i++) {
      const cy = y0 + 10 + i * ((SEC_H - 20) / (ROWS - 1));
      const xs = i % 2 === 0 ? [SEC_W / 2 - 9, SEC_W / 2 + 9] : [SEC_W / 2 - 18, SEC_W / 2, SEC_W / 2 + 18];
      for (const cx of xs) holes.push({ section: s, x: cx, y: cy, rank: 0 });
    }
  }
  [...holes].sort((a, b) => b.y - a.y).forEach((h, i) => (h.rank = i));
  return holes;
}

/** Carabiners (with red band loops) at low, chest and overhead anchors: 18, 44 and 73 in up. */
export const CARABINER_HEIGHTS = [18, 44, 73];
export function carabinerHoles(holes: Hole[]) {
  const col = holes.filter((o) => o.x === SEC_W / 2 + 18);
  return CARABINER_HEIGHTS.map((h) => col.reduce((m, o) => (Math.abs(o.y - (FLOOR_Y - U * h)) < Math.abs(m.y - (FLOOR_Y - U * h)) ? o : m)));
}
