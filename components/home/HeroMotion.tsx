"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMotionMode } from "@/components/motion/MotionProvider";

/**
 * Light, scroll-scrubbed parallax for the hero visual. The server render is the
 * final static layout; motion is layered on afterwards, so there is no layout
 * shift and reduced-motion users simply get the static page.
 */
export function HeroMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const mode = useMotionMode();

  useEffect(() => {
    if (mode === "none" || !ref.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const root = ref.current;
    const strength = mode === "full" ? 1 : 0.45;
    const ctx = gsap.context(() => {
      gsap.to("[data-hero-photo]", {
        yPercent: -8 * strength,
        scale: 1 + 0.04 * strength,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: 0.6 },
      });
      gsap.to("[data-hero-inset]", {
        yPercent: 18 * strength,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: 0.6 },
      });
      if (mode === "full") {
        // Desktop only: the copy drifts a little slower than the page. Never fades (readability first).
        gsap.to("[data-hero-copy]", {
          yPercent: 8,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: 0.6 },
        });
      }
    }, root);
    return () => ctx.revert();
  }, [mode]);

  return <div ref={ref}>{children}</div>;
}
