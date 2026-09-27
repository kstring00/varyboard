"use client";

import { useEffect } from "react";

/** #faq-<id> opens that question (a native <details>) and brings it into view, on load and on every hash change. */
export function FaqDeepLink() {
  useEffect(() => {
    const open = () => {
      const m = window.location.hash.match(/^#(faq-[\w-]+)$/);
      const el = m ? document.getElementById(m[1]) : null;
      if (!(el instanceof HTMLDetailsElement)) return;
      el.open = true;
      el.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      el.querySelector("summary")?.focus({ preventScroll: true });
    };
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, []);
  return null;
}
