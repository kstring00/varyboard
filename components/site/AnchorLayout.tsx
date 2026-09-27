"use client";

import { useEffect } from "react";

/**
 * Sections below the fold use content-visibility: auto (globals.css), so until they render their
 * heights are estimates and an anchor jump could land in the wrong place. Before any jump (an
 * in-page link click, a hash change, or arriving with a #hash) this turns full layout on for good
 * (html.full-layout) and, when arriving with a hash, re-aligns the target once.
 */
export function AnchorLayout() {
  useEffect(() => {
    const root = document.documentElement;
    const full = () => root.classList.add("full-layout");
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!a) return;
      const url = new URL((a as HTMLAnchorElement).href, location.href);
      if (url.hash && url.pathname === location.pathname) full();
    };
    const align = () => {
      if (!location.hash) return;
      full();
      const el = document.getElementById(decodeURIComponent(location.hash.slice(1)).split("?")[0]);
      requestAnimationFrame(() => el?.scrollIntoView({ block: el instanceof HTMLDetailsElement ? "center" : "start" }));
    };
    document.addEventListener("click", onClick, true);
    window.addEventListener("hashchange", full);
    align();
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("hashchange", full);
    };
  }, []);
  return null;
}
