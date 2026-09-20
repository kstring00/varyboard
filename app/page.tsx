import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { brand, formatPrice, products } from "@/content/facts";

export const metadata: Metadata = {
  title: `${brand.name} | Strength, mobility and balance training at home, ${formatPrice(products.board.price)}`,
  description:
    "A patented wall-mounted training board designed by a physical therapist. Hold on, clip in a band and practice strength, mobility and balance exercises at home.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      {/* Sections 2-8 (What it is, Who it's for, What you can do, The people behind it,
          Proof, Fits your space, Price + CTA) are built one at a time after hero review. */}
    </>
  );
}
