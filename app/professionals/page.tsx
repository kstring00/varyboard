import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { PageIntro } from "@/components/ui/PageIntro";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { board, brand, formatPrice, products } from "@/content/facts";
import { images } from "@/content/images";

export const metadata: Metadata = {
  title: "For clinics | One wall, six kinds of practice",
  description: "A durable wall-mounted station for assisted range of motion, balance, mobilization, strengthening, stretching and transfer training. Request clinic pricing or a demo.",
  alternates: { canonical: "/professionals" },
};

const SPEC_SHEET = "/downloads/vary-board-spec-sheet.pdf";

const BENEFITS = [
  { t: "One station, six uses", d: `${board.uses.join(", ").replace(/, ([^,]*)$/, " and $1")}. Move a band or a hand and the exercise changes.` },
  { t: "Every height, every patient", d: `${board.anchorPointsPerSection} anchor points per section with ${board.positioningAccuracy} positioning. Add the XT for taller patients.` },
  { t: "Built for a busy clinic", d: `Molded ${board.material}, indoor or outdoor, mounted flat to the wall. About ${board.minSpacePerUser} of floor per patient.` },
  { t: "Continues at home", d: "Patients can put the same board on their own wall and keep practicing the program you gave them." },
];

export default function ProfessionalsPage() {
  const hasSpecSheet = existsSync(path.join(process.cwd(), "public", SPEC_SHEET));
  return (
    <>
      <PageIntro eyebrow="For clinics and professionals" title="One wall. Six kinds of practice. Every patient." intro={`Designed by a physical therapist for the treatment floor, then built to last by an engineer. Patented.`}>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#request" className="btn-primary text-lg">
            Request clinic pricing / demo
          </a>
          {hasSpecSheet && (
            <a href={SPEC_SHEET} className="btn-secondary text-lg" download>
              Download spec sheet (PDF)
            </a>
          )}
        </div>
      </PageIntro>

      <section className="container-site">
        <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-paper-2 shadow-soft sm:aspect-[21/9]">
          <Image src={images.clinicPair.src} alt={images.clinicPair.alt} fill priority sizes="100vw" placeholder="blur" blurDataURL={images.clinicPair.blurDataURL} className="object-cover object-[center_30%]" />
        </div>
      </section>

      <section aria-labelledby="benefits-title" className="py-12 md:py-12">
        <div className="container-site">
          <Reveal>
            <SectionHeading eyebrow="Why clinics use it" title={<span id="benefits-title">More practice per square foot.</span>} />
          </Reveal>
          <ul className="mt-10 grid gap-5 md:grid-cols-2">
            {BENEFITS.map((b, i) => (
              <Reveal as="li" key={b.t} delay={i * 70} className="rounded-2xl border border-line bg-white/60 p-6">
                <h3 className="text-xl font-medium">{b.t}</h3>
                <p className="mt-2 text-lg text-ink-2">{b.d}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="six-title" className="bg-ink py-12 text-paper md:py-16">
        <div className="container-site grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <Reveal>
            <SectionHeading tone="dark" eyebrow="6-in-1" title={<span id="six-title">Six pieces of equipment. One board.</span>} intro="Everything on the list below happens on the same wall, at whatever height the patient needs." />
          </Reveal>
          <Reveal>
            <ol className="grid gap-3 sm:grid-cols-2">
              {board.uses.map((u, i) => (
                <li key={u} className="flex items-center gap-4 rounded-2xl bg-white/5 px-5 py-4 ring-1 ring-white/10">
                  <span className="font-display text-2xl text-teal">0{i + 1}</span>
                  <span className="text-lg font-medium">{u}</span>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="sizes-title" className="py-12 md:py-12">
        <div className="container-site">
          <Reveal>
            <SectionHeading eyebrow="Sizes" title={<span id="sizes-title">Two heights for one treatment floor.</span>} />
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {[products.board, products.boardXT].map((p, i) => (
              <Reveal key={p.id} delay={i * 80} className="rounded-2xl border border-line bg-white/60 p-6">
                <h3 className="text-xl font-medium">{p.name}</h3>
                <p className="mt-1 text-ink-2">{p.summary}</p>
                <p className="mt-3 text-lg">
                  Retail {formatPrice(p.price)} · SKU {p.sku}
                </p>
                <Link href={p.path} className="mt-4 inline-flex min-h-12 items-center font-semibold text-teal-deep no-underline">
                  Full specs
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="request" aria-labelledby="request-title" className="scroll-mt-24 bg-paper-2 py-12 md:py-12">
        <div className="container-site grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <Reveal>
            <SectionHeading eyebrow="Request" title={<span id="request-title">Clinic pricing or a demo.</span>} intro="Tell us about your clinic and we will follow up with pricing for multiple boards or arrange a demo." />
            <p className="mt-6 text-lg">
              Prefer to talk?{" "}
              <a href={brand.phoneHref} className="link">
                {brand.phone}
              </a>
              <br />
              <a href={`mailto:${brand.email}`} className="link">
                {brand.email}
              </a>
            </p>
          </Reveal>
          <Reveal className="rounded-3xl border border-line bg-white p-6 shadow-soft md:p-6">
            <InquiryForm kind="clinic" page="/professionals" />
          </Reveal>
        </div>
      </section>
    </>
  );
}
