import Link from "next/link";
import { AreaStep } from "@/components/plan/AreaStep";
import { HexMark } from "@/components/plan/HexMark";
import { StepAnnouncer } from "@/components/plan/StepAnnouncer";
import { LANES, SAFETY_EXIT, t, type Concern, type Lane } from "@/content/intake";
import { brand } from "@/content/facts";
import { concernsFor, intakeHref, laneLabel, stepQuestion } from "@/lib/intake";

/** Chosen options so far, each glowing. */
function Crumbs({ lane, concern }: { lane?: Lane; concern?: Concern }) {
  if (!lane) return null;
  return (
    <ol className="ix-crumbs" aria-label="Your choices so far">
      <li>
        <Link href={intakeHref.step1()} className="ix-crumb">
          <HexMark lit size={26} />
          <span>{laneLabel(lane)}</span>
        </Link>
      </li>
      {concern && (
        <li>
          <Link href={intakeHref.step2(lane)} className="ix-crumb">
            <HexMark lit size={26} />
            <span>{t(concern.label, lane)}</span>
          </Link>
        </li>
      )}
    </ol>
  );
}

function Option({ href, label, line, i }: { href: string; label: string; line?: string; i: number }) {
  return (
    <li className="ix-option" style={{ "--i": i } as React.CSSProperties}>
      <Link href={href} className="ix-option__link" data-option={label}>
        <HexMark size={38}>{i + 1}</HexMark>
        <span className="ix-option__text">
          <span className="ix-option__label">{label}</span>
          {line && <span className="ix-option__line">{line}</span>}
        </span>
      </Link>
    </li>
  );
}

function Shell({ step, title, children, lane, concern, back }: { step: 1 | 2 | 3; title: string; children: React.ReactNode; lane?: Lane; concern?: Concern; back?: { href: string; label: string } }) {
  const announce = `Step ${step} of 3: ${title}`;
  return (
    <div className="ix">
      <StepAnnouncer text={announce} headingId="ix-title" />
      <header className="ix-band">
        <div className="container-site">
          <p className="eyebrow">Find your plan · Step {step} of 3</p>
          <h1 id="ix-title" tabIndex={-1} className="ix-title">
            {title}
          </h1>
          <Crumbs lane={lane} concern={concern} />
        </div>
      </header>
      <div className="container-site ix-body">
        {children}
        <div className="ix-foot">
          {step >= 2 && (
            <p>
              <Link href={SAFETY_EXIT.href} className="ix-safety-link" data-safety>
                {t(SAFETY_EXIT.label, lane ?? "me")}
              </Link>
            </p>
          )}
          {back && (
            <p>
              <Link href={back.href} className="link" data-back>
                {back.label}
              </Link>
            </p>
          )}
          <p className="ix-foot__phone">
            Prefer to talk it through? Call{" "}
            <a href={brand.phoneHref} className="link">
              {brand.phone}
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export function Step1() {
  return (
    <Shell step={1} title="Who is this for?">
      <ul className="ix-options">
        {LANES.map((l, i) => (
          <Option key={l.key} href={intakeHref.step2(l.key)} label={l.label} line={l.line} i={i} />
        ))}
      </ul>
    </Shell>
  );
}

export function Step2({ lane }: { lane: Lane }) {
  return (
    <Shell step={2} title={stepQuestion(lane)} lane={lane} back={{ href: intakeHref.step1(), label: "Choose someone else" }}>
      <ul className="ix-options">
        {concernsFor(lane).map((c, i) => (
          <Option key={c.key} href={intakeHref.step3(lane, c.key)} label={t(c.label, lane)} i={i} />
        ))}
      </ul>
    </Shell>
  );
}

export function Step3({ lane, concern }: { lane: Lane; concern: Concern }) {
  const back = { href: intakeHref.step2(lane), label: "Choose a different concern" };
  if (concern.step3.kind === "bodymap") {
    return (
      <Shell step={3} title={lane === "loved" ? "Where do they want to feel stronger?" : "Where do you want to feel stronger?"} lane={lane} concern={concern} back={back}>
        <AreaStep lane={lane} concern={concern.key} />
      </Shell>
    );
  }
  return (
    <Shell step={3} title="Pick the closest situation" lane={lane} concern={concern} back={back}>
      <ul className="ix-options">
        {concern.step3.options.map((s, i) => (
          <Option key={s.key} href={intakeHref.result(lane, concern.key, { s: s.key })} label={t(s.label, lane)} i={i} />
        ))}
      </ul>
    </Shell>
  );
}
