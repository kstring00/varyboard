import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { BoardShowcase } from "@/components/home/BoardShowcase";
import { WhatItIs } from "@/components/home/WhatItIs";
import { WhoItsFor } from "@/components/home/WhoItsFor";
import { WhatYouCanDo } from "@/components/home/WhatYouCanDo";
import { People } from "@/components/home/People";
import { Proof } from "@/components/home/Proof";
import { FitsYourSpace } from "@/components/home/FitsYourSpace";
import { PriceCta } from "@/components/home/PriceCta";
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
      <BoardShowcase />
      <WhatItIs />
      <WhoItsFor />
      <WhatYouCanDo />
      <People />
      <Proof />
      <FitsYourSpace />
      <PriceCta />
    </>
  );
}
