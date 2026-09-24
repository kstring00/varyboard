/**
 * Grades and exports the hero photo (a man pulling a red band anchored high on the Vary Board).
 *   node scripts/hero-photo.mjs            (npm run assets:hero)
 *
 * Source: public/images/hero/hero-strength-original.jpg (the full-resolution original).
 * Until that file is added, the 600 px copy already on the site (public/images/originals/
 * mantoleft.webp) is used and the script says so: the hero will look soft on large screens.
 *
 * Grade (same as the reference, done here with sharp, never with CSS filters):
 *   gamma 0.78 (lifts mid-tones so the gray studio wall reads as plaster), then a slight warm
 *   balance R x1.000, G x0.990, B x0.965.
 * Output: public/images/hero/hero-strength-{desktop|mobile}-{width}.{avif,webp} at 1x and 2x of
 * each layout's display width (never upscaled past the source), plus a graded full-size JPG for
 * the before/after check, and content/hero-photo.generated.json for the component.
 */
import sharp from "sharp";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "public", "images", "hero");
const original = path.join(outDir, "hero-strength-original.jpg");
const fallback = path.join(root, "public", "images", "originals", "mantoleft.webp");
const source = existsSync(original) ? original : fallback;
const usingFallback = source === fallback;

const GAMMA = 0.78;
const BALANCE = [1.0, 0.99, 0.965];

/** Display widths in CSS px. Desktop: the photo column (up to 68% of 1920). Mobile: full width. */
const LAYOUTS = {
  desktop: { cssWidth: 900, crop: null },
  mobile: { cssWidth: 430, crop: null },
};

mkdirSync(outDir, { recursive: true });

async function grade(input) {
  const { data, info } = await sharp(input).rotate().removeAlpha().toColourspace("srgb").raw().toBuffer({ resolveWithObject: true });
  const lut = [0, 1, 2].map((c) => {
    const t = new Uint8Array(256);
    for (let v = 0; v < 256; v++) t[v] = Math.max(0, Math.min(255, Math.round(255 * Math.pow(v / 255, GAMMA) * BALANCE[c])));
    return t;
  });
  for (let i = 0; i < data.length; i += 3) {
    data[i] = lut[0][data[i]];
    data[i + 1] = lut[1][data[i + 1]];
    data[i + 2] = lut[2][data[i + 2]];
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 3 } });
}

const meta = await sharp(source).metadata();
const graded = await grade(source);
const gradedBuf = await graded.clone().jpeg({ quality: 92 }).toBuffer();
writeFileSync(path.join(outDir, "hero-strength-graded.jpg"), gradedBuf);

const manifest = { source: path.relative(root, source), fallback: usingFallback, width: meta.width, height: meta.height, layouts: {} };
for (const [name, l] of Object.entries(LAYOUTS)) {
  const widths = [...new Set([l.cssWidth, l.cssWidth * 2].map((w) => Math.min(w, meta.width)))];
  const files = [];
  for (const w of widths) {
    const h = Math.round((meta.height * w) / meta.width);
    const base = `hero-strength-${name}-${w}`;
    const img = sharp(gradedBuf).resize(w, h);
    await img.clone().avif({ quality: 58, effort: 6 }).toFile(path.join(outDir, `${base}.avif`));
    await img.clone().webp({ quality: 80 }).toFile(path.join(outDir, `${base}.webp`));
    files.push({ w, h, avif: `/images/hero/${base}.avif`, webp: `/images/hero/${base}.webp` });
  }
  manifest.layouts[name] = files;
}
writeFileSync(path.join(root, "content", "hero-photo.generated.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(`✓ graded ${manifest.source} (${meta.width}×${meta.height}) -> public/images/hero/`);
if (usingFallback) console.warn("! hero-strength-original.jpg not found: used the 600 px copy. Add the original and run this again.");
