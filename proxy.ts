import { NextResponse, type NextRequest } from "next/server";

/**
 * Pre-launch gate (Next.js 16 "proxy", formerly middleware).
 *
 * Until launch (SITE_LAUNCHED=true on the production deployment):
 *   - every response carries X-Robots-Tag: noindex, on every deployment and locally;
 *   - every Vercel deployment (production and previews) asks for a password: HTTP Basic auth
 *     against SITE_PASSWORD (any user name; SITE_USER if you want one checked too).
 *     If SITE_PASSWORD is not set on Vercel the site is closed with a 503 page that says so,
 *     so it can never be public by accident. Local `npm run dev` / `npm start` stay open.
 * robots.txt is never gated, so crawlers always read its Disallow.
 *
 * At launch: set SITE_LAUNCHED=true for Production and redeploy. Previews stay gated.
 */
const NOINDEX = "noindex, nofollow, noarchive";

function sameText(a: string, b: string): boolean {
  // Compare every character regardless of where the first difference is.
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

function authorized(req: NextRequest, password: string, user: string | undefined): boolean {
  const header = req.headers.get("authorization") ?? "";
  if (!header.toLowerCase().startsWith("basic ")) return false;
  let decoded = "";
  try {
    decoded = atob(header.slice(6).trim());
  } catch {
    return false;
  }
  const i = decoded.indexOf(":");
  if (i < 0) return false;
  const okPass = sameText(decoded.slice(i + 1), password);
  const okUser = user ? sameText(decoded.slice(0, i), user) : true;
  return okPass && okUser;
}

const closedPage = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><title>The Vary Board: not open yet</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f2f0eb;color:#17211f;font:17px/1.55 system-ui,sans-serif;padding:24px}main{max-width:34rem}h1{font:500 1.8rem/1.2 Georgia,serif;margin:0 0 .6rem}code{background:#e8e5de;padding:.1rem .35rem;border-radius:4px}</style></head>
<body><main><h1>This site is not open yet.</h1><p>Pre-launch deployments are password protected. The password has not been set: add <code>SITE_PASSWORD</code> in Vercel &gt; Project &gt; Settings &gt; Environment Variables (Production and Preview), then redeploy.</p></main></body></html>`;

export function proxy(req: NextRequest) {
  const vercelEnv = process.env.VERCEL_ENV;
  const onVercel = vercelEnv === "production" || vercelEnv === "preview";
  const launched = vercelEnv === "production" && process.env.SITE_LAUNCHED === "true";

  let res: NextResponse;
  if (onVercel && !launched) {
    const password = process.env.SITE_PASSWORD;
    if (!password) {
      res = new NextResponse(closedPage, { status: 503, headers: { "content-type": "text/html; charset=utf-8", "retry-after": "3600", "cache-control": "no-store" } });
    } else if (!authorized(req, password, process.env.SITE_USER || undefined)) {
      res = new NextResponse("Password required.", { status: 401, headers: { "www-authenticate": 'Basic realm="The Vary Board (pre-launch)", charset="UTF-8"', "cache-control": "no-store" } });
    } else {
      res = NextResponse.next();
    }
  } else {
    res = NextResponse.next();
  }
  if (!launched) res.headers.set("x-robots-tag", NOINDEX);
  return res;
}

export const config = {
  // Everything except robots.txt.
  matcher: ["/((?!robots\\.txt$).*)"],
};
