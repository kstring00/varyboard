"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMotionMode } from "@/components/motion/MotionProvider";
import { images } from "@/content/images";
import { board, formatPrice, products } from "@/content/facts";
import { buyLinks } from "@/lib/commerce";
import type { SceneQuality } from "./HeroScene";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false, loading: () => null });

type Visual = "pending" | "scene" | "static";

/** Decide once, on the client, whether this device gets the real-time scene. */
function detectVisual(motion: "full" | "light" | "none"): Visual {
  if (typeof window === "undefined") return "pending";
  if (motion === "none") return "static";
  try {
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    if (nav.connection?.saveData) return "static";
    if (nav.deviceMemory && nav.deviceMemory <= 2) return "static";
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") ?? c.getContext("webgl");
    if (!gl) return "static";
  } catch {
    return "static";
  }
  return "scene";
}

const callouts = [
  { title: board.pillars[0].title, line: "Clip a band to any of 47 anchors", icon: "strength" as const },
  { title: board.pillars[1].title, line: "Handholds at every height", icon: "mobility" as const },
  { title: board.pillars[2].title, line: "A steady hold while you stand", icon: "balance" as const },
];

export function Hero3D({ modelUrl = null }: { modelUrl?: string | null }) {
  const motion = useMotionMode();
  const [visual, setVisual] = useState<Visual>("pending");
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const price = formatPrice(products.board.price);

  useEffect(() => {
    // MotionProvider starts at "none" before its own effect runs; wait one tick for the real mode.
    const id = window.setTimeout(() => setVisual(detectVisual(motion)), 0);
    return () => window.clearTimeout(id);
  }, [motion]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "120px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onReady = useCallback(() => setReady(true), []);
  const quality: SceneQuality = motion === "full" ? "full" : "light";
  const showScene = visual === "scene";

  return (
    <section ref={sectionRef} aria-labelledby="hero-title" className="hero3d relative isolate overflow-hidden bg-paper">
      {/* Visual panel: a real photo poster first (LCP), the live scene fades in over it. */}
      <div className="hero3d__panel">
        <Image
          src={images.heroGym.src}
          alt={images.heroGym.alt}
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          placeholder="blur"
          blurDataURL={images.heroGym.blurDataURL}
          className={`object-cover object-[62%_center] transition-opacity duration-700 motion-reduce:transition-none ${showScene && ready ? "opacity-0" : "opacity-100"}`}
        />
        <div className="hero3d__scrim" aria-hidden="true" />
        {showScene && (
          <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}>
            <HeroScene quality={quality} active={active} modelUrl={modelUrl} onReady={onReady} callouts={callouts} />
          </div>
        )}
        {showScene && quality === "full" && (
          <div className="hero3d__orbit" aria-hidden="true">
            <span>Drag to orbit</span>
            <span className="hero3d__orbit-line" />
            <span className="hero3d__orbit-ring">360°</span>
          </div>
        )}
      </div>

      {/* Copy */}
      <div className="container-site relative z-10 grid min-h-[inherit] items-center">
        <div className="hero3d__copy">
          <p className="eyebrow">Wall-mounted training board</p>
          <h1 id="hero-title" className="mt-4 font-display text-[2.75rem] font-light uppercase leading-[0.98] tracking-[0.01em] sm:text-[3.6rem] lg:text-[4.6rem] xl:text-[5.2rem]">
            Strength.
            <br />
            Mobility.
            <br />
            Balance.
          </h1>
          <p className="mt-6 max-w-xl text-xl text-ink-2">
            A patented wall-mounted training board designed by a physical therapist. Hold on, clip in a
            band and practice the movements that help you stay strong, mobile and steady at home.
          </p>

          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[0.95rem] font-semibold uppercase tracking-[0.14em] text-ink-2 lg:sr-only" aria-label="What it helps you practice">
            {board.pillars.map((p) => (
              <li key={p.title}>{p.title}</li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a href={buyLinks.board} className="btn-primary px-7 text-lg">
              Get the Vary Board ({price})
            </a>
            <Link href="#how-it-works" className="btn-secondary px-7 text-lg">
              See how it works
            </Link>
          </div>
          <p className="mt-5 flex items-center gap-2 text-[1rem] font-medium text-ink-2">
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-teal-deep)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l7 3.5v5.5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V5.5L12 2z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            {board.trustLine}
          </p>
        </div>

        <ul className="hero3d__facts" aria-label="At a glance">
          <li>
            <span>Patented</span>
            <span>hexagon anchor system</span>
          </li>
          <li>
            <span>{products.board.specs[0].value} sections</span>
            <span>installed height {products.board.specs[1].value}</span>
          </li>
          <li>
            <span>Indoor / outdoor</span>
            <span>molded {board.material}</span>
          </li>
        </ul>
      </div>
      <div id="hero-end" aria-hidden="true" className="h-px" />
    </section>
  );
}
