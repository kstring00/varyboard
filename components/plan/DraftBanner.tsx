import { isProduction } from "@/lib/env";

/**
 * Shown on preview and local builds whenever a page renders content Eric has not reviewed.
 * Never shown in production: `npm run audit:content` blocks production builds until the
 * unreviewed list is empty.
 */
export function DraftBanner({ items }: { items: string[] }) {
  if (isProduction || items.length === 0) return null;
  return (
    <div className="ix-draft no-print" role="note" data-draft>
      <strong>Draft, not reviewed by Eric.</strong> {items.length} item{items.length === 1 ? "" : "s"} on this page still need review. Run <code>npm run audit:content</code> for the list.
    </div>
  );
}
