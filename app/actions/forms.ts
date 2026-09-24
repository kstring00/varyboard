"use server";

import { brand } from "@/content/facts";

/**
 * Handles the contact, clinic, plan-email and team-pricing forms.
 *
 * Delivery, in order of preference (set ONE in Vercel > Environment Variables):
 *   FORM_WEBHOOK_URL   any endpoint that accepts a JSON POST (Formspree, Zapier, Make, n8n...)
 *   RESEND_API_KEY     sends an email to info@ via Resend (also set FORM_FROM_EMAIL to a verified sender)
 * With neither set, the form reports that it could not send and shows the phone and email.
 */
export type FormKind = "contact" | "clinic" | "plan" | "team";

export interface FormState {
  status: "idle" | "ok" | "error";
  message?: string;
  errors?: Partial<Record<"name" | "email" | "phone" | "message" | "org" | "consent", string>>;
  /** What the visitor typed, echoed back on a validation error so the form does not clear. */
  values?: Partial<Record<"name" | "email" | "phone" | "message" | "org" | "role" | "consent" | "interest", string>>;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(v: FormDataEntryValue | null, max = 2000) {
  return (typeof v === "string" ? v : "").trim().slice(0, max);
}

export async function submitInquiry(_prev: FormState, formData: FormData): Promise<FormState> {
  const kindRaw = clean(formData.get("kind"), 20);
  const kind: FormKind = kindRaw === "clinic" || kindRaw === "plan" || kindRaw === "team" ? kindRaw : "contact";
  const consent = clean(formData.get("consent"), 5) === "yes";
  const roi = [...formData.entries()].filter(([k, v]) => k.startsWith("roi_") && typeof v === "string" && v.trim()).map(([k, v]) => `${k.slice(4)}=${String(v).trim().slice(0, 20)}`).join(", ");
  const data = {
    kind,
    name: clean(formData.get("name"), 120),
    email: clean(formData.get("email"), 200),
    phone: clean(formData.get("phone"), 40),
    org: clean(formData.get("org"), 160),
    role: clean(formData.get("role"), 120),
    interest: clean(formData.get("interest"), 60),
    message: clean(formData.get("message")),
    page: clean(formData.get("page"), 200),
    consent,
    roi,
    submittedAt: new Date().toISOString(),
  };

  // Honeypot: real people never fill this in.
  if (clean(formData.get("website"), 10)) return { status: "ok", message: "Thanks. We have your message." };

  const errors: FormState["errors"] = {};
  if (data.name.length < 2) errors.name = "Please enter your name.";
  if (!EMAIL.test(data.email)) errors.email = "Please enter a valid email address.";
  if ((kind === "clinic" || kind === "team") && data.org.length < 2) errors.org = kind === "team" ? "Please enter your team or organization." : "Please enter your clinic or organization.";
  if (kind === "plan" && !consent) errors.consent = "Please tick the box so we can email you.";
  if (data.message.length < 5) errors.message = kind === "clinic" ? "Tell us a little about your clinic and what you need." : "Please enter a message.";
  if (Object.keys(errors).length) return { status: "error", errors, message: "Please check the highlighted fields.", values: { name: data.name, email: data.email, phone: data.phone, message: data.message, org: data.org, role: data.role, interest: data.interest, consent: consent ? "yes" : "" } };

  const fallback = `We could not send your message just now. Please call ${brand.phone} or email ${brand.email}.`;
  const subject =
    kind === "clinic" ? `Clinic pricing / demo request from ${data.org}` : kind === "team" ? `Team pricing inquiry from ${data.org}` : kind === "plan" ? `Plan email requested by ${data.name}` : `Website message from ${data.name}`;

  try {
    if (process.env.FORM_WEBHOOK_URL) {
      const res = await fetch(process.env.FORM_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ subject, ...data }),
      });
      if (!res.ok) throw new Error(`webhook ${res.status}`);
    } else if (process.env.RESEND_API_KEY) {
      // A plan email goes to the visitor (they asked for it, with consent); everything else to info@.
      const text =
        kind === "plan"
          ? `${data.message}\n\nQuestions? Call ${brand.phone} or reply to this email.`
          : Object.entries(data)
              .map(([k, v]) => `${k}: ${v}`)
              .join("\n");
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: process.env.FORM_FROM_EMAIL ?? `website@${brand.domain}`,
          to: kind === "plan" ? [data.email] : [brand.email],
          bcc: kind === "plan" ? [brand.email] : undefined,
          reply_to: kind === "plan" ? brand.email : data.email,
          subject,
          text,
        }),
      });
      if (!res.ok) throw new Error(`resend ${res.status}`);
    } else {
      console.error("[forms] No delivery configured (FORM_WEBHOOK_URL or RESEND_API_KEY). Submission:", JSON.stringify(data));
      return { status: "error", message: fallback };
    }
  } catch (err) {
    console.error("[forms] delivery failed", err);
    return { status: "error", message: fallback };
  }

  return {
    status: "ok",
    message:
      kind === "clinic"
        ? "Thanks. We have your request and will be in touch about clinic pricing and a demo."
        : kind === "team"
          ? "Thanks. We have your request and will be in touch about team pricing."
          : kind === "plan"
            ? "Thanks. Your plan is on its way to your inbox."
            : "Thanks. We have your message and will get back to you soon.",
  };
}
