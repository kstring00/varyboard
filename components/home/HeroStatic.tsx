import Image from "next/image";
import Link from "next/link";
import { HeroMotion } from "./HeroMotion";
import { images } from "@/content/images";
import { board, formatPrice, products } from "@/content/facts";
import { buyLinks } from "@/lib/commerce";

/**
 * HERO. In five seconds: what it is, who it is for, how you use it, how it helps.
 * One dominant CTA. Trust line: "Designed by a physical therapist. Patented."
 */
export function HeroStatic() {
  const price = formatPrice(products.board.price);
  return (
    <HeroMotion>
      <section aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-paper">
        {/* soft teal wash, decorative only */}
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 right-[-20%] -z-10 h-[38rem] w-[38rem] rounded-full bg-teal/25 blur-3xl md:right-[-8%]" />

        <div className="container-site grid items-center gap-8 pb-14 pt-6 md:pt-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14 lg:pb-24 lg:pt-16">
          {/* Visual */}
          <div className="relative order-1 lg:order-2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-paper-2 shadow-soft sm:aspect-[5/4] lg:aspect-[4/5]">
              <Image
                data-hero-photo
                src={images.heroRoom.src}
                alt={images.heroRoom.alt}
                fill
                priority
                fetchPriority="high"
                sizes="(min-width: 1024px) 48vw, 100vw"
                placeholder="blur"
                blurDataURL={images.heroRoom.blurDataURL}
                className="object-cover object-[22%_center] will-change-transform"
              />
            </div>
            {/* Real photo of the board in use */}
            <figure
              data-hero-inset
              className="absolute -bottom-6 -left-2 w-[42%] max-w-[15rem] overflow-hidden rounded-xl border-4 border-paper bg-paper-2 shadow-soft sm:-left-6 lg:-bottom-8 lg:-left-10"
            >
              <Image
                src={images.seniorBand.src}
                alt={images.seniorBand.alt}
                width={images.seniorBand.width}
                height={images.seniorBand.height}
                sizes="(min-width: 1024px) 15rem, 42vw"
                placeholder="blur"
                blurDataURL={images.seniorBand.blurDataURL}
                className="h-auto w-full object-cover"
              />
              <figcaption className="sr-only">The Vary Board in use with a resistance band</figcaption>
            </figure>
          </div>

          {/* Copy */}
          <div data-hero-copy className="order-2 pt-8 lg:order-1 lg:pt-0">
            <p className="eyebrow">Wall-mounted training board</p>
            <h1 id="hero-title" className="mt-3 text-[2.5rem] font-medium leading-[1.05] sm:text-[3.25rem] lg:text-[3.9rem]">
              Stay strong, mobile and steady at home.
            </h1>
            <p className="mt-5 max-w-xl text-xl text-ink-2">
              Made for adults who want to keep moving well, and for anyone continuing a home
              exercise program. Mount it to a wall, hold on, clip in a band and practice.
            </p>

            <ul className="mt-7 grid gap-3 sm:grid-cols-3" aria-label="What it helps you practice">
              {board.pillars.map((p) => (
                <li key={p.title} className="rounded-xl border border-line bg-white/60 px-4 py-3">
                  <span className="block font-display text-lg font-semibold">{p.title}</span>
                  <span className="mt-1 block text-[0.95rem] leading-snug text-ink-2">{p.line}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a href={buyLinks.board} className="btn-primary px-7 text-lg">
                Get the Vary Board ({price})
              </a>
              <Link href="#how-it-works" className="btn-secondary px-7 text-lg">
                See how it works
              </Link>
            </div>
            <p className="mt-5 flex items-center gap-2 text-[1rem] font-medium text-ink-2">
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-teal-deep)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l7 3.5v5.5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V5.5L12 2z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              {board.trustLine}
            </p>
          </div>
        </div>
        {/* Sentinel: the sticky buy bar appears once this scrolls off the top. */}
        <div id="hero-end" aria-hidden="true" className="h-px" />
      </section>
    </HeroMotion>
  );
}
