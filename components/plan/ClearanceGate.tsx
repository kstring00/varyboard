"use client";

import { useId, useState, type ReactNode } from "react";

/**
 * For comeback / recovery plans: the exercises stay hidden until the visitor confirms their
 * clinician has cleared them. Client state only, never in the URL, so a shared link asks again.
 */
export function ClearanceGate({ children, lane }: { children: ReactNode; lane: "me" | "loved" | "mil" | "clinic" | "athlete" }) {
  const [ok, setOk] = useState(false);
  const id = useId();
  const who = lane === "loved" ? "Their doctor or PT has cleared them to exercise" : "My doctor or PT has cleared me to exercise";
  return (
    <div className="ix-gate" data-gate={ok ? "open" : "closed"}>
      <label htmlFor={id} className="ix-gate__label">
        <input id={id} type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} className="ix-gate__box" />
        <span>{who}</span>
      </label>
      {ok ? children : <p className="ix-gate__note">Tick the box above to see the movements. We ask every time this page opens, on purpose.</p>}
    </div>
  );
}
