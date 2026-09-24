import { NextResponse } from "next/server";

/**
 * Pre-launch noindex (Next.js 16 "proxy", formerly middleware).
 *
 * Until launch (SITE_LAUNCHED=true on the production deployment) every response carries
 * X-Robots-Tag: noindex, alongside the robots.txt Disallow and the meta robots tag in
 * app/layout.tsx. The site stays open to everyone; it just is not indexed.
 *
 * At launch: set SITE_LAUNCHED=true for Production and redeploy. Previews stay noindex.
 */
export function proxy() {
  const res = NextResponse.next();
  const launched = process.env.VERCEL_ENV === "production" && process.env.SITE_LAUNCHED === "true";
  if (!launched) res.headers.set("x-robots-tag", "noindex, nofollow, noarchive");
  return res;
}

export const config = {
  // Everything except robots.txt.
  matcher: ["/((?!robots\\.txt$).*)"],
};
