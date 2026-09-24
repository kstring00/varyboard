"use client";

import { useEffect, useState } from "react";

/** aria-live announcement on every step change, and focus to the step heading. */
export function StepAnnouncer({ text, headingId }: { text: string; headingId: string }) {
  const [live, setLive] = useState("");
  useEffect(() => {
    const id = window.setTimeout(() => setLive(text), 60);
    const h = document.getElementById(headingId);
    if (h && !window.location.hash) h.focus({ preventScroll: true });
    return () => window.clearTimeout(id);
  }, [text, headingId]);
  return (
    <p className="sr-only" aria-live="polite" aria-atomic="true">
      {live}
    </p>
  );
}
