import type { Metadata } from "next";
import Link from "next/link";
import { Policy, PolicySection } from "@/components/ui/Policy";
import { brand, disclaimer } from "@/content/facts";

export const metadata: Metadata = {
  title: "Terms of use | thevaryboard.com",
  description: "The terms for using thevaryboard.com and buying the Vary Board: purchases through Shopify, health and safety notice, intellectual property, and how to contact us.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <Policy eyebrow="Terms" title="Plain terms for using this site." updated="September 20, 2026">
      <PolicySection title="Purchases">
        <p>Orders are placed and paid for through our Shopify store, and Shopify&apos;s checkout terms apply to the payment. Prices are shown in US dollars. If we make a pricing mistake, we will contact you before charging a different amount.</p>
      </PolicySection>
      <PolicySection title="Health and safety">
        <p>{disclaimer} The Vary Board is exercise equipment. Install it as shown in our installation video, check the mounting regularly, and stop any exercise that causes pain.</p>
        <p>Nothing on this site is medical advice, and the Vary Board is not intended to diagnose, treat or cure any condition.</p>
      </PolicySection>
      <PolicySection title="Shipping, returns and warranty">
        <p>
          See our{" "}
          <Link href="/shipping" className="link">
            shipping
          </Link>
          ,{" "}
          <Link href="/returns" className="link">
            returns
          </Link>{" "}
          and{" "}
          <Link href="/warranty" className="link">
            warranty
          </Link>{" "}
          pages.
        </p>
      </PolicySection>
      <PolicySection title="Intellectual property">
        <p>The Vary Board is patented. The photographs, text and design of this site belong to {brand.legalName} and may not be copied without permission.</p>
      </PolicySection>
      <PolicySection title="Changes and contact">
        <p>
          We may update these terms; the date at the top tells you when. Questions:{" "}
          <a href={`mailto:${brand.email}`} className="link">
            {brand.email}
          </a>{" "}
          or{" "}
          <a href={brand.phoneHref} className="link">
            {brand.phone}
          </a>
          .
        </p>
      </PolicySection>
    </Policy>
  );
}
