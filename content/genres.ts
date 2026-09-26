import { board, formatPrice, products } from "./facts";
import type { Genre, Reviewed } from "./intake";

/**
 * The six kinds of practice on the board. Single source for the homepage "What you can do"
 * section, the hero's genre line, the plan hexagon and the plan result (content/intake.ts
 * derives GENRES and GENRE_ORDER from this list).
 *
 * Rules
 *  - Wellness language only. Every health-related line is rv("…") with reviewedByEric false
 *    until Eric signs it off; `npm run audit:content` lists them and the homepage shows the
 *    Draft banner on previews. `npm run review:export` puts them in content/review.csv.
 *  - Clinical names are Eric's existing wording.
 *  - Numbers come from content/facts.ts through the {tokens} below, never typed here.
 *    {perSection} {anchors} {anchorsXT} {space} {spaceFeet} {depth} {price}
 *    (content/hero.ts, clinic.ts and audiences.ts use the same tokens)
 *  - A field set to null renders "Coming soon from Dr. Eric".
 */
const rv = (value: string, reviewedByEric = false): Reviewed => ({ value, reviewedByEric });

export const ANCHORS = {
  perSection: board.anchorPointsPerSection,
  board: board.anchorPointsPerSection * products.board.sections!,
  xt: board.anchorPointsPerSection * products.boardXT.sections!,
} as const;

/** Fill the fact tokens in a content line. */
export function fillFacts(text: string): string {
  return text
    .replace(/\{perSection\}/g, String(ANCHORS.perSection))
    .replace(/\{anchors\}/g, String(ANCHORS.board))
    .replace(/\{anchorsXT\}/g, String(ANCHORS.xt))
    .replace(/\{spaceFeet\}/g, board.minSpacePerUser.replace("x", "×").replace(/\bft\b/, "feet"))
    .replace(/\{space\}/g, board.minSpacePerUser.replace("x", "×"))
    .replace(/\{depth\}/g, `${board.section.depthIn} inches`)
    .replace(/\{price\}/g, formatPrice(products.board.price));
}

export interface GenreInfo {
  key: Genre;
  /** The word a visitor taps: Climb, Strengthen... */
  plainName: string;
  /** Eric's clinical wording. */
  clinicalName: string;
  /** One line used on plan results (existing copy). */
  line: string;
  whatItIs: Reviewed | null;
  howTheBoardDoesIt: Reviewed | null;
  exampleMove: Reviewed | null;
  /** Stored for plans and later pages; not rendered on the homepage card. */
  helpsMost: Reviewed | null;
}

/** In hexagon order: top edge, then clockwise. */
export const GENRE_LIST: GenreInfo[] = [
  {
    key: "climb",
    plainName: "Climb",
    clinicalName: "Active-Assisted Range of Motion",
    line: "Reach higher with the board as a guide.",
    whatItIs: rv("Moving a joint through its range with a little help, so you can reach further than you could on your own."),
    howTheBoardDoesIt: rv("Your hands walk up the hexagons one row at a time, and the row you reach shows how high you got today."),
    exampleMove: rv("Wall walk: face the board and walk your fingers up the hexagons as high as is comfortable, then walk them back down."),
    helpsMost: rv("People working to reach overhead again, for a shelf, a cupboard or a coat."),
  },
  {
    key: "strengthen",
    plainName: "Strengthen",
    clinicalName: "Strengthening",
    line: "Bands and bodyweight against a wall that does not move.",
    whatItIs: rv("Working muscles against resistance so lifting, pushing and pulling in daily life feel easier."),
    howTheBoardDoesIt: rv("A band clips to any of the {anchors} anchor points ({anchorsXT} on the XT), so it pulls from exactly the angle you choose."),
    exampleMove: rv("Standing row: clip a band at chest height and draw both ends back toward your ribs, then return slowly."),
    helpsMost: rv("Anyone who wants to keep carrying groceries, grandkids and their own weight."),
  },
  {
    key: "stretch",
    plainName: "Stretch",
    clinicalName: "Stretching",
    line: "Lengthen with a handhold at any height.",
    whatItIs: rv("Easing a muscle into a longer position and holding it gently until it relaxes."),
    howTheBoardDoesIt: rv("A band holds the stretch at the exact height your body needs, so you can settle into it without straining."),
    exampleMove: rv("Overhead reach: clip a band high on the board, hold the loop and let it draw your arm gently upward."),
    helpsMost: rv("People who feel tight after sitting, driving or a long day on their feet."),
  },
  {
    key: "loosen",
    plainName: "Loosen",
    clinicalName: "Joint Mobilizations",
    line: "Free up stiff joints with slow, guided motion.",
    // [VERIFY] Eric has not defined the joint mobilization movements yet. Leave these null
    // until he does; the card shows "Coming soon from Dr. Eric".
    whatItIs: null,
    howTheBoardDoesIt: null,
    exampleMove: null,
    helpsMost: null,
  },
  {
    key: "steady",
    plainName: "Steady",
    clinicalName: "Balance Training",
    line: "Practice standing steady with something to hold.",
    whatItIs: rv("Practicing standing, shifting your weight and stepping so staying steady on your feet feels more natural."),
    howTheBoardDoesIt: rv("The handrails give a secure grip while you practice standing and stepping, and you can lighten your grip as you feel ready."),
    exampleMove: rv("Heel-to-toe stand: hold both rails, place one foot directly in front of the other and hold, then switch feet."),
    helpsMost: rv("People who have started reaching for walls and counters as they walk."),
  },
  {
    key: "rise",
    plainName: "Rise",
    clinicalName: "Transfer Training",
    line: "Get up, get down and get moving with a rail.",
    whatItIs: rv("Practicing the everyday moves of standing up, sitting down, reaching and stepping."),
    howTheBoardDoesIt: rv("The rails give support for sit-to-stand, reaching and stepping, right where you push or pull."),
    exampleMove: rv("Sit-to-stand: set a sturdy chair in front of the board, hold the rails and stand up slowly, then sit back down with control."),
    helpsMost: rv("People for whom getting out of a chair, a car or bed is getting harder."),
  },
];

export const GENRE_KEYS: Genre[] = GENRE_LIST.map((g) => g.key);

/** Each genre's card in "What you can do": #genre-climb … The hero's six hexagons link here. */
export const genreCardId = (g: Genre) => `genre-${g}`;

export function genreByKey(key: Genre): GenreInfo {
  const g = GENRE_LIST.find((x) => x.key === key);
  if (!g) throw new Error(`content/genres.ts: no genre ${key}`);
  return g;
}

export const GENRE_FIELDS = ["whatItIs", "howTheBoardDoesIt", "exampleMove", "helpsMost"] as const;

/** Every genre line Eric has not reviewed, for audit:content and the Draft banner. */
export function unreviewedGenres(): string[] {
  const out: string[] = [];
  for (const g of GENRE_LIST)
    for (const f of GENRE_FIELDS) {
      const v = g[f];
      if (v && !v.reviewedByEric) out.push(`genre:${g.key}:${f}: "${v.value}"`);
    }
  return out;
}
