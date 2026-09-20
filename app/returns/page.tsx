import type { Metadata } from "next";
import { Policy, PolicySection } from "@/components/ui/Policy";
import { brand, fact } from "@/content/facts";

export const metadata: Metadata = {
  title: "Returns | How to start a return",
  description: "How to start a return for a Vary Board order. Contact us with your order number and we will walk you through it.",
  alternates: { canonical: "/returns" },
};

export default function ReturnsPage() {
  const terms = fact("returns");
  return (
    <Policy eyebrow="Returns" title="Not right for you? Let's sort it out." updated="September 20, 2026">
      {terms && (
        <PolicySection title="Return terms">
          <p>{terms}</p>
        </PolicySection>
      )}
      <PolicySection title="How to start a return">
        <p>
          Call{" "}
          <a href={brand.phoneHref} className="link">
            {brand.phone}
          </a>{" "}
          or email{" "}
          <a href={`mailto:${brand.email}`} className="link">
            {brand.email}
          </a>{" "}
          with your order number and a short note about why you are returning it. We will confirm the next steps by email.
        </p>
      </PolicySection>
      <PolicySection title="Damaged in transit">
        <p>If your board arrives damaged, contact us within a few days of delivery with a photo of the packaging and the damage, and keep the packaging until we have replied.</p>
      </PolicySection>
    </Policy>
  );
}
