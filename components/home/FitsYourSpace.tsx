"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMotionMode } from "@/components/motion/MotionProvider";
import { images } from "@/content/images";
import { board } from "@/content/facts";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** Real installs only. Captions describe what is actually in the photo. */
const TILES = [
  { img: images.lunge, caption: "Hallway at home" },
  { img: images.clinicPair, caption: "Physical therapy clinic" },
  { img: images.poolDetail, caption: "Poolside patio" },
  { img: images.bandPull, caption: "Spare room" },
  { img: images.reachUp, caption: "Home gym wall" },
  { img: images.seniorBand, caption: "Living room wall" },
];

const COLUMNS = [
  [TILES[0], TILES[3]],
  [TILES[1], TILES[4]],
  [TILES[2], TILES[5]],
];

export function FitsYourSpace() {
  const mode = useMotionMode();
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mode === "none" || !root.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const el = root.current;
    const strength = mode === "full" ? 1 : 0.4;
    const ctx = gsap.context(() => {
      const st = { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6 };
      gsap.fromTo("[data-col='0']", { yPercent: 6 * strength }, { yPercent: -6 * strength, ease: "none", scrollTrigger: st });
      gsap.fromTo("[data-col='1']", { yPercent: -8 * strength }, { yPercent: 8 * strength, ease: "none", scrollTrigger: st });
      gsap.fromTo("[data-col='2']", { yPercent: 5 * strength }, { yPercent: -5 * strength, ease: "none", scrollTrigger: st });
    }, el);
    return () => ctx.revert();
  }, [mode]);

  return (
    <section ref={root} aria-labelledby="space-title" className="overflow-hidden bg-paper py-14 md:py-20">
      <div className="container-site">
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading eyebrow="Fits your space" title={<span id="space-title">On the wall. Out of the way.</span>} intro={`It mounts flat to any solid wall, indoors or out. Leave about ${board.minSpacePerUser} of clear floor in front and you are set.`} />
          <Link href="/install" className="btn-secondary shrink-0">
            See how it installs
          </Link>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
          {COLUMNS.map((col, ci) => (
            <div key={ci} data-col={ci} className={`flex flex-col gap-4 md:gap-6 ${ci === 1 ? "md:pt-16" : ""}`}>
              {col.map((t) => (
                <figure key={t.img.key} className="group relative overflow-hidden rounded-2xl bg-paper-2 shadow-soft">
                  <Image src={t.img.src} alt={t.img.alt} width={t.img.width} height={t.img.height} sizes="(min-width: 768px) 33vw, 50vw" placeholder="blur" blurDataURL={t.img.blurDataURL} className="h-auto w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none" />
                  <figcaption className="absolute bottom-2 left-2 whitespace-nowrap rounded-full bg-paper/90 px-2.5 py-1 text-[0.8rem] font-semibold text-ink backdrop-blur sm:bottom-3 sm:left-3 sm:px-3 sm:py-1.5 sm:text-[0.95rem]">{t.caption}</figcaption>
                </figure>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
