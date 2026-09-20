"use client";

import { useEffect, useState } from "react";
import { buyLinks } from "@/lib/commerce";
import { formatPrice, products } from "@/content/facts";

/**
 * "Vary Board $199 · Buy" bar. Fixed to the bottom, slides in once the user has
 * scrolled past the hero (or past one viewport on pages without a hero).
 * It is a plain link to the Shopify cart permalink.
 */
export function StickyBuyBar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById("hero-end");
    if (sentinel && "IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        ([entry]) => setShow(entry.boundingClientRect.top < 0 && !entry.isIntersecting),
        { rootMargin: "0px" },
      );
      io.observe(sentinel);
      return () => io.disconnect();
    }
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 transition-transform duration-300 motion-reduce:transition-none ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!show}
    >
      <div className="border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_-12px_rgb(23_33_31/0.25)] backdrop-blur">
        <div className="container-site flex min-h-16 items-center justify-between gap-4 py-2">
          <p className="min-w-0 truncate">
            <span className="font-display text-lg font-semibold">{products.board.name}</span>
            <span className="text-ink-2"> {formatPrice(products.board.price)}</span>
            <span className="hidden text-muted sm:inline"> · Flat-rate shipping</span>
          </p>
          <a href={buyLinks.board} className="btn-primary px-6" tabIndex={show ? 0 : -1}>
            Buy
          </a>
        </div>
      </div>
    </div>
  );
}
