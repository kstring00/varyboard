"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Motion rules for a mobile-heavy audience of every age:
 *  - scroll-scrubbed only, never scroll-jacked
 *  - prefers-reduced-motion => static layout (no GSAP at all)
 *  - lighter parallax on small screens
 */
export type MotionMode = "full" | "light" | "none";

const MotionContext = createContext<MotionMode>("none");

export function useMotionMode(): MotionMode {
  return useContext(MotionContext);
}

export function MotionProvider({ children }: { children: ReactNode }) {
  // Start with "none" so the server render and the first paint are static (no layout shift).
  const [mode, setMode] = useState<MotionMode>("none");

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const small = window.matchMedia("(max-width: 767px)");
    const update = () => setMode(reduce.matches ? "none" : small.matches ? "light" : "full");
    update();
    reduce.addEventListener("change", update);
    small.addEventListener("change", update);
    return () => {
      reduce.removeEventListener("change", update);
      small.removeEventListener("change", update);
    };
  }, []);

  return <MotionContext.Provider value={mode}>{children}</MotionContext.Provider>;
}
