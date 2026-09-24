"use client";

import { AreaStep } from "@/components/plan/AreaStep";
import { StepAnnouncer } from "@/components/plan/StepAnnouncer";
import { ConcernOptions, Crumbs, LaneOptions, SituationOptions, StepFoot, stepTitle } from "@/components/plan/StepParts";
import type { Concern, Lane } from "@/content/intake";
import { intakeHref } from "@/lib/intake";

/** The standalone /plan steps: every option is a link and the URL carries the state. */
function Shell({ step, lane, concern, children }: { step: 1 | 2 | 3; lane?: Lane; concern?: Concern; children: React.ReactNode }) {
  const title = stepTitle(step, lane, concern);
  const back = step === 2 ? { href: intakeHref.step1(), label: "Choose someone else" } : step === 3 ? { href: intakeHref.step2(lane!), label: "Choose a different concern" } : undefined;
  return (
    <div className="ix">
      <StepAnnouncer text={`Step ${step} of 3: ${title}`} headingId="ix-title" />
      <header className="ix-band">
        <div className="container-site">
          <p className="eyebrow">Find your plan · Step {step} of 3</p>
          <h1 id="ix-title" tabIndex={-1} className="ix-title">
            {title}
          </h1>
          <Crumbs lane={lane} concern={concern} />
        </div>
      </header>
      <div className="container-site ix-body">
        {children}
        <StepFoot step={step} lane={lane} back={back} />
      </div>
    </div>
  );
}

export function Step1() {
  return (
    <Shell step={1}>
      <LaneOptions pick={(lane) => ({ href: intakeHref.step2(lane) })} />
    </Shell>
  );
}

export function Step2({ lane }: { lane: Lane }) {
  return (
    <Shell step={2} lane={lane}>
      <ConcernOptions lane={lane} pick={(c) => ({ href: intakeHref.step3(lane, c.key) })} />
    </Shell>
  );
}

export function Step3({ lane, concern }: { lane: Lane; concern: Concern }) {
  return (
    <Shell step={3} lane={lane} concern={concern}>
      {concern.step3.kind === "bodymap" ? <AreaStep lane={lane} concern={concern.key} /> : <SituationOptions lane={lane} concern={concern} />}
    </Shell>
  );
}
