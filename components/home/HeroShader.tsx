"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { HexShaderBackground } from "@/components/ui/hex-shader";
import { HexEdge } from "@/components/HexEdge";
import { AudienceTicker } from "./AudienceTicker";
import { DESKTOP_MEDIA } from "./heroMedia";

/**
 * Hero: plaster ground with the existing honeycomb shader, copy on the left, the real photo on
 * the right (desktop) or below the copy (phones and tablets), the static honeycomb dissolve drawn
 * over the photo's bottom edge, and the audience ticker as the closing element.
 * One H1 on the page: "One wall. Six ways to move better."
 *
 * Load order: the photo is the LCP element and is preloaded (Hero.tsx). The WebGL shader mounts
 * only after the photo has loaded (or after a short fallback), so it never competes for LCP.
 * The photo never animates. Live text sits above everything (.hero__inner z 5 > edge 4 > photo 2).
 */
export interface HeroPhoto {
  alt: string;
  width: number;
  height: number;
  desktop: { avif: string; webp: string; sizes: string; fallback: string };
  mobile: { avif: string; webp: string; sizes: string };
  /** Width of the photo's left-edge fade. */
  fade: string;
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

export function HeroShader({ photo }: { photo: HeroPhoto }) {
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
            <p className="hero__sub">A physical therapist&apos;s gym on one wall, for the strength, balance and mobility you need for the things you love.</p>
            <div className="hero__ctas">
              <Link href="#find-your-plan" className="hero__btn hero__btn--primary">
                Find your plan
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <Link href="#how-it-works" className="hero__btn hero__btn--secondary">
                See how it works
              </Link>
            </div>
          </div>
        </div>

        <picture className="hero__photo" style={{ "--photo-ratio": `${photo.width} / ${photo.height}`, "--photo-fade": photo.fade } as React.CSSProperties}>
          <source media={DESKTOP_MEDIA} type="image/avif" srcSet={photo.desktop.avif} sizes={photo.desktop.sizes} />
          <source media={DESKTOP_MEDIA} type="image/webp" srcSet={photo.desktop.webp} sizes={photo.desktop.sizes} />
          <source type="image/avif" srcSet={photo.mobile.avif} sizes={photo.mobile.sizes} />
          <source type="image/webp" srcSet={photo.mobile.webp} sizes={photo.mobile.sizes} />
          <img
            src={photo.desktop.fallback}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            fetchPriority="high"
            decoding="async"
            onLoad={ready}
            className="hero__photo-img"
          />
        </picture>

        <HexEdge heightPct={42} scrollLinked={false} className="hero__edge" />
      </div>
      <AudienceTicker />
      <div id="hero-end" aria-hidden="true" className="absolute bottom-0 left-0 h-px w-px" />
    </section>
  );
}
