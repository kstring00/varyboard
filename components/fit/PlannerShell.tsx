"use client";

import type { ReactNode } from "react";
import { fitPlanner } from "@/content/config";
import { board } from "@/content/facts";
import { ROOMS, roomByKey, type Side } from "@/content/rooms";
import { buyLinks } from "@/lib/commerce";
import { MODELS, SNAPS_TO_STUDS, cap, checkRows, evaluate, ftin, goodSpots, spotsLine, wallLen, type ModelKey } from "@/lib/fit";

export const STEP_WORD = SNAPS_TO_STUDS ? "stud" : "step";
export const SPACE = board.minSpacePerUser.replace("x", "×");

const HexOk = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
    <path d="M10 1.5 17.4 5.75v8.5L10 18.5 2.6 14.25v-8.5Z" fill="#E1EFEC" stroke="#2D6A60" strokeWidth="1.4" />
    <path d="m6.6 10.2 2.3 2.3 4.6-4.9" fill="none" stroke="#1E4D46" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const HexBad = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
    <path d="M10 1.5 17.4 5.75v8.5L10 18.5 2.6 14.25v-8.5Z" fill="#F7E4DF" stroke="#AE3F2E" strokeWidth="1.4" />
    <path d="m7.4 7.4 5.2 5.2m0-5.2-5.2 5.2" fill="none" stroke="#AE3F2E" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export interface ShellProps {
  stage: ReactNode;
  roomKey: string;
  modelKey: ModelKey;
  place: { side: Side; u: number };
  person: boolean;
  onRoom: (key: string) => void;
  onModel: (key: ModelKey) => void;
  onPerson: (v: boolean) => void;
  onReset: () => void;
  onNudge: (dir: 1 | -1) => void;
  onNextWall: () => void;
  /** h3 under the homepage's h2, h2 under the /fit page's h1. */
  roomHeading?: "h2" | "h3";
}

/**
 * Everything around the 3D view: room and board pickers, the live fit check, the funnel
 * CTA and the spec list. Pure text from lib/fit.ts, so it renders identically around the
 * poster (before the visitor taps) and around the live canvas. No three.js in here.
 */
export function PlannerShell({ stage, roomKey, modelKey, place, person, onRoom, onModel, onPerson, onReset, onNudge, onNextWall, roomHeading: RoomHeading = "h3" }: ShellProps) {
  const def = roomByKey(roomKey) ?? ROOMS[0];
  const model = MODELS[modelKey];
  const e = evaluate(def, model, place.side, place.u);
  const rows = checkRows(def, model, place.side, e);
  const fromCorner = place.u + wallLen(def, place.side) / 2;
  const stdSpots = goodSpots(def, MODELS.std);
  const xtTooTall = modelKey === "xt" && !e.heightOK && stdSpots > 0;

  return (
    <div className="fit-planner">
      <div className="fit-main">
        {stage}
        <div className="fit-controls">
          <div className="fit-seg" role="group" aria-label="Room">
            {ROOMS.map((r) => (
              <button key={r.key} type="button" aria-pressed={r.key === roomKey} onClick={() => onRoom(r.key)} data-room={r.key}>
                {r.name}
              </button>
            ))}
          </div>
          <div className="fit-seg" role="group" aria-label="Board">
            {(Object.keys(MODELS) as ModelKey[]).map((k) => (
              <button key={k} type="button" aria-pressed={k === modelKey} onClick={() => onModel(k)} data-model={k}>
                {k === "std" ? `${MODELS.std.name} · ${MODELS.std.h} in` : `XT · ${MODELS.xt.h} in`}
              </button>
            ))}
          </div>
          <label className="fit-toggle">
            <input type="checkbox" checked={person} onChange={(ev) => onPerson(ev.target.checked)} />
            Show a {ftin(fitPlanner.personHeightIn)} person
          </label>
          <button type="button" className="fit-ghost" onClick={onReset}>
            Reset view
          </button>
        </div>
      </div>

      <aside className="fit-status" aria-label="Fit check">
        <div>
          <p className="eyebrow">Room</p>
          <RoomHeading className="fit-status__room">{def.name}</RoomHeading>
          <p className="fit-status__meta">{def.meta}</p>
        </div>
        <div aria-live="polite" aria-atomic="true" className="fit-live">
          <div className={`fit-verdict ${e.ok ? "fit-verdict--ok" : "fit-verdict--bad"}`} data-fit={e.ok ? "yes" : "no"}>
            <strong>{e.ok ? "Fits here" : "Not this spot"}</strong>
            <span>{e.ok ? "Plenty of room to use every anchor point." : "Drag it along the wall, or tap Next wall."}</span>
          </div>
          <ul className="fit-checks">
            {rows.map(([ok, text]) => (
              <li key={text}>
                {ok ? <HexOk /> : <HexBad />}
                <span>
                  <span className="sr-only">{ok ? "Pass: " : "Problem: "}</span>
                  {text}
                </span>
              </li>
            ))}
          </ul>
          <p className="fit-where">
            {cap(place.side)} wall · center {ftin(fromCorner)} from the {place.side === "back" ? "left" : "back"} corner
          </p>
        </div>
        <div className="fit-nudge">
          <button type="button" className="fit-ghost" aria-label={`Move one ${STEP_WORD} left`} onClick={() => onNudge(-1)}>
            ◀ {cap(STEP_WORD)}
          </button>
          <button type="button" className="fit-ghost" aria-label={`Move one ${STEP_WORD} right`} onClick={() => onNudge(1)}>
            {cap(STEP_WORD)} ▶
          </button>
          <button type="button" className="fit-ghost" onClick={onNextWall}>
            Next wall
          </button>
        </div>
        <p className="fit-spots">{spotsLine(def, model)}</p>

        <div className="fit-cta" data-cta={e.ok ? modelKey : xtTooTall ? "std-instead" : "none"}>
          {e.ok ? (
            <a href={modelKey === "xt" ? buyLinks.boardXT : buyLinks.board} className="btn-primary">
              Get the {model.name}
            </a>
          ) : xtTooTall ? (
            <>
              <p className="fit-cta__note">The {MODELS.std.name} fits this room.</p>
              <a href={buyLinks.board} className="btn-primary">
                Get the {MODELS.std.name}
              </a>
            </>
          ) : (
            <p className="fit-cta__note">Find a spot that fits and the next step appears here.</p>
          )}
        </div>

        <dl className="fit-specs">
          <dt>Board height</dt>
          <dd>
            {model.h} in ({ftin(model.h)})
          </dd>
          <dt>Width</dt>
          <dd>{board.section.widthIn} in</dd>
          <dt>Sticks out from the wall</dt>
          <dd>{board.section.depthIn} in</dd>
          <dt>Floor space to use it</dt>
          <dd>{SPACE}</dd>
          <dt>Anchor points</dt>
          <dd>
            {model.anchors} ({board.anchorPointsPerSection} per section)
          </dd>
        </dl>
      </aside>
    </div>
  );
}
