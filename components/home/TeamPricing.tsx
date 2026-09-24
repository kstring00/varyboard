"use client";

import { useEffect, useId, useState } from "react";
import { TeamForm } from "@/components/plan/PlanForms";
import { TEAM_FORM_ANCHOR, audienceAnchor } from "@/content/audiences";

/**
 * The athletes card's one CTA: "Team pricing" opens the existing team inquiry form in the card.
 * /#team-pricing (footer link) opens it too.
 */
export function TeamPricing({ label }: { label: string }) {
  const [open, setOpen] = useState(false);
  const panel = useId();
  useEffect(() => {
    let t = 0;
    const check = () => {
      if (window.location.hash !== `#${TEAM_FORM_ANCHOR}`) return;
      setOpen(true);
      // The browser jumped before the form opened and before content above settled: land on the card.
      window.clearTimeout(t);
      t = window.setTimeout(() => document.getElementById(audienceAnchor("athletes"))?.scrollIntoView({ block: "start" }), 250);
    };
    check();
    window.addEventListener("hashchange", check);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("hashchange", check);
    };
  }, []);
  return (
    <div id={TEAM_FORM_ANCHOR} className="aud-team">
      <button type="button" className="btn-primary" aria-expanded={open} aria-controls={panel} onClick={() => setOpen((v) => !v)} data-team-toggle>
        {label}
      </button>
      <div id={panel} hidden={!open} className="aud-team__panel">
        {open && <TeamForm page="/#team-pricing" planLabel="Homepage: sports teams & athletes" />}
      </div>
    </div>
  );
}
