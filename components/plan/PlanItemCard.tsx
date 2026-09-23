import type { PlanItem } from "@/lib/plan";

/**
 * One movement from the exercise library, as a card. Shared by the homepage plan builder
 * and the four-week section of the intake result. `harder` shows the week-4 progression.
 */
export function PlanItemCard({ item, n, harder = false }: { item: PlanItem; n: number; harder?: boolean }) {
  const e = item.exercise;
  return (
    <li className="plan__item">
      <div className="plan__item-head">
        <span className="plan__item-n">{n}</span>
        <div>
          <span className="plan__item-role">{item.role}</span>
          <h4 className="plan__item-name">{e.name}</h4>
        </div>
        <span className="plan__item-reps">{item.gentle ? "Gentle form" : harder ? "Harder form" : e.reps}</span>
      </div>
      <dl className="plan__meta">
        <div>
          <dt>Anchor</dt>
          <dd>
            Row {e.anchorRow} · {e.anchorLandmark}
          </dd>
        </div>
        <div>
          <dt>Band</dt>
          <dd>{e.band === "none" ? "No band" : e.band}</dd>
        </div>
        <div>
          <dt>Rail</dt>
          <dd>{e.rail ? "Hand on the rail" : "Hands free"}</dd>
        </div>
        <div>
          <dt>Position</dt>
          <dd className="capitalize">{e.position}</dd>
        </div>
      </dl>
      <p className="plan__setup">{e.setup}</p>
      <ol className="plan__steps">
        {e.steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
      {item.gentle && (
        <p className="plan__gentle">
          <strong>Gentle form:</strong> {e.easier}
        </p>
      )}
      {harder && !item.gentle && (
        <p className="plan__gentle">
          <strong>This week:</strong> {e.harder}
        </p>
      )}
      <p className="plan__cue">
        <strong>Cue:</strong> {e.cue}
      </p>
      <details className="plan__more">
        <summary>Why this, and how to adjust</summary>
        <p>
          <strong>Why:</strong> {e.why}
        </p>
        <p>
          <strong>Easier:</strong> {e.easier}
        </p>
        <p>
          <strong>Harder:</strong> {e.harder}
        </p>
        <p>
          <strong>Stop if:</strong> {e.stop}
        </p>
      </details>
    </li>
  );
}
