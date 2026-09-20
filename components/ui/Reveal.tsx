"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Fade-up on first entry into the viewport. Pure CSS transition, so it is automatically
 * static under prefers-reduced-motion (see globals.css). Never blocks content: elements
 * start visible until JS marks them, and are revealed at once if IntersectionObserver is missing.
 */
export function Reveal({ children, as: Tag = "div", className = "", delay = 0 }: { children: ReactNode; as?: ElementType; className?: string; delay?: number }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.dataset.reveal = "in";
      return;
    }
    el.dataset.reveal = "out";
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.dataset.reveal = "in";
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ transitionDelay: delay ? `${delay}ms` : undefined }}>
      {children}
    </Tag>
  );
}
