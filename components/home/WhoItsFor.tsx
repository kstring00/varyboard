import { existsSync } from "node:fs";
import path from "node:path";
import { DraftBanner } from "@/components/plan/DraftBanner";
import { HexIcon } from "@/components/plan/HexIcon";
import { GenreChip } from "@/components/genres/GenreChip";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AUDIENCES, audienceAnchor, unreviewedAudiences, type Audience, type AudienceKey } from "@/content/audiences";
import { vaPacket } from "@/content/config";
import { fillFacts, genreByKey } from "@/content/genres";
import { reviewById, type Review } from "@/content/reviews";
import type { AudienceIcon } from "@/content/audience";
import { TeamPricing } from "./TeamPricing";

/**
 * WHO IT'S FOR (#who-its-for). Four audiences from content/audiences.ts, military first.
 * Each card: problem -> how it helps, its genres as chips (hover lights the hexagon above),
 * a real review if one is assigned, and exactly one CTA.
 */
const ICON: Record<AudienceKey, AudienceIcon> = { military: "shield", patients: "heart", clinics: "asclepius", athletes: "dumbbell" };

/** Whole sentences up to ~190 characters shown first; the rest opens in place. Never reworded. */
function splitQuote(body: string): [string, string] {
  const sentences = body.split(/(?<=[.!?])\s+/);
  let head = sentences[0];
  let i = 1;
  while (i < sentences.length && head.length + 1 + sentences[i].length <= 190) head += " " + sentences[i++];
  return [head, sentences.slice(i).join(" ")];
}

function Proof({ review }: { review: Review }) {
  const [head, rest] = splitQuote(review.body);
  return (
    <figure className="aud-proof">
      {review.title && <p className="aud-proof__title">{review.title}</p>}
      <blockquote className="aud-proof__quote">
        <p>&ldquo;{head}{rest ? "" : "”"}</p>
        {rest && (
          <details className="aud-proof__more">
            <summary>Read the full review</summary>
            <p>{rest}&rdquo;</p>
          </details>
        )}
      </blockquote>
      <figcaption className="aud-proof__by">
        {review.author}
        {review.context ? <span> · {review.context}</span> : null}
      </figcaption>
    </figure>
  );
}

function Cta({ a }: { a: Audience }) {
  const c = a.primaryCta;
  if (c.kind === "teamForm") return <TeamPricing label={c.label} />;
  if (c.kind === "vaPacket") {
    const pdf = existsSync(path.join(process.cwd(), "public", vaPacket.pdfPath));
    return (
      <a href={pdf ? vaPacket.pdfPath : c.fallbackHref} className="btn-primary" {...(pdf ? { download: true } : {})} data-aud-cta={a.key}>
        {c.label}
      </a>
    );
  }
  return (
    <a href={c.href} className="btn-primary" data-aud-cta={a.key}>
      {c.label}
    </a>
  );
}

export function WhoItsFor() {
  return (
    <section id="who-its-for" aria-labelledby="who-title" className="aud">
      <div className="container-site">
        <DraftBanner items={unreviewedAudiences()} />
        <Reveal>
          <SectionHeading eyebrow="Who it's for" title={<span id="who-title">Built for four kinds of people.</span>} intro="Pick the one that sounds like you. The hexagons show which kinds of practice matter most; point at one to see it above." />
        </Reveal>
        <ul className="aud__grid">
          {AUDIENCES.map((a) => {
            const review = a.proofReviewId ? reviewById(a.proofReviewId) : undefined;
            if (a.proofReviewId && !review) throw new Error(`content/audiences.ts: ${a.key} points at review "${a.proofReviewId}", which is not in content/reviews.ts`);
            return (
              <li key={a.key} id={audienceAnchor(a.key)} className="aud-card" data-audience={a.key}>
                <div className="aud-card__head">
                  <HexIcon icon={ICON[a.key]} className="aud-card__icon" />
                  <h3 className="aud-card__title">{a.label}</h3>
                </div>
                <p className="aud-card__problem">
                  <span className="sr-only">The problem: </span>
                  {fillFacts(a.problem.value)}
                </p>
                <p className="aud-card__help">
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                  <span>
                    <span className="sr-only">How it helps: </span>
                    {fillFacts(a.howItHelps.value)}
                  </span>
                </p>
                <ul className="aud-card__chips" aria-label="Kinds of practice that matter most">
                  {a.topGenres.map((g) => (
                    <li key={g}>
                      <GenreChip genre={g} label={genreByKey(g).plainName} />
                    </li>
                  ))}
                </ul>
                {review && <Proof review={review} />}
                <div className="aud-card__foot">
                  <Cta a={a} />
                  {a.note && (
                    <p className="aud-card__note">
                      <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
                        <path d="M10 1.5 17.4 5.75v8.5L10 18.5 2.6 14.25v-8.5Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                        <path d="m10 6 1.2 2.5 2.7.4-2 1.9.5 2.7L10 12.2l-2.4 1.3.5-2.7-2-1.9 2.7-.4Z" fill="currentColor" />
                      </svg>
                      {a.note}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
