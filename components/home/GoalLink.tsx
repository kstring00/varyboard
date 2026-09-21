"use client";

import type { ReactNode } from "react";
import { type Goal } from "@/content/exercises";
import { planGoalHash } from "@/lib/plan";

/**
 * Same-page link to the plan builder with a goal pre-selected (#how-it-works?goal=…).
 * A normal fragment navigation fires hashchange, which the builder listens for. If the
 * hash is already set (second click on the same card), the browser stays silent, so we
 * re-fire hashchange ourselves; nothing else is overridden and the href works without JS.
 */
export function GoalLink({ goal, className, children }: { goal: Goal; className?: string; children: ReactNode }) {
  const href = planGoalHash(goal);
  return (
    <a
      href={href}
      className={className}
      onClick={() => {
        if (window.location.hash === href) window.dispatchEvent(new HashChangeEvent("hashchange"));
      }}
    >
      {children}
    </a>
  );
}
