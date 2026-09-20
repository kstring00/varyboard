"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMotionMode } from "@/components/motion/MotionProvider";
import { cutouts, images } from "@/content/images";
import { board, products } from "@/content/facts";
import { Reveal } from "@/components/ui/Reveal";

/**
 * WHAT IT IS. Pinned, scroll-scrubbed scene (desktop, motion allowed):
 *   1. the real board cutout stacks 1-2-3 to 75"
 *   2. zoom to the hexagonal anchor points
 *   3. a band clipping in
 * Below 1024px, or under reduced motion, the same three steps read as a plain stacked
 * layout with their own visuals (CSS decides; nothing flips after load).
 * Pattern adapted from 21st.dev "Scroll Reveal Content A" (abui), re-implemented with GSAP.
 */
const STEPS = [
  {
    n: "01",
    title: "Three sections. One board.",
    body: `Each section is a backer plus a convex platform. Stack three and you have a ${products.board.specs[1].value} board on your wall.`,
  },
  {
    n: "02",
    title: `${board.anchorPointsPerSection} anchor points per section.`,
    body: `Hexagonal anchors every ${board.positioningAccuracy} up the board. A band or a handhold goes exactly where you need it.`,
  },
  {
    n: "03",
    title: "Clip in. Hold on.",
    body: "A carabiner clips a band to any anchor. The rails and holes give you a steady grip at any height.",
  },
];

function StackScene({ className = "" }: { className?: string }) {
  return (
    <div className={`wii-stage ${className}`} aria-hidden="true">
      <div className="wii-stage__wall" />
      <div className="wii-stage__floor" />
      <div className="wii-stack">
        {[0, 1, 2].map((i) => (
          <Image key={i} data-section={i} src={cutouts.boardSection.src} width={cutouts.boardSection.width} height={cutouts.boardSection.height} alt="" className="wii-stack__section" unoptimized />
        ))}
      </div>
      <div className="wii-ruler" data-ruler>
        <span className="wii-ruler__line" />
        <span className="wii-ruler__top">{products.board.specs[1].value}</span>
        <span className="wii-ruler__mid">3 &times; 25&quot;</span>
      </div>
    </div>
  );
}

export function WhatItIs() {
  const mode = useMotionMode();
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mode !== "full" || !root.current) return;
    if (!window.matchMedia("(min-width: 1024px)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const el = root.current;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "none" } });
      // Step 1: sections drop into place, ruler grows
      tl.fromTo("[data-section='0']", { yPercent: 40, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.7 }, 0)
        .fromTo("[data-section='1']", { yPercent: -60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.7 }, 0.5)
        .fromTo("[data-section='2']", { yPercent: -60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.7 }, 1.0)
        .fromTo("[data-ruler]", { scaleY: 0, autoAlpha: 0 }, { scaleY: 1, autoAlpha: 1, duration: 1.2 }, 0.4)
        .fromTo("[data-progress='0']", { scaleY: 0 }, { scaleY: 1, duration: 1.7 }, 0)
        // Step 2: zoom into the anchors
        .fromTo("[data-layer='anchors']", { autoAlpha: 0, scale: 1.18 }, { autoAlpha: 1, scale: 1, duration: 1.2 }, 2.0)
        .fromTo("[data-progress='1']", { scaleY: 0 }, { scaleY: 1, duration: 1.7 }, 1.9)
        // Step 3: band clips in
        .fromTo("[data-layer='band']", { autoAlpha: 0, scale: 1.08 }, { autoAlpha: 1, scale: 1, duration: 1.1 }, 3.8)
        .fromTo("[data-progress='2']", { scaleY: 0 }, { scaleY: 1, duration: 1.7 }, 3.7)
        .to({}, { duration: 0.6 });
      // Active-state for the step copy
      const steps = gsap.utils.toArray<HTMLElement>("[data-step]", el);
      ScrollTrigger.create({
        trigger: "[data-pin-wrap]",
        start: "top top",
        end: "+=280%",
        pin: "[data-pin]",
        scrub: 0.6,
        animation: tl,
        anticipatePin: 1,
        onUpdate: (self) => {
          const p = self.progress;
          steps.forEach((s, i) => s.classList.toggle("is-active", p >= i * 0.31 && (i === 2 || p < (i + 1) * 0.31)));
        },
      });
    }, el);
    return () => ctx.revert();
  }, [mode]);

  return (
    <section ref={root} id="how-it-works" aria-labelledby="wii-title" className="wii bg-paper-2">
      {/* Desktop pinned layout */}
      <div className="wii-desktop" data-pin-wrap>
        <div className="wii-desktop__pin" data-pin>
          <div className="container-site grid h-full items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
            <div>
              <p className="eyebrow">What it is</p>
              <h2 id="wii-title" className="mt-3 text-[2.3rem] font-medium leading-[1.08] lg:text-[2.9rem]">
                A wall of anchor points, built in sections.
              </h2>
              <ol className="mt-10 space-y-8">
                {STEPS.map((s, i) => (
                  <li key={s.n} data-step className="wii-step">
                    <div className="wii-step__rail">
                      <span className="wii-step__track" />
                      <span className="wii-step__progress" data-progress={i} />
                    </div>
                    <div>
                      <span className="wii-step__n">{s.n}</span>
                      <h3 className="mt-1 text-2xl font-medium">{s.title}</h3>
                      <p className="mt-2 max-w-md text-lg text-ink-2">{s.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="wii-frame">
              <StackScene />
              <div className="wii-layer" data-layer="anchors">
                <Image src={images.poolDetail.src} alt={images.poolDetail.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" placeholder="blur" blurDataURL={images.poolDetail.blurDataURL} className="object-cover" />
                <span className="wii-caption">Hexagonal anchor points, {board.positioningAccuracy} positioning</span>
              </div>
              <div className="wii-layer" data-layer="band">
                <Image src={images.seniorBand.src} alt={images.seniorBand.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" placeholder="blur" blurDataURL={images.seniorBand.blurDataURL} className="object-cover object-[70%_center]" />
                <span className="wii-caption">A band clipped into a top anchor</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stacked layout: phones, and any device with reduced motion */}
      <div className="wii-stacked container-site">
        <Reveal>
          <p className="eyebrow">What it is</p>
          <h2 className="mt-3 text-[2.1rem] font-medium leading-[1.08] sm:text-[2.6rem]">A wall of anchor points, built in sections.</h2>
        </Reveal>
        <ol className="mt-8 space-y-12">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.n} className="grid gap-5 md:grid-cols-2 md:items-center">
              <div className="wii-frame wii-frame--static">
                {i === 0 && <StackScene className="wii-stage--static" />}
                {i === 1 && <Image src={images.poolDetail.src} alt={images.poolDetail.alt} fill sizes="(min-width: 768px) 50vw, 100vw" placeholder="blur" blurDataURL={images.poolDetail.blurDataURL} className="object-cover" />}
                {i === 2 && <Image src={images.seniorBand.src} alt={images.seniorBand.alt} fill sizes="(min-width: 768px) 50vw, 100vw" placeholder="blur" blurDataURL={images.seniorBand.blurDataURL} className="object-cover object-[70%_center]" />}
              </div>
              <div>
                <span className="wii-step__n">{s.n}</span>
                <h3 className="mt-1 text-2xl font-medium">{s.title}</h3>
                <p className="mt-2 text-lg text-ink-2">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
