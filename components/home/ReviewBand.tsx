"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";

export interface BandReview {
  id: string;
  name: string;
  initials: string;
  lane: string;
  label: string;
  excerpt: string;
  body: string;
  focal: boolean;
}
export interface BandCell {
  key: string;
  kind: "review" | "invite";
  /** Index into `reviews` (review cells). */
  k: number;
  col: number;
  row: number;
  odd: number;
  /** First appearance of this review/invitation: focusable and announced. Repeats are aria-hidden. */
  primary: boolean;
  copy: number;
}

const HexIcon = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" aria-hidden="true">
    <path d="M10 1.5 17.4 5.75v8.5L10 18.5 2.6 14.25v-8.5Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

/**
 * The drifting band, its Pause/Play control and the full-review dialog.
 *   - CSS-only drift (transform), paused on hover/focus, by the button, while the dialog is open
 *     and while the band is off screen (IntersectionObserver).
 *   - A hexagon opens the full review in a native <dialog>; closing it (button, Esc, backdrop)
 *     resumes the band if it was playing and returns focus to that review's hexagon.
 *   - prefers-reduced-motion: no drift or lift; a still strip with scroll-snap; no Pause button.
 */
export function ReviewBand({ reviews, cells, cols, invite, allHref, allLabel }: { reviews: BandReview[]; cells: BandCell[]; cols: number; invite: { href: string; label: string }; allHref: string; allLabel: string }) {
  const bandRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const primaryRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const returnTo = useRef<HTMLElement | null>(null);
  const [paused, setPaused] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const [offscreen, setOffscreen] = useState(false);

  // Stop entirely while off screen.
  useEffect(() => {
    const el = bandRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setOffscreen(!e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Open the dialog once its content is in place.
  useEffect(() => {
    const d = dialogRef.current;
    if (open === null || !d || d.open) return;
    if (typeof d.showModal === "function") d.showModal();
    else d.setAttribute("open", "");
    // Start reading at the top: the browser would otherwise focus (and scroll to) the Close button.
    d.scrollTop = 0;
    d.querySelector<HTMLElement>(".rv-reader__tag")?.focus({ preventScroll: true });
  }, [open]);

  const onClose = useCallback(() => {
    setOpen(null);
    returnTo.current?.focus({ preventScroll: true });
  }, []);

  const openReview = (k: number, from: HTMLElement, primary: boolean) => {
    returnTo.current = primary ? from : (primaryRefs.current.get(k) ?? from);
    setOpen(k);
  };
  const close = () => {
    const d = dialogRef.current;
    if (!d) return;
    if (typeof d.close === "function") d.close();
    else {
      d.removeAttribute("open");
      onClose();
    }
  };

  const r = open !== null ? reviews[open] : null;
  const stopped = paused || open !== null;

  return (
    <>
      <div
        ref={bandRef}
        className={`rv-band${stopped ? " is-paused" : ""}${offscreen ? " is-offscreen" : ""}`}
        role="group"
        aria-roledescription="carousel"
        aria-label="Customer reviews, moving slowly. Choose one to read it in full."
      >
        <div className="rv-track" style={{ "--cols": cols } as CSSProperties}>
          {cells.map((c) => {
            const pos = { "--col": c.col, "--row": c.row, "--odd": c.odd } as CSSProperties;
            const hidden = c.primary ? {} : { "aria-hidden": true as const, tabIndex: -1 };
            if (c.kind === "invite")
              return (
                <a key={c.key} href={invite.href} className="rv-hex rv-hex--invite" style={pos} data-copy={c.copy} {...hidden}>
                  <span className="rv-hex__shape" />
                  <span className="rv-hex__fill" />
                  <span className="rv-hex__body">
                    <span className="rv-hex__i" aria-hidden="true">
                      +
                    </span>
                    <span className="rv-hex__q">{invite.label}</span>
                    <span className="rv-hex__n">Your story</span>
                  </span>
                </a>
              );
            const rv = reviews[c.k];
            return (
              <button
                key={c.key}
                type="button"
                ref={
                  c.primary
                    ? (el) => {
                        if (el) primaryRefs.current.set(c.k, el);
                      }
                    : undefined
                }
                className={`rv-hex${rv.focal ? " rv-hex--focal" : ""}`}
                style={pos}
                aria-pressed={open === c.k}
                aria-label={`${rv.name}, ${rv.label}. Read full review.`}
                onClick={(e) => openReview(c.k, e.currentTarget, c.primary)}
                data-copy={c.copy}
                data-review={rv.id}
                {...hidden}
              >
                <span className="rv-hex__shape" />
                <span className="rv-hex__fill" />
                <span className="rv-hex__body">
                  <span className="rv-hex__i" aria-hidden="true">
                    {rv.initials}
                  </span>
                  <span className="rv-hex__q">&ldquo;{rv.excerpt}&rdquo;</span>
                  <span className="rv-hex__n">{rv.name}</span>
                  <span className="rv-hex__l">{rv.lane}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rv__inner rv-below">
        <p className="rv-note">Every review is word for word. Tap a review to read it in full.</p>
        <div className="rv-below__actions">
          <a className="rv-all" href={allHref}>
            {allLabel}
          </a>
          <button type="button" className="rv-pause" aria-pressed={paused} onClick={() => setPaused((v) => !v)} data-rv-pause>
            {paused ? "Play" : "Pause"}
          </button>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className="rv-reader"
        aria-labelledby="rv-reader-name"
        onClose={onClose}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        {r && (
          <>
            <p className="rv-reader__tag" tabIndex={-1}>
              <HexIcon />
              <span>{r.lane}</span>
            </p>
            <blockquote className="rv-reader__quote">{r.body}</blockquote>
            <div className="rv-reader__who">
              <div className="rv-reader__mono" aria-hidden="true">
                {r.initials}
              </div>
              <div>
                <p id="rv-reader-name" className="rv-reader__nm">
                  {r.name}
                </p>
                <p className="rv-reader__lb">{r.label}</p>
              </div>
            </div>
            <button type="button" className="rv-reader__close" onClick={close}>
              Close
            </button>
          </>
        )}
      </dialog>
    </>
  );
}
