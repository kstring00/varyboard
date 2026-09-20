/**
 * Real customer reviews, verbatim. NEVER write or edit a review here.
 * Eric pastes the export from the Shopify reviews app; each entry maps 1:1 to a real review.
 *
 * `featured: true` reviews are shown in the homepage PROOF section.
 * The star summary is computed from this array, never typed by hand.
 */
export interface Review {
  id: string;
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  /** ISO date, e.g. "2025-03-14" */
  date: string;
  title?: string;
  body: string;
  /** e.g. "Physical therapy clinic" or "Veteran" - only if the reviewer said so. */
  context?: string;
  verified?: boolean;
  featured?: boolean;
}

/** PASTE THE EXPORT HERE. Empty until supplied; the PROOF section hides itself while empty. */
export const reviews: Review[] = [];

export function reviewSummary(list: Review[] = reviews) {
  const count = list.length;
  const average = count ? list.reduce((s, r) => s + r.rating, 0) / count : 0;
  return { count, average: Math.round(average * 10) / 10 };
}
