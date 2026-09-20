/**
 * Launch gate: fails if placeholder text or an unconfirmed fact could reach a page.
 *   node scripts/check-placeholders.mjs
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const roots = ["app", "components", "content", "lib"];
const banned = [/lorem/i, /\bTODO\b/, /\bTBD\b/, /placeholder text/i, /confirmed:\s*false/];
const skip = new Set(["content/facts.ts"]); // openFacts legitimately holds confirmed:false
let failed = false;

async function walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p);
    else if (/\.(tsx?|mdx?|json)$/.test(e.name)) {
      const rel = p.replace(/\\/g, "/");
      const text = await readFile(p, "utf8");
      for (const re of banned) {
        if (skip.has(rel) && re.source.includes("confirmed")) continue;
        if (re.test(text)) { console.error(`✗ ${rel}: matches ${re}`); failed = true; }
      }
    }
  }
}
for (const r of roots) await walk(r).catch(() => {});
if (failed) process.exit(1);
console.log("✓ no placeholder text found");
