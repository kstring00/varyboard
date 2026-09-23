"use client";

import Link from "next/link";
import { useActionState, useId, useState } from "react";
import { submitInquiry, type FormState } from "@/app/actions/forms";
import { brand } from "@/content/facts";
import { CLINIC } from "@/content/intake";

const initial: FormState = { status: "idle" };
const input = "plan__input";

function Honeypot({ id }: { id: string }) {
  return (
    <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
      <label htmlFor={id}>Website</label>
      <input id={id} name="website" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}

function Status({ state }: { state: FormState }) {
  if (state.status !== "error" || state.errors) return null;
  return (
    <p role="alert" className="plan__err">
      {state.message}
    </p>
  );
}

function Done({ message }: { message?: string }) {
  return (
    <p role="status" className="ix-form__done">
      {message} Need something sooner? Call{" "}
      <a href={brand.phoneHref} className="link">
        {brand.phone}
      </a>
      .
    </p>
  );
}

/** "Email me my plan": explicit consent + privacy link. Delivery via the existing forms action. */
export function EmailPlanForm({ planText, page, buttonLabel = "Email me my plan", secondary = false }: { planText: string; page: string; buttonLabel?: string; secondary?: boolean }) {
  const [state, action, pending] = useActionState(submitInquiry, initial);
  const [open, setOpen] = useState(false);
  const uid = useId();
  const id = (n: string) => `${uid}-${n}`;
  if (state.status === "ok") return <Done message={state.message} />;
  return (
    <div className="ix-form">
      <button type="button" className={secondary ? "btn-secondary text-lg" : "btn-primary text-lg"} onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls={id("panel")} data-email>
        {buttonLabel}
      </button>
      {open && (
        <form id={id("panel")} action={action} noValidate className="ix-form__panel">
          <input type="hidden" name="kind" value="plan" />
          <input type="hidden" name="page" value={page} />
          <input type="hidden" name="interest" value="plan" />
          <input type="hidden" name="message" value={planText} />
          <Honeypot id={id("website")} />
          <div className="ix-form__row">
            <div>
              <label htmlFor={id("name")} className="block font-semibold">
                Name
              </label>
              <input id={id("name")} name="name" type="text" autoComplete="name" required defaultValue={state.values?.name} className={input} aria-invalid={Boolean(state.errors?.name)} />
              {state.errors?.name && <p className="plan__err">{state.errors.name}</p>}
            </div>
            <div>
              <label htmlFor={id("email")} className="block font-semibold">
                Email
              </label>
              <input id={id("email")} name="email" type="email" autoComplete="email" required defaultValue={state.values?.email} className={input} aria-invalid={Boolean(state.errors?.email)} />
              {state.errors?.email && <p className="plan__err">{state.errors.email}</p>}
            </div>
          </div>
          <label htmlFor={id("consent")} className="ix-form__consent">
            <input id={id("consent")} name="consent" type="checkbox" value="yes" required defaultChecked={state.values?.consent === "yes"} className="ix-gate__box" aria-invalid={Boolean(state.errors?.consent)} />
            <span>
              Email me this plan. I understand it is general exercise guidance, not medical advice, and I have read the{" "}
              <Link href="/privacy" className="link">
                privacy policy
              </Link>
              .
            </span>
          </label>
          {state.errors?.consent && <p className="plan__err">{state.errors.consent}</p>}
          <Status state={state} />
          <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
            {pending ? "Sending…" : "Send my plan"}
          </button>
        </form>
      )}
    </div>
  );
}

/** Athlete lane: team pricing inquiry. */
export function TeamForm({ page, planLabel }: { page: string; planLabel: string }) {
  const [state, action, pending] = useActionState(submitInquiry, initial);
  const uid = useId();
  const id = (n: string) => `${uid}-${n}`;
  if (state.status === "ok") return <Done message={state.message} />;
  return (
    <form action={action} noValidate className="ix-form__panel ix-form__panel--open">
      <input type="hidden" name="kind" value="team" />
      <input type="hidden" name="page" value={page} />
      <input type="hidden" name="interest" value="team-pricing" />
      <Honeypot id={id("website")} />
      <div className="ix-form__row">
        <div>
          <label htmlFor={id("name")} className="block font-semibold">
            Name
          </label>
          <input id={id("name")} name="name" type="text" autoComplete="name" required defaultValue={state.values?.name} className={input} aria-invalid={Boolean(state.errors?.name)} />
          {state.errors?.name && <p className="plan__err">{state.errors.name}</p>}
        </div>
        <div>
          <label htmlFor={id("email")} className="block font-semibold">
            Email
          </label>
          <input id={id("email")} name="email" type="email" autoComplete="email" required defaultValue={state.values?.email} className={input} aria-invalid={Boolean(state.errors?.email)} />
          {state.errors?.email && <p className="plan__err">{state.errors.email}</p>}
        </div>
      </div>
      <div className="ix-form__row">
        <div>
          <label htmlFor={id("org")} className="block font-semibold">
            Team or organization
          </label>
          <input id={id("org")} name="org" type="text" autoComplete="organization" required defaultValue={state.values?.org} className={input} aria-invalid={Boolean(state.errors?.org)} />
          {state.errors?.org && <p className="plan__err">{state.errors.org}</p>}
        </div>
        <div>
          <label htmlFor={id("phone")} className="block font-semibold">
            Phone (optional)
          </label>
          <input id={id("phone")} name="phone" type="tel" autoComplete="tel" defaultValue={state.values?.phone} className={input} />
        </div>
      </div>
      <div>
        <label htmlFor={id("message")} className="block font-semibold">
          How many athletes, and where would the boards go?
        </label>
        <textarea id={id("message")} name="message" rows={3} required className={input} defaultValue={state.values?.message ?? `Team pricing for: ${planLabel}\n`} aria-invalid={Boolean(state.errors?.message)} />
        {state.errors?.message && <p className="plan__err">{state.errors.message}</p>}
      </div>
      <Status state={state} />
      <button type="submit" disabled={pending} className="btn-primary text-lg disabled:opacity-60" data-team>
        {pending ? "Sending…" : "Ask about team pricing"}
      </button>
    </form>
  );
}

/** Clinic lane: book a demo, with the ROI inputs captured (no numbers invented here). */
export function DemoForm({ page, planLabel }: { page: string; planLabel: string }) {
  const [state, action, pending] = useActionState(submitInquiry, initial);
  const uid = useId();
  const id = (n: string) => `${uid}-${n}`;
  if (state.status === "ok") return <Done message={state.message} />;
  return (
    <form action={action} noValidate className="ix-form__panel ix-form__panel--open">
      <input type="hidden" name="kind" value="clinic" />
      <input type="hidden" name="page" value={page} />
      <input type="hidden" name="interest" value="demo" />
      <Honeypot id={id("website")} />
      <fieldset className="ix-roi">
        <legend className="ix-roi__title">{CLINIC.roiTitle}</legend>
        <p className="ix-roi__intro">{CLINIC.roiIntro.replace("{you}", "you")}</p>
        <div className="ix-roi__grid">
          {CLINIC.roiInputs.map((f) => (
            <div key={f.key}>
              <label htmlFor={id(f.key)} className="block font-semibold">
                {f.label}
                {f.unit && <span className="font-normal text-ink-2"> ({f.unit})</span>}
              </label>
              <input id={id(f.key)} name={`roi_${f.key}`} type="number" inputMode="decimal" min="0" className={input} />
            </div>
          ))}
        </div>
      </fieldset>
      <div className="ix-form__row">
        <div>
          <label htmlFor={id("name")} className="block font-semibold">
            Name
          </label>
          <input id={id("name")} name="name" type="text" autoComplete="name" required defaultValue={state.values?.name} className={input} aria-invalid={Boolean(state.errors?.name)} />
          {state.errors?.name && <p className="plan__err">{state.errors.name}</p>}
        </div>
        <div>
          <label htmlFor={id("email")} className="block font-semibold">
            Email
          </label>
          <input id={id("email")} name="email" type="email" autoComplete="email" required defaultValue={state.values?.email} className={input} aria-invalid={Boolean(state.errors?.email)} />
          {state.errors?.email && <p className="plan__err">{state.errors.email}</p>}
        </div>
      </div>
      <div className="ix-form__row">
        <div>
          <label htmlFor={id("org")} className="block font-semibold">
            Clinic or organization
          </label>
          <input id={id("org")} name="org" type="text" autoComplete="organization" required defaultValue={state.values?.org} className={input} aria-invalid={Boolean(state.errors?.org)} />
          {state.errors?.org && <p className="plan__err">{state.errors.org}</p>}
        </div>
        <div>
          <label htmlFor={id("phone")} className="block font-semibold">
            Phone (optional)
          </label>
          <input id={id("phone")} name="phone" type="tel" autoComplete="tel" defaultValue={state.values?.phone} className={input} />
        </div>
      </div>
      <div>
        <label htmlFor={id("message")} className="block font-semibold">
          Anything else we should know?
        </label>
        <textarea id={id("message")} name="message" rows={3} required className={input} defaultValue={state.values?.message ?? `Demo request. Situation: ${planLabel}\n`} aria-invalid={Boolean(state.errors?.message)} />
        {state.errors?.message && <p className="plan__err">{state.errors.message}</p>}
      </div>
      <Status state={state} />
      <button type="submit" disabled={pending} className="btn-primary text-lg disabled:opacity-60" data-demo>
        {pending ? "Sending…" : "Book a demo"}
      </button>
    </form>
  );
}
