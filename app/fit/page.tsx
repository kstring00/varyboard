import type { Metadata } from "next";
import Link from "next/link";
import { FitSection } from "@/components/fit/FitSection";
import { board, products } from "@/content/facts";

export const metadata: Metadata = {
  title: `Will the ${products.board.name} fit your home? Drag it and see`,
  description: `Move the ${products.board.name} around a bedroom, garage, patio and clinic drawn to scale. See the ${board.minSpacePerUser} of floor you need, the ceiling height for each size, and which walls work.`,
  alternates: { canonical: "/fit" },
};

export default function FitPage() {
  return (
    <>
      <FitSection standalone />
      <section className="container-site pb-16">
        <div className="flex flex-wrap gap-3">
          <Link href="/install" className="btn-secondary">
            How it installs
          </Link>
          <Link href="/plan" className="btn-ghost">
            Find your plan
          </Link>
        </div>
      </section>
    </>
  );
}
