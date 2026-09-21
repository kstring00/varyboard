import Image from "next/image";
import { images } from "@/content/images";
import { board, products } from "@/content/facts";

/**
 * Directly beneath the hero. Deep pine ground (HexEdge dissolves into it), then the real
 * board, full-bleed: the sharpest straight-on photo in the repo. No render, no generated imagery.
 */
export function BoardShowcase() {
  const total = board.anchorPointsPerSection * Number(products.board.specs[0].value);
  const photo = images.boardCloseup;
  return (
    <section aria-labelledby="showcase-title" className="showcase">
      <div className="container-site showcase__copy">
        <p className="eyebrow !text-teal">The Vary Board</p>
        <h2 id="showcase-title" className="showcase__line">
          One wall. {total} anchor points. Every exercise at the exact height your body needs.
        </h2>
      </div>
      <div className="showcase__photo">
        <Image src={photo.src} alt={photo.alt} fill sizes="100vw" placeholder="blur" blurDataURL={photo.blurDataURL} className="object-cover object-[center_45%]" />
      </div>
    </section>
  );
}
