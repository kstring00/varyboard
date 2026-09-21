"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { PhoneLink } from "./PhoneLink";
import { formatPrice, products } from "@/content/facts";

const nav = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/vary-board", label: "Vary Board" },
  { href: "/professionals", label: "For clinics" },
  { href: "/our-story", label: "Our story" },
  { href: "/faq", label: "FAQ" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [overDark, setOverDark] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const hero = document.querySelector("[data-dark-hero]");
      setOverDark(Boolean(hero) && (hero as HTMLElement).getBoundingClientRect().bottom > 72);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return (
    <header data-theme={overDark && !open ? "dark" : "light"} className="site-header sticky top-0 z-40 border-b">
      <div className="container-site flex h-16 items-center justify-between gap-3 md:h-[4.5rem]">
        <Logo />
        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="btn-ghost px-4 text-[1rem]">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1 sm:gap-2">
          <PhoneLink compact className="px-2 text-[1rem] text-ink-2 hover:text-ink sm:px-3" />
          <Link href="/#pricing" className="btn-primary header-cta hidden px-5 text-[1rem] sm:inline-flex">
            Shop · from {formatPrice(products.board.price)}
          </Link>
          <button
            type="button"
            className="btn-ghost min-w-12 px-3 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>
      <div id="mobile-nav" hidden={!open} className="border-t border-line/70 bg-paper lg:hidden">
        <nav aria-label="Mobile" className="container-site flex flex-col py-2">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="flex min-h-14 items-center border-b border-line/60 text-lg font-medium no-underline last:border-b-0">
              {n.label}
            </Link>
          ))}
          <Link href="/#pricing" onClick={() => setOpen(false)} className="btn-primary my-3 sm:hidden">
            Shop · from {formatPrice(products.board.price)}
          </Link>
        </nav>
      </div>
    </header>
  );
}
