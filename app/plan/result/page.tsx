import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PlanResult } from "@/components/plan/PlanResult";
import { t } from "@/content/intake";
import { buildPlan, intakeHref, laneLabel, parseIntake, type IntakeParams, type PlanContent } from "@/lib/intake";

/**
 * /plan/result?for=&c=&s= | &area= : the plan page. Every valid combination is a shareable link.
 * A comeback plan never carries clearance in the URL; the page asks every time (ClearanceGate).
 */
type Props = { searchParams: Promise<IntakeParams> };

type Resolved = { redirect: string; plan?: undefined; path?: undefined } | { redirect?: undefined; plan: PlanContent; path: string };

function resolve(p: IntakeParams): Resolved {
  const parsed = parseIntake(p, true);
  if ("redirect" in parsed) return { redirect: parsed.redirect };
  if (parsed.step !== 4) return { redirect: intakeHref.step1() };
  const { lane, concern, situation, area } = parsed.state;
  const plan = buildPlan(lane, concern.key, situation?.key, area);
  const path = intakeHref.result(lane, concern.key, { s: situation?.key, area });
  return { plan, path };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const r = resolve(await searchParams);
  if (r.redirect !== undefined) return { title: "Find your plan" };
  const { plan, path } = r;
  const title = `${plan.reflect.headline} | ${t(plan.concern.label, plan.lane)} · ${laneLabel(plan.lane)}`;
  const description = `A four-week Vary Board plan for ${plan.choiceLabel.toLowerCase()}: ${plan.reflect.points[0]}`.slice(0, 158);
  const og = `/plan/og${path.slice(path.indexOf("?"))}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, images: [{ url: og, width: 1200, height: 630, alt: `Your hexagon: ${plan.genres.join(", ")}` }] },
    twitter: { card: "summary_large_image", images: [og] },
  };
}

export default async function PlanResultPage({ searchParams }: Props) {
  const r = resolve(await searchParams);
  if (r.redirect !== undefined) redirect(r.redirect);
  return <PlanResult plan={r.plan} path={r.path} />;
}
