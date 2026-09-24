import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import Link from "next/link";

const CARDS: { goal: string; title: string; body: string; cta: string }[] = [
  {
    goal: "strength",
    title: "Strength",
    body: "Bands and bodyweight against a wall that does not move. For anyone who wants to keep lifting groceries, kids and themselves without thinking about it.",
    cta: "Build a strength plan",
  },
  {
    goal: "mobility",
    title: "Mobility",
    body: "Reach, bend and rotate further than you did last month. For stiff shoulders, tight hips, and the first months after physical therapy ends.",
    cta: "Build a mobility plan",
  },
  {
    goal: "balance",
    title: "Balance",
    body: "A steady rail to hold while you practice standing on one foot, stepping and turning. For anyone who has caught themselves on a doorframe lately.",
    cta: "Build a balance plan",
  },
];

export function WhoItsFor() {
  return (
    <section aria-labelledby="who-title" className="bg-paper py-12 md:py-16">
      <div className="container-site">
        <Reveal>
          <SectionHeading
            eyebrow="Who it's for"
            title={
              <span id="who-title">
                Pick a spot. Pick a goal.
                <br />
                The board does the rest.
              </span>
            }
            intro="People of every age and fitness level use the Vary Board for strength, mobility and balance. Say who it is for, tell us what is getting harder, and get a ten-minute plan built for you."
          />
        </Reveal>
        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {CARDS.map((c, i) => (
            <Reveal as="li" key={c.goal} delay={i * 90} className="group flex flex-col rounded-2xl border border-line bg-white/70 p-6 shadow-soft transition-transform hover:-translate-y-1 motion-reduce:transition-none">
              <span className="font-display text-3xl text-teal">0{i + 1}</span>
              <h3 className="mt-4 whitespace-nowrap text-xl font-medium leading-snug">{c.title}</h3>
              <p className="mt-3 flex-1 text-lg text-ink-2">{c.body}</p>
              <Link href="#find-your-plan" className="mt-6 inline-flex min-h-12 items-center gap-2 font-semibold text-teal-deep no-underline" data-goal-link={c.goal}>
                {c.cta}
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </Reveal>
          ))}
        </ul>
        <p className="mt-8 text-center text-sm text-ink-2">Buying it for someone else? Build them a plan first and send it along with the board. Flat-rate shipping to their door.</p>
      </div>
    </section>
  );
}
