import type { Reviewed } from "./intake";

/**
 * rv("…"): a line Eric must sign off. `reviewedByEric` stays false until he does (the review
 * round trip, scripts/review-items.ts, finds every rv("…") call and flips the second argument).
 */
export const rv = (value: string, reviewedByEric = false): Reviewed => ({ value, reviewedByEric });

/**
 * Every rv("…") inside a content object that Eric has not reviewed, as `prefix:path: "text"`.
 * Array items with a `key` are named by it, so ids survive reordering. Same ids as review:export.
 */
export function unreviewedIn(root: unknown, prefix: string): string[] {
  const out: string[] = [];
  const walk = (v: unknown, path: string) => {
    if (!v || typeof v !== "object") return;
    const o = v as Record<string, unknown>;
    if (typeof o.value === "string" && typeof o.reviewedByEric === "boolean") {
      if (!o.reviewedByEric) out.push(`${prefix}:${path}: "${o.value}"`);
      return;
    }
    for (const [k, x] of Object.entries(o)) {
      const name = Array.isArray(v) ? ((x as { key?: unknown })?.key as string | undefined) ?? k : k;
      walk(x, path ? `${path}.${name}` : name);
    }
  };
  walk(root, "");
  return out;
}
