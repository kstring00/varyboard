import { DraftBanner } from "@/components/plan/DraftBanner";
import { Reveal } from "@/components/ui/Reveal";
import { AUDIENCES, WHO, audienceAnchor, unreviewedAudiences, type Audience } from "@/content/audiences";
import { SOURCES } from "@/content/sources";
import { TeamPricing } from "./TeamPricing";

/**
 * WHO IT'S FOR (#who-its-for), built first for those who served: a teal DoD & VA block (about 70%
 * of the section's weight) with two equal paths, then three slim cards. Copy: content/audiences.ts.
 * Exactly one link or button per card.
 */
const hexPts = (x: number, y: number, r: number) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = Math.PI / 2 + (i * Math.PI) / 3;
    return `${(x + r * Math.cos(a)).toFixed(1)},${(y + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");

/** The block's honeycomb corner (6 x 6 cells, every fifth filled). */
function MilComb() {
  const cells: { x: number; y: number; fill: boolean }[] = [];
  const R = 26;
  for (let r = 0; r < 6; r++) for (let q = 0; q < 6; q++) cells.push({ x: q * R * 1.732 + (r % 2) * R * 0.866, y: r * R * 1.5, fill: (q + r) % 5 === 0 });
  return (
    <svg className="who-mil__comb" viewBox="0 0 320 320" aria-hidden="true" focusable="false">
      {cells.map((c) => (
        <polygon key={`${c.x}-${c.y}`} points={hexPts(c.x, c.y, R * 0.92)} fill={c.fill ? "rgba(158,214,198,.9)" : "none"} stroke="#9ED6C6" strokeWidth={1.2} />
      ))}
    </svg>
  );
}

function CardCta({ a }: { a: Audience }) {
  if (a.cta.kind === "teamForm") return <TeamPricing label={a.cta.label} />;
  return (
    <a className="who-card__more" href={a.cta.href}>
      {a.cta.label}
    </a>
  );
}

export function WhoItsFor() {
  const m = WHO.military;
  return (
    <section id="who-its-for" aria-labelledby="who-title" className="who">
      <div className="who__inner">
        <DraftBanner items={unreviewedAudiences()} />
        <p className="cl__eyebrow">{WHO.eyebrow}</p>
        <h2 id="who-title" className="cl__title">
          {WHO.headline}
        </h2>
        <div className="who__grid">
          <Reveal className="who-mil">
            <div id={audienceAnchor("military")}>
              <MilComb />
              <p className="who-mil__eyebrow">{m.eyebrow}</p>
              <h3 className="who-mil__title">{m.headline}</h3>
              <p className="who-mil__text">{m.body.value}</p>
              <div className="who-mil__paths">
                <a className="who-mil__path who-mil__path--primary" href={m.veteran.href}>
                  {m.veteran.label}
                </a>
                <a className="who-mil__path" href={m.clinician.href}>
                  {m.clinician.label}
                </a>
              </div>
              <p className="who-mil__note">
                {m.coverage.value} {m.discount}
              </p>
            </div>
          </Reveal>
          <ul className="who__slim">
            {AUDIENCES.map((a) => (
              <li key={a.key} id={audienceAnchor(a.key)} className="who-card">
                <h3 className="who-card__title">{a.title}</h3>
                <p className="who-card__body">{a.body.value}</p>
                {a.source && (
                  <a className="who-card__src" href={SOURCES[a.source].url} rel="noopener" target="_blank">
                    {SOURCES[a.source].authors}, {SOURCES[a.source].journal}, {SOURCES[a.source].year}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                )}
                <CardCta a={a} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
