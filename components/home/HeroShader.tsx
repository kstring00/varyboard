"use client";

import Link from "next/link";
import { HexShaderBackground } from "@/components/ui/hex-shader";
import { HexEdge } from "@/components/HexEdge";
import { useEffect, useState } from "react";
import { board, formatPrice, products, shipping } from "@/content/facts";
import { buyLinks } from "@/lib/commerce";
import { BoardPanel } from "./BoardPanel";

/**
 * Hero: plaster ground, honeycomb shader, copy only. No photo, no dark ground.
 * HexEdge at the bottom dissolves into the deep pine section beneath.
 */
/** Shader density: 12 on desktop, 9 under 768px. Plain width query, no motion gating. */
function useShaderDensity() {
  // The prop never reaches the DOM, so reading the media query in the initializer causes no
  // hydration mismatch and avoids remounting the canvas after first paint.
  const [density, setDensity] = useState(() => (typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches ? 9 : 12));
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setDensity(mq.matches ? 9 : 12);
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return density;
}

export function HeroShader() {
  const density = useShaderDensity();
  return (
    <section aria-labelledby="hero-title" className="hero" style={{ "--section-bg": "var(--color-plaster-hero)", "--ink": "var(--color-ink)" } as React.CSSProperties}>
      <HexShaderBackground variant="light" density={density} intensity={0.42} timeScale={0.35} className="absolute inset-0" />
      <div className="hero__wash" aria-hidden="true" />

      <div className="hero__inner hero__inner--split">
        <div className="hero__copy">
          <p className="hero__eyebrow">Designed by a physical therapist · Patented</p>
          <h1 id="hero-title" className="hero__title">
            Vary Board
          </h1>
          <p className="hero__pillars">Strength · Mobility · Balance</p>
          <p className="hero__sub">
            The Vary Board is a wall-mounted training board for anyone who wants to stay strong, mobile and steady at home. Hold on, clip in a band, and practice the movements that keep you independent.
          </p>
          <div className="hero__ctas">
            <a href={buyLinks.board} className="hero__btn hero__btn--primary">
              Get the Vary Board · {formatPrice(products.board.price)}
            </a>
            <Link href="#how-it-works" className="hero__btn hero__btn--secondary">
              See how it works
            </Link>
          </div>
          <p className="hero__note">
            {shipping.flatRateLine} · Over 6&apos;3&quot;?{" "}
            <Link href={products.boardXT.path} className="hero__note-link">
              See the {products.boardXT.name}
            </Link>
          </p>
          <ul className="hero__facts" aria-label="At a glance">
            <li>{board.anchorPointsPerSection} anchor points per section</li>
            <li>Indoor / outdoor</li>
            <li>{board.minSpacePerUser} is all you need</li>
          </ul>
        </div>
        <div className="hero__panel">
          <BoardPanel />
        </div>
      </div>

      <HexEdge />
      <div id="hero-end" aria-hidden="true" className="absolute bottom-0 left-0 h-px w-px" />
    </section>
  );
}
