"use client";

import { useEffect, useRef, useState } from "react";
import type { Genre } from "@/content/intake";
import { GenreAnim } from "./GenreAnim";
import { GENRE_HINT, GENRE_SELECT, genreCardId } from "./genreBus";

export interface GenreCard {
  key: Genre;
  plainName: string;
  clinicalName: string;
  whatItIs: string | null;
  how: string | null;
  example: string | null;
}

/**
 * The six-sided reveal. One large hexagon, each side a genre (top edge first, clockwise).
 *
 * Desktop (>= 1024px): the side buttons sit outside their edges. Hover previews a genre;
 * click, tap or keyboard selects it and announces the card (aria-live). All six cards share
 * one grid cell, so the column is always as tall as the tallest card: switching never moves
 * the page. Phones and tablets: a compact hexagon index (six links, each with a mini hexagon
 * showing where its side sits) above a stack of all six cards.
 *
 * Every card is in the HTML and readable at rest. Animations are CSS-only, paused off screen.
 */
const W = 480;
const H = 360;
const C = { x: 240, y: 180 };
const R = 118;
const corner = (i: number) => {
  const a = (Math.PI / 180) * (60 * i - 120); // flat-top: top-left corner first, clockwise
  return { x: C.x + R * Math.cos(a), y: C.y + R * Math.sin(a) };
};
/** Where each side's button sits, and which edge of the button touches that point. */
const LABEL = [0, 1, 2, 3, 4, 5].map((i) => {
  const a = corner(i);
  const b = corner((i + 1) % 6);
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const n = (Math.PI / 180) * (-90 + 60 * i);
  const d = 26;
  const x = mid.x + d * Math.cos(n);
  const y = mid.y + d * Math.sin(n);
  const align = i === 0 ? "top" : i === 3 ? "bottom" : i < 3 ? "right" : "left";
  return { x: (x / W) * 100, y: (y / H) * 100, align };
});

function MiniHex({ side }: { side: number }) {
  const r = 9;
  const pts = Array.from({ length: 6 }, (_, k) => {
    const a = (Math.PI / 180) * (60 * k - 120);
    return { x: 12 + r * Math.cos(a), y: 11 + r * Math.sin(a) };
  });
  const a = pts[side];
  const b = pts[(side + 1) % 6];
  return (
    <svg viewBox="0 0 24 22" width="24" height="22" aria-hidden="true" className="gx-mini">
      <polygon points={pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")} className="gx-mini__hex" />
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="gx-mini__side" />
    </svg>
  );
}

export function GenreExplorer({ cards }: { cards: GenreCard[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Genre>(cards[0].key);
  const [hint, setHint] = useState<Genre | null>(null);
  const [announce, setAnnounce] = useState("");
  const [inView, setInView] = useState(false);

  const describe = (g: Genre) => {
    const c = cards.find((x) => x.key === g)!;
    return `${c.plainName}, ${c.clinicalName}. ${c.whatItIs ?? "Coming soon from Dr. Eric."}`;
  };
  /** A deliberate choice (click, tap, key, chip): select and announce. Hover only previews. */
  const choose = (g: Genre) => {
    setActive(g);
    setAnnounce(describe(g));
  };

  // Pause the card loops while the section is off screen.
  useEffect(() => {
    const el = root.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "100px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Chips in "Who it's for" and #genre-* links.
  useEffect(() => {
    const desktop = () => window.matchMedia("(min-width: 1024px)").matches;
    const reduce = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const reveal = (g: Genre) => {
      const target = desktop() ? root.current : document.getElementById(genreCardId(g));
      target?.scrollIntoView({ behavior: reduce() ? "auto" : "smooth", block: "start" });
    };
    const onHint = (e: Event) => setHint((e as CustomEvent<Genre | null>).detail);
    const onSelect = (e: Event) => {
      const g = (e as CustomEvent<Genre>).detail;
      setActive(g);
      setAnnounce(cards.find((x) => x.key === g) ? `${cards.find((x) => x.key === g)!.plainName} selected above.` : "");
      reveal(g);
    };
    const fromHash = () => {
      const m = window.location.hash.match(/^#genre-(\w+)$/);
      const g = m?.[1] as Genre | undefined;
      if (g && cards.some((c) => c.key === g)) {
        setActive(g);
        if (desktop()) reveal(g);
      }
    };
    window.addEventListener(GENRE_HINT, onHint);
    window.addEventListener(GENRE_SELECT, onSelect);
    window.addEventListener("hashchange", fromHash);
    fromHash();
    return () => {
      window.removeEventListener(GENRE_HINT, onHint);
      window.removeEventListener(GENRE_SELECT, onSelect);
      window.removeEventListener("hashchange", fromHash);
    };
  }, [cards]);

  const idx = (g: Genre) => cards.findIndex((c) => c.key === g);

  return (
    <div ref={root} className="gx" data-inview={inView} data-active={active}>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announce}
      </p>

      {/* Desktop: the six-sided reveal */}
      <div className="gx-hex" role="group" aria-label="Six kinds of practice. Choose a side to see it.">
        <svg viewBox={`0 0 ${W} ${H}`} className="gx-hex__svg" aria-hidden="true" focusable="false">
          <polygon points={cards.map((_, i) => `${corner(i).x.toFixed(1)},${corner(i).y.toFixed(1)}`).join(" ")} className="gx-hex__body" />
          <polygon points={cards.map((_, i) => `${(C.x + (corner(i).x - C.x) * 0.62).toFixed(1)},${(C.y + (corner(i).y - C.y) * 0.62).toFixed(1)}`).join(" ")} className="gx-hex__inner" />
          {cards.map((c, i) => {
            const a = corner(i);
            const b = corner((i + 1) % 6);
            const state = c.key === active ? "on" : c.key === hint ? "hint" : "off";
            return (
              <line
                key={c.key}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                className={`gx-side gx-side--${state}`}
                onMouseEnter={() => setActive(c.key)}
                onClick={() => choose(c.key)}
              />
            );
          })}
          <text x={C.x} y={C.y - 6} className="gx-hex__num">
            {String(idx(active) + 1).padStart(2, "0")}
          </text>
          <text x={C.x} y={C.y + 24} className="gx-hex__name">
            {cards[idx(active)].plainName}
          </text>
        </svg>
        {cards.map((c, i) => (
          <button
            key={c.key}
            type="button"
            className={`gx-side-btn gx-side-btn--${LABEL[i].align}${c.key === hint ? " is-hint" : ""}`}
            style={{ left: `${LABEL[i].x}%`, top: `${LABEL[i].y}%` }}
            aria-pressed={c.key === active}
            aria-controls={genreCardId(c.key)}
            onMouseEnter={() => setActive(c.key)}
            onFocus={() => setActive(c.key)}
            onClick={() => choose(c.key)}
            data-genre-side={c.key}
          >
            {c.plainName}
          </button>
        ))}
      </div>

      {/* Phones and tablets: compact index */}
      <nav className="gx-index" aria-label="Jump to a kind of practice">
        <ul>
          {cards.map((c, i) => (
            <li key={c.key}>
              <a href={`#${genreCardId(c.key)}`} className={`gx-index__link${c.key === hint ? " is-hint" : ""}`} onClick={() => setActive(c.key)} data-genre-index={c.key}>
                <MiniHex side={i} />
                <span>{c.plainName}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="gx-cards">
        {cards.map((c, i) => (
          <article key={c.key} id={genreCardId(c.key)} className={`gx-card${c.key === hint ? " is-hint" : ""}`} data-on={c.key === active} aria-labelledby={`${genreCardId(c.key)}-title`}>
            <div className="gx-card__head">
              <div>
                <p className="gx-card__num">{String(i + 1).padStart(2, "0")}</p>
                <h3 id={`${genreCardId(c.key)}-title`} className="gx-card__name">
                  {c.plainName}
                </h3>
                <p className="gx-card__clinical">{c.clinicalName}</p>
              </div>
              <GenreAnim genre={c.key} className="gx-card__anim" />
            </div>
            {c.whatItIs ? (
              <>
                <p className="gx-card__what">{c.whatItIs}</p>
                {c.how && (
                  <p className="gx-card__how">
                    <span className="gx-card__label">On the board</span>
                    {c.how}
                  </p>
                )}
                {c.example && (
                  <p className="gx-card__try">
                    <span className="gx-card__label">Try it</span>
                    {c.example}
                  </p>
                )}
              </>
            ) : (
              <p className="gx-card__soon">Coming soon from Dr. Eric.</p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
