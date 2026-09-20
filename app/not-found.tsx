import type { Metadata } from "next";
import Link from "next/link";
import { brand, formatPrice, products } from "@/content/facts";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <section className="container-site py-24 md:py-32">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 max-w-2xl text-[1.97rem] font-medium leading-[1.05] sm:text-[2.62rem]">That page isn&apos;t on the wall.</h1>
      <p className="mt-5 max-w-xl text-xl text-ink-2">The link may be old. Here is where most people want to go.</p>
      <ul className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-2">
        {[
          { href: "/", label: "Home" },
          { href: products.board.path, label: `${products.board.name} (${formatPrice(products.board.price)})` },
          { href: "/install", label: "Install guide" },
          { href: "/faq", label: "FAQ" },
          { href: "/professionals", label: "For clinics" },
          { href: "/contact", label: "Contact" },
        ].map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="flex min-h-14 items-center rounded-2xl border border-line bg-white/60 px-5 font-semibold text-teal-deep no-underline hover:border-teal-deep">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-ink-2">
        Or call{" "}
        <a href={brand.phoneHref} className="link">
          {brand.phone}
        </a>
        .
      </p>
    </section>
  );
}
