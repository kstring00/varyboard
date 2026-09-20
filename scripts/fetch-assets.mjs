/**
 * Downloads every product/lifestyle photo from the live Shopify store into
 * public/images/originals/, plus the raw products.json for reference.
 *
 *   node scripts/fetch-assets.mjs
 *
 * Sources: /products.json and the HTML of the home, our-story, photo-gallery and
 * physical-therapy pages (any cdn.shopify.com image URL found in them).
 * Safe to re-run: existing files are skipped. Run `npm run assets:optimize` after.
 *
 * NOTE: this must be run from a machine that can reach thevaryboard.com and
 * cdn.shopify.com (the initial build environment could not).
 */
import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";

const SITE = process.env.SITE_ORIGIN ?? "https://thevaryboard.com";
const OUT = path.resolve("public/images/originals");
const PAGES = ["/", "/pages/our-story", "/pages/photo-gallery", "/pages/physical-therapy"];

const exists = (p) => access(p).then(() => true, () => false);
const clean = (u) => u.replace(/_(\d+x\d*|\d*x\d+|small|medium|large|grande|compact|icon|thumb)(@\dx)?(?=\.)/, "").split("?")[0];

async function download(url, hint) {
  const src = clean(url.startsWith("//") ? "https:" + url : url);
  const base = path.basename(new URL(src).pathname).replace(/[^a-z0-9._-]/gi, "-").toLowerCase();
  const file = path.join(OUT, base);
  if (await exists(file)) return { file, skipped: true };
  const res = await fetch(src);
  if (!res.ok) throw new Error(`${res.status} ${src}`);
  await writeFile(file, Buffer.from(await res.arrayBuffer()));
  return { file, skipped: false, hint };
}

await mkdir(OUT, { recursive: true });
const manifest = [];

const products = await (await fetch(`${SITE}/products.json?limit=250`)).json();
await writeFile(path.resolve("content/products.shopify.json"), JSON.stringify(products, null, 2));
for (const p of products.products) {
  for (const img of p.images) {
    const r = await download(img.src, `${p.title}: ${img.alt ?? ""}`);
    manifest.push({ file: path.basename(r.file), product: p.title, alt: img.alt ?? "", w: img.width, h: img.height });
    console.log(r.skipped ? "skip" : "saved", path.basename(r.file));
  }
}

for (const page of PAGES) {
  const html = await (await fetch(SITE + page)).text();
  const urls = new Set([...html.matchAll(/(?:https?:)?\/\/cdn\.shopify\.com\/s\/files\/[^"'\s)]+?\.(?:jpe?g|png|webp)/gi)].map((m) => m[0]));
  for (const u of urls) {
    try {
      const r = await download(u, page);
      manifest.push({ file: path.basename(r.file), page, alt: "" });
      console.log(r.skipped ? "skip" : "saved", path.basename(r.file), "from", page);
    } catch (e) {
      console.warn("failed", u, e.message);
    }
  }
}
await writeFile(path.resolve("content/assets.fetched.json"), JSON.stringify(manifest, null, 2));
console.log(`done: ${manifest.length} images. Now add alt text in content/images.ts and run npm run assets:optimize.`);
