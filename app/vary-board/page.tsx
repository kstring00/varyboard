import type { Metadata } from "next";
import Link from "next/link";
import { ProductPage, UsesStrip } from "@/components/product/ProductPage";
import { Reveal } from "@/components/ui/Reveal";
import { board, formatPrice, products } from "@/content/facts";
import { images } from "@/content/images";
import { buyLinks } from "@/lib/commerce";

const p = products.board;

export const metadata: Metadata = {
  title: `${p.name}, ${formatPrice(p.price)} | Strength, mobility and balance at home`,
  description: `The ${p.name}: 3 modular sections, ${p.specs[1].value} installed, 47 anchor points per section. Designed by a physical therapist. Patented. ${formatPrice(p.price)}, flat-rate shipping.`,
  alternates: { canonical: p.path },
};

export default function VaryBoardPage() {
  return (
    <ProductPage
      product={p}
      image={images.seniorBand}
      gallery={[images.reachUp, images.lunge, images.poolDetail]}
      buyHref={buyLinks.board}
      buyLabel={`Get the Vary Board (${formatPrice(p.price)})`}
      addOn={{ label: `Board + Bands (${formatPrice(p.price + products.bands.price)})`, href: buyLinks.boardPlusBands, note: `Adds the ${products.bands.name}: ${products.bands.summary}` }}
      headline="The board for most adults."
      intro={`Three modular sections stack to a ${p.specs[1].value} board on your wall. ${board.anchorPointsPerSection} hexagonal anchor points per section for bands and handholds. ${board.material}, indoors or out.`}
      faqIds={["size", "space", "install", "shipping", "discount"]}
    >
      <UsesStrip />
      <section className="bg-paper py-12">
        <div className="container-site">
          <Reveal className="flex flex-col gap-4 rounded-3xl border border-line bg-white/60 p-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-medium">{board.heightGuidance.xt}?</h2>
              <p className="mt-1 text-lg text-ink-2">
                The {products.boardXT.name} adds a fourth section for a {products.boardXT.specs[1].value} board.
              </p>
            </div>
            <Link href={products.boardXT.path} className="btn-secondary shrink-0">
              See the XT ({formatPrice(products.boardXT.price)})
            </Link>
          </Reveal>
        </div>
      </section>
    </ProductPage>
  );
}
