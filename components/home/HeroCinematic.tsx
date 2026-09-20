"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMotionMode } from "@/components/motion/MotionProvider";
import { images } from "@/content/images";
import { board, formatPrice, founders, products } from "@/content/facts";
import { buyLinks } from "@/lib/commerce";

const art = images.heroRender;
const AR = art.width / art.height;

/*
 * Callout geometry in image pixel space (1672 x 941). Each callout: the glowing dot on a
 * board, a knee point, and the label's attach point. Lines are drawn in an SVG with the
 * same viewBox so they stay locked to the picture whatever the viewport.
 */
const CALLOUTS = [
  {
    key: "strength",
    title: board.pillars[0].title,
    sub: "Clip a band to any of 47 anchor points",
    dot: [1135, 285],
    knee: [1040, 205],
    end: [962, 205],
    side: "left" as const,
    icon: <path d="M4 10v4M20 10v4M7 8v8M17 8v8M7 12h10" />,
  },
  {
    key: "mobility",
    title: board.pillars[1].title,
    sub: "Handholds at every height",
    dot: [1142, 500],
    knee: [1240, 425],
    end: [1300, 425],
    side: "right" as const,
    icon: <path d="M13 4a1.5 1.5 0 1 0 0 .01M6 20l3-6 3 2 2-5-3-1-2 3M11 14l4 3 2 3M14 9l3 1 2-2" />,
  },
  {
    key: "balance",
    title: board.pillars[2].title,
    sub: "A steady hold while you stand",
    dot: [1150, 722],
    knee: [1240, 662],
    end: [1300, 662],
    side: "right" as const,
    icon: <path d="M12 3v18M5 21h14M3 9l3-4 3 4M3 9a3 3 0 0 0 6 0M15 9l3-4 3 4M15 9a3 3 0 0 0 6 0M8 5h8" />,
  },
];

const pct = (v: number, total: number) => `${((v / total) * 100).toFixed(3)}%`;

export function HeroCinematic() {
  const mode = useMotionMode();
  const root = useRef<HTMLElement>(null);
  const price = formatPrice(products.board.price);

  useEffect(() => {
    if (mode === "none" || !root.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const el = root.current;
    const light = mode === "light";
    const ctx = gsap.context(() => {
      const ease = "power4.out";
      // ---- Intro (runs once) ----
      const tl = gsap.timeline({ defaults: { ease } });
      tl.fromTo("[data-art-inner]", { scale: 1.1 }, { scale: 1, duration: 2.4, ease: "power2.out" }, 0)
        .to("[data-reveal='eyebrow']", { autoAlpha: 1, y: 0, duration: 0.8 }, 0.15)
        .to(".hero__line-inner", { y: 0, duration: 1.15, stagger: 0.11 }, 0.25)
        .to("[data-reveal='lede']", { autoAlpha: 1, y: 0, duration: 0.9 }, 0.7)
        .to("[data-reveal='cta']", { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08 }, 0.85)
        .to("[data-reveal='trust'], [data-reveal='pillars']", { autoAlpha: 1, y: 0, duration: 0.8 }, 1.0)
        .to("[data-reveal='chrome']", { autoAlpha: 1, duration: 0.8 }, 1.2);
      if (!light) {
        tl.to(".hero__lines polyline", { strokeDashoffset: 0, duration: 0.9, stagger: 0.18, ease: "power2.inOut" }, 0.9)
          .to("[data-reveal='dot']", { autoAlpha: 1, scale: 1, duration: 0.5, stagger: 0.18, ease: "back.out(2)" }, 0.95)
          .to("[data-reveal='label']", { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.18 }, 1.25);
      }
      gsap.set("[data-reveal]", { y: 22 });
      gsap.set("[data-reveal='dot']", { scale: 0.4, y: 0 });
      gsap.set("[data-reveal='chrome']", { y: 0 });

      // ---- Scroll (scrubbed, never scroll-jacked) ----
      const strength = light ? 0.45 : 1;
      const st = { trigger: el, start: "top top", end: "bottom top", scrub: 0.5 };
      gsap.to("[data-art]", { yPercent: 10 * strength, ease: "none", scrollTrigger: st });
      gsap.to("[data-copy]", { yPercent: -8 * strength, ease: "none", scrollTrigger: st });
      gsap.to("[data-overlay]", { opacity: 0, ease: "none", scrollTrigger: { ...st, end: "55% top" } });
    }, el);
    return () => ctx.revert();
  }, [mode]);

  return (
    <section ref={root} aria-labelledby="hero-title" className="hero" style={{ "--hero-ar": AR } as React.CSSProperties}>
      <div className="hero__panel">
        <div className="hero__art" data-art>
          <div className="hero__art-inner" data-art-inner>
            <Image
              src={art.src}
              alt={art.alt}
              fill
              priority
              fetchPriority="high"
              sizes="(min-width: 1024px) 100vw, 180vw"
              quality={82}
              placeholder="blur"
              blurDataURL={art.blurDataURL}
            />
          </div>
          <div data-overlay>
            <svg className="hero__lines" viewBox={`0 0 ${art.width} ${art.height}`} preserveAspectRatio="none" aria-hidden="true">
              {CALLOUTS.map((c) => (
                <polyline key={c.key} points={`${c.dot[0]},${c.dot[1]} ${c.knee[0]},${c.knee[1]} ${c.end[0]},${c.end[1]}`} />
              ))}
            </svg>
            <div className="hero__callouts" aria-hidden="true">
              {CALLOUTS.map((c) => (
                <div key={c.key}>
                  <span className="hero__dot hero__reveal" data-reveal="dot" style={{ left: pct(c.dot[0], art.width), top: pct(c.dot[1], art.height) }} />
                  <div className={`hero__label hero__label--${c.side}`} style={{ left: pct(c.end[0], art.width), top: pct(c.end[1], art.height) }}>
                    <div className="hero__label-inner hero__reveal" data-reveal="label">
                    <span className="hero__hex">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        {c.icon}
                      </svg>
                    </span>
                    <span className="hero__label-text">
                      <span className="hero__label-title">{c.title}</span>
                      <span className="hero__label-sub">{c.sub}</span>
                    </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="hero__scrim" aria-hidden="true" />
      </div>

      <div className="container-site">
        <div className="hero__copy" data-copy>
          <p className="hero__eyebrow hero__reveal" data-reveal="eyebrow">
            Wall-mounted training board
          </p>
          <h1 id="hero-title" className="hero__title">
            {["Strength.", "Mobility.", "Balance."].map((line) => (
              <span key={line} className="hero__line">
                <span className="hero__line-inner">{line}</span>
              </span>
            ))}
          </h1>
          <p className="hero__lede hero__reveal" data-reveal="lede">
            A patented wall-mounted training board designed by a physical therapist. Hold on, clip in a
            band and practice the movements that help you stay strong, mobile and steady at home.
          </p>
          <ul className="hero__pillars hero__reveal" data-reveal="pillars" aria-label="What it helps you practice">
            {board.pillars.map((p) => (
              <li key={p.title}>{p.title}</li>
            ))}
          </ul>
          <div className="hero__ctas">
            <a href={buyLinks.board} className="btn-primary hero__reveal px-7 text-lg" data-reveal="cta">
              Get the Vary Board ({price})
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
            <Link href="#how-it-works" className="btn-secondary hero__reveal px-7 text-lg" data-reveal="cta">
              See how it works
            </Link>
          </div>
          <p className="hero__trust hero__reveal" data-reveal="trust">
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-teal-deep)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l7 3.5v5.5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V5.5L12 2z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            {board.trustLine}
          </p>
        </div>
      </div>

      <div className="hero__cue hero__reveal" data-reveal="chrome" aria-hidden="true">
        <span className="hero__cue-line" />
        <span>Scroll to explore</span>
      </div>
      <ul className="hero__foot hero__reveal" data-reveal="chrome" aria-label="At a glance">
        <li>
          <span>Patented</span>
          <span>hexagon anchor system</span>
        </li>
        <li>
          <span>Designed by a physical therapist</span>
          <span>
            {founders.eric.name}, {founders.eric.credentials}
          </span>
        </li>
      </ul>
      <div id="hero-end" aria-hidden="true" className="h-px" />
    </section>
  );
}
