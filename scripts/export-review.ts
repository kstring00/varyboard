/**
 * Writes every unreviewed content item to content/review.csv for Eric.
 *   npm run review:export
 *
 * Columns: id, lane, type, current text, approve (Y/N), Eric's edit
 *   - Put Y in "approve (Y/N)" to mark a row reviewed. Leave blank or N to leave it unreviewed.
 *   - Put replacement wording in "Eric's edit" (leave blank to keep the current text).
 *     Keep the {you} {your} {my} {I} tokens: they become "they/their" on the "someone I care about" lane.
 *   - "try today" rows share one flag per movement: all of that movement's rows need Y for it to flip.
 *   - "exercise" rows carry the movement's name only; edit the other fields in content/exercises.ts.
 * Then: npm run review:import
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { CSV_HEADER, collectItems, toCsv } from "./review-items";

const out = path.join(process.cwd(), "content", "review.csv");
const items = collectItems().filter((i) => !i.reviewed);
const rows: string[][] = [[...CSV_HEADER], ...items.map((i) => [i.id, i.lane, i.type, i.text, "", ""])];
writeFileSync(out, toCsv(rows), "utf8");
console.log(`✓ wrote ${items.length} unreviewed item(s) to content/review.csv`);
