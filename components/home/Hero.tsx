import { preload } from "react-dom";
import photo from "@/content/hero-photo.generated.json";
import { HeroShader, type HeroPhoto } from "./HeroShader";
import { DESKTOP_MEDIA, MOBILE_MEDIA } from "./heroMedia";

/**
 * HERO: the existing honeycomb shader on plaster, copy on the left, a real photo on the right
 * (a man pulling a red band anchored high on the Vary Board), the honeycomb bottom edge drawn
 * over the photo, and the audience ticker underneath.
 *
 * The photo is graded and exported at build time by scripts/hero-photo.mjs (npm run assets:hero):
 * AVIF + WebP, a desktop and a mobile crop, 1x and 2x (never upscaled past the source). It is
 * the LCP element: both crops are preloaded for their own breakpoint, with explicit sizes.
 */
export const HERO_ALT = "A man doing a resistance band exercise anchored to the Vary Board on his wall.";
const DESKTOP_SIZES = "(min-width: 1024px) 68vw, 100vw";
const MOBILE_SIZES = "100vw";

const srcset = (files: { w: number; avif: string; webp: string }[], kind: "avif" | "webp") => files.map((f) => `${f[kind]} ${f.w}w`).join(", ");

export function Hero() {
  const d = photo.layouts.desktop;
  const m = photo.layouts.mobile;
  const data: HeroPhoto = {
    alt: HERO_ALT,
    width: photo.width,
    height: photo.height,
    desktop: { avif: srcset(d, "avif"), webp: srcset(d, "webp"), sizes: DESKTOP_SIZES, fallback: d[d.length - 1].webp },
    mobile: { avif: srcset(m, "avif"), webp: srcset(m, "webp"), sizes: MOBILE_SIZES },
    // A portrait stand-in has the man near its left edge, so its fade is narrower.
    fade: photo.width / photo.height < 1.1 ? "26%" : "32%",
  };
  preload(d[0].avif, { as: "image", type: "image/avif", imageSrcSet: data.desktop.avif, imageSizes: DESKTOP_SIZES, media: DESKTOP_MEDIA, fetchPriority: "high" });
  preload(m[0].avif, { as: "image", type: "image/avif", imageSrcSet: data.mobile.avif, imageSizes: MOBILE_SIZES, media: MOBILE_MEDIA, fetchPriority: "high" });
  return <HeroShader photo={data} />;
}
