"use client";

import Link from "next/link";
import { useActionState, useEffect, useId, useMemo, useRef, useState } from "react";
import { BodyMap } from "@/components/plan/BodyMap";
import { PlanItemCard } from "@/components/plan/PlanItemCard";
import { submitInquiry, type FormState } from "@/app/actions/forms";
import { GOALS, REGIONS, type Goal, type Region } from "@/content/exercises";
import { brand, formatPrice, products } from "@/content/facts";
import { buyLinks } from "@/lib/commerce";
import { CAUTION_MESSAGE, PLAN_ANCHOR, buildPlan, goalFromHash, planToText, type Plan } from "@/lib/plan";

/**
 * PlanBuilder: tap a part of the body, pick a goal, add an optional note, build a plan.
 * The body map (components/plan/BodyMap) is shared with Step 3 of the "Find your plan" intake
 * at /plan, which is the guided front door to this builder. Plan logic lives in lib/plan.ts
 * (buildPlan), the single place a server route will later replace. Wellness language only.
 */

const initialForm: FormState = { status: "idle" };

export function PlanBuilder() {
  const [region, setRegion] = useState<Region | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [note, setNote] = useState("");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [emailOpen, setEmailOpen] = useState(false);
  const [formState, formAction, pending] = useActionState(submitInquiry, initialForm);
  const planRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const figureRef = useRef<HTMLDivElement>(null);
  const uid = useId();
  const regionLabel = useMemo(() => REGIONS.find((r) => r.id === region)?.label ?? "", [region]);
  const canBuild = Boolean(region && goal);

  /* Deep link: #how-it-works?goal=… pre-selects the goal, scrolls here and focuses the figure. */
  useEffect(() => {
    const apply = () => {
      const g = goalFromHash(window.location.hash);
      if (!g) return;
      setGoal(g);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      sectionRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      figureRef.current?.focus({ preventScroll: true });
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  const build = () => {
    if (!region || !goal) return;
    const p = buildPlan({ region, goal, note });
    setPlan(p);
    setEmailOpen(false);
    requestAnimationFrame(() => planRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }));
  };

  return (
    <section id={PLAN_ANCHOR} ref={sectionRef} aria-labelledby="plan-title" className="plan">
      <div className="container-site">
        <header className="plan__head">
          <p className="eyebrow">Build your plan</p>
          <h2 id="plan-title" className="plan__title">
            Where do you want to feel stronger?
          </h2>
          <p className="plan__lede">Tap a part of the body, choose a goal, and we will put together a short practice on the board. Bring it to your physical therapist, or start gently at home.</p>
          <p className="plan__front">
            Not sure where to start?{" "}
            <Link href="/plan" className="link">
              Answer three quick questions
            </Link>{" "}
            and we will build the plan around your situation.
          </p>
        </header>

        <div className="plan__grid">
          {/* Body map */}
          <BodyMap value={region} onSelect={setRegion} figureRef={figureRef} />

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

            <p className="plan__pre">Plans are general exercise guidance from a licensed physical therapist, not a diagnosis or treatment. If you are recovering from surgery or injury, follow your own clinician&rsquo;s advice first.</p>
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
              {plan.items.map((item, n) => (
                <PlanItemCard key={item.exercise.id} item={item} n={n + 1} />
              ))}
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
