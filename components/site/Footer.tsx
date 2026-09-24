import Link from "next/link";
import { brand, disclaimer, discounts } from "@/content/facts";
import { footerNav, legalNav, link } from "@/content/routes";
import { currentYear } from "@/lib/site";
import { FooterEdge } from "./FooterEdge";
import { HexWordmark } from "./HexWordmark";

const MIL = link("/plan", { query: "for=mil", label: "Military & VA" });

/**
 * Site footer: brand + utility. Honeycomb top edge, closing band (copy + the hexagon VARY),
 * utility columns from content/routes.ts, legal row. No headings above h2, no H1.
 */
export function Footer() {
  return (
    <footer className="ft">
      <FooterEdge />
      <div className="ft__inner">
        <div className="ft-close">
          <div className="ft-close__copy">
            <p className="eyebrow">One wall</p>
            <p className="ft-display">It&rsquo;s all on one wall.</p>
            <p className="ft-sub">Designed by a physical therapist in {brand.designedIn}.</p>
            <div className="ft-ctas">
              <Link href={link("/plan").href} className="btn-primary">
                Find your plan
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <Link href={link("/fit").href} className="ft-tlink">
                See if it fits your room
              </Link>
            </div>
          </div>
          <div className="ft-close__mark">
            <HexWordmark />
          </div>
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
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.3" cy="6.7" r="0.9" fill="currentColor" stroke="none" />
                </svg>
                Instagram
              </a>
            </li>
            <li>
              <a href={brand.social.facebook} target="_blank" rel="noopener noreferrer">
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.5A.5.5 0 0 1 14 8Z" />
                </svg>
                Facebook
              </a>
            </li>
          </ul>
        </nav>

        <div className="ft-legal">
          <p className="ft-legal__note">{disclaimer}</p>
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
