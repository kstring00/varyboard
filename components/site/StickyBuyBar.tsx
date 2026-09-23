"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { buyLinks } from "@/lib/commerce";
import { formatPrice, products } from "@/content/facts";

/**
 * "Vary Board $199 | XT $399" bar with a Buy link to the Shopify cart permalink.
 * Fixed to the bottom; hidden while the hero is in view, slides in once #hero-end scrolls off
 * the top (falls back to 60% of a viewport on pages without a hero).
 */
export function StickyBuyBar() {
  const [show, setShow] = useState(false);
  const [which, setWhich] = useState<"board" | "boardXT">("board");
  const pathname = usePathname();

  useEffect(() => {
    const sentinel = document.getElementById("hero-end");
    if (sentinel && "IntersectionObserver" in window) {
      const io = new IntersectionObserver(([entry]) => setShow(entry.boundingClientRect.top < 0 && !entry.isIntersecting), { rootMargin: "0px" });
      io.observe(sentinel);
      return () => io.disconnect();
    }
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The plan pages carry exactly one primary CTA each; the bar would be a second one.
  if (pathname.startsWith("/plan")) return null;
  const product = products[which];
  const href = which === "board" ? buyLinks.board : buyLinks.boardXT;
  const seg = (id: "board" | "boardXT", label: string) => (
    <button
      type="button"
      onClick={() => setWhich(id)}
      aria-pressed={which === id}
      tabIndex={show ? 0 : -1}
      className={`min-h-11 rounded-full px-4 text-[0.95rem] font-semibold transition-colors ${which === id ? "bg-ink text-paper" : "text-ink-2 hover:bg-ink/5"}`}
    >
      {label}
    </button>
  );

  return (
    <div className={`fixed inset-x-0 bottom-0 z-30 transition-transform duration-300 motion-reduce:transition-none ${show ? "translate-y-0" : "translate-y-full"}`} aria-hidden={!show}>
      <div className="border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_-12px_rgb(23_33_31/0.25)] backdrop-blur">
        <div className="container-site flex min-h-16 items-center justify-between gap-3 py-2">
          <div className="flex min-w-0 items-center gap-1 rounded-full border border-line bg-white/70 p-1" role="group" aria-label="Choose a board">
            {seg("board", `${products.board.name} ${formatPrice(products.board.price)}`)}
            {seg("boardXT", `${products.boardXT.shortName} ${formatPrice(products.boardXT.price)}`)}
          </div>
          <a href={href} className="btn-primary px-6" tabIndex={show ? 0 : -1} aria-label={`Buy the ${product.name}, ${formatPrice(product.price)}`}>
            Buy
          </a>
        </div>
      </div>
    </div>
  );
}
