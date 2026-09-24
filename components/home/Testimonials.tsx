import { reviewsUrl } from "@/content/config";
import { storeReviews } from "@/content/facts";
import { reviews } from "@/content/reviews";
import { shareStoryLink } from "@/content/routes";
import { ReviewBand, type BandCell, type BandReview } from "./ReviewBand";

/**
 * IN THEIR WORDS (#reviews): a drifting honeycomb band of real reviews, directly above the
 * closing pricing section. Built from reference/testimonials-preview.html. content/reviews.ts is
 * the only source: `featured` reviews, in file order, with their exact `excerpt`s.
 *
 * Layout (computed here, identical on server and client, so nothing shifts): two staggered rows
 * of flat-top hexagons. One loop = the featured reviews plus the invitation cell, repeated
 * (shifted) until it spans an even number of columns so the zigzag lines up when it repeats.
 * The track holds the loop twice and drifts one loop to the left, forever. Only the first
 * appearance of each review (and of the invitation) is focusable and announced; every repeat and
 * the whole second copy are aria-hidden with tabindex -1.
 */
type Item = { kind: "review"; k: number } | { kind: "invite" };

function buildLoop(n: number): Item[] {
  const base: Item[] = [...Array.from({ length: n }, (_, k) => ({ kind: "review" as const, k })), { kind: "invite" }];
  let loop = base.slice();
  const SHIFT = 3; // each repeat starts three cells later, as in the reference
  const off = SHIFT % base.length;
  while ((loop.length / 2) % 2 !== 0 || loop.length < 12) loop = loop.concat(base.slice(off), base.slice(0, off));
  if (loop.length % 2) loop.push({ kind: "invite" });
  return loop;
}

export function Testimonials() {
  const featured = reviews.filter((r) => r.featured);
  if (featured.length === 0) return null;
  const band: BandReview[] = featured.map((r) => ({ id: r.id, name: r.author, initials: r.initials, lane: r.lane, label: r.label, excerpt: r.excerpt, body: r.body, focal: Boolean(r.focal) }));
  const loop = buildLoop(band.length);
  const cols = loop.length / 2;
  const seen = new Set<string>();
  const cells: BandCell[] = [];
  for (let copy = 0; copy < 2; copy++)
    loop.forEach((item, j) => {
      const i = copy * loop.length + j;
      const key = item.kind === "review" ? `r${item.k}` : "invite";
      const primary = copy === 0 && !seen.has(key);
      if (primary) seen.add(key);
      const col = Math.floor(i / 2);
      cells.push({ key: `${copy}-${j}`, kind: item.kind, k: item.kind === "review" ? item.k : -1, col, row: i % 2, odd: col % 2, primary, copy });
    });

  const { storeReviewCount: count, storeReviewAverage: avg } = storeReviews;
  return (
    <section id="reviews" aria-labelledby="reviews-title" className="rv">
      <div className="rv__inner rv__head">
        <div>
          <p className="rv__eyebrow">In their words</p>
          <h2 id="reviews-title" className="rv__title">
            Real people. Real walls.
          </h2>
          <p className="rv__lede">Clinics, service members and families, quoted word for word from their reviews.</p>
        </div>
        <p className="rv__stat">
          <span className="rv__big">{count}</span>
          <span>
            <span className="rv__stars" aria-hidden="true">
              {"★".repeat(Math.round(avg))}
            </span>
            <span className="sr-only">, averaging {avg} out of 5 stars,</span>
            <br />
            <span className="rv__sm">reviews on the Vary Board store</span>
          </span>
        </p>
      </div>
      <ReviewBand reviews={band} cells={cells} cols={cols} invite={shareStoryLink} allHref={reviewsUrl} allLabel={`Read all ${count} reviews`} />
    </section>
  );
}
