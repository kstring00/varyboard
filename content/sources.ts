/**
 * Every published source the homepage cites, in the order the Sources list shows them.
 * A statistic anywhere on the site names one of these keys in its `source` field.
 *
 * Links: DOIs where the paper has one (they never move), otherwise the publisher's page.
 * Checked 2026-09-26 through search results for the exact title and DOI (publisher pages could
 * not be opened from the build machine). Notes for Eric sit next to each entry.
 */
export type SourceKey = "beinart2013" | "daSilva2019" | "steffens2016" | "molloy2020" | "pav2024" | "bluebook2025" | "sherrington2019";

export interface Source {
  key: SourceKey;
  /** "Beinart et al." */
  authors: string;
  /** Journal or publication, shown in italics. Empty for a web source. */
  journal: string;
  year: number;
  url: string;
  /** Short in-line credit under a statistic: "Beinart et al., 2013". */
  short: string;
}

const src = (key: SourceKey, authors: string, journal: string, year: number, url: string): Source => ({ key, authors, journal, year, url, short: `${authors}, ${year}` });

export const SOURCES: Record<SourceKey, Source> = {
  // "Up to 70% of patients do not engage in prescribed home exercise" (background of the review; chronic low back pain).
  beinart2013: src("beinart2013", "Beinart et al.", "The Spine Journal", 2013, "https://doi.org/10.1016/j.spinee.2013.08.027"),
  // "Within 12 months after recovery, 69% ... had a recurrence of an episode of low back pain" (40% activity-limiting).
  daSilva2019: src("daSilva2019", "da Silva et al.", "Journal of Physiotherapy", 2019, "https://doi.org/10.1016/j.jphys.2019.04.010"),
  // Exercise alone RR 0.65 for a new episode, short term (up to 12 months), low to very low quality evidence.
  steffens2016: src("steffens2016", "Steffens et al.", "JAMA Internal Medicine", 2016, "https://doi.org/10.1001/jamainternmed.2015.7431"),
  // Non-combat musculoskeletal injuries "may account for ... 65% of soldiers who cannot deploy for medical reasons".
  molloy2020: src("molloy2020", "Molloy et al.", "Military Medicine", 2020, "https://doi.org/10.1093/milmed/usaa027"),
  // FY21 private-sector care costs for MSK injuries across four body regions, all active duty services: $132.2M + $98.7M + $92.1M + $42.7M = $365.8M.
  pav2024: src("pav2024", "Pav et al.", "Military Medicine", 2024, "https://doi.org/10.1093/milmed/usae357"),
  // Sword Health's article, citing Healthcare Bluebook national PT cost benchmarks (accessed 2025).
  bluebook2025: src("bluebook2025", "Healthcare Bluebook (via Sword Health)", "", 2025, "https://swordhealth.com/articles/physical-therapy-cost-with-or-without-insurance"),
  // Balance and functional exercise: rate of falls ratio 0.76 (high-certainty evidence).
  sherrington2019: src("sherrington2019", "Sherrington et al.", "Cochrane Review", 2019, "https://doi.org/10.1002/14651858.CD012424.pub2"),
};

export const SOURCE_ORDER: SourceKey[] = ["beinart2013", "daSilva2019", "steffens2016", "molloy2020", "pav2024", "bluebook2025", "sherrington2019"];
