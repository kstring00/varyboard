import { Stars } from "@/components/ui/Stars";
import type { Lane } from "@/content/intake";
import { canFeature, reviews as allReviews, type Review } from "@/content/reviews";

const reviews = allReviews.filter(canFeature);

/**
 * One real review matched to the plan lane by the review's lane (Military, Clinic, Home).
 * Reviews are pasted verbatim into content/reviews.ts by Eric; nothing here is written by us.
 * Renders nothing while no matching review exists (never an invented person).
 */
const LANE: Record<Lane, Review["lane"] | null> = { mil: "Military", clinic: "Clinic", me: "Home", loved: "Home", athlete: null };

export function laneReview(lane: Lane): Review | undefined {
  const want = LANE[lane];
  return (want ? reviews.find((r) => r.lane === want) : undefined) ?? reviews.find((r) => r.featured) ?? reviews[0];
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
