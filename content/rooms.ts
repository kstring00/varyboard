/**
 * Rooms for the "Will it fit?" planner, as data. Every number is inches and comes from the
 * prototype (reference/room-planner.html). Furniture is a list of primitives so the scene
 * component stays generic; `feet` are floor footprints that can block the 3 x 3 ft zone and
 * `blocks` are wall spans the board cannot sit in front of.
 *
 * Coordinates: origin at the room's floor centre, x to the right, z toward the viewer,
 * y up. `u` along a wall is x for the back wall and z for the side walls.
 */
export type Side = "back" | "left" | "right";

export interface Material {
  color: string;
  rough?: number;
  metal?: number;
  emissive?: string;
  emissiveIntensity?: number;
  doubleSide?: boolean;
}

/** Ranges are inclusive [from, to] along an axis; `y0` is the bottom of the piece. */
export type Piece =
  | { kind: "box"; x: [number, number]; y: [number, number]; z: [number, number]; mat: Material }
  | { kind: "cyl"; r: number; h: number; at: [number, number, number]; mat: Material; seg?: number; openEnded?: boolean; rTop?: number; rot?: [number, number, number] }
  | { kind: "sphere"; r: number; at: [number, number, number]; mat: Material }
  | { kind: "rod"; a: [number, number, number]; b: [number, number, number]; r: number; mat: Material }
  | { kind: "plane"; w: number; h: number; at: [number, number, number]; mat: Material; rot?: [number, number, number] }
  | { kind: "tiltedBox"; w: number; h: number; d: number; at: [number, number, number]; rotX: number; mat: Material }
  | { kind: "window"; side: Side; a: number; b: number; y0: number; y1: number }
  | { kind: "door"; side: Side; a: number; b: number }
  | { kind: "plant"; x: number; z: number; r: number }
  | { kind: "onWall"; side: Side; a: number; b: number; pieces: WallPiece[] };

/** Pieces inside an on-wall group: local x across the wall, y up, z out from the wall. */
export type WallPiece = { kind: "box"; w: number; h: number; d: number; at: [number, number, number]; mat: Material } | { kind: "plane"; w: number; h: number; at: [number, number, number]; mat: Material };

export interface Footprint {
  name: string;
  x0: number;
  x1: number;
  z0: number;
  z1: number;
}
export interface WallBlock {
  side: Side;
  a: number;
  b: number;
  name: string;
}

export type FloorTexture = "oak" | "concrete" | "deck" | "vinyl";
export type WallTexture = { kind: "plaster"; color: string } | { kind: "sidingAndFence" };

export interface RoomDef {
  key: string;
  name: string;
  meta: string;
  W: number;
  D: number;
  wallH: Record<Side, number>;
  /** What the height check names: "ceiling", "house wall", "fence". */
  kind: Record<Side, string>;
  /** Open sky: the top may reach the wall height itself. */
  open?: boolean;
  start: { side: Side; u: number };
  yaw: number;
  /** [sun, hemisphere] intensities. */
  light: [number, number];
  floor: FloorTexture;
  wall: WallTexture;
  pieces: Piece[];
  feet: Footprint[];
  blocks: WallBlock[];
}

const M = (color: string, rough?: number, extra: Partial<Material> = {}): Material => ({ color, rough, ...extra });
const ceilings = { back: "ceiling", left: "ceiling", right: "ceiling" } as const;

/* ------------------------------------------------------------- bedroom ---- */
const wood = M("#B99C7A", 0.7);
const dark = M("#6E5A48", 0.7);
const bedroomPieces: Piece[] = [
  { kind: "box", x: [-30, 30], y: [0, 12], z: [-64, 14], mat: wood },
  { kind: "box", x: [-29, 29], y: [12, 21], z: [-63, 13], mat: M("#F3F0EA", 0.95) },
  { kind: "box", x: [-30, 30], y: [21, 24], z: [-34, 14.5], mat: M("#AFC0B5", 0.95) },
  { kind: "box", x: [-31, 31], y: [0, 44], z: [-66, -63], mat: M("#8B9C94", 0.9) },
  { kind: "box", x: [-24, -3], y: [21, 26], z: [-61, -49], mat: M("#FBFAF7", 0.95) },
  { kind: "box", x: [3, 24], y: [21, 26], z: [-61, -49], mat: M("#FBFAF7", 0.95) },
  ...([[-50, -33], [33, 50]] as [number, number][]).flatMap(([a, b]): Piece[] => {
    const x = (a + b) / 2;
    return [
      { kind: "box", x: [a, b], y: [0, 24], z: [-66, -50], mat: wood },
      { kind: "cyl", r: 2.5, h: 1, at: [x, 24, -58], mat: dark },
      { kind: "cyl", r: 0.5, h: 11, at: [x, 25, -58], mat: dark },
      { kind: "cyl", r: 5, rTop: 3.5, h: 6, at: [x, 36, -58], mat: M("#F4EEE2", 0.9, { doubleSide: true, emissive: "#FFE9C4", emissiveIntensity: 0.3 }), openEnded: true },
    ];
  }),
  { kind: "box", x: [54, 72], y: [0, 34], z: [14, 58], mat: wood },
  { kind: "box", x: [53.6, 54], y: [10.7, 11.3], z: [15, 57], mat: dark },
  { kind: "box", x: [53.6, 54], y: [21.7, 22.3], z: [15, 57], mat: dark },
  { kind: "window", side: "right", a: -46, b: -6, y0: 34, y1: 82 },
  { kind: "door", side: "left", a: 22, b: 58 },
  { kind: "plane", w: 64, h: 40, at: [0, 0.2, 36], rot: [-Math.PI / 2, 0, 0], mat: M("#D9D3C7", 1) },
  { kind: "plant", x: -65, z: -59, r: 6 },
];

/* -------------------------------------------------------------- garage ---- */
const gwood = M("#B7996F", 0.75);
const metal = M("#9DA3A0", 0.45, { metal: 0.35 });
const carM = M("#7D8C92", 0.45, { metal: 0.2 });
const lamp = M("#F4F1E8", 0.4, { emissive: "#FFF6E0", emissiveIntensity: 0.4 });
const shelfColors = ["#D9D2C2", "#8BA39A", "#C7B89C"];
const garagePieces: Piece[] = [
  { kind: "box", x: [-102, -34], y: [9, 30], z: [-54, 116], mat: carM },
  { kind: "box", x: [-99, -37], y: [30, 47], z: [-18, 64], mat: M("#5B6C70", 0.2) },
  { kind: "box", x: [-100, -36], y: [47, 49], z: [-16, 62], mat: carM },
  ...([[-102, -32], [-102, 92], [-34, -32], [-34, 92]] as [number, number][]).map(([x, z]): Piece => ({ kind: "cyl", r: 12, h: 7, at: [x, 12 - 3.5, z], mat: M("#232826", 0.8), seg: 24, rot: [0, 0, Math.PI / 2] })),
  { kind: "box", x: [-98, -86], y: [22, 26], z: [115, 116.6], mat: lamp },
  { kind: "box", x: [-50, -38], y: [22, 26], z: [115, 116.6], mat: lamp },
  { kind: "box", x: [16, 88], y: [33, 36], z: [-120, -96], mat: gwood },
  ...([[17, -119], [85, -119], [17, -99], [85, -99]] as [number, number][]).map(([x, z]): Piece => ({ kind: "box", x: [x, x + 2], y: [0, 33], z: [z, z + 2], mat: gwood })),
  { kind: "box", x: [17, 87], y: [8, 9], z: [-119, -97], mat: gwood },
  { kind: "box", x: [60, 76], y: [36, 44], z: [-116, -104], mat: M("#9C5446", 0.6) },
  {
    kind: "onWall",
    side: "back",
    a: 16,
    b: 88,
    pieces: [
      { kind: "box", w: 72, h: 36, d: 0.6, at: [0, 42, 0.3], mat: M("#C9B08E", 0.9) },
      ...([[-24, 60], [-10, 52], [6, 64], [22, 56]] as [number, number][]).map(([x, y]): WallPiece => ({ kind: "box", w: 3, h: 12, d: 1.2, at: [x, y, 1.2], mat: M("#3E4744", 0.5) })),
    ],
  },
  ...([[101, -103], [118, -103], [101, -26], [118, -26]] as [number, number][]).map(([x, z]): Piece => ({ kind: "box", x: [x, x + 1.5], y: [0, 84], z: [z, z + 1.5], mat: metal })),
  ...[2, 26, 50, 74].flatMap((y, i): Piece[] => [
    { kind: "box", x: [100, 120], y: [y, y + 1.2], z: [-104, -24], mat: metal },
    ...(i < 3 ? [-96, -76, -56, -36].flatMap((z, k): Piece[] => ((i + k) % 3 !== 2 ? [{ kind: "box", x: [102, 118], y: [y + 1.2, y + 14], z: [z - 8, z + 8], mat: M(shelfColors[(i + k) % 3], 0.9) }] : [])) : []),
  ]),
  { kind: "cyl", r: 11, h: 62, at: [-107, 0, -107], mat: M("#E9E7E2", 0.45) },
  { kind: "door", side: "left", a: -80, b: -44 },
  { kind: "cyl", r: 11, h: 40, at: [108, 0, 84], mat: M("#4E5B57", 0.7) },
  { kind: "cyl", r: 11, h: 40, at: [108, 0, 107], mat: M("#6B7F77", 0.7) },
];

/* --------------------------------------------------------------- patio ---- */
const trim = M("#F2F0EA", 0.5);
const glass = M("#C9DCE1", 0.15, { emissive: "#E6F2F4", emissiveIntensity: 0.45 });
const loungeFrame = M("#6F5A45", 0.7);
const cush = M("#E6E0D3", 0.95);
const lounger = (x0: number, x1: number, z0: number, z1: number): Piece[] => [
  { kind: "box", x: [x0, x1], y: [6, 9], z: [z0 + 14, z1], mat: loungeFrame },
  { kind: "box", x: [x0 + 1, x1 - 1], y: [9, 13], z: [z0 + 15, z1 - 1], mat: cush },
  ...([[x0, z0 + 14], [x1 - 2, z0 + 14], [x0, z1 - 2], [x1 - 2, z1 - 2]] as [number, number][]).map(([x, z]): Piece => ({ kind: "box", x: [x, x + 2], y: [0, 6], z: [z, z + 2], mat: loungeFrame })),
  { kind: "tiltedBox", w: x1 - x0 - 2, h: 26, d: 4, at: [(x0 + x1) / 2, 20, z0 + 9], rotX: -0.55, mat: cush },
];
const gm = M("#30353A", 0.45, { metal: 0.4 });
const patioPieces: Piece[] = [
  {
    kind: "onWall",
    side: "back",
    a: -20,
    b: 52,
    pieces: [
      { kind: "plane", w: 34, h: 78, at: [-17, 41, 0.2], mat: glass },
      { kind: "plane", w: 34, h: 78, at: [17, 41, 0.2], mat: glass },
      { kind: "box", w: 72, h: 2.5, d: 2, at: [0, 80, 1], mat: trim },
      { kind: "box", w: 2.5, h: 82, d: 2, at: [-34.75, 0, 1], mat: trim },
      { kind: "box", w: 2.5, h: 82, d: 2, at: [34.75, 0, 1], mat: trim },
      { kind: "box", w: 2, h: 80, d: 2.4, at: [0, 0, 1.2], mat: trim },
    ],
  },
  { kind: "window", side: "back", a: -84, b: -48, y0: 40, y1: 84 },
  ...lounger(28, 54, 4, 72),
  ...lounger(64, 90, 4, 72),
  { kind: "cyl", r: 2, h: 18, at: [59, 0, 24], mat: loungeFrame },
  { kind: "cyl", r: 8, h: 1.5, at: [59, 18, 24], mat: loungeFrame },
  { kind: "box", x: [-95, -73], y: [18, 34], z: [-13, 13], mat: gm },
  { kind: "box", x: [-94, -74], y: [34, 40], z: [-12, 12], mat: gm },
  ...([[-94, -12], [-76, -12], [-94, 10], [-76, 10]] as [number, number][]).map(([x, z]): Piece => ({ kind: "box", x: [x, x + 2], y: [0, 18], z: [z, z + 2], mat: gm })),
  { kind: "box", x: [70, 92], y: [0, 20], z: [-72, -50], mat: M("#8E8A82", 0.9) },
  { kind: "sphere", r: 12, at: [81, 28, -61], mat: M("#7E9A6E", 0.9) },
  { kind: "sphere", r: 8, at: [74, 34, -57], mat: M("#88A378", 0.9) },
];

/* -------------------------------------------------------------- clinic ---- */
const cmetal = M("#B9C0BD", 0.35, { metal: 0.55 });
const vinylM = M("#2E5750", 0.6);
const step = M("#C9B394", 0.7);
const blk = M("#2B302E", 0.5, { metal: 0.3 });
const cab = M("#E4E1DA", 0.7);
const clinicPieces: Piece[] = [
  ...([[-42, -28], [24, -28], [-42, -6], [24, -6]] as [number, number][]).map(([x, z]): Piece => ({ kind: "box", x: [x, x + 3], y: [0, 24], z: [z, z + 3], mat: cmetal })),
  { kind: "box", x: [-44, 28], y: [24, 31], z: [-30, -2], mat: vinylM },
  { kind: "box", x: [14, 138], y: [0, 1.5], z: [26, 66], mat: M("#8FA39D", 0.8) },
  ...([[18, 32], [18, 60], [76, 32], [76, 60], [134, 32], [134, 60]] as [number, number][]).map(([x, z]): Piece => ({ kind: "cyl", r: 1, h: 36, at: [x, 1.5, z], mat: cmetal })),
  { kind: "rod", a: [16, 37.5, 32], b: [136, 37.5, 32], r: 1.1, mat: cmetal },
  { kind: "rod", a: [16, 37.5, 60], b: [136, 37.5, 60], r: 1.1, mat: cmetal },
  { kind: "box", x: [122, 144], y: [0, 21], z: [-96, -36], mat: step },
  { kind: "box", x: [115, 122], y: [0, 14], z: [-96, -36], mat: step },
  { kind: "box", x: [108, 115], y: [0, 7], z: [-96, -36], mat: step },
  { kind: "cyl", r: 0.9, h: 40, at: [110, 0, -94], mat: cmetal },
  { kind: "cyl", r: 0.9, h: 40, at: [110, 0, -38], mat: cmetal },
  { kind: "rod", a: [110, 40, -94], b: [140, 55, -94], r: 0.9, mat: cmetal },
  { kind: "rod", a: [110, 40, -38], b: [140, 55, -38], r: 0.9, mat: cmetal },
  { kind: "window", side: "right", a: 4, b: 60, y0: 36, y1: 84 },
  {
    kind: "onWall",
    side: "left",
    a: -70,
    b: 10,
    pieces: [
      { kind: "box", w: 80, h: 76, d: 0.8, at: [0, 9, 0.4], mat: M("#9FA8A5", 0.5) },
      { kind: "plane", w: 77, h: 73, at: [0, 47, 0.9], mat: M("#DCE7EA", 0.08, { metal: 0.1, emissive: "#EEF5F6", emissiveIntensity: 0.35 }) },
    ],
  },
  { kind: "box", x: [-128, -106], y: [0, 3], z: [-104, -64], mat: blk },
  { kind: "cyl", r: 9, h: 3, at: [-117, 14 - 1.5, -72], mat: M("#9AA3A0", 0.4, { metal: 0.5 }), seg: 24, rot: [0, 0, Math.PI / 2] },
  { kind: "rod", a: [-117, 3, -96], b: [-117, 34, -94], r: 1.4, mat: blk },
  { kind: "box", x: [-121, -113], y: [34, 37], z: [-100, -88], mat: blk },
  { kind: "rod", a: [-117, 3, -70], b: [-117, 42, -74], r: 1.4, mat: blk },
  { kind: "rod", a: [-126, 42, -74], b: [-108, 42, -74], r: 0.9, mat: blk },
  { kind: "box", x: [40, 104], y: [0, 36], z: [-108, -86], mat: cab },
  { kind: "box", x: [39, 105], y: [36, 37.5], z: [-108, -85], mat: M("#7F8F8A", 0.5) },
  { kind: "box", x: [40, 104], y: [54, 84], z: [-108, -96], mat: cab },
  { kind: "sphere", r: 13, at: [-112, 13, 64], mat: M("#86B4AE", 0.5) },
];

export const ROOMS: RoomDef[] = [
  {
    key: "bedroom",
    name: "Guest bedroom",
    meta: "12 × 11 ft · 8 ft ceiling",
    W: 144,
    D: 132,
    wallH: { back: 96, left: 96, right: 96 },
    kind: ceilings,
    start: { side: "left", u: -18 },
    yaw: 0.3,
    light: [1.15, 0.85],
    floor: "oak",
    wall: { kind: "plaster", color: "#E4DDD1" },
    pieces: bedroomPieces,
    feet: [
      { name: "the bed", x0: -31, x1: 31, z0: -66, z1: 14.5 },
      { name: "the nightstand", x0: -50, x1: -33, z0: -66, z1: -50 },
      { name: "the nightstand", x0: 33, x1: 50, z0: -66, z1: -50 },
      { name: "the dresser", x0: 54, x1: 72, z0: 14, z1: 58 },
      { name: "a plant", x0: -72, x1: -58, z0: -66, z1: -52 },
    ],
    blocks: [
      { side: "back", a: -52, b: 52, name: "the bed and nightstands" },
      { side: "right", a: 12, b: 60, name: "the dresser" },
      { side: "right", a: -48, b: -4, name: "the window" },
      { side: "left", a: 20, b: 60, name: "the door" },
      { side: "back", a: -72, b: -57, name: "a plant" },
      { side: "left", a: -66, b: -51, name: "a plant" },
    ],
  },
  {
    key: "garage",
    name: "Garage",
    meta: "20 × 20 ft · 10 ft ceiling",
    W: 240,
    D: 240,
    wallH: { back: 120, left: 120, right: 120 },
    kind: ceilings,
    start: { side: "right", u: 40 },
    yaw: -0.3,
    light: [1.1, 0.85],
    floor: "concrete",
    wall: { kind: "plaster", color: "#DEDAD2" },
    pieces: garagePieces,
    feet: [
      { name: "the car", x0: -106, x1: -30, z0: -54, z1: 118 },
      { name: "the workbench", x0: 16, x1: 88, z0: -120, z1: -96 },
      { name: "the shelves", x0: 100, x1: 120, z0: -104, z1: -24 },
      { name: "the water heater", x0: -120, x1: -94, z0: -120, z1: -94 },
      { name: "the trash bins", x0: 96, x1: 120, z0: 72, z1: 120 },
    ],
    blocks: [
      { side: "back", a: 14, b: 90, name: "the workbench" },
      { side: "right", a: -106, b: -22, name: "the shelves" },
      { side: "back", a: -120, b: -92, name: "the water heater" },
      { side: "left", a: -120, b: -92, name: "the water heater" },
      { side: "left", a: -82, b: -42, name: "the door to the house" },
      { side: "right", a: 70, b: 120, name: "the trash bins" },
    ],
  },
  {
    key: "patio",
    name: "Back patio",
    meta: "16 × 12 ft · open sky, 7 ft fence",
    W: 192,
    D: 144,
    wallH: { back: 120, left: 84, right: 84 },
    kind: { back: "house wall", left: "fence", right: "fence" },
    open: true,
    start: { side: "back", u: -32 },
    yaw: 0.12,
    light: [1.45, 1.0],
    floor: "deck",
    wall: { kind: "sidingAndFence" },
    pieces: patioPieces,
    feet: [
      { name: "a lounge chair", x0: 28, x1: 54, z0: 4, z1: 72 },
      { name: "a lounge chair", x0: 64, x1: 90, z0: 4, z1: 72 },
      { name: "the grill", x0: -96, x1: -70, z0: -16, z1: 14 },
      { name: "the planter", x0: 70, x1: 92, z0: -72, z1: -50 },
    ],
    blocks: [
      { side: "back", a: -22, b: 54, name: "the sliding door" },
      { side: "back", a: -86, b: -46, name: "the window" },
      { side: "left", a: -18, b: 16, name: "the grill" },
      { side: "back", a: 68, b: 94, name: "the planter" },
    ],
  },
  {
    key: "clinic",
    name: "Clinic gym",
    meta: "24 × 18 ft · 10 ft ceiling",
    W: 288,
    D: 216,
    wallH: { back: 120, left: 120, right: 120 },
    kind: ceilings,
    start: { side: "back", u: 0 },
    yaw: 0.12,
    light: [1.1, 0.9],
    floor: "vinyl",
    wall: { kind: "plaster", color: "#E2E6E2" },
    pieces: clinicPieces,
    feet: [
      { name: "the treatment table", x0: -44, x1: 28, z0: -30, z1: -2 },
      { name: "the parallel bars", x0: 14, x1: 138, z0: 26, z1: 66 },
      { name: "the stair unit", x0: 108, x1: 144, z0: -96, z1: -36 },
      { name: "the bike", x0: -130, x1: -104, z0: -108, z1: -62 },
      { name: "the cabinets", x0: 40, x1: 104, z0: -108, z1: -86 },
      { name: "the exercise ball", x0: -125, x1: -99, z0: 51, z1: 77 },
    ],
    blocks: [
      { side: "right", a: -98, b: -34, name: "the stair unit" },
      { side: "right", a: 2, b: 62, name: "the window" },
      { side: "left", a: -72, b: 12, name: "the mirror" },
      { side: "back", a: -132, b: -102, name: "the bike" },
      { side: "back", a: 38, b: 106, name: "the cabinets" },
    ],
  },
];

export const roomByKey = (key: string) => ROOMS.find((r) => r.key === key);
