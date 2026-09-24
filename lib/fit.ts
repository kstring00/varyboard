import { fitPlanner } from "@/content/config";
import { board, products } from "@/content/facts";
import { ROOMS, type RoomDef, type Side } from "@/content/rooms";

/**
 * Fit rules for the room planner. Pure functions, ported one to one from the prototype
 * (reference/room-planner.html) with the board's numbers coming from content/facts.ts and
 * the mounting assumptions from content/config.ts. Units are inches.
 */
export type ModelKey = "std" | "xt";

export interface FitModel {
  key: ModelKey;
  name: string;
  h: number;
  sections: number;
  anchors: number;
}

export const MODELS: Record<ModelKey, FitModel> = {
  std: { key: "std", name: products.board.name, h: products.board.heightIn!, sections: products.board.sections!, anchors: board.anchorPointsPerSection * products.board.sections! },
  xt: { key: "xt", name: products.boardXT.name, h: products.boardXT.heightIn!, sections: products.boardXT.sections!, anchors: board.anchorPointsPerSection * products.boardXT.sections! },
};

export const BOTTOM = fitPlanner.mountBottomIn;
export const BOARD_W = board.section.widthIn;
export const BOARD_D = board.section.depthIn;
export const SECTION_H = board.section.heightIn;
/** Clear floor zone in front of the board, square, from facts ("3 x 3 ft"). */
export const ZONE = 36;
export const SNAPS_TO_STUDS = fitPlanner.mountMethod === "studs";
/** Spacing between candidate positions along a wall. */
export const STEP = SNAPS_TO_STUDS ? fitPlanner.studSpacingIn : fitPlanner.gridStepIn;

export const SIDES: Side[] = ["left", "back", "right"];

export interface Frame {
  p: { x: number; y: number; z: number };
  n: { x: number; y: number; z: number };
  rot: number;
}

/** Position, inward normal and yaw of a point `u` along a wall. */
export function wallFrame(def: RoomDef, side: Side, u: number): Frame {
  if (side === "back") return { p: { x: u, y: 0, z: -def.D / 2 }, n: { x: 0, y: 0, z: 1 }, rot: 0 };
  if (side === "left") return { p: { x: -def.W / 2, y: 0, z: u }, n: { x: 1, y: 0, z: 0 }, rot: Math.PI / 2 };
  return { p: { x: def.W / 2, y: 0, z: u }, n: { x: -1, y: 0, z: 0 }, rot: -Math.PI / 2 };
}

export const wallLen = (def: RoomDef, side: Side) => (side === "back" ? def.W : def.D);

/** Candidate positions along a wall: studs 16 in apart from the corner, or a grid when studs are off. */
export function positionsFor(def: RoomDef, side: Side): number[] {
  const L = wallLen(def, side);
  const out: number[] = [];
  for (let k = 1; -L / 2 + STEP * k < L / 2; k++) out.push(-L / 2 + STEP * k);
  return out;
}

export function inBounds(def: RoomDef, side: Side, u: number): boolean {
  const L = wallLen(def, side);
  const half = BOARD_W / 2 + 1; // 5 in: half the board plus a 1 in margin
  return u - half >= -L / 2 + 1 && u + half <= L / 2 - 1;
}

export function wallBlock(def: RoomDef, side: Side, u: number) {
  const half = BOARD_W / 2 + 1;
  return def.blocks.find((b) => b.side === side && u + half > b.a && u - half < b.b);
}

export interface Evaluation {
  wallOK: boolean;
  wallBy?: string;
  heightOK: boolean;
  top: number;
  wallH: number;
  zoneOK: boolean;
  zoneBy?: string;
  ok: boolean;
}

export function evaluate(def: RoomDef, model: FitModel, side: Side, u: number): Evaluation {
  const top = BOTTOM + model.h;
  const wallH = def.wallH[side];
  const limit = def.open ? wallH : wallH - 2;
  const wb = !inBounds(def, side, u) ? { name: "the corner" } : wallBlock(def, side, u);
  const f = wallFrame(def, side, u);
  const cx = f.p.x + f.n.x * (ZONE / 2);
  const cz = f.p.z + f.n.z * (ZONE / 2);
  const r = { x0: cx - ZONE / 2, x1: cx + ZONE / 2, z0: cz - ZONE / 2, z1: cz + ZONE / 2 };
  const inside = r.x0 >= -def.W / 2 - 0.5 && r.x1 <= def.W / 2 + 0.5 && r.z0 >= -def.D / 2 - 0.5 && r.z1 <= def.D / 2 + 0.5;
  const fb = def.feet.find((o) => r.x0 < o.x1 - 1 && r.x1 > o.x0 + 1 && r.z0 < o.z1 - 1 && r.z1 > o.z0 + 1);
  const wallOK = !wb;
  const heightOK = top <= limit;
  const zoneOK = inside && !fb;
  return { wallOK, wallBy: wb?.name, heightOK, top, wallH, zoneOK, zoneBy: !inside ? "corner" : fb?.name, ok: wallOK && heightOK && zoneOK };
}

export function goodSpots(def: RoomDef, model: FitModel): number {
  let n = 0;
  for (const s of SIDES) for (const u of positionsFor(def, s)) if (evaluate(def, model, s, u).ok) n++;
  return n;
}

/** Positions on a wall that are in bounds and not blocked (height and zone aside). */
export function wallValid(def: RoomDef, side: Side): number[] {
  return positionsFor(def, side).filter((u) => inBounds(def, side, u) && !wallBlock(def, side, u));
}

/** Best position on a wall: a good spot nearest the wall's middle, else the nearest valid one. */
export function bestSpot(def: RoomDef, model: FitModel, side: Side): number | null {
  const c = wallValid(def, side);
  if (!c.length) return null;
  const good = c.filter((u) => evaluate(def, model, side, u).ok);
  return (good.length ? good : c).slice().sort((a, b) => Math.abs(a) - Math.abs(b))[0];
}

/** The next wall (left -> back -> right) with a valid position, starting after `side`. */
export function nextWall(def: RoomDef, model: FitModel, side: Side): { side: Side; u: number } | null {
  const i = SIDES.indexOf(side);
  for (let k = 1; k <= 3; k++) {
    const s = SIDES[(i + k) % 3];
    const u = bestSpot(def, model, s);
    if (u !== null) return { side: s, u };
  }
  return null;
}

/** One position over along the current wall. dir +1 is to the viewer's right. */
export function nudge(def: RoomDef, side: Side, u: number, dir: 1 | -1): number | null {
  const sign = side === "left" ? -dir : dir;
  const list = wallValid(def, side);
  const next = sign > 0 ? list.find((x) => x > u + 0.1) : list.slice().reverse().find((x) => x < u - 0.1);
  return next === undefined ? null : next;
}

/** Nearest valid position on the wall to `u`, or null. */
export function nearestValid(def: RoomDef, side: Side, u: number): number | null {
  const c = wallValid(def, side).slice().sort((a, b) => Math.abs(a - u) - Math.abs(b - u));
  return c.length ? c[0] : null;
}

/** Nearest candidate position (in bounds) to a raw wall coordinate. */
export function snap(def: RoomDef, side: Side, u: number): number | null {
  const list = positionsFor(def, side).filter((x) => inBounds(def, side, x));
  if (!list.length) return null;
  let best = list[0];
  for (const x of list) if (Math.abs(x - u) < Math.abs(best - u)) best = x;
  return best;
}

export function ftin(n: number): string {
  n = Math.round(n);
  const f = Math.floor(n / 12);
  const i = n % 12;
  if (!f) return `${i} in`;
  return i ? `${f} ft ${i} in` : `${f} ft`;
}

export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** The three check rows for the status panel. */
export function checkRows(def: RoomDef, model: FitModel, side: Side, e: Evaluation): [boolean, string][] {
  const kind = def.kind[side];
  const wallLine = SNAPS_TO_STUDS ? "Clear wall, centered on a stud" : "Clear wall";
  return [
    e.wallOK ? [true, wallLine] : [false, e.wallBy === "the corner" ? "Too close to the corner" : `Blocked by ${e.wallBy}`],
    e.heightOK ? [true, `Top at ${ftin(e.top)}, under the ${ftin(e.wallH)} ${kind}`] : [false, `${model.name} reaches ${ftin(e.top)}. The ${kind} is ${ftin(e.wallH)}.`],
    e.zoneOK ? [true, "3 × 3 ft clear in front to stand and move"] : [false, e.zoneBy === "corner" ? "Too close to the corner for the 3 × 3 ft space" : `${cap(e.zoneBy ?? "")} is in the 3 × 3 ft space`],
  ];
}

/** The "N good spots" line, with the XT fallback wording. */
export function spotsLine(def: RoomDef, model: FitModel): string {
  const n = goodSpots(def, model);
  if (n) return `${n} good spot${n === 1 ? "" : "s"} for the ${model.name} in this room.`;
  const other = model.key === "xt" ? goodSpots(def, MODELS.std) : 0;
  return model.key === "xt" && other ? `The XT is too tall for this room. The ${MODELS.std.h} in ${MODELS.std.name} fits in ${other} spots.` : "No clear spot in this room.";
}

/** Room-by-room summary, for the no-WebGL fallback and the tests. */
export function fitSummary(): { room: string; std: number; xt: number }[] {
  return ROOMS.map((r) => ({ room: r.name, std: goodSpots(r, MODELS.std), xt: goodSpots(r, MODELS.xt) }));
}
