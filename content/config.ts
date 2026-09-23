/**
 * Commerce and delivery configuration for the "Find your plan" flow.
 *
 * Prices live in ./facts (the single price file). Checkout links come from lib/commerce,
 * which builds Shopify cart permalinks from the variant ids in ./facts and the host in
 * NEXT_PUBLIC_SHOP_DOMAIN. Nothing here invents a number.
 */

/**
 * Military discount. CONFIRM_WITH_ERIC: we know it is 10% for veterans, active duty and
 * first responders (facts.ts `discounts`). We do NOT know how Shopify applies it:
 *   - "code": a discount code typed at checkout (set `code` and it is appended to cart links)
 *   - "verification": an ID-verification step at checkout (e.g. an app), no code needed
 *   - "unknown": show the discount line and the phone number; do not promise a mechanism
 */
export const militaryDiscount: { mechanism: "code" | "verification" | "unknown"; code?: string } = {
  mechanism: "unknown",
};

/**
 * Plan emails are delivered by the existing forms action (app/actions/forms.ts):
 * FORM_WEBHOOK_URL or RESEND_API_KEY (Resend, under Eric's account; the key is an env var
 * listed in HANDOFF.md). No key set => the form reports it could not send and shows the phone.
 */
export const emailProvider = { name: "Resend", envVar: "RESEND_API_KEY" } as const;

/**
 * VA provider packet. When Eric supplies a real PDF, drop it at this path and the `mil` lane
 * offers it for download. Until then the lane links to the print-friendly provider page.
 */
export const vaPacket = { pdfPath: "/docs/va-provider-packet.pdf" } as const;

/** Sections of the plan result page, in order. Used by the completeness check. */
export const RESULT_SECTIONS = ["reflect", "hexagon", "try", "weeks", "questions", "cta", "related"] as const;
