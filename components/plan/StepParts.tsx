"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { HexIcon, LANE_ICON } from "@/components/plan/HexIcon";
import { HexMark } from "@/components/plan/HexMark";
import { LANES, SAFETY_EXIT, t, type Concern, type Lane } from "@/content/intake";
import { brand } from "@/content/facts";
import { concernsFor, intakeHref, laneLabel, stepQuestion } from "@/lib/intake";

/**
 * Shared pieces of the intake steps, used two ways:
 *   - /plan (components/plan/Steps.tsx): every option is a link, the URL carries the state
 *   - the homepage section (InlineIntake.tsx): Steps 1 and 2 are buttons that update local
 *     state; the final tap is still a link to /plan/result, so plans stay shareable.
 */
export type Pick = { href: string } | { onSelect: () => void };

export function Option({ label, line, i, icon, pick, tile = false }: { label: string; line?: string; i: number; icon?: Lane; pick: Pick; tile?: boolean }) {
  const inner = (
    <>
      {icon ? <HexIcon icon={LANE_ICON[icon]} className="ix-option__icon" /> : <HexMark size={38}>{i + 1}</HexMark>}
      <span className="ix-option__text">
        <span className="ix-option__label">{label}</span>
        {line && <span className="ix-option__line">{line}</span>}
      </span>
    </>
  );
  return (
    <li className={`ix-option ${tile ? "ix-option--tile" : ""}`} style={{ "--i": i } as React.CSSProperties}>
      {"href" in pick ? (
        <Link href={pick.href} className="ix-option__link" data-option={label}>
          {inner}
        </Link>
      ) : (
        <button type="button" className="ix-option__link" data-option={label} onClick={pick.onSelect}>
          {inner}
        </button>
      )}
    </li>
  );
}

/** Chosen options so far, each glowing. Clicking one goes back to that step. */
export function Crumbs({ lane, concern, onLane, onConcern }: { lane?: Lane; concern?: Concern; onLane?: () => void; onConcern?: () => void }) {
  if (!lane) return null;
  const crumb = (label: string, href: string, onClick?: () => void) =>
    onClick ? (
      <button type="button" className="ix-crumb" onClick={onClick}>
        <HexMark lit size={26} />
        <span>{label}</span>
      </button>
    ) : (
      <Link href={href} className="ix-crumb">
        <HexMark lit size={26} />
        <span>{label}</span>
      </Link>
    );
  return (
    <ol className="ix-crumbs" aria-label="Your choices so far">
      <li>{crumb(laneLabel(lane), intakeHref.step1(), onLane)}</li>
      {concern && <li>{crumb(t(concern.label, lane), intakeHref.step2(lane), onConcern)}</li>}
    </ol>
  );
}

/** Links under a step: safety exit (Step 2+), back, phone. */
export function StepFoot({ step, lane, back }: { step: 1 | 2 | 3; lane?: Lane; back?: { label: string } & Pick }) {
  return (
    <div className="ix-foot">
      {step >= 2 && (
        <p>
          <Link href={SAFETY_EXIT.href} className="ix-safety-link" data-safety>
            {t(SAFETY_EXIT.label, lane ?? "me")}
          </Link>
        </p>
      )}
      {back && (
        <p>
          {"href" in back ? (
            <Link href={back.href} className="link" data-back>
              {back.label}
            </Link>
          ) : (
            <button type="button" className="link" data-back onClick={back.onSelect}>
              {back.label}
            </button>
          )}
        </p>
      )}
      <p className="ix-foot__phone">
        Prefer to talk it through? Call{" "}
        <a href={brand.phoneHref} className="link">
          {brand.phone}
        </a>
        .
      </p>
    </div>
  );
}

/** Step 1 options: the five lanes as hexagon icon tiles. */
export function LaneOptions({ pick }: { pick: (lane: Lane) => Pick }) {
  return (
    <ul className="ix-options ix-options--tiles">
      {LANES.map((l, i) => (
        <Option key={l.key} label={l.label} line={l.line} i={i} icon={l.key} pick={pick(l.key)} tile />
      ))}
    </ul>
  );
}

/** Step 2 options: the lane's concerns. */
export function ConcernOptions({ lane, pick }: { lane: Lane; pick: (concern: Concern) => Pick }) {
  return (
    <ul className="ix-options">
      {concernsFor(lane).map((c, i) => (
        <Option key={c.key} label={t(c.label, lane)} i={i} pick={pick(c)} />
      ))}
    </ul>
  );
}

/** Step 3 options for situation concerns: links to the plan page. */
export function SituationOptions({ lane, concern }: { lane: Lane; concern: Concern }) {
  if (concern.step3.kind !== "situations") return null;
  return (
    <ul className="ix-options">
      {concern.step3.options.map((s, i) => (
        <Option key={s.key} label={t(s.label, lane)} i={i} pick={{ href: intakeHref.result(lane, concern.key, { s: s.key }) }} />
      ))}
    </ul>
  );
}

export function stepTitle(step: 1 | 2 | 3, lane?: Lane, concern?: Concern, inline = false): string {
  if (step === 1) return inline ? "Who are we building this for?" : "Who is this for?";
  if (step === 2) return stepQuestion(lane!);
  if (concern?.step3.kind === "bodymap") return lane === "loved" ? "Where do they want to feel stronger?" : "Where do you want to feel stronger?";
  return "Pick the closest situation";
}

export type StepChildren = ReactNode;
