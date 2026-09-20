import { generatedImages, type GeneratedImageName } from "./images.generated";

/**
 * Every image on the site, with descriptive alt text. Add a line here when a new
 * photo is dropped into public/images/originals and `npm run assets:optimize` is run.
 * All photos are real photos supplied by Vary Systems. No AI imagery. (The hero's real-time
 * 3D scene is built from measured product geometry; see components/home/hero3d.)
 */
export interface SiteImage {
  key: GeneratedImageName;
  src: string;
  alt: string;
  width: number;
  height: number;
  blurDataURL: string;
  /** Where it is used. Informational. */
  scene: "hero" | "install" | "in-use" | "detail" | "clinic";
}

function img(key: GeneratedImageName, alt: string, scene: SiteImage["scene"]): SiteImage {
  const g = generatedImages[key];
  return { key, src: `/images/originals/${g.file}`, alt, width: g.width, height: g.height, blurDataURL: g.blur, scene };
}

export const images = {
  heroRoom: img(
    "varysystems-modernroom-r1-1",
    "A Vary Board mounted on a white wall beside a tall grid window, with a blue resistance band clipped to one of its anchor points",
    "hero",
  ),
  heroGym: img(
    "varysystems-gym-r1",
    "Two Vary Boards mounted side by side on a grey wall in a home gym, between living green walls, with a yellow band, dumbbells and an exercise ball nearby",
    "hero",
  ),
  reachUp: img(
    "6l5a6431",
    "A woman reaching up to grip a high anchor point on a teal Vary Board mounted to a grey wall",
    "in-use",
  ),
  bandPull: img(
    "img-6091",
    "A man in a home gym pulling a red resistance band anchored to the top of a Vary Board",
    "in-use",
  ),
  clinicPair: img(
    "img-7059",
    "A tall man and a woman each holding a Vary Board mounted on a dark blue clinic wall, reaching to different heights",
    "clinic",
  ),
  lunge: img(
    "img-e4807",
    "A woman holding a Vary Board with both hands while practicing a lunge on carpet in a hallway at home",
    "in-use",
  ),
  seniorBand: img(
    "mantoleft",
    "A man with grey hair and glasses pulling a red resistance band clipped to the top of a blue Vary Board",
    "in-use",
  ),
  poolDetail: img(
    "outside-pool",
    "Close-up of a black carabiner clipping a yellow resistance band to a hexagonal anchor point on a Vary Board installed outdoors by a pool",
    "detail",
  ),
} as const;

/** Background-removed PNG cutouts of the board, for parallax layers. Made by scripts/cutout.py. */
export const cutouts = {
  boardWithBand: { src: "/images/cutouts/board-with-band.png", width: 114, height: 639, alt: "" },
  boardSection: { src: "/images/cutouts/board-section.png", width: 113, height: 291, alt: "" },
  boardFront: { src: "/images/cutouts/board-front.png", width: 45, height: 384, alt: "" },
} as const;
