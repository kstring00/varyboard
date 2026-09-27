import { faqFor, toView, type FaqPlacement } from "@/content/faq";
import { FaqDetails } from "./FaqDetails";

/**
 * The questions a visitor asks right here, as small chips (content/faq.ts `placements`).
 * At most `max` per section (2; the Buy strip allows 3), first ones by file order. Production
 * shows verified answers only. "More in FAQ" deep-links to the entry in the FAQ section.
 */
export function InlineFaq({ placement, max = 2, tone = "light", className = "" }: { placement: FaqPlacement; max?: number; tone?: "light" | "dark"; className?: string }) {
  const all = faqFor(placement);
  if (all.length > max && process.env.NODE_ENV === "development")
    console.warn(`[InlineFaq] "${placement}" has ${all.length} questions; showing the first ${max}: ${all.slice(0, max).map((e) => e.id).join(", ")}`);
  const items = all.slice(0, max);
  if (items.length === 0) return null;
  return (
    <div className={`faqi faqi--${tone} ${className}`} data-placement={placement}>
      {items.map((e) => (
        <FaqDetails key={e.id} item={toView(e)} placement={placement} moreHref={e.featured ? `/#faq-${e.id}` : e.placements.includes("faq") ? `/faq#faq-${e.id}` : undefined} />
      ))}
    </div>
  );
}
