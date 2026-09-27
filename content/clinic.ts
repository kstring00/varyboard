import { rv, unreviewedIn } from "./reviewed";

/**
 * "Why it's different" (#clinic), directly under the hero. Ported from the reference's clinic
 * section. Same rules as content/hero.ts: health and business claims are rv("…") until Eric
 * signs them off; spec numbers come from facts.ts through {tokens}.
 *
 * The two rooms are an illustration of one day of sessions, not measured data, and say so.
 */

export const CLINIC = {
  eyebrow: "Why it's different",
  headline: "Grow your clinic without adding a square foot.",
  lead: rv("Every station in a PT gym takes floor you pay rent on, and every session turns into laps between them. The Vary Board moves that work onto one wall, just {depth} deep."),
  oldRoom: {
    title: "The usual PT gym",
    tag: "7 stations",
    label: "Top-down clinic with seven stations. A patient's path criss-crosses the room between them.",
    stations: ["Treatment table", "Finger ladder", "Pulley", "Band station", "Stairs", "Mat table", "Balance pad", "Parallel bars"],
  },
  newRoom: {
    title: "With the Vary Board",
    tag: "1 wall",
    label: "The same room with one Vary Board on the wall. The patient stays in one 3 by 3 foot spot for every exercise.",
    board: "Vary Board",
    spot: "{space}",
    spare: rv("Room for another table"),
  },
  meters: { exercises: "exercises", trips: "trips across the floor" },
  replay: "Replay",
  fine: "Illustration of one day of sessions, not measured data.",
  solves: [
    { key: "treatment", title: rv("More treatment per visit"), body: rv("Minutes spent walking between stations go back into the exercises.") },
    { key: "trips", title: rv("Fewer trips for unsteady patients"), body: rv("The rail is at arm's length, not across the room.") },
    { key: "supervise", title: rv("Easier to supervise"), body: rv("A therapist can watch form when the patient isn't on the move.") },
    { key: "rent", title: rv("Floor space costs rent. Wall space is already paid for."), body: rv("One {space} spot opens up room for another table, another patient or another therapist.") },
  ],
  capstone: rv("The biggest win: patients go home to the same wall they trained on, so the program carries over."),
  cta: "Talk to us about your clinic",
  sourcesTitle: "Sources",
};

/** Every clinic line Eric has not reviewed, for audit:content and the Draft banner. */
export function unreviewedClinic(): string[] {
  return unreviewedIn(CLINIC, "clinic");
}
