import { DraftBanner } from "@/components/plan/DraftBanner";
import { Reveal } from "@/components/ui/Reveal";
import { CLINIC, unreviewedClinic } from "@/content/clinic";
import { fillFacts, GENRE_LIST } from "@/content/genres";
import { unreviewedHero } from "@/content/hero";
import { link } from "@/content/routes";
import { ClinicCompare } from "./ClinicCompare";
import { Sources } from "./Sources";

/**
 * WHY IT'S DIFFERENT (#clinic), directly under the hero: the usual PT gym next to one wall,
 * the four things it solves, and one CTA to the clinic request form. Then the page's Sources.
 * Copy: content/clinic.ts. The Draft banner here also counts the hero's unreviewed lines
 * (the pinned hero has no room for one of its own).
 */
export function WhyItsDifferent() {
  const c = CLINIC;
  return (
    <section id="clinic" aria-labelledby="cl-title" className="cl">
      <div className="cl__inner">
        <DraftBanner items={[...unreviewedHero(), ...unreviewedClinic()]} />
        <p className="cl__eyebrow">{c.eyebrow}</p>
        <h2 id="cl-title" className="cl__title">
          {c.headline}
        </h2>
        <p className="cl__lead">{fillFacts(c.lead.value)}</p>
        <ClinicCompare
          copy={{
            oldTitle: c.oldRoom.title,
            oldTag: c.oldRoom.tag,
            oldLabel: c.oldRoom.label,
            stations: c.oldRoom.stations,
            newTitle: c.newRoom.title,
            newTag: c.newRoom.tag,
            newLabel: c.newRoom.label,
            board: c.newRoom.board,
            spot: fillFacts(c.newRoom.spot),
            spare: c.newRoom.spare.value,
            genres: GENRE_LIST.map((g) => g.plainName),
            exercises: c.meters.exercises,
            trips: c.meters.trips,
            replay: c.replay,
            fine: c.fine,
          }}
        />
        <ul className="cl-solves">
          {c.solves.map((s) => (
            <li key={s.key}>
              <span>
                <b>{s.title.value}</b>
                {fillFacts(s.body.value)}
              </span>
            </li>
          ))}
        </ul>
        <Reveal className="cl-capstone">
          <p>{c.capstone.value}</p>
          <a className="sb-btn" href={link("/professionals", { hash: "request" }).href}>
            {c.cta}
          </a>
        </Reveal>
        <Sources />
      </div>
    </section>
  );
}
