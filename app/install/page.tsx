import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/ui/PageIntro";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { YouTubeFacade } from "@/components/ui/YouTubeFacade";
import { board, brand, products, video } from "@/content/facts";
import { installSteps } from "@/content/install";

export const metadata: Metadata = {
  title: "How to install the Vary Board | Video guide",
  description: `Watch how the three sections stack to a ${products.board.specs[1].value} board and mount to the wall. Space needed, indoor and outdoor use, and who to call if you get stuck.`,
  alternates: { canonical: "/install" },
};

const BEFORE = [
  { t: "Pick the wall", d: `Any solid wall, indoors or out. Leave about ${board.minSpacePerUser} of clear floor in front of it per person.` },
  { t: "Know your height", d: `${products.board.name}: ${products.board.specs[0].value} sections, ${products.board.specs[1].value} installed. ${products.boardXT.name}: ${products.boardXT.specs[0].value} sections, ${products.boardXT.specs[1].value} installed.` },
  { t: "Watch first", d: "The video walks through the whole install. Watch it once before you pick up a drill." },
];

export default function InstallPage() {
  return (
    <>
      <PageIntro eyebrow="Install" title="Up on the wall in one afternoon." intro="Three sections, one straight line, one wall. Watch the video, then follow along." />
      <section className="container-site">
        <YouTubeFacade id={video.youtubeId} title={video.title} />
      </section>

      <section aria-labelledby="before-title" className="py-12 md:py-12">
        <div className="container-site">
          <Reveal>
            <SectionHeading eyebrow="Before you start" title={<span id="before-title">Three things to check.</span>} />
          </Reveal>
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {BEFORE.map((b, i) => (
              <Reveal as="li" key={b.t} delay={i * 80} className="rounded-2xl border border-line bg-white/60 p-6">
                <span className="font-display text-2xl text-teal">0{i + 1}</span>
                <h3 className="mt-3 text-xl font-medium">{b.t}</h3>
                <p className="mt-2 text-lg text-ink-2">{b.d}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {installSteps.length > 0 && (
        <section aria-labelledby="steps-title" className="bg-paper-2 py-12 md:py-12">
          <div className="container-site max-w-3xl">
            <Reveal>
              <SectionHeading eyebrow="Written steps" title={<span id="steps-title">Step by step.</span>} />
            </Reveal>
            <ol className="mt-8 space-y-7">
              {installSteps.map((s, i) => (
                <Reveal as="li" key={s.title} className="grid grid-cols-[3rem_1fr] gap-4">
                  <span className="font-display text-xl text-teal">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-xl font-medium">{s.title}</h3>
                    <p className="mt-2 text-lg text-ink-2">{s.body}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>
      )}

      <section className="bg-paper-2 py-12">
        <div className="container-site flex flex-col items-start gap-5 rounded-3xl bg-ink p-6 text-paper md:flex-row md:items-center md:justify-between md:p-10">
          <div>
            <h2 className="text-2xl font-medium">Stuck on a step?</h2>
            <p className="mt-1 text-xl text-paper/80">Call us and we will talk you through it.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={brand.phoneHref} className="btn-primary text-lg">
              Call {brand.phone}
            </a>
            <Link href="/contact" className="btn border-2 border-paper/30 text-paper hover:bg-paper/10">
              Send a message
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
