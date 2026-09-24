/**
 * Environment resolution for Vercel.
 *
 * Buy buttons link to the Shopify cart on NEXT_PUBLIC_SHOP_DOMAIN. Until the
 * domain moves, thevaryboard.com itself is the Shopify host, so that is the
 * fallback. Once thevaryboard.com is assigned to this Vercel project, checkout
 * must live elsewhere (the *.myshopify.com domain or a subdomain such as
 * shop.thevaryboard.com) and the variable must be set. A production build fails
 * only in that dangerous case: the checkout host resolving to this very site.
 */
const vercelEnv = process.env.VERCEL_ENV; // "production" | "preview" | "development" | undefined
export const isProduction = vercelEnv === "production";

/**
 * Launched = the production deployment AND SITE_LAUNCHED=true. Until then every deployment is
 * noindex (robots.txt, meta robots, X-Robots-Tag) and, on Vercel, behind the password gate in
 * proxy.ts. Flip SITE_LAUNCHED only as the last launch step (HANDOFF.md, "Launch blockers").
 */
export const isLaunched = isProduction && process.env.SITE_LAUNCHED === "true";

const LEGACY_SHOP_HOST = "thevaryboard.com";

function normalizeHost(v: string | undefined): string {
  return (v ?? "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");
}

/** Hostname that serves the Shopify cart, without protocol. */
export function resolveShopDomain(): string {
  const explicit = normalizeHost(process.env.NEXT_PUBLIC_SHOP_DOMAIN);
  const shop = explicit || LEGACY_SHOP_HOST;
  const productionHost = normalizeHost(process.env.VERCEL_PROJECT_PRODUCTION_URL);

  if (isProduction && productionHost && productionHost === shop) {
    throw new Error(
      `NEXT_PUBLIC_SHOP_DOMAIN resolves to "${shop}", which is this site's own production domain. ` +
        "Buy buttons would point at this site instead of Shopify checkout. " +
        "Set NEXT_PUBLIC_SHOP_DOMAIN in Vercel > Project > Settings > Environment Variables to the " +
        "Shopify checkout host (e.g. your-store.myshopify.com or shop.thevaryboard.com) and redeploy.",
    );
  }
  if (isProduction && !explicit) {
    console.warn(
      `[env] NEXT_PUBLIC_SHOP_DOMAIN not set; buy buttons use ${LEGACY_SHOP_HOST}. ` +
        "Set it before pointing thevaryboard.com at Vercel.",
    );
  }
  return shop;
}

/** Canonical public URL of the site, without a trailing slash. */
export function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (explicit) return explicit;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL && isProduction) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
