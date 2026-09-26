import { board, formatPrice, products, storeReviews } from "./facts";
import { fillFacts, GENRE_LIST } from "./genres";
import type { Genre, Reviewed } from "./intake";
import { canFeature, excerptCore, reviewById } from "./reviews";
import { rv, unreviewedIn } from "./reviewed";
import type { SourceKey } from "./sources";

/**
 * The homepage scroll-build hero (components/home/hero). Every word the hero shows lives here,
 * in beat order, ported from reference/varyboard-scroll-build.html.
 *
 * Rules
 *  - Every statistic has a `source` (content/sources.ts) and every statistic, caption and
 *    health-related line is rv("…") with reviewedByEric false until Eric signs it off.
 *    `npm run audit:content` lists them; `npm run review:export` puts them in content/review.csv.
 *  - Numbers and specs come from content/facts.ts through {tokens} (see content/genres.ts
 *    fillFacts), never typed into a sentence here. Keep a statistic's whole object on one line:
 *    the safety audit looks for its `source:` on the same line.
 *  - Blake Cook's quote is read from content/reviews.ts, never retyped.
 *  - VA wording is exact: VA_COVERAGE below. Never "free". The XT price never appears in the hero.
 *  - The demo moves are described in `demos` so Eric can approve what the figures act out.
 */

/** The only approved VA coverage wording. The build fails if a VA line drops it. */
export const VA_COVERAGE = "may be covered when your provider finds it medically necessary.";
/** Coverage is never described as costing nothing. */
const NOT_ALLOWED_IN_COVERAGE = /\bfree\b/i;
/** Throws unless a coverage line keeps the approved wording. */
export function checkCoverage(file: string, line: string) {
  if (!line.includes(VA_COVERAGE) || NOT_ALLOWED_IN_COVERAGE.test(line)) throw new Error(`${file}: the coverage line must keep the approved wording (VA_COVERAGE in content/hero.ts)`);
}

export interface HeroStat {
  key: string;
  figure: string;
  caption: Reviewed;
  source: SourceKey;
  /** Mint "solution" cell (the $199 line) instead of a teal study cell. */
  solution?: boolean;
  /** The lighter mint fill on the middle stakes hexagon. */
  alt?: boolean;
}

export const HERO = {
  /** Beat 0 */
  hook: {
    // Reid: "20+ years of military service" (facts.ts founders.reid). Eric to confirm the wording.
    eyebrow: rv("Designed by a physical therapist · Built with a 20‑year veteran"),
    headline: { lead: "The appointment ends.", accent: "Your recovery doesn't." },
    rotatePrefix: "Keep it going",
    rotating: ["at home.", "between VA visits.", "on base.", "in the clinic.", "in the locker room."],
    rotatingStatic: "at home, between VA visits, on base, in the clinic and in the locker room.",
    cue: "Scroll to build it",
  },
  /** Beat 1 */
  problem: {
    eyebrow: "The hidden problem",
    headline: { lead: "Therapy works.", accent: "Stopping is the problem." },
    lead: rv("Three published findings on what happens after the appointment ends, when the exercise sheet goes in a drawer."),
    stats: [
      { key: "adherence", figure: "Up to 70%", caption: rv("of back pain patients don't keep up with their home exercises"), source: "beinart2013" },
      { key: "recurrence", figure: "69%", caption: rv("had back pain come back within a year of recovering"), source: "daSilva2019", alt: true },
      { key: "exercise", figure: "35%", caption: rv("lower risk of a new episode with exercise. The benefit faded after a year."), source: "steffens2016" },
    ] satisfies HeroStat[],
  },
  /** Beat 2 (the anchors and carabiners that follow have no copy of their own) */
  space: {
    eyebrow: "01 · The space",
    headline: rv("All it asks for is {spaceFeet}."),
    lead: rv("The Vary Board is a physical therapist's gym on one wall. It sticks out just {depth} and needs less floor than a yoga mat."),
    /** Rendered as "Does the job of a" + one crossed-out chip per item. */
    swap: rv("Does the job of a finger ladder, balance bar, band station"),
  },
  /** Beat 3 */
  served: {
    eyebrow: "02 · For those who served",
    headline: rv("Injuries sideline troops. Rehab carries the bill."),
    stats: [
      { key: "nondeployable", figure: "65%", caption: rv("of non-deployable soldiers: muscle & joint injuries"), source: "molloy2020" },
      { key: "outsideCare", figure: "$366M", caption: rv("one year of outside care for those injuries"), source: "pav2024" },
      { key: "once", figure: "{price}", caption: rv("once, to keep rehab going between visits"), source: "bluebook2025", solution: true },
    ] satisfies HeroStat[],
    /** Desktop lead, then the shorter phone lead. Both compare against the PT course cost (source: bluebook2025). */
    lead: rv("A 12-week course of PT can run $1,200 to $8,000 or more. The Vary Board doesn't replace those visits. It makes every day between them count, on base or at home."),
    leadShort: rv("A course of PT can run $1,200–$8,000+. This makes the days between visits count."),
    sources: ["molloy2020", "pav2024", "bluebook2025"] satisfies SourceKey[],
  },
  /** Beat 4 */
  program: {
    eyebrow: "03 · Your program",
    headline: "The rehab exercises, on your wall.",
    lead: rv("Band work and stretches at the same heights every session, at home or on base."),
    quoteReviewId: "blake-cook",
  },
  /** Beat 5 */
  finale: {
    eyebrow: `${board.patentLine} · Designed by a physical therapist`,
    headline: { lead: "One wall.", accent: "Six ways", tail: "to move better." },
    who: ["patients and families", "veterans and the VA", "clinics", "teams"],
    cta: "Find your plan",
    va: rv("Veteran or VA clinician? The Vary Board may be covered when your provider finds it medically necessary."),
    vaLink: "Get the provider packet",
    /** Shown under the six hexagons until one is pointed at or focused. */
    defaultCaption: "Point to a hexagon to see how it works.",
    /** One short line per genre, after Eric's clinical name, in the hover/focus caption. */
    captions: {
      climb: rv("Walk your hands up the hexagons."),
      strengthen: rv("Bands clipped to anchor points."),
      stretch: rv("Hold the board and lengthen."),
      loosen: rv("Gentle joint movement."),
      steady: rv("Handrails to hold while you train balance."),
      rise: rv("Sit-to-stand, reaching and stepping."),
    } satisfies Record<Genre, Reviewed>,
  },
  progressLabel: "Skip to the six ways",
  /** What the placeholder figures act out. Eric approves the moves, not just the words. */
  demos: {
    stretch: rv("Beat 3: standing side stretch, one hand on the board, the other arm reaching up and over."),
    pulldown: rv("Beat 4: band pulldown from the highest carabiner, the other hand at the hip."),
    climb: rv("Finale, Climb: arm walks up along the rail and back down."),
    strengthen: rv("Finale, Strengthen: band pulldown from the top anchor."),
    stretchMini: rv("Finale, Stretch: standing side stretch."),
    loosen: rv("Finale, Loosen: small arm circles, other hand on the rail."),
    steady: rv("Finale, Steady: stand on one leg holding the rail."),
    rise: rv("Finale, Rise: sit to stand from a chair, holding the rail."),
  },
};

/* ------------------------------------------------------------------ derived ---- */

/** Blake Cook's excerpt, word for word from content/reviews.ts. */
export function heroQuote() {
  const r = reviewById(HERO.program.quoteReviewId);
  if (!r) throw new Error(`content/hero.ts: review ${HERO.program.quoteReviewId} is missing from content/reviews.ts`);
  if (!canFeature(r)) throw new Error(`content/hero.ts: review ${r.id} is list-only and cannot appear in the hero`);
  if (!r.body.includes(excerptCore(r.excerpt))) throw new Error(`content/hero.ts: the excerpt for ${r.id} is not word for word`);
  // Stars only when the source supplies a rating for this review. Never assumed.
  return { text: r.excerpt, author: r.author, context: r.context ?? r.lane, stars: r.rating ?? 0 };
}

/** "47 five-star reviews" from facts.ts storeReviews ([VERIFY] there). */
export function heroProof() {
  const { storeReviewCount: count, storeReviewAverage: avg } = storeReviews;
  return {
    stars: Math.round(avg),
    reviews: avg === 5 ? `${count} five-star reviews` : `${count} reviews, ${avg} average`,
    price: `From ${formatPrice(products.board.price)}, bought once`,
  };
}

/** A figure or line with its fact tokens filled. */
export const fill = (s: string) => fillFacts(s);

/** Split the "Does the job of a …" line into its lead-in and the crossed-out items. */
export function splitSwap(line: string): { lead: string; items: string[] } {
  const m = line.match(/^(.*?\bof an?)\s+(.+?)\.?$/);
  if (!m) return { lead: line, items: [] };
  return { lead: m[1], items: m[2].split(/,\s*(?:and\s+|or\s+)?|\s+and\s+/).filter(Boolean) };
}

/** The six genres with Eric's clinical names, in ring order (top, then clockwise). */
export const heroGenres = () =>
  GENRE_LIST.map((g) => ({ key: g.key, name: g.plainName, term: g.clinicalName, caption: HERO.finale.captions[g.key].value }));

/** Every hero line Eric has not reviewed, for audit:content and the Draft banner. */
export function unreviewedHero(): string[] {
  return unreviewedIn(HERO, "hero");
}

checkCoverage("content/hero.ts", HERO.finale.va.value);
