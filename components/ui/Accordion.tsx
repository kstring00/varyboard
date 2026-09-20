"use client";

/**
 * Accessible accordion. Keyboard model and ARIA wiring adapted from the 21st.dev
 * "Accordion" by ddoemonn; animation ported from Framer Motion to a CSS grid-rows
 * transition so it respects prefers-reduced-motion for free.
 */
import { useCallback, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
}

export function Accordion({
  items,
  type = "single",
  defaultOpen = [],
  headingLevel = 3,
  className = "",
}: {
  items: readonly AccordionItem[];
  type?: "single" | "multiple";
  defaultOpen?: readonly string[];
  headingLevel?: 2 | 3 | 4;
  className?: string;
}) {
  const base = useId();
  const [open, setOpen] = useState<string[]>(() => (type === "single" ? defaultOpen.slice(0, 1) : defaultOpen.slice()));
  const headers = useRef(new Map<string, HTMLButtonElement>());
  const order = useMemo(() => items.map((i) => i.id), [items]);

  const toggle = useCallback(
    (id: string) => {
      setOpen((cur) => {
        const active = cur.includes(id);
        if (type === "single") return active ? [] : [id];
        return active ? cur.filter((x) => x !== id) : [...cur, id];
      });
    },
    [type],
  );

  const move = (id: string, delta: number, edge: "first" | "last" | null) => {
    const at = order.indexOf(id);
    if (at < 0) return;
    const next = edge === "first" ? 0 : edge === "last" ? order.length - 1 : (at + delta + order.length) % order.length;
    headers.current.get(order[next])?.focus();
  };

  const onKeyDown = (id: string) => (e: KeyboardEvent) => {
    const keys: Record<string, [number, "first" | "last" | null]> = { ArrowDown: [1, null], ArrowUp: [-1, null], Home: [0, "first"], End: [0, "last"] };
    const k = keys[e.key];
    if (!k) return;
    e.preventDefault();
    move(id, k[0], k[1]);
  };

  const Heading = `h${headingLevel}` as const;

  return (
    <div className={`divide-y divide-line rounded-2xl border border-line bg-white/70 ${className}`}>
      {items.map((item) => {
        const isOpen = open.includes(item.id);
        const headerId = `${base}-h-${item.id}`;
        const panelId = `${base}-p-${item.id}`;
        return (
          <div key={item.id} className="acc-item" data-open={isOpen}>
            <Heading className="m-0 font-sans text-base font-medium">
              <button
                id={headerId}
                ref={(n) => {
                  if (n) headers.current.set(item.id, n);
                  else headers.current.delete(item.id);
                }}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                onKeyDown={onKeyDown(item.id)}
                className="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-4 text-left text-lg font-medium text-ink transition-colors hover:bg-teal-soft/40"
              >
                <span>{item.title}</span>
                <span aria-hidden="true" className="acc-icon grid h-8 w-8 shrink-0 place-items-center rounded-full border border-ink/15 text-ink-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                    <path d="M12 5v14" className="acc-v" />
                    <path d="M5 12h14" />
                  </svg>
                </span>
              </button>
            </Heading>
            <div id={panelId} role="region" aria-labelledby={headerId} className="acc-panel" aria-hidden={!isOpen}>
              <div className="acc-panel-inner">
                <div className="px-5 pb-5 text-ink-2">{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
