import { HERO, heroGenres } from "@/content/hero";
import { genreCardId } from "@/content/genres";
import { Mannequin } from "./Mannequin";
import { MINI, MINI_REST } from "./rig";

/**
 * The finale: the board shrinks into a centre hexagon (the hub), six genre hexagons bloom out
 * around it, each with a looping mini mannequin demo, inside a ghost honeycomb ring.
 * Each genre hexagon is a real link to its card in "What you can do" (#genre-climb …), focusable
 * only once it has landed (choreography.ts sets tabindex). Hover or focus shows Eric's clinical
 * term in the caption under the ring.
 */
const HEX_BG = "43.3,0 86.6,25 86.6,75 43.3,100 0,75 0,25";
/** Axial (q, r) around the hub, top-left first, clockwise: same order as GENRE_LIST. */
const AXIAL: [number, number][] = [[0, -1], [1, -1], [1, 0], [0, 1], [-1, 1], [-1, 0]];
/** The ghost honeycomb: the twelve cells two steps out; roughly one in four is filled. */
const GHOSTS: { q: number; r: number; fill: boolean }[] = [];
for (let q = -2; q <= 2; q++)
  for (let r = -2; r <= 2; r++) if (Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r)) === 2) GHOSTS.push({ q, r, fill: (q * 7 + r * 3) % 4 === 0 });

const Bg = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 86.6 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <polygon points={HEX_BG} />
  </svg>
);

/** The small board scene inside one genre hexagon (inches, floor at y = 78). */
function MiniScene({ genre, index }: { genre: string; index: number }) {
  const holes: [number, number][] = [];
  for (let r = 0; r < 28; r++) for (const x of r % 2 ? [-19.3, -17, -14.7] : [-18.2, -15.8]) holes.push([x, 5.5 + r * 2.6]);
  const railLit = genre === "steady" || genre === "rise" || genre === "loosen";
  return (
    <svg className="sb-hx__ic" viewBox="-24 -4 46 84" aria-hidden="true" focusable="false">
      <rect x={-21} y={3} width={8} height={75} rx={1.4} fill="#4fa5c6" />
      <rect x={-21} y={3.5} width={1.1} height={74} rx={0.5} fill="#8C979C" />
      <rect x={-14.1} y={3.5} width={1.1} height={74} rx={0.5} fill={railLit ? "#62BBA6" : "#8C979C"} />
      {holes.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={0.62} fill="#1F3E4A" />
      ))}
      <line x1={-24} y1={78.2} x2={22} y2={78.2} stroke="#CFC9BF" strokeWidth={0.8} />
      {genre === "rise" && (
        <>
          <rect x={-7} y={42} width={14} height={18} rx={1.2} fill="#D6CDBF" />
          <rect x={-9} y={59} width={18} height={1.8} rx={0.6} fill="#C4B7A4" />
        </>
      )}
      {genre === "strengthen" && <line data-sb="miniband" x1={-15.2} y1={1.5} x2={-15.2} y2={1.5} stroke="#E5484D" strokeWidth={0.9} strokeLinecap="round" />}
      <Mannequin pose={MINI[index](MINI_REST)} u={1} ox={0} oy={78} />
    </svg>
  );
}

export function GenreRingBackground() {
  return (
    <div className="sb-ringbg" data-sb="ringbg" aria-hidden="true">
      <div className="sb-hub" data-sb="hub">
        <Bg />
      </div>
      {GHOSTS.map((g) => (
        <div key={`${g.q}.${g.r}`} className={`sb-ghost${g.fill ? " sb-ghost--fill" : ""}`} data-sb="ghost" data-q={g.q} data-r={g.r}>
          <Bg />
        </div>
      ))}
    </div>
  );
}

export function GenreRing() {
  return (
    <>
      <nav className="sb-ring" data-sb="ring" aria-label="The six ways">
        {heroGenres().map((g, i) => (
          <a
            key={g.key}
            href={`#${genreCardId(g.key)}`}
            className="sb-hx"
            tabIndex={-1}
            aria-label={`${g.name}: ${g.term}`}
            data-sb="hx"
            data-q={AXIAL[i][0]}
            data-r={AXIAL[i][1]}
            data-name={g.name}
            data-term={g.term}
            data-caption={g.caption}
          >
            <Bg className="sb-hx__bg" />
            <MiniScene genre={g.key} index={i} />
            <span className="sb-hx__t" aria-hidden="true">
              {g.name}
              <span className="sb-hx__n">{String(i + 1).padStart(2, "0")}</span>
            </span>
          </a>
        ))}
      </nav>
      <p className="sb-cap" data-sb="cap" aria-live="polite">
        {HERO.finale.defaultCaption}
      </p>
    </>
  );
}
