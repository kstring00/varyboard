import type { NextConfig } from "next";
import { redirects } from "./content/redirects";
import { resolveShopDomain } from "./lib/env";

const shop = resolveShopDomain();

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536, 1920],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      // Old Shopify theme URLs -> new pages (true 301s).
      ...redirects.map((r) => ({ source: r.from, destination: r.to, statusCode: 301 as const })),
      // Anything commerce-related that lands on this host goes to the Shopify store.
      { source: "/cart", destination: `https://${shop}/cart`, statusCode: 301 as const },
      { source: "/cart/:path*", destination: `https://${shop}/cart/:path*`, statusCode: 301 as const },
      { source: "/checkouts/:path*", destination: `https://${shop}/checkouts/:path*`, statusCode: 301 as const },
      { source: "/account/:path*", destination: `https://${shop}/account/:path*`, statusCode: 301 as const },
      { source: "/collections/:path*", destination: "/vary-board", statusCode: 301 as const },
    ];
  },
};

export default nextConfig;
