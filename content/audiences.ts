import { discounts } from "./facts";
import type { Genre, Reviewed } from "./intake";
import { link } from "./routes";

/**
 * The four audiences on the homepage "Who it's for" section, military first (Eric's pillar).
 * The hero ticker links each of its items to one of these cards (content/audience.ts).
 *
 * Rules
 *  - Every claim is rv("…") with reviewedByEric false until Eric signs it off (audit:content,
 *    Draft banner, review:export). Fact tokens ({space} …) are filled from content/facts.ts.
 *  - proofReviewId points at a real review in content/reviews.ts, or null to show nothing.
 *    The build fails if it points at a review that does not exist. Never invent a quote.
 *  - Exactly one primary CTA per card.
 */
const rv = (value: string, reviewedByEric = false): Reviewed => ({ value, reviewedByEric });

export type AudienceKey = "military" | "patients" | "clinics" | "athletes";

export type AudienceCta =
  | { kind: "link"; label: string; href: string }
  /** The VA provider packet PDF when it exists (content/config.ts vaPacket), else `fallbackHref`. */
  | { kind: "vaPacket"; label: string; fallbackHref: string }
  /** Opens the team pricing inquiry form inside the card. */
  | { kind: "teamForm"; label: string };

export interface Audience {
  key: AudienceKey;
  label: string;
  problem: Reviewed;
  howItHelps: Reviewed;
  topGenres: Genre[];
  proofReviewId: string | null;
  primaryCta: AudienceCta;
  /** A plain line under the CTA (not a second button). */
  note?: string;
}

/** Card anchor, used by the hero ticker: #for-military, #for-patients ... */
export const audienceAnchor = (key: AudienceKey) => `for-${key}`;
export const TEAM_FORM_ANCHOR = "team-pricing";

export const AUDIENCES: Audience[] = [
  {
    key: "military",
    label: "DoD & VA",
    problem: rv("Rehab after surgery or injury has to keep going between appointments, at home or on base."),
    howItHelps: rv("One wall holds the reaching, strengthening and joint work a program calls for, so practice continues between visits."),
    topGenres: ["climb", "strengthen", "loosen"],
    proofReviewId: "blake-cook",
    primaryCta: { kind: "vaPacket", label: "Get the VA provider packet", fallbackHref: link("/plan", { query: "for=mil" }).href },
    note: discounts.heroesLine,
  },
  {
    key: "patients",
    label: "Patients & families",
    problem: rv("Strength, balance and independence at home are slipping, for you or for someone you care for."),
    howItHelps: rv("Short sessions on one wall, with something steady to hold, built around what is getting harder."),
    topGenres: ["steady", "rise", "climb"],
    proofReviewId: "b-castillo",
    primaryCta: { kind: "link", label: "Find your plan", href: link("/plan", { query: "for=me" }).href },
  },
  {
    key: "clinics",
    label: "Clinics, nurses & hospitals",
    problem: rv("Floor space is tight, equipment is expensive, and patients skip their home programs."),
    howItHelps: rv("One board on the wall covers all six kinds of practice in {space} of floor, and patients can use the same board at home."),
    topGenres: ["climb", "strengthen", "stretch", "loosen", "steady", "rise"],
    proofReviewId: "ashley-workman",
    primaryCta: { kind: "link", label: "Book a demo", href: link("/professionals", { hash: "request" }).href },
  },
  {
    // [VERIFY] The athletes lane as a whole: problem, how it helps and the genres are not yet confirmed by Eric.
    key: "athletes",
    label: "Sports teams & athletes",
    problem: rv("Prehab, mobility and recovery work takes space and gear that wears out and gets replaced every season."),
    howItHelps: rv("Buy the board once and mount it where the team trains: bands and anchor points cover strength, joint work and stretching."),
    topGenres: ["strengthen", "loosen", "stretch"],
    proofReviewId: null,
    primaryCta: { kind: "teamForm", label: "Team pricing" },
  },
];

export function audienceByKey(key: AudienceKey): Audience {
  const a = AUDIENCES.find((x) => x.key === key);
  if (!a) throw new Error(`content/audiences.ts: no audience ${key}`);
  return a;
}

/** Every audience claim Eric has not reviewed, for audit:content and the Draft banner. */
export function unreviewedAudiences(): string[] {
  const out: string[] = [];
  for (const a of AUDIENCES)
    for (const f of ["problem", "howItHelps"] as const) if (!a[f].reviewedByEric) out.push(`audience:${a.key}:${f}: "${a[f].value}"`);
  return out;
}
