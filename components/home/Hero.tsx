import { existsSync } from "node:fs";
import path from "node:path";
import { images } from "@/content/images";
import { reviews } from "@/content/reviews";
import { HeroShader, type HeroAssets } from "./HeroShader";

/**
 * HERO: plaster wall, honeycomb shader, real board photo in a layered parallax, honeycomb
 * bottom edge, audience ticker. Server side we only check which real assets exist:
 *
 *   public/images/hero/board-cutout.png   the board, background removed (Eric supplies)
 *   public/images/hero/hand-band.png      hand + band from the same photo, if separable
 *   public/images/hero/leaf.png           a real foreground leaf, blurred in CSS
 *
 * Until the cutout exists the current real board photo (board-closeup) is used. Never an
 * illustration or a generated image. Missing optional layers render nothing.
 */
const HERO_DIR = path.join(process.cwd(), "public", "images", "hero");
const slot = (file: string) => (existsSync(path.join(HERO_DIR, file)) ? `/images/hero/${file}` : null);

/** One short real review line. Never edited: the title if there is one, else a body under 160 chars. */
function heroReview() {
  const r = reviews.find((x) => x.featured) ?? reviews[0];
  if (!r) return null;
  const text = r.title?.trim() || (r.body.length <= 160 ? r.body.trim() : "");
  return text ? { text, author: r.author, rating: r.rating } : null;
}

export function Hero() {
  const cutout = slot("board-cutout.png");
  const assets: HeroAssets = {
    board: cutout
      ? { src: cutout, alt: "The Vary Board: a wall-mounted training board with honeycomb anchor points and side rails, photographed and cut out from its background", cutout: true }
      : { src: images.boardCloseup.src, alt: images.boardCloseup.alt, width: images.boardCloseup.width, height: images.boardCloseup.height, blurDataURL: images.boardCloseup.blurDataURL, cutout: false },
    hand: slot("hand-band.png"),
    leaf: slot("leaf.png"),
  };
  return <HeroShader assets={assets} review={heroReview()} />;
}
