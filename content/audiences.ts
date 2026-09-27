import { discounts } from "./facts";
import { checkCoverage } from "./hero";
import type { Reviewed } from "./intake";
import { rv, unreviewedIn } from "./reviewed";
import { INLINE_ANCHOR, link } from "./routes";
import type { SourceKey } from "./sources";

/**
 * "Who it's for" (#who-its-for): a military-first block (about 70% of the section) and three
 * slim cards. Ported from the reference's #who section.
 *
 * Rules
 *  - Every claim is rv("…") with reviewedByEric false until Eric signs it off (audit:content,
 *    Draft banner, review:export). A statistic names its `source` on the same line.
 *  - VA wording is exact (VA_COVERAGE in content/hero.ts). Never "free".
 *  - Exactly one link or button per card.
 */
export type AudienceKey = "patients" | "clinics" | "athletes";

/** Card anchors: #for-patients, #for-clinics, #for-athletes. The team form scrolls back to #for-athletes. */
export const audienceAnchor = (key: AudienceKey | "military") => `for-${key}`;
/** /#team-pricing opens the team inquiry form on the athletes card (footer link). */
export const TEAM_FORM_ANCHOR = "team-pricing";

export type AudienceCta =
  | { kind: "link"; label: string; href: string }
  /** Opens the team pricing inquiry form inside the card. */
  | { kind: "teamForm"; label: string };

export interface Audience {
  key: AudienceKey;
  title: string;
  body: Reviewed;
  source?: SourceKey;
  cta: AudienceCta;
}

export const WHO = {
  eyebrow: "Who it's for",
  headline: "Built first for those who served.",
  military: {
    eyebrow: "DoD & VA",
    headline: "From the clinic to the barracks to the living room.",
    body: rv("That recovery doesn't end when the appointment does. One Vary Board gives a clinician a single item that covers six kinds of practice. It's bought once, kept at home and used every day between visits."),
    veteran: { label: "I'm a veteran →", href: link("/plan", { query: "for=mil" }).href },
    // [VERIFY] No VA clinician page yet: the clinic request form stands in until one exists.
    clinician: { label: "I'm a VA clinician →", href: link("/professionals", { hash: "request" }).href },
    coverage: rv("The Vary Board may be covered when your provider finds it medically necessary."),
    discount: discounts.heroesLine,
  },
};

export const AUDIENCES: Audience[] = [
  { key: "patients", title: "Patients & families", body: rv("In older adults, balance and functional exercise cut the rate of falls by about a quarter. Steady and Rise are that practice, with a rail to hold."), source: "sherrington2019", cta: { kind: "link", label: "Find your plan", href: `#${INLINE_ANCHOR}` } },
  {
    key: "clinics",
    title: "Clinics & hospitals",
    body: rv("More clinic in the same four walls, and the same setup your patients take home."),
    cta: { kind: "link", label: "See the difference", href: "#clinic" },
  },
  {
    key: "athletes",
    title: "Sports teams & athletes",
    body: rv("Cleats, bats and helmets get replaced every season. The Vary Board is a one-time buy for mobility, recovery and prehab."),
    cta: { kind: "teamForm", label: "Outfit your team" },
  },
];

/** Every "Who it's for" line Eric has not reviewed, for audit:content and the Draft banner. */
export function unreviewedAudiences(): string[] {
  return [...unreviewedIn(WHO, "who"), ...unreviewedIn(AUDIENCES, "audience")];
}

checkCoverage("content/audiences.ts", WHO.military.coverage.value);
