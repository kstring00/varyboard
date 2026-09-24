import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PlanTools } from "@/components/plan/PlanTools";
import { t } from "@/content/intake";
import { board, brand, founders, products } from "@/content/facts";
import { buildPlan, intakeHref, parseIntake, planToText, type IntakeParams } from "@/lib/intake";
import { siteUrl } from "@/lib/site";

/**
 * Print-friendly provider page. For the `mil` lane it is worded for a VA provider. It is built
 * from confirmed facts and the plan's own content; a real PDF packet from Eric replaces the
 * link to this page once it exists at content/config.ts `vaPacket.pdfPath`.
 */
type Props = { searchParams: Promise<IntakeParams> };

export const metadata: Metadata = { title: "Provider packet", robots: { index: false } };

export default async function ProviderPacketPage({ searchParams }: Props) {
  const parsed = parseIntake(await searchParams, true);
  if ("redirect" in parsed) redirect(parsed.redirect);
  if (parsed.step !== 4) redirect(intakeHref.step1());
  const { lane, concern, situation, area } = parsed.state;
  const plan = buildPlan(lane, concern.key, situation?.key, area);
  const path = intakeHref.result(lane, concern.key, { s: situation?.key, area });
  const text = planToText(plan, `${siteUrl}${path}`);
  const provider = lane === "mil" ? "VA provider" : "provider";

  return (
    <div className="ix ix-packet">
      <header className="ix-band ix-band--quiet">
        <div className="container-site">
          <p className="eyebrow">For your {provider}</p>
          <h1 className="ix-title">A one-page summary to bring to your {lane === "mil" ? "VA" : ""} appointment.</h1>
          <p className="ix-prose no-print">
            Print this page or save it as a PDF from the print dialog.{" "}
            <Link href={path} className="link">
              Back to the plan
            </Link>
          </p>
        </div>
      </header>
      <div className="container-site ix-body ix-body--narrow">
        <PlanTools text={text} filename="vary-board-provider-packet.txt" />

        <section className="ix-packet__section">
          <h2>What the patient chose</h2>
          <p>
            {t(concern.label, lane)} · {plan.choiceLabel}
          </p>
          <p className="ix-packet__url">{`${siteUrl}${path}`}</p>
        </section>

        <section className="ix-packet__section">
          <h2>The equipment</h2>
          <p>
            {products.board.name}: {products.board.summary} {board.trustLine} Each section is a backer plus a convex platform with {board.anchorPointsPerSection} hexagonal anchor points at {board.positioningAccuracy} spacing. {board.material}, indoor or outdoor. Space needed: {board.minSpacePerUser} per user.
          </p>
          <p>Kinds of practice it supports: {board.uses.join(", ")}.</p>
          <p>
            Designed by {founders.eric.name}, {founders.eric.credentialsSpelledOut}, {founders.eric.role}.
          </p>
        </section>

        {plan.weeks.length > 0 && (
          <section className="ix-packet__section">
            <h2>Movements in the plan</h2>
            <ul>
              {plan.weeks[3].items.map((i) => (
                <li key={i.exercise.id}>
                  <strong>{i.exercise.name}</strong>: {i.exercise.reps}. Anchor row {i.exercise.anchorRow} ({i.exercise.anchorLandmark}), {i.exercise.band === "none" ? "no band" : i.exercise.band}, {i.exercise.rail ? "hand on the rail" : "hands free"}. Stop if: {i.exercise.stop}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="ix-packet__section">
          <h2>Questions the patient wants to ask</h2>
          <ol>
            {plan.questions.map((q) => (
              <li key={q.value}>{q.value}</li>
            ))}
          </ol>
        </section>

        <section className="ix-packet__section">
          <h2>Provider notes</h2>
          <div className="ix-packet__lines" aria-hidden="true" />
        </section>

        <p className="ix-packet__foot">
          {brand.legalName} · {brand.phone} · {brand.email}. General exercise guidance, not a diagnosis or treatment. The patient has been advised to follow your guidance first.
        </p>
      </div>
    </div>
  );
}
