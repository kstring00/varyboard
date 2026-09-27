import { Figtree } from "next/font/google";

/**
 * One family for everything: Figtree. Headlines and display use 600/700, body and UI 400/500/600.
 * Loaded once (self-hosted by next/font, preloaded, never render-blocking) and exposed as
 * --font-figtree; app/globals.css maps it to the two type tokens, --font-display and --font-body.
 * No italic is loaded: accents change colour only, and font-synthesis is off so nothing fakes one.
 */
export const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  adjustFontFallback: true,
  variable: "--font-figtree",
});
