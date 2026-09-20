import type { Metadata } from "next";
import Link from "next/link";
import { Policy, PolicySection } from "@/components/ui/Policy";
import { brand, shipping } from "@/content/facts";

export const metadata: Metadata = {
  title: "Shipping | Flat-rate $9.99 on every order",
  description: `Every Vary Board order ships for a flat ${shipping.flatRateLine.replace("Flat-rate shipping ", "")}. How shipping works and who to contact about a delivery.`,
  alternates: { canonical: "/shipping" },
};

export default function ShippingPage() {
  return (
    <Policy eyebrow="Shipping" title="One flat rate. No surprises." intro={`${shipping.flatRateLine} on every order, whatever you buy.`} updated="September 20, 2026">
      <PolicySection title="Cost">
        <p>{shipping.flatRateLine}. The rate is the same for a single board, a Vary Board XT, or a board with bands.</p>
      </PolicySection>
      <PolicySection title="How it works">
        <p>Checkout and shipping are handled through our Shopify store. You will receive an order confirmation by email, and a tracking email once your order ships.</p>
      </PolicySection>
      <PolicySection title="Questions about a delivery">
        <p>
          Call{" "}
          <a href={brand.phoneHref} className="link">
            {brand.phone}
          </a>{" "}
          or email{" "}
          <a href={`mailto:${brand.email}`} className="link">
            {brand.email}
          </a>{" "}
          with your order number and we will look into it. See also our{" "}
          <Link href="/returns" className="link">
            returns
          </Link>{" "}
          page.
        </p>
      </PolicySection>
    </Policy>
  );
}
