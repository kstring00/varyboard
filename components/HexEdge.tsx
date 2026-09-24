"use client";

import { useEffect, useRef } from "react";

/**
 * HexEdge: the hero never ends in a straight line.
 *
 * One <canvas> pinned to the bottom of the hero (height = `heightPct` of the hero).
 * The next section's background (CSS var --section-bg) fills whole hexagon cells.
 * At rest, only the row hanging below the hero is filled, so the hero's bottom edge
 * is the pointed bottoms of whole hexagons with the next background in the notches.
 * As the page scrolls, the front climbs cell by cell: each cell flips whole over
 * `feather` rows, offset by a seeded per-cell jitter of up to `jitter` rows, so the
 * front is always a ragged honeycomb. Above the front the honeycomb dissolves:
 * `outline` rows of 1px hexagon outlines, then `ticks` rows of short strokes at each
 * vertex (neighbours complete the Y), fading to nothing.
 *
 * Motion: lerp 0.1 toward the scroll target, running only while target != current.
 * prefers-reduced-motion: drawn static at the current scroll position.
 * Zero dependencies.
 */
export interface HexEdgeProps {
  /** Hexagon width, flat side to flat side, in CSS px. */
  cell?: number;
  /** Rows over which one cell flips from empty to filled. */
  feather?: number;
  /** Fraction of the hero height the page must scroll for the front to reach the top. */
  reach?: number;
  /** Rows of thin hexagon outlines above the solid front. */
  outline?: number;
  /** Rows of vertex marks beyond the outlines. */
  ticks?: number;
  /** Length of each vertex stroke as a fraction of the hex circumradius. */
  tickLen?: number;
  /** Max per-cell jitter, in rows. */
  jitter?: number;
  /** Canvas height as a percentage of the hero. */
  heightPct?: number;
  /** Seed for the stable per-cell jitter. */
  seed?: number;
  /** false = the front never moves: the at-rest dissolve is drawn once and only redrawn on resize. */
  scrollLinked?: boolean;
}

/** Small, fast, deterministic hash -> [0, 1). Same (col,row,seed) always gives the same value. */
function hash(col: number, row: number, seed: number): number {
  let h = Math.imul(col + 0x7fff, 374761393) ^ Math.imul(row + 0x7fff, 668265263) ^ Math.imul(seed, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

export function HexEdge({
  cell = 34,
  feather = 0.22,
  reach = 0.78,
  outline = 2.2,
  ticks = 4.5,
  tickLen = 0.22,
  jitter = 1.6,
  heightPct = 85,
  seed = 7,
  scrollLinked = true,
}: HexEdgeProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const hero = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !hero || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const R = cell / Math.sqrt(3); // circumradius (pointy-top hexagon)
    const rowPitch = 1.5 * R;
    let W = 0;
    let H = 0;
    let cols = 0;
    let rows = 0;
    let heroH = 1;
    let fill = "#eeeae2";
    let ink = "#17211f";
    let current = 0;
    let target = 0;
    let raf = 0;

    // Vertex offsets for a pointy-top hexagon, starting at the top vertex, clockwise.
    const VX: number[] = [];
    const VY: number[] = [];
    for (let k = 0; k < 6; k++) {
      const a = (-90 + 60 * k) * (Math.PI / 180);
      VX.push(Math.cos(a));
      VY.push(Math.sin(a));
    }

    const readColors = () => {
      const cs = getComputedStyle(canvas);
      fill = cs.getPropertyValue("--section-bg").trim() || fill;
      ink = cs.getPropertyValue("--ink").trim() || ink;
    };

    // Alpha is quantized into a few buckets so each bucket is one stroke call, not one per cell.
    const BUCKETS = 8;
    const hexInto = (path: Path2D, cx: number, cy: number, r: number) => {
      path.moveTo(cx + VX[0] * r, cy + VY[0] * r);
      for (let k = 1; k < 6; k++) path.lineTo(cx + VX[k] * r, cy + VY[k] * r);
      path.closePath();
    };
    const marksInto = (path: Path2D, cx: number, cy: number, t: number) => {
      for (let k = 0; k < 6; k++) {
        const x = cx + VX[k] * R;
        const y = cy + VY[k] * R;
        const kn = (k + 1) % 6;
        const kp = (k + 5) % 6;
        path.moveTo(x, y);
        path.lineTo(x + (cx + VX[kn] * R - x) * t, y + (cy + VY[kn] * R - y) * t);
        path.moveTo(x, y);
        path.lineTo(x + (cx + VX[kp] * R - x) * t, y + (cy + VY[kp] * R - y) * t);
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const frontRow = current * rows;
      const cy0 = H - R; // bottom full row: its bottom vertex sits on the hero's bottom edge
      const t = tickLen; // stroke length as a fraction of the edge (edge length == R)

      const solid = new Path2D();
      const partial = Array.from({ length: BUCKETS }, () => new Path2D());
      const lines = Array.from({ length: BUCKETS }, () => new Path2D());
      const marks = Array.from({ length: BUCKETS }, () => new Path2D());
      const bucket = (a: number) => Math.min(BUCKETS - 1, Math.floor(a * BUCKETS));

      for (let i = -1; i <= rows; i++) {
        const cy = cy0 - i * rowPitch;
        if (cy + R < 0) break;
        const shift = ((i % 2) + 2) % 2 ? cell / 2 : 0;
        for (let c = -1; c <= cols; c++) {
          const cx = c * cell + shift;
          if (i === -1) {
            hexInto(solid, cx, cy, R + 0.7); // hanging row: always the next section's background
            continue;
          }
          const d = i + hash(c, i, seed) * jitter - frontRow; // rows above the front
          if (d <= 0) hexInto(solid, cx, cy, R + 0.7);
          else if (d < feather) hexInto(partial[bucket(1 - d / feather)], cx, cy, R + 0.7);
          if (d > 0 && d < outline) hexInto(lines[bucket(1 - d / outline)], cx, cy, R);
          else if (d >= outline && d < outline + ticks) marksInto(marks[bucket(1 - (d - outline) / ticks)], cx, cy, t);
        }
      }

      ctx.fillStyle = fill;
      ctx.fill(solid);
      for (let b = 0; b < BUCKETS; b++) {
        ctx.globalAlpha = (b + 0.5) / BUCKETS;
        ctx.fill(partial[b]);
      }
      ctx.strokeStyle = ink;
      ctx.lineWidth = 1;
      ctx.lineCap = "round";
      for (let b = 0; b < BUCKETS; b++) {
        const a = (b + 0.5) / BUCKETS;
        ctx.globalAlpha = 0.22 * a; // thin outlines, low contrast
        ctx.stroke(lines[b]);
        ctx.globalAlpha = 0.16 * a; // vertex marks, lower still
        ctx.stroke(marks[b]);
      }
      ctx.globalAlpha = 1;
    };

    const build = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const rect = canvas.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      heroH = hero.getBoundingClientRect().height || 1;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(W / cell) + 1;
      rows = Math.ceil(H / rowPitch) + 1;
      readColors();
      updateTarget();
      if (reduce || !scrollLinked) current = target;
      draw();
    };

    const step = () => {
      raf = 0;
      current += (target - current) * 0.1;
      if (Math.abs(target - current) < 0.0005) {
        current = target;
        draw();
        return;
      }
      draw();
      raf = requestAnimationFrame(step);
    };

    const updateTarget = () => {
      target = scrollLinked ? Math.min(1, Math.max(0, window.scrollY / (heroH * reach))) : 0;
    };

    const onScroll = () => {
      updateTarget();
      if (reduce) {
        current = target;
        if (!raf) raf = requestAnimationFrame(() => ((raf = 0), draw()));
        return;
      }
      if (!raf && target !== current) raf = requestAnimationFrame(step);
    };

    let buildRaf = 0;
    const scheduleBuild = () => {
      if (!buildRaf) buildRaf = requestAnimationFrame(() => ((buildRaf = 0), build()));
    };
    let ro: ResizeObserver | null = null;
    const start = () => {
      build();
      ro = new ResizeObserver(scheduleBuild);
      ro.observe(hero);
      if (scrollLinked) window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", scheduleBuild);
    };
    const hasIdle = "requestIdleCallback" in window;
    const idleId = hasIdle ? window.requestIdleCallback(start, { timeout: 600 }) : window.setTimeout(start, 120);
    return () => {
      if (hasIdle) window.cancelIdleCallback(idleId);
      else window.clearTimeout(idleId);
      ro?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", scheduleBuild);
      if (raf) cancelAnimationFrame(raf);
      if (buildRaf) cancelAnimationFrame(buildRaf);
    };
  }, [cell, feather, reach, outline, ticks, tickLen, jitter, seed, scrollLinked]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{ position: "absolute", left: 0, right: 0, bottom: 0, width: "100%", height: `${heightPct}%`, pointerEvents: "none", zIndex: 4, display: "block" }}
    />
  );
}
