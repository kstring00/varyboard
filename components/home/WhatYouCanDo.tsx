import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { images } from "@/content/images";
import { board } from "@/content/facts";

const PILLARS = [
  { ...board.pillars[0], image: images.bandPull, body: "Clip a band to any anchor point and work against it. Rows, presses, pulls. Change the height, change the exercise." },
  { ...board.pillars[1], image: images.reachUp, body: "Reach for a handhold that is a little higher than yesterday. Practice bending and turning with something solid to hold." },
  { ...board.pillars[2], image: images.lunge, body: "Hold on with one hand or two while you practice standing, stepping and lunging. Let go when you are ready." },
];

export function WhatYouCanDo() {
  return (
    <section aria-labelledby="do-title" className="bg-ink py-20 text-paper md:py-28">
      <div className="container-site">
        <Reveal>
          <SectionHeading tone="dark" eyebrow="What you can do" title={<span id="do-title">Strength. Mobility. Balance. One wall.</span>} intro="Six kinds of practice, all on the same board. Your therapist can show you which ones are right for you." />
        </Reveal>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={i * 90} className="group overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image src={p.image.src} alt={p.image.alt} fill sizes="(min-width: 1024px) 33vw, 100vw" placeholder="blur" blurDataURL={p.image.blurDataURL} className="object-cover transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transition-none" />
              </div>
              <div className="p-7">
                <h3 className="text-2xl font-medium">{p.title}</h3>
                <p className="mt-2 text-lg text-paper/80">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10">
          <ul className="flex flex-wrap gap-3" aria-label="Six uses">
            {board.uses.map((u) => (
              <li key={u} className="rounded-full border border-teal/50 bg-teal/10 px-5 py-2.5 text-[1rem] font-medium text-paper">
                {u}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
