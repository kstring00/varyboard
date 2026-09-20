import type { Metadata } from "next";
import Link from "next/link";
import { Accordion } from "@/components/ui/Accordion";
import { JsonLd } from "@/components/ui/JsonLd";
import { PageIntro } from "@/components/ui/PageIntro";
import { brand, formatPrice, products } from "@/content/facts";
import { faq } from "@/content/faq";
import { buyLinks } from "@/lib/commerce";

export const metadata: Metadata = {
  title: "FAQ | Sizes, space, shipping and everyday use",
  description: "Which size to choose, how much room you need, what shipping costs, the veteran and first responder discount, and how the Vary Board fits a home exercise program.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <>
      <JsonLd data={jsonLd} />
      <PageIntro eyebrow="FAQ" title="Questions, answered plainly." intro={<>Anything we missed? Call <a href={brand.phoneHref} className="link">{brand.phone}</a> or <Link href="/contact" className="link">send a message</Link>.</>} />
      <section className="container-site max-w-3xl pb-20">
        <Accordion items={faq.map((f) => ({ id: f.id, title: f.q, content: <p>{f.a}</p> }))} defaultOpen={[faq[0].id]} headingLevel={2} />
        <div className="mt-10 flex flex-wrap gap-3">
          <a href={buyLinks.board} className="btn-primary">
            Get the Vary Board ({formatPrice(products.board.price)})
          </a>
          <Link href="/install" className="btn-secondary">
            How it installs
          </Link>
        </div>
      </section>
    </>
  );
}
