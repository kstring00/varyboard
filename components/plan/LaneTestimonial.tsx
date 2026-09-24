import { Stars } from "@/components/ui/Stars";
import type { Lane } from "@/content/intake";
import { reviews, type Review } from "@/content/reviews";

/**
 * One real review matched to the lane by the reviewer's own stated context.
 * Reviews are pasted verbatim into content/reviews.ts by Eric; nothing here is written by us.
 * Renders nothing while no matching review exists (never an invented person).
 */
const MATCH: Record<Lane, RegExp | null> = {
  mil: /veteran|military|active duty|army|navy|marine|air force|coast guard|service/i,
  clinic: /clinic|therap|\bPT\b|\bOT\b|rehab/i,
  athlete: /athlete|coach|train|team|player/i,
  me: null,
  loved: /parent|mother|father|mom|dad|husband|wife|spouse|gift/i,
};

export function laneReview(lane: Lane): Review | undefined {
  const re = MATCH[lane];
  const pool = re ? reviews.filter((r) => r.context && re.test(r.context)) : [];
  return pool[0] ?? reviews.find((r) => r.featured) ?? reviews[0];
}

export function LaneTestimonial({ lane }: { lane: Lane }) {
  const r = laneReview(lane);
  if (!r) return null;
  return (
    <figure className="ix-review">
      {r.rating !== undefined && <Stars value={r.rating} />}
      {r.title && <p className="ix-review__title">{r.title}</p>}
      <blockquote className="ix-review__body">{r.body}</blockquote>
      <figcaption className="ix-review__by">
        {r.author}
        {r.context ? ` · ${r.context}` : ""}
        {r.verified ? " · Verified buyer" : ""}
      </figcaption>
    </figure>
  );
}
