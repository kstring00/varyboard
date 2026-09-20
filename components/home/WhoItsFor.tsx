import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const CARDS = [
  {
    title: "Staying strong and independent at 55+",
    body: "A steady place to hold on while you practice standing, reaching and bending. Ten minutes a day, at home.",
    href: "/vary-board",
    cta: "See the Vary Board",
  },
  {
    title: "Continuing your home program after PT",
    body: "The same anchors and handholds your therapist uses, on your own wall. Keep going after your last visit.",
    href: "/install",
    cta: "How it installs",
  },
  {
    title: "Buying it for a parent",
    body: "Simple to use, nothing to assemble each time, and it stays out of the way on the wall. Flat-rate shipping to their door.",
    href: "/faq",
    cta: "Common questions",
  },
];

export function WhoItsFor() {
  return (
    <section aria-labelledby="who-title" className="bg-paper py-14 md:py-20">
      <div className="container-site">
        <Reveal>
          <SectionHeading eyebrow="Who it's for" title={<span id="who-title">Made for people who want to keep moving well.</span>} />
        </Reveal>
        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {CARDS.map((c, i) => (
            <Reveal as="li" key={c.title} delay={i * 90} className="group flex flex-col rounded-2xl border border-line bg-white/70 p-6 shadow-soft transition-transform hover:-translate-y-1 motion-reduce:transition-none">
              <span className="font-display text-3xl text-teal">0{i + 1}</span>
              <h3 className="mt-4 text-xl font-medium leading-snug">{c.title}</h3>
              <p className="mt-3 flex-1 text-lg text-ink-2">{c.body}</p>
              <Link href={c.href} className="mt-6 inline-flex min-h-12 items-center gap-2 font-semibold text-teal-deep no-underline">
                {c.cta}
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
