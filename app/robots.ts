import type { MetadataRoute } from "next";
import { isProduction } from "@/lib/env";
import { siteUrl } from "@/lib/site";

/** Preview deployments and local builds are never indexed. */
export default function robots(): MetadataRoute.Robots {
  if (!isProduction) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
