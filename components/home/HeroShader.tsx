"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { HexShaderBackground } from "@/components/ui/hex-shader";
import { HexEdge } from "@/components/HexEdge";
import { useMotionMode } from "@/components/motion/MotionProvider";
import { board, formatPrice, products, shipping } from "@/content/facts";

const CUTOUT = { src: "/images/cutouts/board-hero.png", width: 674, height: 1269 };

/**
 * Hero: honeycomb shader ground, the real board as a cutout, honeycomb bottom edge.
 * Copy on #e8e5de over #0b0c0e (AA+). No health claims.
 */
export function HeroShader() {
  const mode = useMotionMode();
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  // Pointer parallax 1.5% on the product stage (desktop pointer only).
  useEffect(() => {
    const el = root.current;
    const st = stage.current;
    if (!el || !st || mode !== "full") return;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const tick = () => {
      raf = 0;
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      st.style.setProperty("--px", `${(cx * 1.5).toFixed(3)}%`);
      st.style.setProperty("--py", `${(cy * 1.5).toFixed(3)}%`);
      if (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) raf = requestAnimationFrame(tick);
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [mode]);

  const density = mode === "light" ? 10 : 14;

  return (
    <section ref={root} aria-labelledby="hero-title" className="hero" data-dark-hero style={{ "--section-bg": "var(--color-plaster)", "--ink": "var(--color-ink)" } as React.CSSProperties}>
      <HexShaderBackground variant="dark" density={density} className="absolute inset-0" />
      <div className="hero__scrim" aria-hidden="true" />

      <div className="hero__grid">
        {/* RIGHT: the real product. First in DOM on phones (order via CSS on desktop). */}
        <div className="hero__stage" ref={stage}>
          <div className="hero__float">
            <Image
              src={CUTOUT.src}
              alt="The Vary Board: a teal honeycomb platform with hexagonal anchor points on a grey backer with side rails"
              width={CUTOUT.width}
              height={CUTOUT.height}
              priority
              fetchPriority="high"
              sizes="(min-width: 768px) 30vw, 60vw"
              className="hero__board"
            />
            {/* Hotspots: real, focusable links pinned to the cutout */}
            <a href="#how-it-works" className="hero__hotspot hero__hotspot--left" style={{ "--x": "30%", "--y": "27%" } as React.CSSProperties}>
              <span className="hero__hotspot-dot" />
              <span className="hero__hotspot-leader" />
              <span className="hero__hotspot-badge" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 10v4M20 10v4M7 8v8M17 8v8M7 12h10" />
                </svg>
              </span>
              <span className="hero__hotspot-label">
                <span>Strength</span>
                <small>Band anchor</small>
              </span>
            </a>
            <a href="#how-it-works" className="hero__hotspot hero__hotspot--right" style={{ "--x": "94%", "--y": "58%" } as React.CSSProperties}>
              <span className="hero__hotspot-dot" />
              <span className="hero__hotspot-leader" />
              <span className="hero__hotspot-badge" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v18M5 21h14M3 9l3-4 3 4M3 9a3 3 0 0 0 6 0M15 9l3-4 3 4M15 9a3 3 0 0 0 6 0M8 5h8" />
                </svg>
              </span>
              <span className="hero__hotspot-label">
                <span>Balance</span>
                <small>Handrail</small>
              </span>
            </a>
          </div>
        </div>

        {/* LEFT: copy */}
        <div className="hero__copy">
          <p className="hero__eyebrow">Designed by a physical therapist · Patented</p>
          <h1 id="hero-title" className="hero__title">
            Strength.
            <br />
            Mobility.
            <br />
            Balance.
          </h1>
          <p className="hero__sub">
            A wall-mounted training board for adults who want to stay strong, mobile and steady at home. Hold on, clip in a band, and practice the movements that keep you independent.
          </p>
          <div className="hero__ctas">
            <a href="#pricing" className="hero__btn hero__btn--primary">
              Choose your board
            </a>
            <Link href="#how-it-works" className="hero__btn hero__btn--secondary">
              See how it works
            </Link>
          </div>
          <p className="hero__price">
            From {formatPrice(products.board.price)} · {shipping.flatRateLine.replace(" $9.99", "")}
          </p>
          <ul className="hero__facts" aria-label="At a glance">
            <li>{board.anchorPointsPerSection} anchor points per section</li>
            <li>Indoor / outdoor</li>
            <li>{board.minSpacePerUser} is all you need</li>
          </ul>
        </div>
      </div>

      <HexEdge />
      {/* Sentinel for the sticky buy bar: inside the hero box so it can intersect the viewport. */}
      <div id="hero-end" aria-hidden="true" className="absolute bottom-0 left-0 h-px w-px" />
    </section>
  );
}
