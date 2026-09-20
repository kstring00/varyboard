import type { MetadataRoute } from "next";
import { routes } from "@/content/routes";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return routes.map((r) => ({ url: `${siteUrl}${r.path === "/" ? "" : r.path}`, lastModified, priority: r.priority }));
}
