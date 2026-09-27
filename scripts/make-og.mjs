/**
 * Builds public/og.jpg (1200x630) from the hero render with the site name overlaid.
 *   node scripts/make-og.mjs
 */
import path from "node:path";
import { mkdtempSync, writeFileSync } from "node:fs";
import os from "node:os";

// Text is set in Figtree, the site's one family (assets/fonts, SIL OFL). librsvg finds fonts
// through fontconfig, so point it at a config that includes that folder before sharp loads.
const conf = path.join(mkdtempSync(path.join(os.tmpdir(), "og-fonts-")), "fonts.conf");
writeFileSync(conf, `<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig><dir>${path.resolve("assets/fonts")}</dir><include ignore_missing="yes">/etc/fonts/fonts.conf</include></fontconfig>`);
process.env.FONTCONFIG_FILE = conf;
const { default: sharp } = await import("sharp");

const src = path.resolve("public/images/originals/hero-render-clean.jpg");
const out = path.resolve("public/og.jpg");
const W = 1200, H = 630;

const overlay = Buffer.from(`
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="45%" stop-color="#17211f" stop-opacity="0"/>
      <stop offset="100%" stop-color="#17211f" stop-opacity="0.82"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <text x="60" y="${H - 118}" font-family="Figtree" font-weight="700" letter-spacing="-2" font-size="64" fill="#ffffff">The Vary Board</text>
  <text x="60" y="${H - 62}" font-family="Figtree" font-weight="500" font-size="28" fill="#dfe8e6">Strength. Mobility. Balance. Designed by a physical therapist. Patented.</text>
</svg>`);

await sharp(src)
  .resize(W, H, { fit: "cover", position: "right" })
  .composite([{ input: overlay }])
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile(out);
console.log("wrote public/og.jpg");
