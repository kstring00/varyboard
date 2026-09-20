import type { Metadata } from "next";
import { ProductPage } from "@/components/product/ProductPage";
import { Reveal } from "@/components/ui/Reveal";
import { formatPrice, products } from "@/content/facts";
import { images } from "@/content/images";
import { buyLinks } from "@/lib/commerce";

const p = products.bands;

export const metadata: Metadata = {
  title: `${p.name}, ${formatPrice(p.price)} | Latex-free loops`,
  description: `${p.summary} Clip them to any of the Vary Board's anchor points with a carabiner (${formatPrice(products.carabiner.price)}). Flat-rate shipping.`,
  alternates: { canonical: p.path },
};

export default function BandsPage() {
  return (
    <ProductPage
      product={p}
      image={images.poolDetail}
      gallery={[images.bandPull, images.seniorBand]}
      buyHref={buyLinks.bands}
      buyLabel={`Get the bands (${formatPrice(p.price)})`}
      addOn={{ label: `Add a carabiner (${formatPrice(products.carabiner.price)})`, href: buyLinks.carabiner, note: products.carabiner.summary }}
      headline="Six bands. Every anchor point."
      intro={`${p.summary} Clip one to a low anchor for legs, a high one for arms and shoulders, and change the resistance by changing the loop.`}
      faqIds={["bands", "shipping", "what"]}
    >
      <section className="bg-paper pb-4">
        <div className="container-site grid gap-5 md:grid-cols-3">
          {[
            { t: `3 × 10" mini loops`, d: "Short loops for steps, side-steps and small, controlled movements." },
            { t: `3 × 22" loops`, d: "Longer loops for rows, presses and pulls from any anchor height." },
            { t: "Latex free", d: "Kind to skin and easy to wipe down between uses." },
          ].map((c, i) => (
            <Reveal key={c.t} delay={i * 80} className="rounded-2xl border border-line bg-white/60 p-7">
              <h2 className="text-xl font-medium">{c.t}</h2>
              <p className="mt-2 text-ink-2">{c.d}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </ProductPage>
  );
}
