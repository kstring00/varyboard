/**
 * SINGLE SOURCE OF TRUTH for every price, spec, contact detail and claim on the site.
 *
 * Rules
 *  - Components never hard-code a price or a spec. They import from here.
 *  - Anything not yet confirmed by Eric lives in `openFacts` with `confirmed: false`
 *    and is NOT rendered anywhere until it is flipped to `confirmed: true` AND
 *    given a value. `npm run check:placeholders` fails the build if an
 *    unconfirmed fact is referenced in a page.
 *  - Say "patented", never "patent pending".
 *  - Wellness language only: "supports", "helps you practice". Never "prevents
 *    falls", "treats" or "cures".
 */

export const brand = {
  name: "The Vary Board",
  legalName: "Vary Systems",
  domain: "thevaryboard.com",
  tagline: "A wall-mounted training board for strength, mobility and balance at home.",
  phone: "888-597-7591",
  phoneHref: "tel:+18885977591",
  email: "info@varysystems.com",
  accent: "#85b5b2",
} as const;

export const founders = {
  eric: {
    name: "Dr. Eric Santiago",
    shortName: "Eric",
    credentials: "PT, DPT",
    credentialsSpelledOut: "Physical Therapist, Doctor of Physical Therapy",
    role: "Owner, Trinity Physical Therapy, Houston",
    /** Portrait supplied by the client. Path must exist before launch. */
    portrait: "/images/founders/eric-santiago.jpg",
    portraitAlt: "Dr. Eric Santiago, physical therapist and co-creator of the Vary Board",
    /** Short lines for the home page. Built only from confirmed facts. */
    lines: [
      "Physical therapist and owner of Trinity Physical Therapy in Houston.",
      "Designed the board around the exercises he teaches in the clinic, so people can keep practicing them at home.",
    ],
    /** Full bio for /our-story. */
    bio: [
      "Dr. Eric Santiago is a physical therapist and Doctor of Physical Therapy, and the owner of Trinity Physical Therapy in Houston, Texas.",
      "He designed the Vary Board around the exercises he teaches in the clinic every day: reaching, holding, stretching, and practicing balance with something steady to hold on to. The 47 anchor points on every section come from that work, so a band or a handhold can go exactly where a person needs it.",
      "His goal is simple: give people a way to keep practicing at home what they learned in the clinic.",
    ],
  },
  reid: {
    name: "Reid De Leon",
    shortName: "Reid",
    credentials: "Engineer and craftsman",
    credentialsSpelledOut: "20+ years of military service; engineer and craftsman",
    role: "Co-creator, Vary Systems",
    portrait: "/images/founders/reid-de-leon.jpg",
    portraitAlt: "Reid De Leon, engineer, veteran and co-creator of the Vary Board",
    lines: [
      "More than 20 years of military service. Engineer and craftsman.",
      "Turned the clinical idea into a product that can be built, mounted and used for years.",
    ],
    bio: [
      "Reid De Leon served for more than 20 years in the military. He is an engineer and a craftsman.",
      "Reid took Eric's idea from the clinic and made it something you can bolt to a wall: three modular sections of molded HDPE, each with a backer and a convex platform, that stack to a 75-inch board and work indoors or out.",
      "The patented design is his answer to a practical question: how do you make one simple piece of equipment do the job of many, and last?",
    ],
  },
} as const;

export type ProductId = "board" | "boardXT" | "bands" | "carabiner";

export interface Product {
  id: ProductId;
  name: string;
  shortName: string;
  price: number;
  sku: string;
  /** Shopify variant id used for cart permalinks. */
  variantId: string;
  path: string;
  summary: string;
  /** Spec lines that are confirmed and safe to render. */
  specs: { label: string; value: string }[];
}

export const products: Record<ProductId, Product> = {
  board: {
    id: "board",
    name: "Vary Board",
    shortName: "Vary Board",
    price: 199,
    sku: "VB75001",
    variantId: "45481137439023",
    path: "/vary-board",
    summary: "Three modular sections. Installed height 75 inches. Fits most adults.",
    specs: [
      { label: "Modular sections", value: "3" },
      { label: "Installed height", value: '75"' },
      { label: "Anchor points per section", value: "47 hexagonal" },
      { label: "Positioning accuracy", value: '1/2"' },
      { label: "Material", value: "HDPE, indoor/outdoor" },
      { label: "Space needed", value: "3 x 3 ft per user" },
      { label: "SKU", value: "VB75001" },
    ],
  },
  boardXT: {
    id: "boardXT",
    name: "Vary Board XT",
    shortName: "XT",
    price: 399,
    sku: "VBXT100",
    variantId: "45480889581871",
    path: "/vary-board-xt",
    summary: "Four modular sections. Installed height 100 inches. For users 6'3\" and taller.",
    specs: [
      { label: "Modular sections", value: "4" },
      { label: "Installed height", value: '100"' },
      { label: "Recommended for", value: "Users 6'3\" and taller" },
      { label: "Anchor points per section", value: "47 hexagonal" },
      { label: "Positioning accuracy", value: '1/2"' },
      { label: "Material", value: "HDPE, indoor/outdoor" },
      { label: "Space needed", value: "3 x 3 ft per user" },
      { label: "SKU", value: "VBXT100" },
    ],
  },
  bands: {
    id: "bands",
    name: "Resistance Band Bundle",
    shortName: "Bands",
    price: 29.99,
    sku: "",
    variantId: "45953294663983",
    path: "/resistance-bands",
    summary: '3 x 10" mini loops and 3 x 22" loops. Latex free.',
    specs: [
      { label: "Mini loops", value: '3 x 10"' },
      { label: "Long loops", value: '3 x 22"' },
      { label: "Material", value: "Latex free" },
    ],
  },
  carabiner: {
    id: "carabiner",
    name: "Carabiner",
    shortName: "Carabiner",
    price: 3.99,
    sku: "",
    variantId: "51291573846319",
    path: "/resistance-bands",
    summary: "Clips a band to any anchor point.",
    specs: [],
  },
};

export const board = {
  patented: true,
  patentLine: "Patented",
  trustLine: "Designed by a physical therapist. Patented.",
  sectionAnatomy: "Each section is a backer plus a convex platform.",
  anchorPointsPerSection: 47,
  anchorShape: "hexagonal",
  positioningAccuracy: '1/2"',
  material: "HDPE",
  indoorOutdoor: true,
  minSpacePerUser: "3 x 3 ft",
  heightGuidance: {
    standard: "Most adults",
    xt: "Users 6'3\" and taller",
  },
  /** The six uses. Wording is wellness-safe. */
  uses: [
    "Assisted range of motion",
    "Balance",
    "Joint mobilization",
    "Strengthening",
    "Stretching",
    "Transfer training",
  ],
  pillars: [
    { title: "Strength", line: "Bands clip to any anchor point for push, pull and press work." },
    { title: "Mobility", line: "Handholds at every height help you practice reaching and bending." },
    { title: "Balance", line: "A steady hold on the wall while you practice standing exercises." },
  ],
} as const;

export const shipping = {
  flatRate: 9.99,
  flatRateLine: "Flat-rate shipping $9.99",
} as const;

export const discounts = {
  heroesPercent: 10,
  heroesLine: "10% off for veterans, active duty and first responders.",
} as const;

export const video = {
  youtubeId: "n4FIRckccOE",
  title: "See the Vary Board in use",
} as const;

export const disclaimer =
  "Consult your physician or physical therapist before starting any exercise program.";

/**
 * OPEN FACTS. Not rendered anywhere until Eric confirms.
 * To confirm: set `confirmed: true` and fill in `value`.
 */
export interface OpenFact {
  key: string;
  question: string;
  confirmed: boolean;
  value: string | null;
}

export const openFacts: Record<string, OpenFact> = {
  weight: {
    key: "weight",
    question: "Weight of the Vary Board and the XT (per section and installed)?",
    confirmed: false,
    value: null,
  },
  depth: {
    key: "depth",
    question: 'Depth off the wall: 3" or 4"?',
    confirmed: false,
    value: null,
  },
  maxCapacity: {
    key: "maxCapacity",
    question:
      'What does "100 lb max capacity" refer to (per anchor point, per band, whole board)?',
    confirmed: false,
    value: null,
  },
  colors: {
    key: "colors",
    question: "Color options available for purchase?",
    confirmed: false,
    value: null,
  },
  warranty: {
    key: "warranty",
    question: "Warranty terms (length, what is covered)?",
    confirmed: false,
    value: null,
  },
  returns: {
    key: "returns",
    question: "Returns terms (window, condition, who pays return shipping)?",
    confirmed: false,
    value: null,
  },
};

/** Returns the fact's value only when confirmed; otherwise null so nothing renders. */
export function fact(key: keyof typeof openFacts): string | null {
  const f = openFacts[key];
  return f && f.confirmed && f.value ? f.value : null;
}

export function formatPrice(n: number): string {
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;
}
