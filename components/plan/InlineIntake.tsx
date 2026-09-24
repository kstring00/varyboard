"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AreaStep } from "@/components/plan/AreaStep";
import { ConcernOptions, Crumbs, LaneOptions, SituationOptions, StepFoot, stepTitle } from "@/components/plan/StepParts";
import { type Concern, type Lane } from "@/content/intake";
import { concernFor, isLane } from "@/lib/intake";

/**
 * The intake, inline on the homepage (section #find-your-plan). Steps 1 and 2 are local state;
 * the final tap is a link to /plan/result with the same params the standalone /plan produces.
 *
 * Deep link: #find-your-plan?for=mil[&c=surgery] pre-selects and scrolls here (ticker links use it).
 * Motion: the stage's height eases between steps and each new step assembles cell by cell
 * (ixAssemble). Static under prefers-reduced-motion. The heading is announced and focused on
 * every step change after the first interaction, never on page load.
 */
export const INLINE_ANCHOR = "find-your-plan";

function fromHash(hash: string): { lane?: Lane; concern?: string } | null {
  const m = new RegExp(`^#${INLINE_ANCHOR}(?:\\?(.*))?$`).exec(hash);
  if (!m) return null;
  const q = new URLSearchParams(m[1] ?? "");
  const lane = q.get("for") ?? "";
  return { lane: isLane(lane) ? lane : undefined, concern: q.get("c") ?? undefined };
}

export function InlineIntake() {
  const [lane, setLane] = useState<Lane | null>(null);
  const [concern, setConcern] = useState<Concern | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [live, setLive] = useState("");
  const dirty = useRef(false);
  const section = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  const step: 1 | 2 | 3 = !lane ? 1 : !concern ? 2 : 3;
  const title = stepTitle(step, lane ?? undefined, concern ?? undefined, true);
  const stepKey = `${step}-${lane ?? ""}-${concern?.key ?? ""}`;

  // Stage height follows the current step's content, so it eases between steps. The step element
  // remounts on every change (key), so the observer is re-attached per step.
  useEffect(() => {
    const el = inner.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setHeight(Math.ceil(e.contentRect.height)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [stepKey]);

  // Announce and focus the heading on step changes, but only after the visitor has interacted.
  useEffect(() => {
    if (!dirty.current) return;
    setLive(`Step ${step} of 3: ${title}`);
    heading.current?.focus({ preventScroll: true });
  }, [step, title]);

  const go = useCallback((next: { lane?: Lane | null; concern?: Concern | null }) => {
    dirty.current = true;
    if (next.lane !== undefined) setLane(next.lane);
    if (next.concern !== undefined) setConcern(next.concern);
  }, []);

  // #find-your-plan?for=…&c=… on load and on hashchange.
  useEffect(() => {
    const apply = () => {
      const h = fromHash(window.location.hash);
      if (!h) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      section.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      if (!h.lane) return;
      const c = h.concern ? (concernFor(h.lane, h.concern) ?? null) : null;
      go({ lane: h.lane, concern: c });
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, [go]);

  const back = step === 2 ? { label: "Choose someone else", onSelect: () => go({ lane: null, concern: null }) } : step === 3 ? { label: "Choose a different concern", onSelect: () => go({ concern: null }) } : undefined;

  return (
    <section ref={section} id={INLINE_ANCHOR} aria-labelledby="fyp-title" className="fyp" data-step={step}>
      <div className="container-site">
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {live}
        </p>
        <header className="fyp__head">
          <p className="eyebrow">Find your plan · Step {step} of 3</p>
          <h2 id="fyp-title" ref={heading} tabIndex={-1} className="fyp__title">
            {title}
          </h2>
          {step === 1 ? <p className="fyp__sub">Three quick taps. No email needed.</p> : <Crumbs lane={lane ?? undefined} concern={concern ?? undefined} onLane={() => go({ lane: null, concern: null })} onConcern={() => go({ concern: null })} />}
        </header>

        <div className="fyp__stage" style={height === null ? undefined : { height }}>
          <div ref={inner} key={stepKey} className="fyp__step">
            {step === 1 && <LaneOptions pick={(l) => ({ onSelect: () => go({ lane: l, concern: null }) })} />}
            {step === 2 && lane && <ConcernOptions lane={lane} pick={(c) => ({ onSelect: () => go({ concern: c }) })} />}
            {step === 3 && lane && concern && (concern.step3.kind === "bodymap" ? <AreaStep lane={lane} concern={concern.key} /> : <SituationOptions lane={lane} concern={concern} />)}
            <StepFoot step={step} lane={lane ?? undefined} back={back} />
          </div>
        </div>
      </div>
    </section>
  );
}
