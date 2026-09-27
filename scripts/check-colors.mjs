/**
 * Colour guardrail. Fails (and prints file:line) when it finds:
 *   1. a hard-coded hex colour outside the token files (the :root block in app/globals.css, and
 *      lib/colors.ts, which must mirror it exactly)
 *   2. --progress or --progress-soft used as a text colour (`color:` or text-mint*), except a line
 *      marked with an "on-brand" comment (progress-soft text is allowed only on --brand)
 *   3. --product (the board's blue) used outside the board drawings
 * It is a tripwire for a human, not a proof. The 3D room planner's material palette (wood, walls,
 * furniture textures) is scene data, not UI colour, and is listed as allowed below.
 *   npm run check:colors
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const roots = ["app", "components", "content", "lib", "scripts"];
const TOKEN_FILES = new Set(["app/globals.css", "lib/colors.ts"]);
/** 3D scene material palette (three.js textures and materials): allowed, reported as a count. */
const SCENE_PALETTE = new Set(["components/fit/scene.ts", "content/rooms.ts"]);
/** Where the board's own blue may appear: the drawings of the board. */
const BOARD_FILES = new Set([
  "components/home/hero/BoardSvg.tsx",
  "components/home/hero/GenreRing.tsx",
  "components/home/clinic/ClinicCompare.tsx",
  "components/site/Logo.tsx",
  "components/fit/scene.ts",
  "lib/colors.ts",
  "scripts/check-colors.mjs",
]);

const HEX = /(?<![\w&/-])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g;
const isComment = (l) => /^\s*(\/\/|\*|\/\*)/.test(l);
const problems = [];
let sceneHexes = 0;

async function walk(dir, out = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else if (/\.(tsx?|css|mjs)$/.test(e.name)) out.push(p.replace(/\\/g, "/"));
  }
  return out;
}

const files = (await Promise.all(roots.map((r) => walk(r).catch(() => [])))).flat();
const css = await readFile("app/globals.css", "utf8");
const rootStart = css.indexOf(":root {");
const rootEnd = css.indexOf("\n}", rootStart);
const rootBlock = css.slice(rootStart, rootEnd);

for (const rel of files) {
  const text = await readFile(rel, "utf8");
  const lines = text.split("\n");
  let offset = 0;
  lines.forEach((line, i) => {
    const at = `${rel}:${i + 1}`;
    const lineStart = offset;
    offset += line.length + 1;
    if (isComment(line) || rel === "scripts/check-colors.mjs") return;
    // 1. hard-coded hex
    const hexes = line.match(HEX) ?? [];
    if (hexes.length) {
      const inRoot = rel === "app/globals.css" && lineStart > rootStart && lineStart < rootEnd;
      if (SCENE_PALETTE.has(rel)) sceneHexes += hexes.length;
      else if (!(inRoot || rel === "lib/colors.ts")) problems.push(`${at} hard-coded colour ${hexes.join(", ")}`);
    }
    // 2. progress colours as text
    const onBrand = /on-brand/.test(line);
    if (!onBrand && /(^|[\s;{])color:\s*var\(--(progress|progress-soft|color-mint|color-mint-soft)\)/.test(line)) problems.push(`${at} progress colour used as text`);
    if (!onBrand && /\btext-mint(-soft)?\b/.test(line)) problems.push(`${at} progress colour used as text (text-mint)`);
    // 3. the board's blue off the board
    if (!BOARD_FILES.has(rel) && /var\(--(product|color-product)\)|\b(bg|text|fill|stroke|border)-product\b|COLORS\.product\b/.test(line)) {
      const isTokenDef = rel === "app/globals.css" && /^\s*--(color-)?product:/.test(line);
      if (!isTokenDef) problems.push(`${at} product blue outside the board drawings`);
    }
  });
}

// lib/colors.ts must mirror the CSS tokens
const mirror = await readFile("lib/colors.ts", "utf8");
const kebab = (k) => k.replace(/([a-z])([A-Z0-9])/g, "$1-$2").toLowerCase();
for (const [, key, hex] of mirror.matchAll(/^\s*(\w+):\s*"(#[0-9a-fA-F]{6})"/gm)) {
  const m = rootBlock.match(new RegExp(`--${kebab(key)}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) problems.push(`lib/colors.ts ${key}: no --${kebab(key)} token in app/globals.css`);
  else if (m[1].toLowerCase() !== hex.toLowerCase()) problems.push(`lib/colors.ts ${key} is ${hex} but --${kebab(key)} is ${m[1]}`);
}

console.log(`• ${sceneHexes} hex values in the 3D room planner's material palette (allowed: ${[...SCENE_PALETTE].join(", ")})`);
if (problems.length) {
  console.error(`✗ ${problems.length} colour problem(s):\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log("✓ colours: tokens only, progress never as text, product blue only on the board");
