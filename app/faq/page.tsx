import type { Metadata } from "next";
import Link from "next/link";
import { FaqDeepLink } from "@/components/faq/FaqDeepLink";
import { FaqDetails } from "@/components/faq/FaqDetails";
import { JsonLd } from "@/components/ui/JsonLd";
import { PageIntro } from "@/components/ui/PageIntro";
import { brand, formatPrice, products } from "@/content/facts";
import { FAQ, FAQ_GROUPS, faqJsonLd, isVisible, toView } from "@/content/faq";
import { buyLinks } from "@/lib/commerce";

export const metadata: Metadata = {
  title: "FAQ | Sizes, space, shipping and everyday use",
  description: "Which size to choose, how much room you need, what shipping costs, the veteran and first responder discount, and how the Vary Board fits a home exercise program.",
  alternates: { canonical: "/faq" },
};

/** Every question on the site (content/faq.ts), grouped. Production lists verified answers only. */
export default function FaqPage() {
  const visible = FAQ.filter((e) => e.placements.includes("faq") && isVisible(e));
  const groups = FAQ_GROUPS.map((g) => ({ ...g, items: visible.filter((e) => g.groups.includes(e.group)) })).filter((g) => g.items.length);
  const ld = faqJsonLd();
  return (
    <>
      {ld && <JsonLd data={ld} />}
      <FaqDeepLink />
      <PageIntro eyebrow="FAQ" title="Questions, answered plainly." intro={<>Anything we missed? Call <a href={brand.phoneHref} className="link">{brand.phone}</a> or <Link href="/contact" className="link">send a message</Link>.</>} />
      <section className="container-site max-w-3xl pb-20">
        {groups.map((g) => (
          <div key={g.label} className="faqs__group">
            <h2 className="faqs__h">{g.label}</h2>
            {g.items.map((e) => (
              <FaqDetails key={e.id} id={`faq-${e.id}`} item={toView(e)} placement="faq-page" variant="row" />
            ))}
          </div>
        ))}
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
