import Link from "next/link";
import { Logo } from "./Logo";
import { PhoneLink } from "./PhoneLink";
import { brand, disclaimer } from "@/content/facts";
import { currentYear } from "@/lib/site";

const cols = [
  {
    title: "Shop",
    links: [
      { href: "/vary-board", label: "Vary Board" },
      { href: "/vary-board-xt", label: "Vary Board XT" },
      { href: "/resistance-bands", label: "Resistance bands" },
      { href: "/professionals", label: "For clinics" },
    ],
  },
  {
    title: "Learn",
    links: [
      { href: "/install", label: "Install guide" },
      { href: "/faq", label: "FAQ" },
      { href: "/our-story", label: "Our story" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Policies",
    links: [
      { href: "/shipping", label: "Shipping" },
      { href: "/returns", label: "Returns" },
      { href: "/warranty", label: "Warranty" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper-2 pb-28 pt-14 md:pb-24">
      <div className="container-site grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-3 text-ink-2">{brand.tagline}</p>
          <div className="mt-4 flex flex-col items-start">
            <PhoneLink className="text-teal-deep" />
            <a href={`mailto:${brand.email}`} className="inline-flex min-h-12 items-center font-semibold text-teal-deep">
              {brand.email}
            </a>
          </div>
        </div>
        {cols.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.14em] text-muted">{c.title}</h2>
            <ul className="mt-3">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="inline-flex min-h-11 min-w-11 items-center text-ink-2 no-underline hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="container-site mt-10 border-t border-line pt-6 text-[0.95rem] text-muted">
        <p>{disclaimer}</p>
        <p className="mt-2">
          &copy; {currentYear} {brand.legalName}. {brand.name} is patented. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
