import { faqFor, fillFaq, isLive, type FaqPlacement } from "@/content/faq";

/**
 * One plain line of facts for the scroll-build 3 x 3 ft beat: the `fact` of every verified entry
 * placed there, joined ("Mounts flat · 3 × 3 ft of floor · sticks out about 3 in"). The install
 * fact joins once that answer is verified. No chip, no extra controls: the pinned hero stays put.
 */
export function InlineFact({ placement, className = "" }: { placement: FaqPlacement; className?: string }) {
  const facts = faqFor(placement, true).filter((e) => isLive(e) && e.fact).map((e) => fillFaq(e.fact!));
  if (facts.length === 0) return null;
  return <p className={className}>{facts.join(" · ")}</p>;
}
