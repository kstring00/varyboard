"use server";

import { brand } from "@/content/facts";

/**
 * Handles the contact and clinic forms.
 *
 * Delivery, in order of preference (set ONE in Vercel > Environment Variables):
 *   FORM_WEBHOOK_URL   any endpoint that accepts a JSON POST (Formspree, Zapier, Make, n8n...)
 *   RESEND_API_KEY     sends an email to info@ via Resend (also set FORM_FROM_EMAIL to a verified sender)
 * With neither set, the form reports that it could not send and shows the phone and email.
 */
export type FormKind = "contact" | "clinic";

export interface FormState {
  status: "idle" | "ok" | "error";
  message?: string;
  errors?: Partial<Record<"name" | "email" | "phone" | "message" | "org", string>>;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(v: FormDataEntryValue | null, max = 2000) {
  return (typeof v === "string" ? v : "").trim().slice(0, max);
}

export async function submitInquiry(_prev: FormState, formData: FormData): Promise<FormState> {
  const kind = (clean(formData.get("kind"), 20) as FormKind) || "contact";
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
    submittedAt: new Date().toISOString(),
  };

  // Honeypot: real people never fill this in.
  if (clean(formData.get("website"), 10)) return { status: "ok", message: "Thanks. We have your message." };

  const errors: FormState["errors"] = {};
  if (data.name.length < 2) errors.name = "Please enter your name.";
  if (!EMAIL.test(data.email)) errors.email = "Please enter a valid email address.";
  if (kind === "clinic" && data.org.length < 2) errors.org = "Please enter your clinic or organization.";
  if (data.message.length < 5) errors.message = kind === "clinic" ? "Tell us a little about your clinic and what you need." : "Please enter a message.";
  if (Object.keys(errors).length) return { status: "error", errors, message: "Please check the highlighted fields." };

  const fallback = `We could not send your message just now. Please call ${brand.phone} or email ${brand.email}.`;
  const subject = kind === "clinic" ? `Clinic pricing / demo request from ${data.org}` : `Website message from ${data.name}`;

  try {
    if (process.env.FORM_WEBHOOK_URL) {
      const res = await fetch(process.env.FORM_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ subject, ...data }),
      });
      if (!res.ok) throw new Error(`webhook ${res.status}`);
    } else if (process.env.RESEND_API_KEY) {
      const text = Object.entries(data)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: process.env.FORM_FROM_EMAIL ?? `website@${brand.domain}`,
          to: [brand.email],
          reply_to: data.email,
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
        : "Thanks. We have your message and will get back to you soon.",
  };
}
