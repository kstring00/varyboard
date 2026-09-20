"use client";

import { useActionState, useId } from "react";
import { submitInquiry, type FormKind, type FormState } from "@/app/actions/forms";
import { brand } from "@/content/facts";

const initial: FormState = { status: "idle" };

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block font-semibold">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-[0.95rem] font-medium text-[#9b3b2f]">
          {error}
        </p>
      )}
    </div>
  );
}

const input = "block w-full min-h-12 rounded-xl border border-line bg-white px-4 py-3 text-lg text-ink placeholder:text-muted focus:border-teal-deep";

export function InquiryForm({ kind, page }: { kind: FormKind; page: string }) {
  const [state, action, pending] = useActionState(submitInquiry, initial);
  const uid = useId();
  const id = (n: string) => `${uid}-${n}`;
  const e = state.errors ?? {};

  if (state.status === "ok") {
    return (
      <div role="status" className="rounded-2xl border border-teal/60 bg-teal-soft/60 p-6">
        <h3 className="text-xl font-medium">Message sent</h3>
        <p className="mt-2 text-lg text-ink-2">{state.message}</p>
        <p className="mt-4 text-ink-2">
          Need something sooner? Call{" "}
          <a href={brand.phoneHref} className="link">
            {brand.phone}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form action={action} noValidate className="grid gap-5">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="page" value={page} />
      {/* Honeypot, hidden from people */}
      <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor={id("website")}>Website</label>
        <input id={id("website")} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={id("name")} label="Your name" error={e.name}>
          <input id={id("name")} name="name" type="text" autoComplete="name" required className={input} aria-invalid={Boolean(e.name)} aria-describedby={e.name ? `${id("name")}-error` : undefined} />
        </Field>
        <Field id={id("email")} label="Email" error={e.email}>
          <input id={id("email")} name="email" type="email" autoComplete="email" required className={input} aria-invalid={Boolean(e.email)} aria-describedby={e.email ? `${id("email")}-error` : undefined} />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={id("phone")} label="Phone (optional)" error={e.phone}>
          <input id={id("phone")} name="phone" type="tel" autoComplete="tel" className={input} />
        </Field>
        {kind === "clinic" ? (
          <Field id={id("org")} label="Clinic or organization" error={e.org}>
            <input id={id("org")} name="org" type="text" autoComplete="organization" required className={input} aria-invalid={Boolean(e.org)} aria-describedby={e.org ? `${id("org")}-error` : undefined} />
          </Field>
        ) : (
          <Field id={id("interest")} label="What can we help with?">
            <select id={id("interest")} name="interest" className={input} defaultValue="question">
              <option value="question">A question before I order</option>
              <option value="order">An existing order</option>
              <option value="discount">Veteran, active duty or first responder discount</option>
              <option value="other">Something else</option>
            </select>
          </Field>
        )}
      </div>
      {kind === "clinic" && (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id={id("role")} label="Your role">
            <input id={id("role")} name="role" type="text" autoComplete="organization-title" className={input} />
          </Field>
          <Field id={id("interest")} label="I'm interested in">
            <select id={id("interest")} name="interest" className={input} defaultValue="pricing">
              <option value="pricing">Clinic pricing</option>
              <option value="demo">A demo</option>
              <option value="both">Pricing and a demo</option>
            </select>
          </Field>
        </div>
      )}
      <Field id={id("message")} label={kind === "clinic" ? "Tell us about your clinic" : "Message"} error={e.message}>
        <textarea id={id("message")} name="message" rows={5} required className={input} aria-invalid={Boolean(e.message)} aria-describedby={e.message ? `${id("message")}-error` : undefined} placeholder={kind === "clinic" ? "How many boards, where they would go, and anything else we should know." : undefined} />
      </Field>

      {state.status === "error" && (
        <p role="alert" className="rounded-xl border border-[#e0b4ad] bg-[#fbeeec] px-4 py-3 font-medium text-[#7d2e24]">
          {state.message}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" disabled={pending} className="btn-primary text-lg disabled:opacity-60">
          {pending ? "Sending…" : kind === "clinic" ? "Request pricing / demo" : "Send message"}
        </button>
        <span className="text-ink-2">
          Or call{" "}
          <a href={brand.phoneHref} className="link">
            {brand.phone}
          </a>
        </span>
      </div>
    </form>
  );
}
