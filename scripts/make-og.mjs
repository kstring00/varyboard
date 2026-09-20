/**
 * Builds public/og.jpg (1200x630) from the hero render with the site name overlaid.
 *   node scripts/make-og.mjs
 */
import sharp from "sharp";
import path from "node:path";

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
  <text x="60" y="${H - 118}" font-family="Georgia, 'DejaVu Serif', serif" font-size="64" fill="#ffffff">The Vary Board</text>
  <text x="60" y="${H - 62}" font-family="Helvetica, Arial, 'DejaVu Sans', sans-serif" font-size="28" fill="#dfe8e6">Strength. Mobility. Balance. Designed by a physical therapist. Patented.</text>
</svg>`);

await sharp(src)
  .resize(W, H, { fit: "cover", position: "right" })
  .composite([{ input: overlay }])
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile(out);
console.log("wrote public/og.jpg");
