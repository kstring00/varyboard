"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BodyMap } from "@/components/plan/BodyMap";
import { REGIONS, type Region } from "@/content/exercises";
import type { Lane } from "@/content/intake";
import { intakeHref } from "@/lib/intake";

/** Step 3 as the body map: tap an area, the chosen hexagon glows, then the plan page opens. */
export function AreaStep({ lane, concern }: { lane: Lane; concern: string }) {
  const router = useRouter();
  const [picked, setPicked] = useState<Region | null>(null);
  const go = (r: Region) => {
    setPicked(r);
    const href = intakeHref.result(lane, concern, { area: r });
    router.prefetch(href);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => router.push(href), reduce ? 0 : 260);
  };
  return (
    <div className="ix-area">
      <BodyMap value={picked} onSelect={go} wholeLabel="Whole body" sizes="(min-width: 1024px) 22vw, 60vw" />
      <p className="ix-area__hint" aria-live="polite">
        {picked ? `Building a plan for ${REGIONS.find((r) => r.id === picked)?.label.toLowerCase()}…` : "Tap the area you want to work on."}
      </p>
    </div>
  );
}
