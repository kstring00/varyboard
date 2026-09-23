import { REGIONS, exercises, type Exercise, type Goal, type Region } from "@/content/exercises";
import {
  AREA_PHRASE,
  AREA_REFLECT,
  CONCERNS,
  GENRE_ORDER,
  LANES,
  QUESTIONS,
  REFLECT,
  STEP2_QUESTION,
  TRY_TODAY,
  WEEK_NOTES,
  t,
  type Concern,
  type Genre,
  type Lane,
  type Reflect,
  type Reviewed,
  type Situation,
  type TryToday,
} from "@/content/intake";
import { buildPlan as buildMovementPlan, type PlanItem } from "@/lib/plan";

/* ------------------------------------------------------------ URL state ---- */

export interface IntakeParams {
  for?: string | string[];
  c?: string | string[];
  s?: string | string[];
  area?: string | string[];
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export const isLane = (v: string): v is Lane => LANES.some((l) => l.key === v);
export const isRegion = (v: string): v is Region => REGIONS.some((r) => r.id === v);

export function concernFor(lane: Lane, key: string): Concern | undefined {
  return CONCERNS.find((c) => c.key === key && c.lanes.includes(lane));
}
export function concernsFor(lane: Lane): Concern[] {
  return CONCERNS.filter((c) => c.lanes.includes(lane));
}
export function situationFor(concern: Concern, key: string): Situation | undefined {
  return concern.step3.kind === "situations" ? concern.step3.options.find((s) => s.key === key) : undefined;
}

export interface IntakeState {
  lane: Lane;
  concern: Concern;
  situation?: Situation;
  area?: Region;
}

/** Step URLs. Every plan is a link. */
export const intakeHref = {
  step1: () => "/plan",
  step2: (lane: Lane) => `/plan?for=${lane}`,
  step3: (lane: Lane, concern: string) => `/plan?for=${lane}&c=${concern}`,
  result: (lane: Lane, concern: string, sel: { s?: string; area?: string }) => `/plan/result?for=${lane}&c=${concern}${sel.s ? `&s=${sel.s}` : ""}${sel.area ? `&area=${sel.area}` : ""}`,
};

/**
 * Parse the URL. Returns the deepest valid step, or `redirect` when a param is missing or
 * tampered: unknown lane -> Step 1; unknown concern -> that lane's Step 2; situation or area
 * not valid for that concern -> that concern's Step 3.
 */
export type Parsed =
  | { step: 1 }
  | { step: 2; lane: Lane }
  | { step: 3; lane: Lane; concern: Concern }
  | { step: 4; state: IntakeState }
  | { redirect: string };

export function parseIntake(p: IntakeParams, wantResult = false): Parsed {
  const laneRaw = one(p.for);
  if (!laneRaw) return wantResult ? { redirect: intakeHref.step1() } : { step: 1 };
  if (!isLane(laneRaw)) return { redirect: intakeHref.step1() };
  const lane = laneRaw;

  const cRaw = one(p.c);
  if (!cRaw) return wantResult ? { redirect: intakeHref.step2(lane) } : { step: 2, lane };
  const concern = concernFor(lane, cRaw);
  if (!concern) return { redirect: intakeHref.step2(lane) };

  const sRaw = one(p.s);
  const areaRaw = one(p.area);
  if (concern.step3.kind === "situations") {
    if (!sRaw && !areaRaw) return wantResult ? { redirect: intakeHref.step3(lane, concern.key) } : { step: 3, lane, concern };
    const situation = situationFor(concern, sRaw);
    if (!situation || areaRaw) return { redirect: intakeHref.step3(lane, concern.key) };
    return { step: 4, state: { lane, concern, situation } };
  }
  if (!areaRaw && !sRaw) return wantResult ? { redirect: intakeHref.step3(lane, concern.key) } : { step: 3, lane, concern };
  if (!isRegion(areaRaw) || sRaw) return { redirect: intakeHref.step3(lane, concern.key) };
  return { step: 4, state: { lane, concern, area: areaRaw } };
}

/* ------------------------------------------------------------- The plan ---- */

export interface Week {
  week: 1 | 2 | 3 | 4;
  note: Reviewed;
  items: PlanItem[];
  /** True in week 4: show the harder form. */
  harder: boolean;
}

export interface PlanContent {
  lane: Lane;
  concern: Concern;
  situation?: Situation;
  area?: Region;
  /** The tapped label, in the lane's words. */
  choiceLabel: string;
  reflect: { headline: string; points: string[]; truth: Reviewed };
  genres: Genre[];
  tryToday: TryToday | null;
  weeks: Week[];
  questions: Reviewed[];
  region: Region;
  goal: Goal;
  /** Any exercise, truth statement or health line still unreviewed. Drives the draft banner. */
  unreviewed: string[];
  requireClearance: boolean;
}

function assertContent<T>(v: T | undefined | null, what: string): T {
  if (v === undefined || v === null) throw new Error(`[intake] Missing content: ${what}`);
  return v;
}

function reflectFor(state: IntakeState): Reflect {
  const { concern, situation, area } = state;
  if (situation) return assertContent(REFLECT[`${concern.key}.${situation.key}`], `REFLECT["${concern.key}.${situation.key}"]`);
  const base = assertContent(AREA_REFLECT[concern.key], `AREA_REFLECT["${concern.key}"]`);
  const phrase = AREA_PHRASE[assertContent(area, "area")].noun;
  const sub = (s: string) => s.replace(/\{area\}/g, phrase);
  return { headline: sub(base.headline), points: [sub(base.points[0]), sub(base.points[1]), sub(base.points[2])], truth: { ...base.truth, value: sub(base.truth.value) } };
}

/** Movements for the four weeks, from the existing library via lib/plan's buildPlan. */
function movementsFor(region: Region, goal: Goal): PlanItem[] {
  const base = buildMovementPlan({ region, goal, note: "" });
  if (base.items.length >= 3) return base.items;
  // Thin regions: top up with whole-body work so every week has something to do.
  const have = new Set(base.items.map((i) => i.exercise.id));
  const extra = exercises.filter((e) => e.region === "whole" && !have.has(e.id)).map((exercise): PlanItem => ({ exercise, role: "main", gentle: false }));
  return [...base.items, ...extra].slice(0, 5);
}

/**
 * buildPlan(for, c, s, area): the content of one plan page. Throws on any missing content,
 * which is what scripts/check-intake.ts relies on to fail the build.
 */
export function buildPlan(lane: Lane, c: string, s?: string, area?: string): PlanContent {
  const concern = assertContent(concernFor(lane, c), `concern "${c}" for lane "${lane}"`);
  const situation = s ? assertContent(situationFor(concern, s), `situation "${s}" for "${c}"`) : undefined;
  const region = area ? (assertContent(isRegion(area) ? area : undefined, `area "${area}"`) as Region) : undefined;
  if (concern.step3.kind === "situations" ? !situation : !region) throw new Error(`[intake] "${c}" needs ${concern.step3.kind === "situations" ? "a situation" : "an area"}`);
  const state: IntakeState = { lane, concern, situation, area: region };

  const raw = reflectFor(state);
  const reflect = { headline: t(raw.headline, lane), points: raw.points.map((p) => t(p, lane)), truth: { ...raw.truth, value: t(raw.truth.value, lane) } };

  const planRegion: Region = region ?? concern.region;
  const items = lane === "clinic" ? [] : movementsFor(planRegion, concern.goal);
  const weeks: Week[] =
    lane === "clinic"
      ? []
      : ([1, 2, 3, 4] as const).map((week) => ({
          week,
          note: { ...WEEK_NOTES[week - 1], value: t(WEEK_NOTES[week - 1].value, lane) },
          items: items.slice(0, week === 1 ? 2 : week === 2 ? 3 : items.length),
          harder: week === 4,
        }));

  const tryRaw = lane === "clinic" ? null : assertContent(TRY_TODAY[concern.key], `TRY_TODAY["${concern.key}"]`);
  const tryToday = tryRaw ? { ...tryRaw, name: t(tryRaw.name, lane), steps: tryRaw.steps.map((x) => t(x, lane)), note: t(tryRaw.note, lane) } : null;
  const questions = assertContent(QUESTIONS[lane], `QUESTIONS["${lane}"]`);
  if (lane !== "clinic" && weeks[3].items.length < 2) throw new Error(`[intake] Too few movements for ${planRegion}/${concern.goal}`);

  const unreviewed: string[] = [];
  if (!raw.truth.reviewedByEric) unreviewed.push(`truth: ${raw.truth.value}`);
  if (tryRaw && !tryRaw.reviewedByEric) unreviewed.push(`try today: ${tryRaw.name}`);
  for (const w of WEEK_NOTES) if (!w.reviewedByEric) unreviewed.push(`week note: ${w.value}`);
  for (const q of questions) if (!q.reviewedByEric) unreviewed.push(`question: ${q.value}`);
  for (const i of items) if (!i.exercise.approved) unreviewed.push(`exercise: ${i.exercise.name}`);

  const choiceLabel = situation ? t(situation.label, lane) : t(AREA_PHRASE[region as Region].noun, lane);
  return { lane, concern, situation, area: region, choiceLabel, reflect, genres: concern.genres, tryToday, weeks, questions, region: planRegion, goal: concern.goal, unreviewed, requireClearance: concern.step3.kind === "bodymap" && concern.step3.requireClearance };
}

/* --------------------------------------------------------------- Helpers ---- */

export function stepQuestion(lane: Lane): string {
  return STEP2_QUESTION[lane];
}

export function laneLabel(lane: Lane): string {
  return LANES.find((l) => l.key === lane)!.label;
}

/** The next situation in the same concern, or the next concern in the lane. */
export function relatedHref(plan: PlanContent): { href: string; label: string } {
  const { lane, concern, situation, area } = plan;
  if (situation && concern.step3.kind === "situations") {
    const opts = concern.step3.options;
    const next = opts[(opts.findIndex((o) => o.key === situation.key) + 1) % opts.length];
    return { href: intakeHref.result(lane, concern.key, { s: next.key }), label: t(next.label, lane) };
  }
  if (area) {
    const ids = REGIONS.map((r) => r.id);
    const next = ids[(ids.indexOf(area) + 1) % ids.length];
    return { href: intakeHref.result(lane, concern.key, { area: next }), label: t(AREA_PHRASE[next].noun, lane) };
  }
  const list = concernsFor(lane);
  const next = list[(list.findIndex((x) => x.key === concern.key) + 1) % list.length];
  return { href: intakeHref.step3(lane, next.key), label: t(next.label, lane) };
}

export function genreSides(genres: Genre[]): boolean[] {
  return GENRE_ORDER.map((g) => genres.includes(g));
}

/** Plain-text version for the .txt download and the email. */
export function planToText(plan: PlanContent, url: string): string {
  const L: string[] = [];
  L.push(`Vary Board plan: ${t(plan.concern.label, plan.lane)} / ${plan.choiceLabel}`);
  L.push(url, "");
  L.push(plan.reflect.headline, "");
  for (const p of plan.reflect.points) L.push(`- ${p}`);
  L.push("", `Your plan uses ${plan.genres.length} of the 6 kinds of practice: ${plan.genres.join(", ")}.`, "");
  if (plan.tryToday) {
    L.push("Try one thing today (no board needed):", plan.tryToday.name);
    plan.tryToday.steps.forEach((s, i) => L.push(`  ${i + 1}. ${s}`));
    L.push(`  ${plan.tryToday.note}`, "");
  }
  if (plan.weeks.length) {
    L.push("Your 4 weeks:");
    for (const w of plan.weeks) {
      L.push(`Week ${w.week}: ${w.note.value}`);
      for (const i of w.items) L.push(`  - ${i.exercise.name}: ${w.harder ? i.exercise.harder : i.exercise.reps}. Anchor row ${i.exercise.anchorRow}, ${i.exercise.anchorLandmark}.`);
    }
    L.push("");
  }
  L.push("Questions to bring to your provider:");
  plan.questions.forEach((q, i) => L.push(`  ${i + 1}. ${q.value}`));
  L.push("", "Not medical advice. Consult your physician or physical therapist before starting any exercise program.");
  return L.join("\n");
}

/** Every valid (lane, concern, selection) combination. Used by the build-time check and the OG route. */
export function allCombinations(): { lane: Lane; c: string; s?: string; area?: string }[] {
  const out: { lane: Lane; c: string; s?: string; area?: string }[] = [];
  for (const { key: lane } of LANES) {
    for (const concern of concernsFor(lane)) {
      if (concern.step3.kind === "situations") for (const s of concern.step3.options) out.push({ lane, c: concern.key, s: s.key });
      else for (const r of REGIONS) out.push({ lane, c: concern.key, area: r.id });
    }
  }
  return out;
}

/** Throws on the first combination that lacks content. */
export function assertIntakeComplete(): number {
  const combos = allCombinations();
  for (const combo of combos) buildPlan(combo.lane, combo.c, combo.s, combo.area);
  return combos.length;
}

export type { Exercise };
