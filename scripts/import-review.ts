/**
 * Reads the CSV Eric edited and writes it back into content/intake.ts, exercises.ts, genres.ts, audiences.ts, hero.ts and clinic.ts:
 *   - "approve (Y/N)" = Y  -> reviewedByEric: true (or approved: true for exercises)
 *   - "Eric's edit" filled -> replaces the current text (approved or not)
 *   npm run review:import              (reads content/review.csv)
 *   npm run review:import -- path.csv  (reads another file)
 *
 * Edits are made in place with the TypeScript compiler's source positions, so formatting and
 * comments survive. Rows with unknown ids are reported and skipped. Nothing else in the files changes.
 * Afterwards run: npm run check:intake && npm run audit:safety && npm run audit:content
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { CSV_HEADER, absFile, collectItems, parseCsv, type ReviewItem } from "./review-items";

const csvPath = path.resolve(process.argv[2] ?? path.join("content", "review.csv"));
const rows = parseCsv(readFileSync(csvPath, "utf8"));
const header = rows.shift() ?? [];
const col = (name: (typeof CSV_HEADER)[number]) => header.findIndex((h) => h.trim().toLowerCase() === name.toLowerCase());
const iId = col("id");
const iApprove = col("approve (Y/N)");
const iEdit = col("Eric's edit");
if (iId < 0 || iApprove < 0 || iEdit < 0) {
  console.error(`✗ ${csvPath}: expected the columns ${CSV_HEADER.join(", ")}`);
  process.exit(1);
}

const items = new Map(collectItems().map((i) => [i.id, i]));
type Edit = { file: string; start: number; end: number; text: string };
const edits: Edit[] = [];
const approvedRows = new Map<string, Set<string>>(); // group -> ids approved
const groupIds = new Map<string, Set<string>>();
for (const i of items.values()) {
  if (!groupIds.has(i.group)) groupIds.set(i.group, new Set());
  groupIds.get(i.group)!.add(i.id);
}

let textEdits = 0;
const reviewEdits: string[] = [];
const unknown: string[] = [];
const unchanged: string[] = [];
for (const r of rows) {
  const id = (r[iId] ?? "").trim();
  if (!id) continue;
  const item = items.get(id);
  if (!item) {
    unknown.push(id);
    continue;
  }
  const approve = (r[iApprove] ?? "").trim().toUpperCase() === "Y";
  const edit = (r[iEdit] ?? "").trim();
  if (item.type === "review" && edit) {
    reviewEdits.push(id);
  } else if (edit && edit !== item.text) {
    edits.push({ file: item.file, start: item.textSpan.start, end: item.textSpan.end, text: JSON.stringify(edit) });
    textEdits++;
  }
  if (approve) {
    if (!approvedRows.has(item.group)) approvedRows.set(item.group, new Set());
    approvedRows.get(item.group)!.add(id);
  } else if (!edit) unchanged.push(id);
}

// A group flips to reviewed only when every one of its rows was approved.
const flipped: string[] = [];
const partial: string[] = [];
const seenFlag = new Set<string>();
for (const [group, ids] of approvedRows) {
  const all = groupIds.get(group)!;
  if ([...all].every((x) => ids.has(x))) {
    const item = [...items.values()].find((i) => i.group === group) as ReviewItem;
    if (item.reviewed || seenFlag.has(group)) continue;
    seenFlag.add(group);
    const f = item.flag;
    if (f.kind === "prop" && f.span) edits.push({ file: item.file, start: f.span.start, end: f.span.end, text: "true" });
    else if (f.kind === "arg" && f.span) edits.push({ file: item.file, start: f.span.start, end: f.span.end, text: "true" });
    else if (f.kind === "arg" && f.insertAt !== undefined) edits.push({ file: item.file, start: f.insertAt, end: f.insertAt, text: ", true" });
    flipped.push(group);
  } else partial.push(`${group} (${ids.size} of ${all.size} rows approved)`);
}

// Apply from the end of each file backwards so positions stay valid.
const byFile = new Map<string, Edit[]>();
for (const e of edits) (byFile.get(e.file) ?? byFile.set(e.file, []).get(e.file)!).push(e);
for (const [rel, list] of byFile) {
  const abs = absFile(rel);
  let text = readFileSync(abs, "utf8");
  list.sort((a, b) => b.start - a.start);
  for (const e of list) text = text.slice(0, e.start) + e.text + text.slice(e.end);
  writeFileSync(abs, text, "utf8");
}

console.log(`✓ ${textEdits} text edit(s) applied, ${flipped.length} item(s) marked reviewed`);
if (partial.length) console.log(`  not flipped, only partly approved: ${partial.join("; ")}`);
if (unknown.length) console.log(`  skipped, unknown id: ${unknown.join(", ")}`);
if (reviewEdits.length) console.log(`  not applied, reviews are never edited: ${reviewEdits.join(", ")}. Y keeps a review; to remove one, delete it from content/reviews.ts.`);
console.log(`  ${unchanged.length} row(s) left as they were`);
console.log("Next: npm run check:intake && npm run audit:safety && npm run audit:content");
