"use client";

import { useEffect, useRef } from "react";

/**
 * The word VARY built from hexagons. Each letter is a small skeleton on a 6 x 9 grid of
 * pointy-top cells (odd rows offset half a cell); a cell is "on" when its centre sits within
 * 0.72 cells of a stroke. The cells are computed once at module load, so the SVG is the
 * same on the server and the client. Decorative: aria-hidden, the wordmark in the utility
 * row is the real text.
 *
 * Motion (site rules: calm, once, nothing hidden at rest):
 *   - when the footer scrolls into view, a soft mint fill climbs through the cells from
 *     bottom-left to top-right (about 1.6s in all) and fades back; a few seeded cells stay
 *     faintly mint.
 *   - desktop hover: cells within about two cells of the pointer tint mint and ease back.
 *   - prefers-reduced-motion: static outlines with the faint cells, nothing animates.
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
};
const GAP = 2;

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
function build(word: string): { cells: Cell[]; vw: number; vh: number } {
  const raw: { x: number; y: number }[] = [];
  let ox = 0;
  for (const ch of word) {
    const g = GLYPHS[ch];
    for (let row = 0; row < ROWS; row++) {
      const shift = row % 2 ? 0.5 : 0;
      for (let c = -1; c <= Math.ceil(g.w) + 1; c++) {
        const lx = c + shift;
        const ly = row * RH;
        if (Math.min(...g.s.map((s) => segDist(lx, ly, s))) < 0.72) raw.push({ x: ox + lx, y: ly });
      }
    }
    ox += Math.round(g.w + GAP);
  }
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
      const a = Math.PI / 2 + (i * Math.PI) / 3;
      pts.push(`${(cx + S * 0.94 * Math.cos(a)).toFixed(1)},${(cy + S * 0.94 * Math.sin(a)).toFixed(1)}`);
    }
    return { cx, cy, pts: pts.join(" "), delay: Math.round(t * 600) / 1000, rest: r() < 0.12 };
  });
  return { cells, vw: (maxX - minX) * UNIT + PAD * 2, vh: maxY * UNIT + PAD * 2 };
}
const VARY = build("VARY");

export function HexWordmark() {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const polys = Array.from(svg.querySelectorAll<SVGPolygonElement>("polygon"));
    const cleanups: (() => void)[] = [];

    // Climb once, when the footer comes into view.
    if (!reduce) {
      const play = () => {
        svg.classList.add("ft-vary--play");
        const done = window.setTimeout(() => svg.classList.remove("ft-vary--play"), 2200);
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

    // Desktop hover: nearby cells tint mint. Nothing on touch.
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      const pt = svg.createSVGPoint();
      const lim = UNIT * 2.1;
      const move = (e: PointerEvent) => {
        const m = svg.getScreenCTM();
        if (!m) return;
        pt.x = e.clientX;
        pt.y = e.clientY;
        const q = pt.matrixTransform(m.inverse());
        polys.forEach((p, i) => p.classList.toggle("ft-cell--near", Math.hypot(VARY.cells[i].cx - q.x, VARY.cells[i].cy - q.y) < lim));
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
  }, []);

  return (
    <svg ref={ref} className="ft-vary" viewBox={`0 0 ${VARY.vw.toFixed(1)} ${VARY.vh.toFixed(1)}`} aria-hidden="true" focusable="false">
      {VARY.cells.map((c, i) => (
        <polygon key={i} points={c.pts} className={`ft-cell${c.rest ? " ft-cell--rest" : ""}`} style={{ animationDelay: `${c.delay}s` }} />
      ))}
    </svg>
  );
}
