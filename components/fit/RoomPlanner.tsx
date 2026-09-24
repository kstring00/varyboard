"use client";

import { useEffect, useRef, useState } from "react";
import { products } from "@/content/facts";
import { ROOMS, roomByKey, type Side } from "@/content/rooms";
import { MODELS, evaluate, ftin, type ModelKey } from "@/lib/fit";
import { createPlanner, type Planner } from "./scene";
import { FitPoster } from "./FitPoster";
import { PlannerShell, SPACE, STEP_WORD } from "./PlannerShell";

/**
 * The live planner: owns the three.js scene (scene.ts) and feeds the shell. Loaded on demand
 * by RoomPlannerLazy, so three.js never ships with the page. The panel re-evaluates the same
 * rules the scene uses, so text and 3D can never disagree.
 */
export default function RoomPlanner({ initialRoom = "bedroom", initialModel = "std" as ModelKey, initialPerson = true, autoFocus = false, roomHeading = "h3" as const }: { initialRoom?: string; initialModel?: ModelKey; initialPerson?: boolean; autoFocus?: boolean; roomHeading?: "h2" | "h3" }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tagTopRef = useRef<HTMLDivElement>(null);
  const tagZoneRef = useRef<HTMLDivElement>(null);
  const plannerRef = useRef<Planner | null>(null);

  const [roomKey, setRoomKey] = useState(initialRoom);
  const [modelKey, setModelKey] = useState<ModelKey>(initialModel);
  const [person, setPerson] = useState(initialPerson);
  const [place, setPlace] = useState<{ side: Side; u: number; dragging: boolean }>(() => ({ ...(roomByKey(initialRoom) ?? ROOMS[0]).start, dragging: false }));
  const [hint, setHint] = useState(true);
  const [failed, setFailed] = useState(false);
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    const tagTop = tagTopRef.current;
    const tagZone = tagZoneRef.current;
    if (!canvas || !stage || !tagTop || !tagZone) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    setCoarse(isCoarse);
    const planner = createPlanner({
      canvas,
      stage,
      tagTop,
      tagZone,
      room: initialRoom,
      model: initialModel,
      reduceMotion,
      coarse: isCoarse,
      onState: (s) => setPlace(s),
      onInteract: () => setHint(false),
    });
    if (!planner) {
      setFailed(true);
      return;
    }
    planner.setPerson(initialPerson);
    plannerRef.current = planner;

    // Render only while the stage is on screen and the tab is visible.
    let onScreen = false;
    const sync = () => {
      if (onScreen && document.visibilityState === "visible") planner.start();
      else planner.stop();
    };
    const io = new IntersectionObserver(
      ([en]) => {
        onScreen = en.isIntersecting;
        sync();
      },
      { threshold: 0 },
    );
    io.observe(stage);
    document.addEventListener("visibilitychange", sync);
    if (autoFocus) canvas.focus({ preventScroll: true });

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      planner.dispose();
      plannerRef.current = null;
    };
    // The scene is created once; later room and model changes go through the handle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (failed) return <FitPoster fallback />;

  const def = roomByKey(roomKey) ?? ROOMS[0];
  const e = evaluate(def, MODELS[modelKey], place.side, place.u);

  const stage = (
    <div ref={stageRef} className="fit-stage">
      <canvas
        ref={canvasRef}
        className="fit-canvas"
        tabIndex={0}
        aria-label={`3D room with the ${products.board.name} on a wall. Drag the board to move it. With the room focused, use the left and right arrow keys to move one ${STEP_WORD}, and N for the next wall.`}
      />
      <div ref={tagTopRef} className="fit-tag" hidden aria-hidden="true">
        Top at {ftin(e.top)}
      </div>
      <div ref={tagZoneRef} className="fit-tag fit-tag--zone" hidden aria-hidden="true">
        {e.zoneOK ? `${SPACE} clear` : `${SPACE} blocked`}
      </div>
      <div className={`fit-hint${hint ? "" : " fit-hint--gone"}`} aria-hidden={!hint}>
        <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
          <path d="M11 1.8 18.9 6.4v9.2L11 20.2 3.1 15.6V6.4Z" fill="#E1EFEC" stroke="#2D6A60" strokeWidth="1.3" />
          <path d="M6.5 11h9M6.5 11l2.3-2.3M6.5 11l2.3 2.3M15.5 11l-2.3-2.3M15.5 11l-2.3 2.3" fill="none" stroke="#1E4D46" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span>{coarse ? "Drag the board to another wall" : "Drag the board to any wall"}</span>
      </div>
    </div>
  );

  return (
    <PlannerShell
      stage={stage}
      roomKey={roomKey}
      modelKey={modelKey}
      place={place}
      person={person}
      onRoom={(key) => {
        setRoomKey(key);
        const d = roomByKey(key);
        if (d) setPlace({ ...d.start, dragging: false });
        plannerRef.current?.setRoom(key);
      }}
      onModel={(key) => {
        setModelKey(key);
        plannerRef.current?.setModel(key);
      }}
      onPerson={(v) => {
        setPerson(v);
        plannerRef.current?.setPerson(v);
      }}
      onReset={() => plannerRef.current?.resetCamera()}
      onNudge={(d) => plannerRef.current?.nudge(d)}
      onNextWall={() => plannerRef.current?.nextWall()}
      roomHeading={roomHeading}
    />
  );
}
