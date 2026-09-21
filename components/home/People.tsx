import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { founders } from "@/content/facts";

function hasPortrait(publicPath: string) {
  return existsSync(path.join(process.cwd(), "public", publicPath));
}

export function Portrait({ person, size = "lg" }: { person: (typeof founders)[keyof typeof founders]; size?: "lg" | "md" }) {
  const initials = person.name
    .replace(/^Dr\.\s*/, "")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
  const box = size === "lg" ? "aspect-[4/5]" : "aspect-square";
  if (hasPortrait(person.portrait)) {
    return (
      <div className={`relative ${box} overflow-hidden rounded-2xl bg-paper-2 shadow-soft`}>
        <Image src={person.portrait} alt={person.portraitAlt} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
      </div>
    );
  }
  // Portrait not supplied yet: a quiet monogram tile. Never a stock photo, never an invented person.
  return (
    <div className={`grid ${box} place-items-center rounded-2xl bg-teal-soft text-teal-deep shadow-soft`} role="img" aria-label={`${person.name} (portrait coming)`}>
      <span className="font-display text-5xl font-medium">{initials}</span>
    </div>
  );
}

export function People() {
  const people = [founders.eric, founders.reid];
  return (
    <section aria-labelledby="people-title" className="bg-paper py-12 md:py-16">
      <div className="container-site">
        <Reveal>
          <SectionHeading eyebrow="The people behind it" title={<span id="people-title">A physical therapist and an engineer. One idea.</span>} intro="Eric wanted his patients to keep practicing at home. Reid knew how to build something that would last. The Vary Board is what they made together." />
        </Reveal>
        <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:gap-10">
          {people.map((p, i) => (
            <Reveal key={p.name} delay={i * 120} className="grid gap-6 sm:grid-cols-[minmax(0,200px)_1fr] sm:items-start">
              <Portrait person={p} />
              <div>
                <h3 className="text-2xl font-medium">{p.name}</h3>
                <p className="mt-1 font-semibold text-teal-deep">{p.credentialsSpelledOut}</p>
                <p className="text-ink-2">{p.role}</p>
                <ul className="mt-4 space-y-2 text-lg text-ink-2">
                  {p.lines.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10">
          <Link href="/our-story" className="btn-secondary">
            Read our story
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
