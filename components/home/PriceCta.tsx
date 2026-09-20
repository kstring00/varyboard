import Link from "next/link";
import { Accordion } from "@/components/ui/Accordion";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { board, brand, discounts, formatPrice, products, shipping } from "@/content/facts";
import { homeFaq } from "@/content/faq";
import { buyLinks } from "@/lib/commerce";

export function PriceCta() {
  const bundle = products.board.price + products.bands.price;
  return (
    <section id="pricing" aria-labelledby="price-title" className="bg-paper-2 py-14 md:py-20">
      <div className="container-site">
        <Reveal>
          <SectionHeading align="center" eyebrow="Get yours" title={<span id="price-title">Two sizes. One simple choice.</span>} intro={`${shipping.flatRateLine}. ${discounts.heroesLine}`} />
        </Reveal>

        <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2">
          {/* Standard */}
          <Reveal className="relative flex flex-col rounded-3xl border-2 border-teal-deep bg-white p-6 shadow-soft">
            <span className="absolute -top-3.5 left-8 rounded-full bg-teal-deep px-3 py-1 text-sm font-semibold uppercase tracking-wider text-white">Most people</span>
            <h3 className="text-2xl font-medium">{products.board.name}</h3>
            <p className="mt-1 text-ink-2">{board.heightGuidance.standard}</p>
            <p className="mt-5 font-display text-4xl font-medium">{formatPrice(products.board.price)}</p>
            <ul className="mt-6 space-y-2 text-lg">
              {products.board.specs.slice(0, 3).map((s) => (
                <li key={s.label} className="flex justify-between gap-4 border-b border-line py-2">
                  <span className="text-ink-2">{s.label}</span>
                  <span className="font-semibold">{s.value}</span>
                </li>
              ))}
            </ul>
            <a href={buyLinks.board} className="btn-primary mt-8 text-lg">
              Get the Vary Board ({formatPrice(products.board.price)})
            </a>
            <Link href={products.board.path} className="mt-3 inline-flex min-h-12 items-center justify-center font-semibold text-teal-deep no-underline">
              Details and specs
            </Link>
          </Reveal>
          {/* XT */}
          <Reveal delay={90} className="flex flex-col rounded-3xl border border-line bg-white/70 p-6">
            <h3 className="text-2xl font-medium">{products.boardXT.name}</h3>
            <p className="mt-1 text-ink-2">{board.heightGuidance.xt}</p>
            <p className="mt-5 font-display text-4xl font-medium">{formatPrice(products.boardXT.price)}</p>
            <ul className="mt-6 space-y-2 text-lg">
              {products.boardXT.specs.slice(0, 3).map((s) => (
                <li key={s.label} className="flex justify-between gap-4 border-b border-line py-2">
                  <span className="text-ink-2">{s.label}</span>
                  <span className="font-semibold">{s.value}</span>
                </li>
              ))}
            </ul>
            <a href={buyLinks.boardXT} className="btn-secondary mt-8 text-lg">
              Get the XT ({formatPrice(products.boardXT.price)})
            </a>
            <Link href={products.boardXT.path} className="mt-3 inline-flex min-h-12 items-center justify-center font-semibold text-teal-deep no-underline">
              Details and specs
            </Link>
          </Reveal>
        </div>

        {/* Board + bands */}
        <Reveal className="mx-auto mt-6 flex max-w-4xl flex-col gap-4 rounded-2xl border border-line bg-white/70 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-medium">Board + Bands</h3>
            <p className="text-ink-2">
              {products.board.name} with the {products.bands.name}: {products.bands.summary}
            </p>
          </div>
          <a href={buyLinks.boardPlusBands} className="btn-primary shrink-0">
            Add both ({formatPrice(bundle)})
          </a>
        </Reveal>

        <div className="mx-auto mt-12 max-w-3xl">
          <Reveal>
            <h3 className="text-2xl font-medium">Quick answers</h3>
          </Reveal>
          <Reveal className="mt-5">
            <Accordion items={homeFaq.map((f) => ({ id: f.id, title: f.q, content: <p>{f.a}</p> }))} defaultOpen={[homeFaq[0].id]} />
          </Reveal>
          <Reveal className="mt-4">
            <Link href="/faq" className="inline-flex min-h-12 items-center font-semibold text-teal-deep no-underline">
              All questions
            </Link>
          </Reveal>
        </div>

        <Reveal className="mx-auto mt-12 max-w-3xl rounded-3xl bg-ink px-7 py-10 text-center text-paper">
          <h3 className="text-2xl font-medium">Ready when you are.</h3>
          <p className="mt-3 text-xl text-paper/80">
            {board.trustLine} {shipping.flatRateLine}.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <a href={buyLinks.board} className="btn-primary text-lg">
              Get the Vary Board ({formatPrice(products.board.price)})
            </a>
            <a href={brand.phoneHref} className="btn border-2 border-paper/30 text-paper hover:bg-paper/10">
              Call {brand.phone}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
