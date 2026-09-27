"use client";

import { useRef } from "react";
import type { FaqView } from "@/content/faq";
import { trackEvent } from "@/lib/track";

/**
 * One question as a native <details>: opens and closes without JavaScript, by mouse or keyboard.
 * A mint hexagon marks each question. Pending answers carry a "Pending Eric" badge (previews only;
 * production never receives them). The first open fires faq_open; "More in FAQ" fires faq_more_click.
 */
export function FaqDetails({ item, placement, id, moreHref, variant = "chip" }: { item: FaqView; placement: string; id?: string; moreHref?: string; variant?: "chip" | "row" }) {
  const opened = useRef(false);
  return (
    <details
      id={id}
      className={`faq faq--${variant}${item.pending ? " faq--pending" : ""}`}
      data-faq={item.id}
      onToggle={(e) => {
        if ((e.currentTarget as HTMLDetailsElement).open && !opened.current) {
          opened.current = true;
          trackEvent("faq_open", { id: item.id, placement });
        }
      }}
    >
      <summary className="faq__q">
        <svg className="faq__hex" viewBox="0 0 20 22" width="14" height="16" aria-hidden="true" focusable="false">
          <polygon points="10,1 19,6 19,16 10,21 1,16 1,6" />
        </svg>
        <span className="faq__text">{item.q}</span>
        {item.pending && <span className="faq__badge">Pending Eric</span>}
      </summary>
      <div className="faq__a">
        <p>
          {item.a}
          {item.link && !item.pending && (
            <>
              {" "}
              <a href={item.link.href} className="faq__link">
                {item.link.label}
              </a>
            </>
          )}
        </p>
        {moreHref && (
          <a href={moreHref} className="faq__more" onClick={() => trackEvent("faq_more_click", { id: item.id, placement })}>
            More in FAQ
          </a>
        )}
      </div>
    </details>
  );
}
