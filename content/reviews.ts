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
  /** Star rating, only when the source shows one. The testimonials on the old site show none. */
  rating?: 1 | 2 | 3 | 4 | 5;
  /** ISO date, e.g. "2025-03-14", only when the source shows one. */
  date?: string;
  title?: string;
  body: string;
  /** e.g. "Physical therapy clinic" or "Veteran" - only if the reviewer said so. */
  context?: string;
  verified?: boolean;
  featured?: boolean;
}

/**
 * Testimonials from the thevaryboard.com homepage (Shopify theme), copied word for word,
 * typos and capitals included. No ratings or dates: the source shows none.
 * D. Muhammad's testimonial is also on that page; paste it here verbatim when available.
 */
export const reviews: Review[] = [
  {
    id: "ashley-workman",
    author: "Ashley Workman",
    body: "This versatile device changed the physical therapy game. This single piece of equipment replaced 3 separate other pieces in my outpatient orthopedic physical therapy clinic. It is a space saver with potential to help perform resistance exercise, joint mobilizations, balance exercise, and stretching exercises, while also providing a comfortable and sturdy hand held assist.",
    context: "Physical therapy clinic",
  },
  {
    id: "blake-cook",
    author: "Blake Cook",
    title: "A VERSATILE MILITARY CAREER SAVER",
    body: "The Vary Board is the most versatile and expertly designed mobility gym equipment that I have ever used during my entire 26-year service in the military. VB's versatility spans all ages, health conditions, physical capacities, and personal performance, as well as having the capability to exercise nearly all of the joints and muscle groups. I first used VB to recover from a potentially career ending surgery, and now, complete recovered, I continue to use VB to improve my strength and mobility for my entire body. I absolutely love Vary Board and wish all service men and women had access to VB's career enhancing potential on their bases/posts/stations at home and in all deployed locations. My belief is so strong that I personally purchased a VB for my family and I to use in our home gym. Your joints and muscles will thank you, and you'll have the rest of your life to enjoy its benefits!",
    context: "Military",
  },
  {
    id: "j-white",
    author: "J. White",
    body: "The Vary Board will allow my parents to improve their strength and balance in a safe and easy-to-use way. I want to help them maintain their quality of life and reduce their risk of falls.",
  },
  {
    id: "b-castillo",
    author: "B. Castillo",
    body: "The Vary Board is reliable and practical for home use, and easy to install. It allows my family to stay active without having to go to a gym.",
  },
  {
    id: "j-jones",
    author: "J. Jones",
    body: "After I had herniated disc surgery, I struggled to find a piece of equipment that had the versatility I needed to regain my core strength. After utilizing the Vary Board, I easily added 10-15 additional exercises right from home which allowed me to dramatically improve my mobility and quality of life.",
  },
];

export const reviewById = (id: string) => reviews.find((r) => r.id === id);

/** Star summary over the reviews that carry a rating. count 0 = show no stars at all. */
export function reviewSummary(list: Review[] = reviews) {
  const rated = list.filter((r): r is Review & { rating: NonNullable<Review["rating"]> } => r.rating !== undefined);
  const count = rated.length;
  const average = count ? rated.reduce((s, r) => s + r.rating, 0) / count : 0;
  return { count, average: Math.round(average * 10) / 10 };
}
