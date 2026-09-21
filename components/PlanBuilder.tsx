"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { submitInquiry, type FormState } from "@/app/actions/forms";
import { GOALS, REGIONS, type Goal, type Region } from "@/content/exercises";
import { brand, formatPrice, products } from "@/content/facts";
import { buyLinks } from "@/lib/commerce";
import { CAUTION_MESSAGE, buildPlan, planToText, type Plan } from "@/lib/plan";

/**
 * PlanBuilder: tap a part of the body, pick a goal, add an optional note, build a plan.
 * Body map = the supplied figure (public/images/body-map.png) with six hexagon hotspots plus
 * "Whole body · Balance". Hotspots are real buttons: Tab reaches them, arrow keys move between
 * them, Enter/Space selects. Plan logic lives in lib/plan.ts (buildPlan), the single place a
 * server route will later replace. Wellness language only; not medical advice.
 */

/* Hotspot geometry: percent of the figure box (left, top). Tuned to the supplied figure. */
const HOTSPOTS: { id: Region; x: number; y: number; side: "left" | "right" }[] = [
  { id: "shoulders", x: 71, y: 19, side: "right" },
  { id: "arms", x: 12, y: 50, side: "left" },
  { id: "core", x: 50, y: 34, side: "right" },
  { id: "hips", x: 50, y: 49, side: "left" },
  { id: "knees", x: 60, y: 68, side: "right" },
  { id: "ankles", x: 40, y: 91, side: "left" },
];

const initialForm: FormState = { status: "idle" };

export function PlanBuilder() {
  const [region, setRegion] = useState<Region | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [note, setNote] = useState("");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [emailOpen, setEmailOpen] = useState(false);
  const [formState, formAction, pending] = useActionState(submitInquiry, initialForm);
  const hotspotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const planRef = useRef<HTMLDivElement>(null);
  const uid = useId();
  const regionLabel = useMemo(() => REGIONS.find((r) => r.id === region)?.label ?? "", [region]);
  const canBuild = Boolean(region && goal);

  const onHotspotKey = (i: number) => (e: KeyboardEvent) => {
    const n = REGIONS.length; // six hotspots + whole body
    const map: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (e.key in map) {
      e.preventDefault();
      hotspotRefs.current[(i + map[e.key] + n) % n]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      hotspotRefs.current[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      hotspotRefs.current[n - 1]?.focus();
    }
  };

  const build = () => {
    if (!region || !goal) return;
    const p = buildPlan({ region, goal, note });
    setPlan(p);
    setEmailOpen(false);
    requestAnimationFrame(() => planRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }));
  };

  return (
    <section id="how-it-works" aria-labelledby="plan-title" className="plan">
      <div className="container-site">
        <header className="plan__head">
          <p className="eyebrow">Build your plan</p>
          <h2 id="plan-title" className="plan__title">
            Where do you want to feel stronger?
          </h2>
          <p className="plan__lede">Tap a part of the body, choose a goal, and we will put together a short practice on the board. Bring it to your physical therapist, or start gently at home.</p>
        </header>

        <div className="plan__grid">
          {/* Body map */}
          <div className="plan__map" role="group" aria-label="Choose an area of the body">
            <div className="plan__figure">
              <Image src="/images/body-map.png" alt="" width={444} height={1400} sizes="(min-width: 1024px) 26vw, 60vw" className="plan__body" />
              {HOTSPOTS.map((h, i) => {
                const r = REGIONS.find((x) => x.id === h.id)!;
                const on = region === h.id;
                return (
                  <button
                    key={h.id}
                    ref={(el) => {
                      hotspotRefs.current[i] = el;
                    }}
                    type="button"
                    className={`plan__hot plan__hot--${h.side}`}
                    style={{ left: `${h.x}%`, top: `${h.y}%` }}
                    aria-pressed={on}
                    aria-label={r.label}
                    onClick={() => setRegion(h.id)}
                    onKeyDown={onHotspotKey(i)}
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
                hotspotRefs.current[6] = el;
              }}
              type="button"
              className="plan__whole"
              aria-pressed={region === "whole"}
              onClick={() => setRegion("whole")}
              onKeyDown={onHotspotKey(6)}
              data-region="whole"
            >
              <span className="plan__hex" aria-hidden="true" />
              Whole body · Balance
            </button>
          </div>

          {/* Controls */}
          <div className="plan__controls">
            <div className="plan__step">
              <span className="plan__step-n">1</span>
              <div>
                <h3 className="plan__step-title">Area</h3>
                <p className="plan__step-value" aria-live="polite">
                  {region ? regionLabel : "Tap the figure to choose"}
                </p>
              </div>
            </div>

            <div className="plan__step">
              <span className="plan__step-n">2</span>
              <div className="w-full">
                <h3 className="plan__step-title">Goal</h3>
                <div className="plan__chips" role="group" aria-label="Choose a goal">
                  {GOALS.map((g) => (
                    <button key={g.id} type="button" className="plan__chip" aria-pressed={goal === g.id} onClick={() => setGoal(g.id)} data-goal={g.id}>
                      <span className="plan__chip-title">{g.label}</span>
                      <span className="plan__chip-line">{g.line}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="plan__step">
              <span className="plan__step-n">3</span>
              <div className="w-full">
                <label htmlFor={`${uid}-note`} className="plan__step-title">
                  Anything we should know? <span className="font-normal text-ink-2">(optional)</span>
                </label>
                <textarea id={`${uid}-note`} value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={300} className="plan__note" placeholder="For example: I had knee surgery last year, or I get tired standing for long." />
              </div>
            </div>

            <div className="plan__actions">
              <button type="button" className="btn-primary text-lg" onClick={build} disabled={!canBuild} data-build>
                Build my plan
              </button>
              {!canBuild && <span className="text-ink-2">Choose an area and a goal first.</span>}
            </div>
          </div>
        </div>

        {/* Plan */}
        {plan && (
          <div ref={planRef} className="plan__result" data-plan aria-live="polite">
            <div className="plan__result-head">
              <div>
                <p className="eyebrow">Your plan</p>
                <h3 className="plan__result-title">
                  {regionLabel} · {GOALS.find((g) => g.id === plan.goal)?.label}
                </h3>
                <p className="text-ink-2">About ten minutes. Three to five movements, all on the board.</p>
              </div>
              {plan.usesUnapproved && (
                <span className="plan__badge" data-badge>
                  Example plan · placeholder exercises
                </span>
              )}
            </div>

            {plan.cautious && (
              <p className="plan__caution" role="note" data-caution>
                {CAUTION_MESSAGE}
              </p>
            )}

            <ol className="plan__list">
              {plan.items.map((item, n) => {
                const e = item.exercise;
                return (
                  <li key={e.id} className="plan__item">
                    <div className="plan__item-head">
                      <span className="plan__item-n">{n + 1}</span>
                      <div>
                        <span className="plan__item-role">{item.role}</span>
                        <h4 className="plan__item-name">{e.name}</h4>
                      </div>
                      <span className="plan__item-reps">{item.gentle ? "Gentle form" : e.reps}</span>
                    </div>
                    <dl className="plan__meta">
                      <div>
                        <dt>Anchor</dt>
                        <dd>
                          Row {e.anchorRow} · {e.anchorLandmark}
                        </dd>
                      </div>
                      <div>
                        <dt>Band</dt>
                        <dd>{e.band === "none" ? "No band" : e.band}</dd>
                      </div>
                      <div>
                        <dt>Rail</dt>
                        <dd>{e.rail ? "Hand on the rail" : "Hands free"}</dd>
                      </div>
                      <div>
                        <dt>Position</dt>
                        <dd className="capitalize">{e.position}</dd>
                      </div>
                    </dl>
                    <p className="plan__setup">{e.setup}</p>
                    <ol className="plan__steps">
                      {e.steps.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ol>
                    {item.gentle && (
                      <p className="plan__gentle">
                        <strong>Gentle form:</strong> {e.easier}
                      </p>
                    )}
                    <p className="plan__cue">
                      <strong>Cue:</strong> {e.cue}
                    </p>
                    <details className="plan__more">
                      <summary>Why this, and how to adjust</summary>
                      <p>
                        <strong>Why:</strong> {e.why}
                      </p>
                      <p>
                        <strong>Easier:</strong> {e.easier}
                      </p>
                      <p>
                        <strong>Harder:</strong> {e.harder}
                      </p>
                      <p>
                        <strong>Stop if:</strong> {e.stop}
                      </p>
                    </details>
                  </li>
                );
              })}
            </ol>

            <div className="plan__cta">
              <a href={buyLinks.board} className="btn-primary text-lg">
                Get the Vary Board · {formatPrice(products.board.price)}
              </a>
              <button type="button" className="btn-secondary text-lg" onClick={() => setEmailOpen((v) => !v)} aria-expanded={emailOpen} aria-controls={`${uid}-email`}>
                Email me this plan
              </button>
              <Link href="/faq" className="link">
                Questions?
              </Link>
            </div>

            {emailOpen && (
              <div id={`${uid}-email`} className="plan__email">
                {formState.status === "ok" ? (
                  <p role="status" className="font-medium">
                    {formState.message}
                  </p>
                ) : (
                  <form action={formAction} className="plan__email-form" noValidate>
                    <input type="hidden" name="kind" value="contact" />
                    <input type="hidden" name="page" value="/#how-it-works" />
                    <input type="hidden" name="interest" value="plan" />
                    <input type="hidden" name="message" value={`Please email me this Vary Board plan (${regionLabel}, ${plan.goal}).\n\n${planToText(plan)}`} />
                    <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
                      <label htmlFor={`${uid}-website`}>Website</label>
                      <input id={`${uid}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
                    </div>
                    <div>
                      <label htmlFor={`${uid}-name`} className="block font-semibold">
                        Your name
                      </label>
                      <input id={`${uid}-name`} name="name" type="text" autoComplete="name" required className="plan__input" aria-invalid={Boolean(formState.errors?.name)} />
                      {formState.errors?.name && <p className="plan__err">{formState.errors.name}</p>}
                    </div>
                    <div>
                      <label htmlFor={`${uid}-em`} className="block font-semibold">
                        Email
                      </label>
                      <input id={`${uid}-em`} name="email" type="email" autoComplete="email" required className="plan__input" aria-invalid={Boolean(formState.errors?.email)} />
                      {formState.errors?.email && <p className="plan__err">{formState.errors.email}</p>}
                    </div>
                    <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
                      {pending ? "Sending…" : "Send my plan"}
                    </button>
                    {formState.status === "error" && !formState.errors && <p className="plan__err sm:col-span-3">{formState.message}</p>}
                  </form>
                )}
              </div>
            )}

            <p className="plan__disclaimer">
              Not medical advice. This is a general practice suggestion built from the choices above. Consult your physician or physical therapist before starting, and stop any movement that causes pain. Call{" "}
              <a href={brand.phoneHref} className="link">
                {brand.phone}
              </a>{" "}
              with questions.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
