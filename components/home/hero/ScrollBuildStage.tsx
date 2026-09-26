"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { mountScrollBuild } from "./choreography";

/** The pinned 760vh scroll section. Its server-rendered children are animated by choreography.ts. */
export function ScrollBuildStage({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => (ref.current ? mountScrollBuild(ref.current) : undefined), []);
  return (
    <section ref={ref} className="sb-build" aria-labelledby="sb-title">
      {children}
    </section>
  );
}
