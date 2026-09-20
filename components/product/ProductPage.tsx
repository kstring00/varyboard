import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Accordion } from "@/components/ui/Accordion";
import { JsonLd } from "@/components/ui/JsonLd";
import { Reveal } from "@/components/ui/Reveal";
import { board, brand, discounts, formatPrice, products, shipping, type Product } from "@/content/facts";
import type { SiteImage } from "@/content/images";
import { faq } from "@/content/faq";
import { siteUrl } from "@/lib/site";

export function ProductPage({
  product,
  image,
  gallery = [],
  buyHref,
  buyLabel,
  addOn,
  headline,
  intro,
  children,
  faqIds,
}: {
  product: Product;
  image: SiteImage;
  gallery?: SiteImage[];
  buyHref: string;
  buyLabel: string;
  addOn?: { label: string; href: string; note: string };
  headline: string;
  intro: string;
  children?: ReactNode;
  faqIds: string[];
}) {
  const items = faq.filter((f) => faqIds.includes(f.id));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku || undefined,
    description: intro,
    image: [`${siteUrl}${image.src}`],
    brand: { "@type": "Brand", name: brand.name },
    offers: {
      "@type": "Offer",
      url: `${siteUrl}${product.path}`,
      priceCurrency: "USD",
      price: product.price.toFixed(2),
      availability: "https://schema.org/InStock",
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: shipping.flatRate.toFixed(2), currency: "USD" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" },
      },
    },
  };

  return (
    <article>
      <JsonLd data={jsonLd} />
      <section className="bg-paper">
        <div className="container-site grid gap-10 py-10 md:py-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start lg:gap-12">
          <div className="grid gap-4">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-paper-2 shadow-soft sm:aspect-[5/4] lg:aspect-[4/5]">
              <Image src={image.src} alt={image.alt} fill priority sizes="(min-width: 1024px) 55vw, 100vw" placeholder="blur" blurDataURL={image.blurDataURL} className="object-cover" />
            </div>
            {gallery.length > 0 && (
              <ul className="grid grid-cols-3 gap-3">
                {gallery.map((g) => (
                  <li key={g.key} className="relative aspect-square overflow-hidden rounded-2xl bg-paper-2">
                    <Image src={g.src} alt={g.alt} fill sizes="20vw" placeholder="blur" blurDataURL={g.blurDataURL} className="object-cover" />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="lg:sticky lg:top-24">
            <p className="eyebrow">{product.name}</p>
            <h1 className="mt-3 text-[1.97rem] font-medium leading-[1.05] sm:text-[2.46rem]">{headline}</h1>
            <p className="mt-4 text-xl text-ink-2">{intro}</p>
            <p className="mt-6 font-display text-4xl font-medium">{formatPrice(product.price)}</p>
            <div className="mt-6 flex flex-col gap-3">
              <a href={buyHref} className="btn-primary text-lg">
                {buyLabel}
              </a>
              {addOn && (
                <a href={addOn.href} className="btn-secondary text-lg">
                  {addOn.label}
                </a>
              )}
            </div>
            {addOn && <p className="mt-2 text-[0.95rem] text-ink-2">{addOn.note}</p>}
            <ul className="mt-6 space-y-2 text-ink-2">
              <li className="flex items-center gap-2">
                <Check /> {shipping.flatRateLine}
              </li>
              <li className="flex items-center gap-2">
                <Check /> {discounts.heroesLine}
              </li>
              <li className="flex items-center gap-2">
                <Check /> {board.trustLine}
              </li>
              <li className="flex items-center gap-2">
                <Check /> Secure checkout through Shopify
              </li>
            </ul>
            <p className="mt-6 text-ink-2">
              Questions? Call{" "}
              <a href={brand.phoneHref} className="link">
                {brand.phone}
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      {children}

      {product.specs.length > 0 && (
        <section aria-labelledby="specs-title" className="bg-paper-2 py-12 md:py-12">
          <div className="container-site grid gap-10 lg:grid-cols-[1fr_1.4fr]">
            <Reveal>
              <p className="eyebrow">Specifications</p>
              <h2 id="specs-title" className="mt-3 text-[1.72rem] font-medium leading-[1.08] sm:text-[2.13rem]">
                The details.
              </h2>
              <p className="mt-4 text-lg text-ink-2">
                {board.sectionAnatomy} Every spec on this page comes from one confirmed source, so what you read is what you get.
              </p>
            </Reveal>
            <Reveal>
              <dl className="divide-y divide-line rounded-2xl border border-line bg-white/70">
                {product.specs.map((s) => (
                  <div key={s.label} className="flex justify-between gap-6 px-6 py-4 text-lg">
                    <dt className="text-ink-2">{s.label}</dt>
                    <dd className="text-right font-semibold">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </section>
      )}

      <section aria-labelledby="pfaq-title" className="bg-paper py-12 md:py-12">
        <div className="container-site max-w-3xl">
          <Reveal>
            <h2 id="pfaq-title" className="text-[1.72rem] font-medium leading-[1.08] sm:text-[2.13rem]">
              Good to know.
            </h2>
          </Reveal>
          <Reveal className="mt-6">
            <Accordion items={items.map((f) => ({ id: f.id, title: f.q, content: <p>{f.a}</p> }))} />
          </Reveal>
          <Reveal className="mt-6 flex flex-wrap gap-4">
            <Link href="/faq" className="btn-secondary">
              All questions
            </Link>
            <Link href="/install" className="btn-ghost">
              How it installs
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="bg-paper-2 py-12">
        <div className="container-site flex flex-col items-start gap-5 rounded-3xl bg-ink p-6 text-paper md:flex-row md:items-center md:justify-between md:p-10">
          <div>
            <h2 className="text-2xl font-medium">{product.name}</h2>
            <p className="mt-1 text-xl text-paper/80">
              {formatPrice(product.price)} · {shipping.flatRateLine.toLowerCase()}
            </p>
          </div>
          <a href={buyHref} className="btn-primary text-lg">
            {buyLabel}
          </a>
        </div>
      </section>
    </article>
  );
}

function Check() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-teal-deep)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

export function UsesStrip() {
  return (
    <section className="bg-paper pb-4">
      <div className="container-site">
        <Reveal className="rounded-3xl border border-line bg-white/60 p-6">
          <h2 className="text-xl font-medium">Six kinds of practice, one board</h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {board.uses.map((u) => (
              <li key={u} className="rounded-full bg-teal-soft px-5 py-2.5 font-medium text-teal-deeper">
                {u}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-ink-2">{products.board.summary.split(".")[0]}. Consult your physician or physical therapist before starting a new exercise program.</p>
        </Reveal>
      </div>
    </section>
  );
}
