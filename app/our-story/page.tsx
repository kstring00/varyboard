import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Portrait } from "@/components/home/People";
import { PageIntro } from "@/components/ui/PageIntro";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { board, founders, formatPrice, products } from "@/content/facts";
import { images } from "@/content/images";
import { buyLinks } from "@/lib/commerce";

export const metadata: Metadata = {
  title: "Our story | The PT and the engineer behind the board",
  description: "Dr. Eric Santiago, PT, DPT, of Trinity Physical Therapy in Houston, and Reid De Leon, veteran and engineer, designed the patented Vary Board for practice at home.",
  alternates: { canonical: "/our-story" },
};

export default function OurStoryPage() {
  return (
    <>
      <PageIntro eyebrow="Our story" title="It started on a clinic wall in Houston." intro="A physical therapist who wanted his patients to keep practicing at home, and an engineer who knew how to build something that would last." />

      <section className="container-site">
        <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-paper-2 shadow-soft sm:aspect-[21/9]">
          <Image src={images.reachUp.src} alt={images.reachUp.alt} fill priority sizes="100vw" placeholder="blur" blurDataURL={images.reachUp.blurDataURL} className="object-cover object-[center_20%]" />
        </div>
      </section>

      <section aria-labelledby="why-title" className="py-12 md:py-12">
        <div className="container-site max-w-3xl">
          <Reveal>
            <SectionHeading eyebrow="Why we built it" title={<span id="why-title">The best exercises are the ones you keep doing.</span>} />
            <div className="mt-6 space-y-5 text-xl text-ink-2">
              <p>In the clinic, the wall does a lot of work. It is where people practice reaching, holding, stretching and standing with something steady to hold on to. Then they go home, and the wall at home is just a wall.</p>
              <p>The Vary Board puts the same anchor points and handholds on any wall: a hallway, a garage, a patio, a clinic. Clip in a band, hold on, and practice.</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="who-title" className="bg-paper-2 py-12 md:py-12">
        <div className="container-site">
          <Reveal>
            <SectionHeading eyebrow="Who we are" title={<span id="who-title">Two people, one idea.</span>} />
          </Reveal>
          <div className="mt-10 grid gap-10">
            {[founders.eric, founders.reid].map((p, i) => (
              <Reveal key={p.name} className={`grid gap-8 lg:grid-cols-[minmax(0,320px)_1fr] lg:items-start ${i % 2 ? "lg:[&>*:first-child]:order-2" : ""}`}>
                <Portrait person={p} />
                <div>
                  <h3 className="text-2xl font-medium">{p.name}</h3>
                  <p className="mt-1 text-lg font-semibold text-teal-deep">{p.credentialsSpelledOut}</p>
                  <p className="text-ink-2">{p.role}</p>
                  <div className="mt-5 space-y-4 text-xl text-ink-2">
                    {p.bio.map((para) => (
                      <p key={para}>{para}</p>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="how-title" className="py-12 md:py-12">
        <div className="container-site grid gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <SectionHeading eyebrow="How it's made" title={<span id="how-title">Simple on purpose.</span>} />
            <ul className="mt-6 space-y-3 text-xl text-ink-2">
              <li>{board.sectionAnatomy}</li>
              <li>
                {board.anchorPointsPerSection} hexagonal anchor points per section, {board.positioningAccuracy} positioning.
              </li>
              <li>Molded {board.material}. Indoors or outdoors.</li>
              <li>
                Three sections make the {products.board.specs[1].value} {products.board.name}. Four make the {products.boardXT.specs[1].value} {products.boardXT.name}.
              </li>
              <li>{board.patentLine}.</li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={buyLinks.board} className="btn-primary">
                Get the Vary Board ({formatPrice(products.board.price)})
              </a>
              <Link href="/professionals" className="btn-secondary">
                For clinics
              </Link>
            </div>
          </Reveal>
          <Reveal className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-paper-2 shadow-soft">
            <Image src={images.poolDetail.src} alt={images.poolDetail.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" placeholder="blur" blurDataURL={images.poolDetail.blurDataURL} className="object-cover" />
          </Reveal>
        </div>
      </section>
    </>
  );
}
