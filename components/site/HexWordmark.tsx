"use client";

import { useEffect, useRef } from "react";

/**
 * "VARY BOARD" built from hexagons. Each letter is a small stroke skeleton on a 9-row grid
 * of pointy-top cells (odd rows offset half a cell); a cell is "on" when its centre sits
 * within 0.72 cells of a stroke. Two layouts are computed at module load, one line for
 * wide screens and VARY over BOARD for narrow ones, and CSS shows one of them, so the
 * server and client render the same SVG and nothing shifts. Decorative: aria-hidden, the
 * wordmark in the utility row is the real text.
 *
 * Motion (site rules: calm, once, nothing hidden at rest):
 *   - when the footer scrolls into view, a mint wave climbs through the cells from
 *     bottom-left to top-right and settles back to the resting tint.
 *   - desktop hover: cells within about two cells of the pointer deepen and ease back.
 *   - prefers-reduced-motion: static, nothing animates.
 */
const ROWS = 9;
const RH = 0.866; // row pitch in cell units
const TOP = (ROWS - 1) * RH;
type Stroke = [number, number, number, number];
const GLYPHS: Record<string, { w: number; s: Stroke[] }> = {
  V: { w: 5.2, s: [[0, 0, 2.6, TOP], [5.2, 0, 2.6, TOP]] },
  A: { w: 5.4, s: [[0, TOP, 2.7, 0], [2.7, 0, 5.4, TOP], [1.35, TOP * 0.62, 4.05, TOP * 0.62]] },
  R: { w: 4.8, s: [[0, 0, 0, TOP], [0, 0, 3.2, 0], [3.2, 0, 4.4, 0.9], [4.4, 0.9, 4.4, 2.5], [4.4, 2.5, 3.2, 3.45], [3.2, 3.45, 0, 3.45], [2.0, 3.45, 4.8, TOP]] },
  Y: { w: 5.2, s: [[0, 0, 2.6, TOP * 0.5], [5.2, 0, 2.6, TOP * 0.5], [2.6, TOP * 0.5, 2.6, TOP]] },
  B: { w: 4.8, s: [[0, 0, 0, TOP], [0, 0, 2.6, 0], [2.6, 0, 3.8, 0.9], [3.8, 0.9, 3.8, 2.3], [3.8, 2.3, 2.4, 3.3], [2.4, 3.3, 0, 3.3], [2.4, 3.3, 4.8, 4.5], [4.8, 4.5, 4.8, 5.7], [4.8, 5.7, 3.4, TOP], [3.4, TOP, 0, TOP]] },
  O: { w: 5.0, s: [[1.3, 0, 3.7, 0], [3.7, 0, 5.0, 1.3], [5.0, 1.3, 5.0, 5.6], [5.0, 5.6, 3.7, TOP], [3.7, TOP, 1.3, TOP], [1.3, TOP, 0, 5.6], [0, 5.6, 0, 1.3], [0, 1.3, 1.3, 0]] },
  D: { w: 4.8, s: [[0, 0, 0, TOP], [0, 0, 2.8, 0], [2.8, 0, 4.8, 1.7], [4.8, 1.7, 4.8, 5.2], [4.8, 5.2, 2.8, TOP], [2.8, TOP, 0, TOP]] },
};
const GAP = 2;
const WORD_GAP = 5;

function segDist(px: number, py: number, [x1, y1, x2, y2]: Stroke) {
  const vx = x2 - x1;
  const vy = y2 - y1;
  const len = vx * vx + vy * vy;
  let t = len ? ((px - x1) * vx + (py - y1) * vy) / len : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * vx), py - (y1 + t * vy));
}
function rng(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** One word as cells, starting at integer column ox and an even row offset (keeps the grid aligned). */
function wordCells(word: string, ox: number, rowOff: number) {
  const out: { x: number; y: number }[] = [];
  for (const ch of word) {
    const g = GLYPHS[ch];
    for (let row = 0; row < ROWS; row++) {
      const shift = row % 2 ? 0.5 : 0;
      for (let c = -1; c <= Math.ceil(g.w) + 1; c++) {
        const lx = c + shift;
        const ly = row * RH;
        if (Math.min(...g.s.map((s) => segDist(lx, ly, s))) < 0.72) out.push({ x: ox + lx, y: ly + rowOff * RH });
      }
    }
    ox += Math.round(g.w + GAP);
  }
  return { cells: out, end: ox };
}

const S = 22; // circumradius in SVG units
const UNIT = S * Math.sqrt(3);
const PAD = S * 1.1;

interface Cell {
  cx: number;
  cy: number;
  pts: string;
  delay: number;
  rest: boolean;
}
interface Layout {
  cells: Cell[];
  vw: number;
  vh: number;
}
function layout(stacked: boolean): Layout {
  const a = wordCells("VARY", 0, 0);
  const b = stacked ? wordCells("BOARD", 0, 10) : wordCells("BOARD", a.end + WORD_GAP - GAP, 0);
  const raw = a.cells.concat(b.cells);
  const xs = raw.map((c) => c.x);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...raw.map((c) => c.y));
  const r = rng(11);
  const cells = raw.map((c) => {
    const cx = PAD + (c.x - minX) * UNIT;
    const cy = PAD + c.y * UNIT;
    const t = ((c.x - minX) / (maxX - minX)) * 0.62 + (1 - c.y / maxY) * 0.38;
    const pts: string[] = [];
    for (let i = 0; i < 6; i++) {
      const ang = Math.PI / 2 + (i * Math.PI) / 3;
      pts.push(`${(cx + S * 0.94 * Math.cos(ang)).toFixed(1)},${(cy + S * 0.94 * Math.sin(ang)).toFixed(1)}`);
    }
    return { cx, cy, pts: pts.join(" "), delay: Math.round(t * 1500) / 1000, rest: r() < 0.12 };
  });
  return { cells, vw: (maxX - minX) * UNIT + PAD * 2, vh: maxY * UNIT + PAD * 2 };
}
const WIDE = layout(false);
const STACKED = layout(true);

function Mark({ data, variant }: { data: Layout; variant: "wide" | "stacked" }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const polys = Array.from(svg.querySelectorAll<SVGPolygonElement>("polygon"));
    const cleanups: (() => void)[] = [];

    // Climb once, the first time this layout is on screen (the hidden layout never intersects).
    if (!reduce) {
      const play = () => {
        svg.classList.add("ft-vary--play");
        const done = window.setTimeout(() => svg.classList.remove("ft-vary--play"), 3000);
        cleanups.push(() => window.clearTimeout(done));
      };
      if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver(
          ([e]) => {
            if (e.isIntersecting) {
              io.disconnect();
              play();
            }
          },
          { threshold: 0.35 },
        );
        io.observe(svg);
        cleanups.push(() => io.disconnect());
      } else play();
    }

    // Desktop hover: nearby cells deepen. Nothing on touch.
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      const pt = svg.createSVGPoint();
      const lim = UNIT * 2.1;
      const move = (e: PointerEvent) => {
        const m = svg.getScreenCTM();
        if (!m) return;
        pt.x = e.clientX;
        pt.y = e.clientY;
        const q = pt.matrixTransform(m.inverse());
        polys.forEach((p, i) => p.classList.toggle("ft-cell--near", Math.hypot(data.cells[i].cx - q.x, data.cells[i].cy - q.y) < lim));
      };
      const leave = () => polys.forEach((p) => p.classList.remove("ft-cell--near"));
      svg.addEventListener("pointermove", move);
      svg.addEventListener("pointerleave", leave);
      cleanups.push(() => {
        svg.removeEventListener("pointermove", move);
        svg.removeEventListener("pointerleave", leave);
      });
    }
    return () => cleanups.forEach((f) => f());
  }, [data]);

  return (
    <svg ref={ref} className={`ft-vary ft-vary--${variant}`} viewBox={`0 0 ${data.vw.toFixed(1)} ${data.vh.toFixed(1)}`} aria-hidden="true" focusable="false">
      {data.cells.map((c, i) => (
        <polygon key={i} points={c.pts} className={`ft-cell${c.rest ? " ft-cell--rest" : ""}`} style={{ animationDelay: `${c.delay}s` }} />
      ))}
    </svg>
  );
}

export function HexWordmark() {
  return (
    <>
      <Mark data={WIDE} variant="wide" />
      <Mark data={STACKED} variant="stacked" />
    </>
  );
}
