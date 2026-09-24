"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { HexShaderBackground } from "@/components/ui/hex-shader";
import { HexEdge } from "@/components/HexEdge";
import { Stars } from "@/components/ui/Stars";
import { GENRES, GENRE_ORDER } from "@/content/intake";
import { AudienceTicker } from "./AudienceTicker";
import { HeroVisual } from "./HeroVisual";

/**
 * Hero: plaster ground, honeycomb shader, copy on the left, the real board in a layered
 * parallax on the right, the static honeycomb dissolve at the bottom, the audience ticker
 * as the closing element. One H1 on the page: "One wall. Six ways to move better."
 *
 * Load order: the board image is the LCP element and is preloaded. The WebGL shader mounts
 * only after the board has loaded (or after a short fallback), so it never competes for LCP.
 * Live text always sits above the canvases (.hero__inner z 5 > HexEdge 4 > wash 1).
 */
export interface HeroAssets {
  board: { src: string; alt: string; cutout: true } | { src: string; alt: string; cutout: false; width: number; height: number; blurDataURL: string };
  hand: string | null;
  leaf: string | null;
}
export interface HeroReview {
  text: string;
  author: string;
  rating?: number;
}

/** Shader density: 12 on desktop, 9 under 768px. Read in the initializer so the canvas never remounts. */
function useShaderDensity() {
  const [density, setDensity] = useState(() => (typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches ? 9 : 12));
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setDensity(mq.matches ? 9 : 12);
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return density;
}

export function HeroShader({ assets, review }: { assets: HeroAssets; review: HeroReview | null }) {
  const density = useShaderDensity();
  const [shaderReady, setShaderReady] = useState(false);
  const ready = useCallback(() => setShaderReady(true), []);
  // Fallback: if the image is cached and onLoad already fired before hydration, or is slow, start anyway.
  useEffect(() => {
    const id = window.setTimeout(ready, 1800);
    return () => window.clearTimeout(id);
  }, [ready]);

  return (
    <section aria-labelledby="hero-title" className="hero" style={{ "--section-bg": "var(--color-plaster-hero)", "--ink": "var(--color-ink)" } as React.CSSProperties}>
      <div className="hero__stage">
        {shaderReady && <HexShaderBackground variant="light" density={density} intensity={0.42} timeScale={0.35} className="absolute inset-0 hero__shader" />}
        <div className="hero__wash" aria-hidden="true" />

        <div className="hero__inner">
          <div className="hero__copy">
            <p className="hero__eyebrow">Designed by a physical therapist · Patented</p>
            <h1 id="hero-title" className="hero__title">
              One wall.
              <br />
              Six ways to move better.
            </h1>
            <p className="hero__genres">{GENRE_ORDER.map((g) => GENRES[g].label).join(" · ")}</p>
            <p className="hero__sub">A wall-mounted training board that brings the physical therapy gym home, in just 3 × 3 feet.</p>
            <div className="hero__ctas">
              <Link href="#find-your-plan" className="hero__btn hero__btn--primary">
                Find your plan
              </Link>
              <Link href="#how-it-works" className="hero__btn hero__btn--secondary">
                See how it works
              </Link>
            </div>
            {review && (
              <figure className="hero__review">
                {review.rating !== undefined && <Stars value={review.rating} size={14} />}
                <blockquote className="hero__review-text">&ldquo;{review.text}&rdquo;</blockquote>
                <figcaption className="hero__review-by">{review.author}</figcaption>
              </figure>
            )}
          </div>
          <HeroVisual assets={assets} onBoardLoad={ready} />
        </div>

        <HexEdge heightPct={42} scrollLinked={false} />
      </div>
      <AudienceTicker />
      <div id="hero-end" aria-hidden="true" className="absolute bottom-0 left-0 h-px w-px" />
    </section>
  );
}
