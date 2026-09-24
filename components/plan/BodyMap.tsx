"use client";

import Image from "next/image";
import { useRef, type KeyboardEvent, type Ref } from "react";
import { REGIONS, type Region } from "@/content/exercises";

/**
 * The body map: the supplied figure (public/images/body-map.png) with six hexagon hotspots
 * plus "Whole body · Balance". Step 3 of the intake for comeback, mil and athlete lanes.
 * Hotspots are real buttons: Tab reaches them, arrow keys move between them, Enter/Space
 * selects. Percent coordinates are tuned to the supplied figure.
 */
/*
 * Markers sit on the body point; labels hang off a short leader line to one side. Right-side
 * labels (shoulders, core, hips, knees) are at least 14% apart vertically, left-side labels
 * (arms, ankles) 41% apart, so no label can meet another label or marker at any width.
 */
const HOTSPOTS: { id: Region; x: number; y: number; side: "left" | "right" }[] = [
  { id: "shoulders", x: 71, y: 19, side: "right" },
  { id: "core", x: 50, y: 34, side: "right" },
  { id: "hips", x: 50, y: 49, side: "right" },
  { id: "knees", x: 60, y: 68, side: "right" },
  { id: "arms", x: 12, y: 50, side: "left" },
  { id: "ankles", x: 40, y: 91, side: "left" },
];

export function BodyMap({ value, onSelect, figureRef, wholeLabel = "Whole body · Balance", sizes = "(min-width: 1024px) 26vw, 60vw" }: { value: Region | null; onSelect: (r: Region) => void; figureRef?: Ref<HTMLDivElement>; wholeLabel?: string; sizes?: string }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (i: number) => (e: KeyboardEvent) => {
    const n = REGIONS.length;
    const map: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (e.key in map) {
      e.preventDefault();
      refs.current[(i + map[e.key] + n) % n]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      refs.current[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      refs.current[n - 1]?.focus();
    }
  };
  return (
    <div className="plan__map" role="group" aria-label="Choose an area of the body">
      <div ref={figureRef} tabIndex={-1} className="plan__figure">
        <Image src="/images/body-map.png" alt="" width={444} height={1400} sizes={sizes} className="plan__body" />
        {HOTSPOTS.map((h, i) => {
          const r = REGIONS.find((x) => x.id === h.id)!;
          return (
            <button
              key={h.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              className={`plan__hot plan__hot--${h.side}`}
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
              aria-pressed={value === h.id}
              aria-label={r.label}
              onClick={() => onSelect(h.id)}
              onKeyDown={onKey(i)}
              data-region={h.id}
            >
              <span className="plan__hex" aria-hidden="true" />
              <span className="plan__hot-label" aria-hidden="true">
                {r.short}
              </span>
            </button>
          );
        })}
      </div>
      <button
        ref={(el) => {
          refs.current[6] = el;
        }}
        type="button"
        className="plan__whole"
        aria-pressed={value === "whole"}
        onClick={() => onSelect("whole")}
        onKeyDown={onKey(6)}
        data-region="whole"
      >
        <span className="plan__hex" aria-hidden="true" />
        {wholeLabel}
      </button>
    </div>
  );
}
