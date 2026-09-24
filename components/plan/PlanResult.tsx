import Link from "next/link";
import { ClearanceGate } from "@/components/plan/ClearanceGate";
import { DraftBanner } from "@/components/plan/DraftBanner";
import { EricCard } from "@/components/plan/EricCard";
import { GenreHexagon } from "@/components/plan/GenreHexagon";
import { HexMark } from "@/components/plan/HexMark";
import { LaneCta } from "@/components/plan/LaneCta";
import { LaneTestimonial } from "@/components/plan/LaneTestimonial";
import { PlanItemCard } from "@/components/plan/PlanItemCard";
import { PlanTools } from "@/components/plan/PlanTools";
import { WeekCells } from "@/components/plan/WeekCells";
import { CLINIC, GENRES, SAFETY_EXIT, t } from "@/content/intake";
import { brand, board } from "@/content/facts";
import { intakeHref, laneLabel, planToText, relatedHref, type PlanContent } from "@/lib/intake";
import { siteUrl } from "@/lib/site";

export function PlanResult({ plan, path }: { plan: PlanContent; path: string }) {
  const { lane, concern } = plan;
  const text = planToText(plan, `${siteUrl}${path}`);
  const related = relatedHref(plan);
  const weeksLabels = plan.weeks.map((w) => `Week ${w.week}`);
  const weeksCounts = plan.weeks.map((w) => w.week);
  const providerWord = lane === "mil" ? "VA provider" : "PT or doctor";
  const gated = plan.requireClearance;

  const weeks = (
    <div className="ix-weeks-wrap">
      <WeekCells counts={weeksCounts} labels={weeksLabels} />
      <ol className="ix-weeklist">
        {plan.weeks.map((w) => (
          <li key={w.week} className="ix-week">
            <h3 className="ix-week__title">
              <HexMark lit size={28}>
                {w.week}
              </HexMark>
              Week {w.week}
            </h3>
            <p className="ix-week__note">{w.note.value.replace(/^Week \d: /, "")}</p>
            {w.week === 1 ? (
              <ol className="plan__list">
                {w.items.map((item, n) => (
                  <PlanItemCard key={item.exercise.id} item={item} n={n + 1} />
                ))}
              </ol>
            ) : (
              <ol className="ix-week__rows">
                {w.items.map((item, n) => {
                  const e = item.exercise;
                  const isNew = !plan.weeks[w.week - 2].items.some((x) => x.exercise.id === e.id);
                  return (
                    <li key={e.id} className="ix-week__row">
                      <span className="plan__item-n">{n + 1}</span>
                      <span className="ix-week__row-text">
                        <strong>{e.name}</strong>
                        {isNew && <span className="ix-week__new">new this week</span>}
                        <span className="ix-week__row-line">{w.harder ? `Harder form: ${e.harder}` : `${e.reps} · row ${e.anchorRow}, ${e.anchorLandmark}`}</span>
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}
          </li>
        ))}
      </ol>
    </div>
  );

  return (
    <article className="ix-result">
      <DraftBanner items={plan.unreviewed} />

      {/* 1. Reflect */}
      <header className="ix-band ix-band--result">
        <div className="container-site">
          <p className="eyebrow">
            <Link href={intakeHref.step1()} className="ix-crumb-link">
              Find your plan
            </Link>{" "}
            · {laneLabel(lane)} · {t(concern.label, lane)}
          </p>
          <h1 className="ix-result__headline">{plan.reflect.headline}</h1>
          <ul className="ix-result__points">
            {plan.reflect.points.map((p, i) => (
              <li key={p} style={{ "--i": i } as React.CSSProperties}>
                <HexMark lit size={22} />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <p className="ix-result__truth">{plan.reflect.truth.value}</p>
        </div>
      </header>

      <div className="container-site ix-result__body">
        {/* 2. Hexagon */}
        <section className="ix-section" aria-labelledby="ix-hex-title">
          <div className="ix-section__text">
            <p className="eyebrow">Your hexagon</p>
            <h2 id="ix-hex-title" className="ix-section__title">
              Six kinds of practice on one wall.
            </h2>
            <p className="ix-section__lede">
              {lane === "loved" ? "Their" : "Your"} plan uses {plan.genres.length} of the 6. The other {6 - plan.genres.length} {6 - plan.genres.length === 1 ? "is" : "are"} there when {lane === "loved" ? "they" : "you"} need {6 - plan.genres.length === 1 ? "it" : "them"}.
            </p>
            <ul className="ix-genres">
              {plan.genres.map((g) => (
                <li key={g}>
                  <strong>{GENRES[g].label}.</strong> {GENRES[g].line}
                </li>
              ))}
            </ul>
          </div>
          <GenreHexagon genres={plan.genres} />
        </section>

        {lane === "clinic" ? (
          <>
            {/* Clinic: what one wall replaces */}
            <section className="ix-section ix-section--stack" aria-labelledby="ix-replaces-title">
              <p className="eyebrow">{CLINIC.replacesTitle}</p>
              <h2 id="ix-replaces-title" className="ix-section__title">
                {CLINIC.replacesIntro}
              </h2>
              <ul className="ix-replaces">
                {CLINIC.replaces.map((r) => (
                  <li key={r.genre}>
                    <HexMark lit size={30} />
                    <div>
                      <strong>
                        {GENRES[r.genre].label} · {GENRES[r.genre].clinical}
                      </strong>
                      <span>{r.replaces}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="ix-section__note">
                {board.material}, indoor or outdoor. {board.anchorPointsPerSection} anchor points per section at {board.positioningAccuracy} spacing. {board.minSpacePerUser} per user.
              </p>
            </section>
          </>
        ) : (
          <>
            {/* 3. Try one thing today */}
            {plan.tryToday && (
              <section className="ix-section ix-section--try" aria-labelledby="ix-try-title">
                <div className="ix-section__text">
                  <p className="eyebrow">Try one thing today</p>
                  <h2 id="ix-try-title" className="ix-section__title">
                    {plan.tryToday.name}
                  </h2>
                  <p className="ix-section__lede">No board needed. Just a chair, a counter or a wall.</p>
                </div>
                <div className="ix-try">
                  <ol className="ix-try__steps">
                    {plan.tryToday.steps.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                  <p className="ix-try__note">{plan.tryToday.note}</p>
                </div>
              </section>
            )}

            {/* 4. Your 4 weeks */}
            <section className="ix-section ix-section--stack" aria-labelledby="ix-weeks-title">
              <p className="eyebrow">{lane === "loved" ? "Their" : "Your"} 4 weeks</p>
              <h2 id="ix-weeks-title" className="ix-section__title">
                A little higher each week.
              </h2>
              <p className="ix-section__lede">About ten minutes, a few days a week. Every movement lives on the board, and every one has an easier and a harder version.</p>
              {gated ? <ClearanceGate lane={lane}>{weeks}</ClearanceGate> : weeks}
            </section>
          </>
        )}

        {/* 5. Questions to bring */}
        <section className="ix-section ix-section--stack ix-questions" aria-labelledby="ix-q-title">
          <p className="eyebrow">Questions to bring</p>
          <h2 id="ix-q-title" className="ix-section__title">
            For {lane === "loved" ? "their" : "your"} {lane === "clinic" ? "team" : providerWord}.
          </h2>
          <ol className="ix-questions__list">
            {plan.questions.map((q) => (
              <li key={q.value}>{q.value}</li>
            ))}
          </ol>
          <PlanTools text={text} filename={`vary-board-plan-${concern.key}${plan.situation ? "-" + plan.situation.key : plan.area ? "-" + plan.area : ""}.txt`} />
        </section>

        <EricCard />
        <LaneTestimonial lane={lane} />
      </div>

      {/* 6. One primary CTA */}
      <div className="container-site">
        <LaneCta plan={plan} path={path} planText={text} />
      </div>

      {/* 7. Related + start over */}
      <footer className="container-site ix-result__footer no-print">
        <p>
          Related:{" "}
          <Link href={related.href} className="link" data-related>
            {related.label}
          </Link>
        </p>
        <p>
          <Link href={intakeHref.step1()} className="link" data-startover>
            Start over
          </Link>
        </p>
        <p className="ix-result__safety">
          <Link href={SAFETY_EXIT.href} className="ix-safety-link">
            {t(SAFETY_EXIT.label, lane)}
          </Link>
        </p>
        <p className="ix-result__disclaimer">
          Not medical advice. This plan is general exercise guidance built from the choices above. Consult {lane === "loved" ? "their" : "your"} physician or physical therapist before starting, and stop any movement that causes pain. Call{" "}
          <a href={brand.phoneHref} className="link">
            {brand.phone}
          </a>{" "}
          with questions.
        </p>
      </footer>
    </article>
  );
}
