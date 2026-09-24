"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useMotionMode } from "@/components/motion/MotionProvider";
import type { HeroAssets } from "./HeroShader";

/**
 * The hero's right column: real layers, back to front.
 *   plaster wall (section) -> honeycomb shader (stage) -> board photo -> hand + band -> blurred leaf
 * Parallax: each layer translates at its own depth as the page scrolls (board least, leaf most),
 * driven by one rAF that reads scrollY; nothing else moves the board. On load a ring of outlined
 * honeycomb cells drifts inward toward the board and settles (CSS keyframes, slow ease-out).
 * Motion mode "none" (prefers-reduced-motion): static composition.
 */
const DEPTH = { board: 0.035, hand: 0.075, leaf: 0.14 } as const;

/* Settled positions of the load cells around the board, in a 600x720 box, with their drift vector. */
const CELLS: { x: number; y: number; r: number; dx: number; dy: number; d: number }[] = [
  { x: 92, y: 96, r: 30, dx: -70, dy: -60, d: 0 },
  { x: 508, y: 76, r: 24, dx: 70, dy: -70, d: 120 },
  { x: 548, y: 250, r: 34, dx: 90, dy: -10, d: 240 },
  { x: 62, y: 300, r: 22, dx: -90, dy: 0, d: 180 },
  { x: 530, y: 470, r: 26, dx: 80, dy: 40, d: 360 },
  { x: 74, y: 520, r: 32, dx: -80, dy: 50, d: 300 },
  { x: 150, y: 672, r: 22, dx: -50, dy: 80, d: 480 },
  { x: 470, y: 660, r: 28, dx: 60, dy: 80, d: 420 },
];
const hex = (cx: number, cy: number, r: number) => Array.from({ length: 6 }, (_, k) => { const a = (Math.PI / 180) * (60 * k - 90); return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`; }).join(" ");

export function HeroVisual({ assets, onBoardLoad }: { assets: HeroAssets; onBoardLoad: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const mode = useMotionMode();

  useEffect(() => {
    const el = root.current;
    if (!el || mode === "none") return;
    const layers = [...el.querySelectorAll<HTMLElement>("[data-depth]")];
    const strength = mode === "full" ? 1 : 0.5;
    let raf = 0;
    const apply = () => {
      raf = 0;
      const y = window.scrollY;
      for (const l of layers) l.style.transform = `translate3d(0, ${(-y * Number(l.dataset.depth) * strength).toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      for (const l of layers) l.style.transform = "";
    };
  }, [mode]);

  const b = assets.board;
  return (
    <div ref={root} className={`hero__visual ${b.cutout ? "hero__visual--cutout" : "hero__visual--photo"}`}>
      <svg className="hero__cells" viewBox="0 0 600 720" aria-hidden="true" focusable="false">
        {CELLS.map((c, i) => (
          <polygon key={i} points={hex(c.x, c.y, c.r)} className="hero__cell" style={{ "--dx": `${c.dx}px`, "--dy": `${c.dy}px`, animationDelay: `${c.d}ms` } as React.CSSProperties} />
        ))}
      </svg>

      {/* Board: the LCP image. Preloaded, sized, never animated beyond the parallax translate. */}
      <div className="hero__layer hero__layer--board" data-depth={DEPTH.board}>
        {b.cutout ? (
          <Image src={b.src} alt={b.alt} fill priority fetchPriority="high" sizes="(min-width: 1024px) 34vw, 80vw" className="hero__board hero__board--cutout" onLoad={onBoardLoad} />
        ) : (
          <Image src={b.src} alt={b.alt} fill priority fetchPriority="high" sizes="(min-width: 1024px) 34vw, 80vw" placeholder="blur" blurDataURL={b.blurDataURL} className="hero__board hero__board--photo" onLoad={onBoardLoad} />
        )}
      </div>

      {assets.hand && (
        <div className="hero__layer hero__layer--hand" data-depth={DEPTH.hand} aria-hidden="true">
          <Image src={assets.hand} alt="" fill sizes="(min-width: 1024px) 34vw, 80vw" className="hero__hand" />
        </div>
      )}
      {assets.leaf && (
        <div className="hero__layer hero__layer--leaf" data-depth={DEPTH.leaf} aria-hidden="true">
          <Image src={assets.leaf} alt="" fill sizes="(min-width: 1024px) 34vw, 80vw" className="hero__leaf" />
        </div>
      )}
    </div>
  );
}
