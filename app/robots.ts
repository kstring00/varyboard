import type { MetadataRoute } from "next";
import { isLaunched } from "@/lib/env";
import { siteUrl } from "@/lib/site";

/** Nothing is indexed until launch: previews, local builds and the pre-launch production deployment all disallow. */
export default function robots(): MetadataRoute.Robots {
  if (!isLaunched) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
