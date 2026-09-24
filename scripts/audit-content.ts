/**
 * Lists every content item Eric has not reviewed yet:
 *   - intake.ts items with `reviewedByEric: false` (truths, try-today movements, week notes, questions)
 *   - exercises.ts rows with `approved: false` (the library's review flag)
 *   - genres.ts and audiences.ts lines with `reviewedByEric: false` (homepage sections)
 *
 * Exit code: 1 only on production builds (VERCEL_ENV=production) while anything is unreviewed.
 * Preview builds pass and show the "Draft, not reviewed by Eric" banner on affected pages.
 *   npm run audit:content
 */
import { exercises } from "../content/exercises";
import { unreviewedAudiences } from "../content/audiences";
import { unreviewedGenres } from "../content/genres";
import { AREA_REFLECT, QUESTIONS, REFLECT, TRY_TODAY, WEEK_NOTES } from "../content/intake";

const items: string[] = [];
for (const [k, r] of Object.entries(REFLECT)) if (!r.truth.reviewedByEric) items.push(`intake truth  ${k}: "${r.truth.value}"`);
for (const [k, r] of Object.entries(AREA_REFLECT)) if (!r.truth.reviewedByEric) items.push(`intake truth  ${k}.*: "${r.truth.value}"`);
for (const [k, r] of Object.entries(TRY_TODAY)) if (!r.reviewedByEric) items.push(`try today     ${k}: "${r.name}"`);
WEEK_NOTES.forEach((w, i) => !w.reviewedByEric && items.push(`week note     ${i + 1}: "${w.value}"`));
for (const [lane, qs] of Object.entries(QUESTIONS)) qs.forEach((q, i) => !q.reviewedByEric && items.push(`question      ${lane}#${i + 1}: "${q.value}"`));
for (const e of exercises) if (!e.approved) items.push(`exercise      ${e.id}: "${e.name}"`);
for (const g of unreviewedGenres()) items.push(`homepage      ${g}`);
for (const a of unreviewedAudiences()) items.push(`homepage      ${a}`);

if (items.length === 0) {
  console.log("✓ every content item is reviewed");
  process.exit(0);
}
console.log(`${items.length} item(s) not yet reviewed by Eric:\n`);
for (const i of items) console.log("  " + i);
if (process.env.VERCEL_ENV === "production") {
  console.error("\n✗ production build blocked until the list above is empty (flip reviewedByEric / approved to true after review).");
  process.exit(1);
}
console.log("\n(preview/local build: continuing; affected pages show the Draft banner)");
