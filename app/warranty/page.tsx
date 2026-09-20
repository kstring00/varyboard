import type { Metadata } from "next";
import { Policy, PolicySection } from "@/components/ui/Policy";
import { board, brand, fact } from "@/content/facts";

export const metadata: Metadata = {
  title: "Warranty | Support for your Vary Board",
  description: "How to get help if something is wrong with your Vary Board. Contact us with your order number and a photo.",
  alternates: { canonical: "/warranty" },
};

export default function WarrantyPage() {
  const terms = fact("warranty");
  return (
    <Policy eyebrow="Warranty" title="Built to last. Backed by people who answer the phone." intro={`Molded ${board.material}, made for indoor and outdoor use.`} updated="September 20, 2026">
      {terms && (
        <PolicySection title="Warranty terms">
          <p>{terms}</p>
        </PolicySection>
      )}
      <PolicySection title="If something is wrong">
        <p>
          Call{" "}
          <a href={brand.phoneHref} className="link">
            {brand.phone}
          </a>{" "}
          or email{" "}
          <a href={`mailto:${brand.email}`} className="link">
            {brand.email}
          </a>{" "}
          with your order number, a photo of the issue, and when you bought the board. We will get back to you with the next steps.
        </p>
      </PolicySection>
      <PolicySection title="Care">
        <p>Wipe the board down with mild soap and water. Check the mounting hardware from time to time and tighten anything that has worked loose.</p>
      </PolicySection>
    </Policy>
  );
}
