import { exercises, type Exercise, type Goal, type Region } from "@/content/exercises";

/** Words in the optional note that switch the plan to its cautious form. */
const CAUTION = /\b(pain|painful|hurt|hurts|hurting|ache|aching|surgery|surgical|operation|post-?op|injur\w*|fractur\w*|broke\w*|broken|replacement|dizz\w*|fell|fall|falls|falling|numb\w*|tingl\w*)\b/i;

export function detectCaution(note: string): boolean {
  return CAUTION.test(note);
}

export interface PlanInput {
  region: Region;
  goal: Goal;
  note: string;
}

export interface PlanItem {
  exercise: Exercise;
  role: "warm-up" | "main" | "finisher";
  /** True when the cautious plan substitutes the exercise's easier form. */
  gentle: boolean;
}

export interface Plan {
  items: PlanItem[];
  cautious: boolean;
  usesUnapproved: boolean;
  region: Region;
  goal: Goal;
}

/**
 * buildPlan(): THE SINGLE PLACE the plan comes from.
 *
 * Today this is a pure, deterministic client-side filter and sequence:
 *   1. one mobility warm-up for the region (or whole body)
 *   2. up to three exercises for the region matching the goal
 *   3. one whole-body balance finisher
 * A server route will replace this function later; keep the signature.
 */
export function buildPlan({ region, goal, note }: PlanInput): Plan {
  const cautious = detectCaution(note);
  const forRegion = (r: Region) => exercises.filter((e) => e.region === r);
  const regional = region === "whole" ? exercises.filter((e) => e.region !== "whole") : forRegion(region);
  const whole = forRegion("whole");

  const warm = [...regional, ...whole].find((e) => e.goal.includes("mobility") && (!cautious || e.level === "gentle")) ?? regional.find((e) => e.goal.includes("mobility"));
  const mainPool = (region === "whole" ? whole.concat(regional) : regional).filter((e) => e.goal.includes(goal) && e.id !== warm?.id);
  const main = (cautious ? [...mainPool.filter((e) => e.level === "gentle"), ...mainPool.filter((e) => e.level !== "gentle")] : mainPool).slice(0, 3);
  const finisher = whole.find((e) => e.goal.includes("balance") && !main.some((m) => m.id === e.id) && e.id !== warm?.id && (!cautious || e.level === "gentle")) ?? whole.find((e) => e.goal.includes("balance") && !main.some((m) => m.id === e.id));

  const items: PlanItem[] = [];
  if (warm) items.push({ exercise: warm, role: "warm-up", gentle: cautious && warm.level !== "gentle" });
  for (const e of main) items.push({ exercise: e, role: "main", gentle: cautious && e.level !== "gentle" });
  if (finisher) items.push({ exercise: finisher, role: "finisher", gentle: cautious && finisher.level !== "gentle" });

  return { items: items.slice(0, 5), cautious, usesUnapproved: items.some((i) => !i.exercise.approved), region, goal };
}
