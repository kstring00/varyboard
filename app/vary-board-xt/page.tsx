import type { Metadata } from "next";
import Link from "next/link";
import { ProductPage, UsesStrip } from "@/components/product/ProductPage";
import { Reveal } from "@/components/ui/Reveal";
import { board, formatPrice, products } from "@/content/facts";
import { images } from "@/content/images";
import { buyLinks } from "@/lib/commerce";

const p = products.boardXT;

export const metadata: Metadata = {
  title: `${p.name}, ${formatPrice(p.price)} | ${p.specs[1].value} board for taller users`,
  description: `The ${p.name}: 4 modular sections, ${p.specs[1].value} installed, made for people 6'3" and taller. Designed by a physical therapist. Patented. ${formatPrice(p.price)}, flat-rate shipping.`,
  alternates: { canonical: p.path },
};

export default function VaryBoardXTPage() {
  return (
    <ProductPage
      product={p}
      image={images.clinicPair}
      gallery={[images.reachUp, images.bandPull, images.poolDetail]}
      buyHref={buyLinks.boardXT}
      buyLabel={`Get the XT (${formatPrice(p.price)})`}
      addOn={{ label: `XT + Bands (${formatPrice(p.price + products.bands.price)})`, href: buyLinks.boardXTPlusBands, note: `Adds the ${products.bands.name}: ${products.bands.summary}` }}
      headline="More reach for taller users."
      intro={`Four modular sections stack to a ${p.specs[1].value} board. Made for ${board.heightGuidance.xt.replace("Users ", "people ")}, and for clinics that serve everyone. Same anchors, same ${board.material}, one more section.`}
      faqIds={["size", "space", "install", "shipping", "clinics"]}
    >
      <UsesStrip />
      <section className="bg-paper py-12">
        <div className="container-site">
          <Reveal className="flex flex-col gap-4 rounded-3xl border border-line bg-white/60 p-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-medium">Under 6&apos;3&quot;?</h2>
              <p className="mt-1 text-lg text-ink-2">
                The standard {products.board.name} ({products.board.specs[1].value}) fits most adults.
              </p>
            </div>
            <Link href={products.board.path} className="btn-secondary shrink-0">
              See the Vary Board ({formatPrice(products.board.price)})
            </Link>
          </Reveal>
        </div>
      </section>
    </ProductPage>
  );
}
