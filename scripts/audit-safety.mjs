/**
 * Safety audit. Fails the build if site copy contains:
 *   - diagnose / diagnosis / diagnosing (unless negated: "not a diagnosis", "not intended to diagnose")
 *   - cure / cures / cured (unless negated)
 *   - guarantee / guaranteed
 *   - "free" within six words of "VA"
 *   - lifespan claims: lifespan, "how long you'll live", "live longer", "add years"
 *   - a statistic (12%, 1 in 4, 3x, "studies show") outside a typed Stat with a `source`
 *
 *   npm run audit:safety   (runs in prebuild)
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const roots = ["app", "components", "content"];
const skipFiles = new Set(["components/ui/hex-shader.tsx", "content/images.generated.ts"]);

const rules = [
  { name: "diagnosis language", re: /\bdiagnos(e|es|ed|is|ing)\b/gi, negatable: true },
  { name: "cure language", re: /\bcur(e|es|ed|ing)\b/gi, negatable: true },
  { name: "guarantee", re: /\bguarantee[sd]?\b/gi, negatable: false },
  { name: "free near VA", re: /\bfree\b(?:\W+\w+){0,6}\W+\bVA\b|\bVA\b(?:\W+\w+){0,6}\W+\bfree\b/g, negatable: false },
  { name: "lifespan claim", re: /\blifespan\b|how long (you|they)('|’)?ll live|live longer|add(s|ed)? years/gi, negatable: false },
  { name: "statistic without source", re: /(?<=^|\s)\d+(\.\d+)?\s?%(?=\s+[A-Za-z]|[.!?,])(?!\s*(off|discount))|\b\d+ (in|out of) \d+\b|\b\d+x\b|\b(studies|research|data) (show|shows|suggest|suggests|prove|proves)\b/gi, negatable: false },
];
const NEGATION = /\b(not|never|no|isn't|aren't|doesn't|don't|cannot|can't)\b[^.]{0,40}$/i;

let failed = false;
async function walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p);
    else if (/\.(tsx?|mdx?)$/.test(e.name)) await check(p.replace(/\\/g, "/"));
  }
}
async function check(rel) {
  if (skipFiles.has(rel)) return;
  const text = await readFile(rel, "utf8");
  const lines = text.split("\n");
  lines.forEach((line, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) return; // comments explain the rules; they are not copy
    for (const rule of rules) {
      rule.re.lastIndex = 0;
      let m;
      while ((m = rule.re.exec(line))) {
        if (rule.negatable && NEGATION.test(line.slice(0, m.index))) continue;
        if (rule.name === "statistic without source" && /source\s*:/.test(line)) continue;
        console.error(`✗ ${rel}:${i + 1} ${rule.name}: "${m[0]}"`);
        failed = true;
      }
    }
  });
}
for (const r of roots) await walk(r).catch(() => {});
if (failed) {
  console.error("\nSafety audit failed. Rewrite the lines above in wellness language, or give the statistic a source.");
  process.exit(1);
}
console.log("✓ safety audit passed");
