"use client";

import { useEffect, useRef, useState } from "react";
import { audience, type AudienceIcon } from "@/content/audience";

/**
 * Audience ticker: the hero's closing element, floating on the plaster ground under the
 * honeycomb dissolve. A nav landmark ("Who the Vary Board serves") with one visible list and
 * two aria-hidden, inert copies for the seamless loop.
 *
 * Motion (site rules: calm, slow ease-outs, no bounce):
 *   - drifts slowly at rest; scroll velocity adds speed, scrolling up reverses it; capped
 *   - hover or keyboard focus eases it to a stop; the paused control stops it too
 *   - touch/pointer drag scrubs the track, then it eases back to the drift
 *   - rAF runs only while on screen; prefers-reduced-motion renders a static wrapping row
 */
const BASE = -18; // px/s, leftward drift at rest
const MAX = 150; // px/s cap in either direction
const GAIN = 0.32; // scroll px/s -> ticker px/s

/* Line icons on a 24x24 grid, stroke 1.6, drawn inside the hexagon outline. */
const ICONS: Record<AudienceIcon, React.ReactNode> = {
  star: <path d="M12 3.6l2.5 5.2 5.7.8-4.1 4 1 5.7L12 16.6l-5.1 2.7 1-5.7-4.1-4 5.7-.8z" />,
  shield: <path d="M12 3.2l6.8 2.8v5.4c0 4.2-2.9 7.9-6.8 9.4-3.9-1.5-6.8-5.2-6.8-9.4V6z" />,
  asclepius: (
    <>
      <path d="M12 4.2v16.6" />
      <path d="M9.2 7.6c.4-1.9 4.6-2 4.9-.1.3 1.8-4.6 2.4-4.7 4.4-.1 2 5 2 4.9 4.1-.1 1.9-3.6 2.4-5 1.4" />
      <circle cx="8.7" cy="7.9" r=".9" fill="currentColor" stroke="none" />
    </>
  ),
  clinic: (
    <>
      <path d="M5 20.5V8.5h14v12M3.5 20.5h17" />
      <path d="M12 11v6M9 14h6" />
      <path d="M8 8.5V5h8v3.5" />
    </>
  ),
  heart: <path d="M12 20.2s-7.2-4.5-7.2-9.7A3.9 3.9 0 0 1 12 8.1a3.9 3.9 0 0 1 7.2 2.4c0 5.2-7.2 9.7-7.2 9.7z" />,
  home: (
    <>
      <path d="M4 11.2l8-6.8 8 6.8" />
      <path d="M6.2 10v10.2h11.6V10" />
      <path d="M10.2 20.2v-5.4h3.6v5.4" />
    </>
  ),
  bandage: (
    <>
      <rect x="3.2" y="9.2" width="17.6" height="5.6" rx="2.8" transform="rotate(-45 12 12)" />
      <path d="M10.8 12.2h.01M12 10.9h.01M13.2 12.2h.01M12 13.4h.01" strokeWidth="1.9" />
    </>
  ),
  dumbbell: <path d="M4.2 10v4M7.2 8v8M16.8 8v8M19.8 10v4M7.2 12h9.6" />,
  clipboard: (
    <>
      <path d="M9.2 4.5h5.6v2.6H9.2zM9.2 5.6H6.4v14.9h11.2V5.6h-2.8" />
      <path d="M9.4 13.3l1.9 1.9 3.6-3.8" />
    </>
  ),
};

function HexIcon({ icon }: { icon: AudienceIcon }) {
  return (
    <svg className="ticker__hex" viewBox="0 0 40 46" aria-hidden="true" focusable="false">
      <polygon className="ticker__hex-cell" points="20,1.5 38,11.75 38,34.25 20,44.5 2,34.25 2,11.75" />
      <g transform="translate(8 11)" className="ticker__hex-icon">
        {ICONS[icon]}
      </g>
    </svg>
  );
}

/** The Y vertex mark from the honeycomb system, used as the separator. */
function VertexMark() {
  return (
    <svg className="ticker__sep" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
      <path d="M6 6V1.2M6 6l-4.2 2.4M6 6l4.2 2.4" />
    </svg>
  );
}

function List({ hidden = false, onLinkClick }: { hidden?: boolean; onLinkClick: (e: React.MouseEvent) => void }) {
  return (
    <ul className="ticker__list" aria-hidden={hidden || undefined} {...(hidden ? { inert: true } : {})}>
      {audience.map((a) => (
        <li key={a.label} className="ticker__item">
          <a href={`/plan?for=${a.lane}`} className="ticker__link" tabIndex={hidden ? -1 : undefined} onClick={onLinkClick} data-ticker-link={hidden ? undefined : a.lane}>
            <HexIcon icon={a.icon} />
            <span className="ticker__label">{a.label}</span>
          </a>
          <VertexMark />
        </li>
      ))}
    </ul>
  );
}

export function AudienceTicker() {
  const rootRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const state = useRef({ paused: false, hover: false, focus: false, dragging: false, moved: 0 });

  useEffect(() => {
    state.current.paused = paused;
  }, [paused]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!root || !viewport || !track || reduced) return;
    const s = state.current;

    let x = 0;
    let vel = BASE;
    let copyW = 0;
    let raf = 0;
    let visible = false;
    let lastT = 0;
    let scrollVel = 0;
    let lastScrollY = window.scrollY;
    let lastScrollT = performance.now();
    let dragLastX = 0;
    let dragLastT = 0;
    let dragVel = 0;

    const measure = () => {
      const first = track.firstElementChild as HTMLElement | null;
      copyW = first ? first.getBoundingClientRect().width : 0;
    };
    const wrap = () => {
      if (copyW <= 0) return;
      while (x <= -copyW) x += copyW;
      while (x > 0) x -= copyW;
    };
    const apply = () => {
      track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
    };

    const frame = (t: number) => {
      raf = 0;
      const dt = Math.min(48, lastT ? t - lastT : 16) / 1000;
      lastT = t;
      // Scroll velocity fades once scrolling stops.
      if (t - lastScrollT > 80) scrollVel *= 0.9;
      if (!s.dragging) {
        const still = s.paused || s.hover || s.focus;
        const target = still ? 0 : Math.max(-MAX, Math.min(MAX, BASE - scrollVel * GAIN));
        vel += (target - vel) * 0.06; // slow ease, no overshoot
        x += vel * dt;
        wrap();
        apply();
      }
      if (visible) raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (!raf && visible) {
        lastT = 0;
        raf = requestAnimationFrame(frame);
      }
    };

    const onScroll = () => {
      const now = performance.now();
      const dy = window.scrollY - lastScrollY;
      const dt = Math.max(8, now - lastScrollT);
      const raw = (dy / dt) * 1000; // px/s, positive when scrolling down
      scrollVel += (raw - scrollVel) * 0.35; // smooth the read
      lastScrollY = window.scrollY;
      lastScrollT = now;
    };

    // Pointer drag scrubs the track. Vertical panning still scrolls the page (touch-action: pan-y).
    // Capture only once it is clearly a drag, so a plain click still reaches the link.
    let captured = false;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      s.dragging = true;
      s.moved = 0;
      captured = false;
      dragLastX = e.clientX;
      dragLastT = performance.now();
      dragVel = 0;
    };
    const onMove = (e: PointerEvent) => {
      if (!s.dragging) return;
      const now = performance.now();
      const dx = e.clientX - dragLastX;
      const dt = Math.max(8, now - dragLastT);
      dragVel = (dx / dt) * 1000;
      dragLastX = e.clientX;
      dragLastT = now;
      s.moved += Math.abs(dx);
      if (!captured && s.moved > 6) {
        captured = true;
        try {
          viewport.setPointerCapture(e.pointerId);
        } catch {}
      }
      x += dx;
      wrap();
      apply();
    };
    const onUp = (e: PointerEvent) => {
      if (!s.dragging) return;
      s.dragging = false;
      if (s.moved > 6) vel = Math.max(-MAX * 1.5, Math.min(MAX * 1.5, dragVel)); // carry the fling, then ease back to the drift
      if (captured) {
        try {
          viewport.releasePointerCapture(e.pointerId);
        } catch {}
      }
      captured = false;
    };
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === "mouse") s.hover = true;
    };
    const onLeave = () => {
      s.hover = false;
    };
    const onFocusIn = () => {
      s.focus = true;
    };
    const onFocusOut = (e: FocusEvent) => {
      if (!root.contains(e.relatedTarget as Node | null)) s.focus = false;
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
      },
      { threshold: 0 },
    );
    const ro = new ResizeObserver(() => {
      measure();
      wrap();
      apply();
    });

    measure();
    apply();
    io.observe(root);
    ro.observe(track);
    window.addEventListener("scroll", onScroll, { passive: true });
    viewport.addEventListener("pointerdown", onDown);
    viewport.addEventListener("pointermove", onMove);
    viewport.addEventListener("pointerup", onUp);
    viewport.addEventListener("pointercancel", onUp);
    viewport.addEventListener("pointerenter", onEnter);
    viewport.addEventListener("pointerleave", onLeave);
    root.addEventListener("focusin", onFocusIn);
    root.addEventListener("focusout", onFocusOut);
    return () => {
      io.disconnect();
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      viewport.removeEventListener("pointerdown", onDown);
      viewport.removeEventListener("pointermove", onMove);
      viewport.removeEventListener("pointerup", onUp);
      viewport.removeEventListener("pointercancel", onUp);
      viewport.removeEventListener("pointerenter", onEnter);
      viewport.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("focusout", onFocusOut);
    };
  }, [reduced]);

  // A drag that moved more than a few pixels is a scrub, not a click.
  const onLinkClick = (e: React.MouseEvent) => {
    if (state.current.moved > 6) e.preventDefault();
  };

  return (
    <nav ref={rootRef} aria-label="Who the Vary Board serves" className={`ticker ${reduced ? "ticker--static" : ""}`} data-ticker data-paused={paused || undefined}>
      <div ref={viewportRef} className="ticker__viewport">
        <div ref={trackRef} className="ticker__track">
          <List onLinkClick={onLinkClick} />
          {!reduced && <List hidden onLinkClick={onLinkClick} />}
          {!reduced && <List hidden onLinkClick={onLinkClick} />}
        </div>
      </div>
      {!reduced && (
        <button type="button" className="ticker__btn" onClick={() => setPaused((v) => !v)} aria-pressed={paused} aria-label={paused ? "Play the audience list motion" : "Pause the audience list motion"} data-ticker-toggle>
          {paused ? (
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M8 5.5v13l10-6.5z" fill="currentColor" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M8 5.5h3v13H8zM13 5.5h3v13h-3z" fill="currentColor" />
            </svg>
          )}
        </button>
      )}
    </nav>
  );
}
