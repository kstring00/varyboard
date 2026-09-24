import Link from "next/link";
import { brand, discounts } from "@/content/facts";
import { footerNav, legalNav, link } from "@/content/routes";
import { currentYear } from "@/lib/site";
import { FooterEdge } from "./FooterEdge";
import { HexWordmark } from "./HexWordmark";

const MIL = link("/plan", { query: "for=mil", label: "Military & VA" });

/**
 * Site footer: brand + utility. Honeycomb top edge, "VARY BOARD" in hexagons (decorative),
 * utility columns from content/routes.ts, legal row. No H1; column titles are h2.
 */
export function Footer() {
  return (
    <footer className="ft">
      <FooterEdge />
      <div className="ft__inner">
        <div className="ft-mark">
          <HexWordmark />
        </div>

        <nav className="ft-util" aria-label="Footer">
          <div className="ft-brand">
            <p className="ft-wordmark">{brand.name}</p>
            <p>Designed in {brand.designedIn}</p>
          </div>
          {footerNav.map((col) => (
            <div key={col.title} className="ft-col">
              <h2>{col.title}</h2>
              <ul>
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="ft-col ft-contact">
            <h2>Talk to us</h2>
            <a className="ft-phone" href={brand.phoneHref}>
              {brand.phone}
            </a>
            <a href={`mailto:${brand.email}`}>{brand.email}</a>
            <Link href={MIL.href} className="ft-discount">
              <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M10 1.5 17.4 5.75v8.5L10 18.5 2.6 14.25v-8.5Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="m10 6 1.2 2.5 2.7.4-2 1.9.5 2.7L10 12.2l-2.4 1.3.5-2.7-2-1.9 2.7-.4Z" fill="currentColor" />
              </svg>
              <span>{discounts.heroesLine.replace(/\.$/, "").replace(" and ", " & ")}</span>
            </Link>
          </div>
          <ul className="ft-social" aria-label="Social">
            <li>
              <a href={brand.social.instagram} target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            </li>
            <li>
              <a href={brand.social.facebook} target="_blank" rel="noopener noreferrer">
                Facebook
              </a>
            </li>
          </ul>
        </nav>

        <div className="ft-legal">
          <div className="ft-legal__row">
            <span>
              &copy; {currentYear} {brand.name}
            </span>
            <ul>
              {legalNav.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
