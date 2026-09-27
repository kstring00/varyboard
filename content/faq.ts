import { board, brand, discounts, formatPrice, products, shipping } from "./facts";
import { fillFacts } from "./genres";
import { isProduction } from "../lib/env";

/**
 * FAQ: the single source of truth for every question on the site. Each question appears inline
 * where the doubt starts (its `placements`), and the `featured` ones repeat in the FAQ section
 * above the Buy block. The /faq page lists every visible entry.
 *
 * Rules
 *  - Production shows only entries with status "verified" and a non-empty answer.
 *  - Preview and local builds also show "pending-eric" entries, with a "Pending Eric" badge and
 *    the answer "Waiting on Dr. Eric.", so the preview doubles as Eric's review copy.
 *  - Every entry is in the content audit (npm run audit:content, review:export): pending ones and
 *    any with reviewedByEric false. To publish an answer: write `a`, set status "verified", and
 *    Eric sets reviewedByEric true once he has read it (only then does it enter the JSON-LD).
 *  - Numbers come from content/facts.ts through {tokens} (see content/genres.ts fillFacts). Keep
 *    `a` a plain string so the review import can rewrite it. Never state an XT price here.
 *  - `previous` keeps the site's earlier wording, word for word, where a new answer replaced it
 *    or the entry is waiting on Eric.
 */
export type FaqGroup = "buying" | "fit" | "using" | "veterans" | "clinics" | "athletes";
export type FaqPlacement = "space" | "fit" | "genres" | "military" | "clinic" | "athletes" | "buy" | "faq";

export interface FaqEntry {
  id: string;
  q: string;
  /** The answer, 1-2 sentences. Empty until written. */
  a: string;
  group: FaqGroup;
  placements: FaqPlacement[];
  /** In the FAQ section above the Buy block (8-10 at most). */
  featured?: boolean;
  status: "verified" | "pending-eric";
  reviewedByEric: boolean;
  /** Where the answer comes from, e.g. "content/facts.ts", "Eric interview". */
  source?: string;
  /** A short fact for the scroll-build 3 x 3 ft line (<InlineFact />), shown once verified. */
  fact?: string;
  /** A follow-on link after the answer. */
  link?: { href: string; label: string };
  /** Earlier wording from the site, kept for Eric. Never rendered. */
  previous?: string;
}

/** The provider packet PDF does not exist yet: the military plan (which ends in a printable provider page) stands in. */
const PACKET_HREF = "/plan?for=mil";

export const FAQ: FaqEntry[] = [
  {
    id: "floor-space",
    q: "How much room does it need?",
    a: "About {space} of floor per person. The board mounts flat to the wall and sticks out about {depth}.",
    group: "fit",
    placements: ["space", "fit", "faq"],
    featured: true,
    status: "verified",
    reviewedByEric: false,
    source: "content/facts.ts",
    fact: "Mounts flat · {space} of floor · sticks out about {depthIn}",
    previous: `About ${board.minSpacePerUser} of clear floor space per person in front of the board. It mounts flat to the wall, so it takes up no floor space of its own.`,
  },
  {
    id: "which-model",
    q: "Vary Board or XT: which one do I need?",
    a: "The Vary Board is three sections: {heightIn} inches tall with {anchors} anchor points. The XT adds a fourth section: {heightInXT} inches with {anchorsXT} anchor points, for taller users or high ceilings.",
    group: "buying",
    placements: ["buy", "faq"],
    featured: true,
    status: "verified",
    reviewedByEric: false,
    source: "content/facts.ts",
    previous: `The ${products.board.name} (${products.board.specs[1].value} installed, ${formatPrice(products.board.price)}) fits most adults. The ${products.boardXT.name} (${products.boardXT.specs[1].value} installed, ${formatPrice(products.boardXT.price)}) adds a fourth section and is made for people ${board.heightGuidance.xt.replace("Users ", "")}.`,
  },
  {
    id: "material",
    q: "What is it made of?",
    a: "High-density polyethylene (HDPE).",
    group: "fit",
    placements: ["fit", "faq"],
    status: "verified",
    reviewedByEric: false,
    source: "content/facts.ts",
  },
  {
    id: "designed-by",
    q: "Who designed it?",
    a: "A Doctor of Physical Therapy. The Vary Board is patented.",
    group: "using",
    placements: ["faq"],
    featured: true,
    status: "verified",
    reviewedByEric: false,
    source: "content/facts.ts",
    previous: "Yes. The Vary Board is patented. (Was: \"Is the Vary Board patented?\")",
  },
  {
    id: "exercises",
    q: "How do I know which exercises to do?",
    a: "Start with Find your plan. Tell us what's getting harder and you'll get a short routine of Vary Board movements.",
    group: "using",
    placements: ["genres", "faq"],
    featured: true,
    status: "verified",
    reviewedByEric: false,
    link: { href: "/#find-your-plan", label: "Find your plan" },
  },
  {
    id: "va-coverage",
    q: "Will the VA cover it?",
    a: "The Vary Board may be covered when your provider finds it medically necessary. Ask your VA provider, and share our provider packet with them.",
    group: "veterans",
    placements: ["military", "faq"],
    featured: true,
    status: "verified",
    reviewedByEric: false,
    // [VERIFY] No packet PDF yet: this opens the military plan, which ends in the printable provider page.
    link: { href: PACKET_HREF, label: "Get the provider packet" },
  },
  {
    id: "military-discount",
    q: "Is there a military discount?",
    a: "{heroesPercent}% off for veterans, active duty and first responders.",
    group: "veterans",
    placements: ["military", "buy", "faq"],
    featured: true,
    status: "verified",
    reviewedByEric: false,
    source: "content/facts.ts (how to claim it: pending Eric)",
    previous: `Yes. ${discounts.heroesLine} Call ${brand.phone} or email ${brand.email} and we will set it up for you.`,
  },
  {
    id: "install",
    q: "Can I install it myself?",
    a: "",
    group: "fit",
    placements: ["space", "fit", "faq"],
    featured: true,
    status: "pending-eric",
    reviewedByEric: false,
    // Wanted: time, tools, studs, one or two people. Once verified, add a `fact` for the 3 x 3 ft line.
    previous: `The three sections stack to a ${products.board.specs[1].value} board and mount to the wall. Watch the installation video on our install page before you start.`,
  },
  {
    id: "ceiling",
    q: "Will the XT fit under an 8 ft ceiling?",
    a: "",
    group: "fit",
    placements: ["fit", "buy"],
    status: "pending-eric",
    reviewedByEric: false,
  },
  {
    id: "outdoor",
    q: "Can it go outside?",
    a: "Yes. The Vary Board works outdoors, on a patio, porch or garage wall.",
    group: "fit",
    placements: ["fit", "athletes", "faq"],
    featured: true,
    status: "verified",
    reviewedByEric: false,
    source: "Confirmed by Kyle, Sept 27 2026",
    previous: `Yes. The board is molded from ${board.material}, which is made for indoor and outdoor use: a garage, a patio, a clinic or a bedroom wall.`,
  },
  {
    id: "outdoor-care",
    q: "Will sun or rain wear it out?",
    a: "",
    group: "fit",
    placements: ["fit"],
    status: "pending-eric",
    reviewedByEric: false,
    // UV and weather details; pairs with the warranty answer.
  },
  {
    id: "weight",
    q: "How much weight or pull can it take?",
    a: "",
    group: "fit",
    placements: ["fit", "faq"],
    status: "pending-eric",
    reviewedByEric: false,
  },
  {
    id: "shipping",
    q: "What does shipping cost?",
    a: "Flat-rate shipping {shippingRate} on every order.",
    group: "buying",
    placements: ["buy", "faq"],
    featured: true,
    status: "verified",
    reviewedByEric: false,
    source: "content/facts.ts (shipping.flatRate)",
  },
  {
    id: "whats-included",
    q: "What comes in the box?",
    a: "",
    group: "buying",
    placements: ["buy", "faq"],
    status: "pending-eric",
    reviewedByEric: false,
  },
  {
    id: "shipping-returns",
    q: "Shipping and returns?",
    a: "",
    group: "buying",
    placements: ["buy", "faq"],
    status: "pending-eric",
    reviewedByEric: false,
    // No Shopify policy text is in the repo, and the return terms are an open fact in facts.ts.
    previous: `See our returns and warranty pages, or call ${brand.phone} and we will help. (Was: "What about returns and warranty?")`,
  },
  {
    id: "warranty",
    q: "Is there a warranty? How long does it last?",
    a: "",
    group: "buying",
    placements: ["athletes", "buy", "faq"],
    status: "pending-eric",
    reviewedByEric: false,
  },
  {
    id: "hsa-fsa",
    q: "Can I use HSA or FSA?",
    a: "",
    group: "buying",
    placements: ["buy", "faq"],
    status: "pending-eric",
    reviewedByEric: false,
  },
  {
    id: "va-how",
    q: "How do I ask my VA provider?",
    a: "",
    group: "veterans",
    placements: ["military"],
    status: "pending-eric",
    reviewedByEric: false,
    // Wanted: three steps.
  },
  {
    id: "need-a-pt",
    q: "Do I need a physical therapist to use it?",
    a: "",
    group: "using",
    placements: ["genres", "faq"],
    status: "pending-eric",
    reviewedByEric: false,
    previous: "No. Many people use the board to continue a home program after physical therapy, and many use it simply to keep moving well. As with any exercise program, consult your physician or physical therapist before starting.",
  },
  {
    id: "clinics",
    q: "Do you sell to clinics?",
    a: "Yes. Physical therapy clinics, gyms and senior living communities use the Vary Board. Visit our professionals page to request clinic pricing or a demo.",
    group: "clinics",
    placements: ["clinic", "faq"],
    featured: true,
    status: "verified",
    reviewedByEric: false,
    link: { href: "/professionals#request", label: "Clinic pricing or a demo" },
  },
  {
    id: "clinic-bulk",
    q: "How many does a clinic need? Is there bulk pricing?",
    a: "",
    group: "clinics",
    placements: ["clinic"],
    status: "pending-eric",
    reviewedByEric: false,
  },
  {
    id: "clinic-cleaning",
    q: "How do we clean it between patients?",
    a: "",
    group: "clinics",
    placements: ["clinic", "faq"],
    status: "pending-eric",
    reviewedByEric: false,
  },
  {
    id: "what",
    q: "What is the Vary Board?",
    a: "A patented wall-mounted training board designed by a physical therapist. Each section has {perSection} hexagonal anchor points, so you can clip in a resistance band or find a handhold at the height you need and practice strength, mobility and balance exercises at home.",
    group: "buying",
    placements: ["faq"],
    status: "verified",
    reviewedByEric: false,
    source: "content/facts.ts",
  },
  {
    id: "bands",
    q: "What comes in the Resistance Band Bundle?",
    a: "{bandsSummary} It is {bandsPrice}. A carabiner to clip a band to any anchor point is {carabinerPrice}.",
    group: "buying",
    placements: ["faq"],
    status: "verified",
    reviewedByEric: false,
    source: "content/facts.ts",
  },
];

/* ---------------------------------------------------------------- selectors ---- */

/** Answers and facts with every {token} filled from facts.ts. */
export const fillFaq = (s: string) =>
  fillFacts(s)
    .replace(/\{shippingRate\}/g, formatPrice(shipping.flatRate))
    .replace(/\{bandsSummary\}/g, products.bands.summary)
    .replace(/\{bandsPrice\}/g, formatPrice(products.bands.price))
    .replace(/\{carabinerPrice\}/g, formatPrice(products.carabiner.price));

export const isLive = (e: FaqEntry) => e.status === "verified" && e.a.trim() !== "";
/** Production: live entries only. Preview and local: pending ones too, marked. */
export const isVisible = (e: FaqEntry, production = isProduction) => isLive(e) || !production;
export const PENDING_ANSWER = "Waiting on Dr. Eric.";

/** What a component renders for one entry. */
export interface FaqView {
  id: string;
  q: string;
  a: string;
  pending: boolean;
  link?: { href: string; label: string };
}
export const toView = (e: FaqEntry): FaqView => ({ id: e.id, q: e.q, a: isLive(e) ? fillFaq(e.a) : PENDING_ANSWER, pending: !isLive(e), link: e.link });

export function faqFor(placement: FaqPlacement, production = isProduction): FaqEntry[] {
  return FAQ.filter((e) => e.placements.includes(placement) && isVisible(e, production));
}
export const faqById = (id: string) => FAQ.find((e) => e.id === id);

/** The FAQ section's tabs/groups, in order. "Using it" questions sit with Buying. */
export const FAQ_GROUPS: { label: string; groups: FaqGroup[] }[] = [
  { label: "Buying", groups: ["buying", "using"] },
  { label: "Fit & install", groups: ["fit"] },
  { label: "Veterans & VA", groups: ["veterans"] },
  { label: "Clinics", groups: ["clinics"] },
  { label: "Athletes", groups: ["athletes"] },
];

/**
 * FAQPage structured data: only answers that are verified, reviewed by Eric and non-empty, so it
 * stays empty until Eric signs off. Google shows FAQ rich results only for well-known government
 * and health sites, so this markup is for search engines and AI assistants to understand the
 * answers, not for stars or expanders in the results.
 */
export function faqJsonLd() {
  const ready = FAQ.filter((e) => isLive(e) && e.reviewedByEric);
  if (ready.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: ready.map((e) => ({ "@type": "Question", name: e.q, acceptedAnswer: { "@type": "Answer", text: fillFaq(e.a) } })),
  };
}

/** Every FAQ entry that is pending or not yet reviewed, for audit:content. */
export function unreviewedFaq(): string[] {
  return FAQ.filter((e) => e.status === "pending-eric" || !e.reviewedByEric).map((e) => `faq:${e.id}: ${e.status === "pending-eric" ? "[pending-eric] " : ""}"${e.q}"`);
}

for (const e of FAQ) {
  if (FAQ.filter((x) => x.id === e.id).length > 1) throw new Error(`content/faq.ts: duplicate id ${e.id}`);
  if (e.status === "verified" && !e.a.trim()) throw new Error(`content/faq.ts: ${e.id} is verified but has no answer`);
}
if (FAQ.filter((e) => e.featured).length > 10) throw new Error("content/faq.ts: at most 10 featured questions");
