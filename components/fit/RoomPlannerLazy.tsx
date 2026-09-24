"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ROOMS, roomByKey, type Side } from "@/content/rooms";
import { bestSpot, MODELS, nextWall, nudge, type ModelKey } from "@/lib/fit";
import { FitPoster } from "./FitPoster";
import { PlannerShell } from "./PlannerShell";

const load = () => import("./RoomPlanner");
const RoomPlanner = dynamic(load, { ssr: false, loading: () => <FitPoster loading /> });

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Homepage-safe entry point. Renders the full shell around a real still of the scene, with
 * the same status panel the live view shows for the start spot. Nothing from three.js loads
 * until the stage is within 400px of the viewport (prefetch) and nothing runs until the
 * visitor taps. No WebGL: the still plus a text summary, from the same rules.
 */
export function RoomPlannerLazy({ autoFocus = false, roomHeading = "h3" as const }: { autoFocus?: boolean; roomHeading?: "h2" | "h3" }) {
  const root = useRef<HTMLDivElement>(null);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [active, setActive] = useState(false);
  const [roomKey, setRoomKey] = useState(ROOMS[0].key);
  const [modelKey, setModelKey] = useState<ModelKey>("std");
  const [person, setPerson] = useState(true);
  const [place, setPlace] = useState<{ side: Side; u: number }>(ROOMS[0].start);

  // Within 400px of the viewport: check WebGL once and warm the chunk. The scene still waits for the tap.
  useEffect(() => {
    const el = root.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const ok = hasWebGL();
        setWebgl(ok);
        if (ok) void load();
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const def = roomByKey(roomKey) ?? ROOMS[0];
  const activate = () => {
    if (webgl === false) return;
    if (webgl === null) setWebgl(hasWebGL());
    setActive(true);
  };

  if (webgl === false) {
    return (
      <div ref={root}>
        <FitPoster fallback />
      </div>
    );
  }
  if (active && webgl) {
    return (
      <div ref={root}>
        <RoomPlanner initialRoom={roomKey} initialModel={modelKey} initialPerson={person} autoFocus={autoFocus} roomHeading={roomHeading} />
      </div>
    );
  }
  // Static shell: every control works on the text, and the first tap on the stage goes live.
  return (
    <div ref={root}>
      <PlannerShell
        stage={<FitPoster onTap={activate} loading={active && webgl === null} />}
        roomKey={roomKey}
        modelKey={modelKey}
        place={place}
        person={person}
        onRoom={(key) => {
          const d = roomByKey(key);
          if (!d) return;
          setRoomKey(key);
          setPlace(d.start);
          activate();
        }}
        onModel={(k) => setModelKey(k)}
        onPerson={(v) => setPerson(v)}
        onReset={activate}
        onNudge={(d) => {
          const u = nudge(def, place.side, place.u, d);
          if (u !== null) setPlace({ side: place.side, u });
        }}
        onNextWall={() => {
          const n = nextWall(def, MODELS[modelKey], place.side) ?? { side: place.side, u: bestSpot(def, MODELS[modelKey], place.side) ?? place.u };
          setPlace(n);
        }}
        roomHeading={roomHeading}
      />
    </div>
  );
}
