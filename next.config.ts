import type { NextConfig } from "next";
import { redirects } from "./content/redirects";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536, 1920],
  },
  async redirects() {
    return redirects.map((r) => ({ source: r.from, destination: r.to, statusCode: 301 }));
  },
};

export default nextConfig;
