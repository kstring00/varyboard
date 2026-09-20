/**
 * Environment resolution for Vercel.
 *
 * Production, preview and local builds all work without extra config, but production
 * MUST set NEXT_PUBLIC_SHOP_DOMAIN: once thevaryboard.com points at Vercel, the
 * Shopify checkout lives on a different hostname (the *.myshopify.com domain or a
 * subdomain such as shop.thevaryboard.com), and every buy button links there.
 */
const vercelEnv = process.env.VERCEL_ENV; // "production" | "preview" | "development" | undefined
export const isProduction = vercelEnv === "production";

/** Hostname that serves the Shopify cart, without protocol. */
export function resolveShopDomain(): string {
  const v = process.env.NEXT_PUBLIC_SHOP_DOMAIN?.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (v) return v;
  if (isProduction) {
    throw new Error(
      "NEXT_PUBLIC_SHOP_DOMAIN is not set. Production buy buttons would point at the wrong host. " +
        "Set it in Vercel > Project > Settings > Environment Variables (e.g. your-store.myshopify.com).",
    );
  }
  return "thevaryboard.com"; // local/preview fallback: the current Shopify-hosted domain
}

/** Canonical public URL of the site, without a trailing slash. */
export function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (explicit) return explicit;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL && isProduction) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
