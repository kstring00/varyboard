import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Step1, Step2, Step3 } from "@/components/plan/Steps";
import { t } from "@/content/intake";
import { laneLabel, parseIntake, stepQuestion, type IntakeParams } from "@/lib/intake";

/**
 * /plan: the three-step intake. State is in the URL (for, c) so every step is a link.
 * Invalid or tampered params redirect one step back.
 */
type Props = { searchParams: Promise<IntakeParams> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const parsed = parseIntake(await searchParams);
  if ("redirect" in parsed || parsed.step === 1) {
    return { title: "Find your plan | Who is this for?", description: "Three quick questions about your life, and a ten-minute Vary Board plan built around the answers. No jargon, no sign-up.", robots: { index: true } };
  }
  if (parsed.step === 2) {
    return { title: `Find your plan for ${laneLabel(parsed.lane).toLowerCase()} | ${stepQuestion(parsed.lane)}`, description: `Step 2 of 3. Tell us what is getting harder and we will match it to the six kinds of practice on the Vary Board.` };
  }
  const lane = parsed.step === 3 ? parsed.lane : parsed.state.lane;
  const c = t(parsed.step === 3 ? parsed.concern.label : parsed.state.concern.label, lane);
  return { title: `${c} for ${laneLabel(lane).toLowerCase()} | Pick the closest situation`, description: `Step 3 of 3. Choose the closest situation for "${c.toLowerCase()}" (${laneLabel(lane).toLowerCase()}) and get a four-week Vary Board plan.` };
}

export default async function PlanPage({ searchParams }: Props) {
  const parsed = parseIntake(await searchParams);
  if ("redirect" in parsed) redirect(parsed.redirect);
  if (parsed.step === 1) return <Step1 />;
  if (parsed.step === 2) return <Step2 lane={parsed.lane} />;
  if (parsed.step === 3) return <Step3 lane={parsed.lane} concern={parsed.concern} />;
  // Fully specified: send them to the plan page.
  const { lane, concern, situation, area } = parsed.state;
  redirect(`/plan/result?for=${lane}&c=${concern.key}${situation ? `&s=${situation.key}` : ""}${area ? `&area=${area}` : ""}`);
}
