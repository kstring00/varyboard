/**
 * Captures public/images/fit/poster-bedroom.jpg from the live planner (the real scene, not an
 * illustration). Needs a running site and Chromium with software GL:
 *   npm run build && npm start -- -p 3123 &   then   node scripts/fit-poster.mjs [http://localhost:3123]
 */
import { chromium } from "playwright-core";

const base = process.argv[2] || "http://localhost:3123";
const exe = process.env.CHROME_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const b = await chromium.launch({ executablePath: exe, args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const p = await (await b.newContext({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 1 })).newPage();
await p.goto(`${base}/fit`, { waitUntil: "networkidle" });
// Make the stage exactly 1280x760 so the still matches the canvas aspect on desktop.
await p.addStyleTag({ content: ".container-site{max-width:none !important;padding:0 !important} .fit-planner{display:block !important} .fit-stage{height:760px !important;width:1280px !important;border-radius:0 !important;border:0 !important} .fit-hint,.fit-tag{display:none !important}" });
await p.click(".fit-poster__tap");
await p.waitForSelector(".fit-canvas", { timeout: 30000 });
await p.waitForTimeout(6000); // let the camera settle (software GL is slow)
// Screenshot the composited canvas (toDataURL is blank without preserveDrawingBuffer).
const out = new URL("../public/images/fit/poster-bedroom.jpg", import.meta.url);
await (await p.$(".fit-canvas")).screenshot({ path: out, type: "jpeg", quality: 86 });
console.log("✓ wrote public/images/fit/poster-bedroom.jpg");
await b.close();
