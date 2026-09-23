import { GENRES, GENRE_ORDER, type Genre } from "@/content/intake";

/**
 * The six-genre hexagon. Each side is one kind of practice (top edge = Climb, clockwise).
 * Sides the plan uses glow mint; the rest stay gray. Labels sit outside their side.
 */
const R = 100;
const C = { x: 150, y: 130 };
const corner = (i: number) => {
  const a = (Math.PI / 180) * (60 * i - 120); // start top-left, go clockwise
  return { x: C.x + R * Math.cos(a), y: C.y + R * Math.sin(a) };
};
const LABEL_POS = [
  { x: 150, y: 14, anchor: "middle" },
  { x: 262, y: 88, anchor: "start" },
  { x: 262, y: 186, anchor: "start" },
  { x: 150, y: 254, anchor: "middle" },
  { x: 38, y: 186, anchor: "end" },
  { x: 38, y: 88, anchor: "end" },
] as const;

export function GenreHexagon({ genres, title = "Your hexagon", compact = false }: { genres: Genre[]; title?: string; compact?: boolean }) {
  const used = new Set(genres);
  return (
    <svg viewBox="0 0 300 264" className={`ix-hexagon ${compact ? "ix-hexagon--compact" : ""}`} role="img" aria-labelledby="ix-hexagon-title">
      <title id="ix-hexagon-title">{`${title}: ${GENRE_ORDER.filter((g) => used.has(g)).map((g) => GENRES[g].label).join(", ")}`}</title>
      <defs>
        <filter id="ix-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <polygon points={GENRE_ORDER.map((_, i) => `${corner(i).x},${corner(i).y}`).join(" ")} className="ix-hexagon__fill" />
      {GENRE_ORDER.map((g, i) => {
        const a = corner(i);
        const b = corner((i + 1) % 6);
        const lit = used.has(g);
        return <line key={g} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={`ix-hexagon__side ${lit ? "ix-hexagon__side--lit" : ""}`} style={{ animationDelay: `${i * 120}ms` }} filter={lit ? "url(#ix-glow)" : undefined} />;
      })}
      {GENRE_ORDER.map((_, i) => {
        const p = corner(i);
        return <circle key={i} cx={p.x} cy={p.y} r="4" className="ix-hexagon__vertex" />;
      })}
      {!compact &&
        GENRE_ORDER.map((g, i) => (
          <text key={g} x={LABEL_POS[i].x} y={LABEL_POS[i].y} textAnchor={LABEL_POS[i].anchor} className={`ix-hexagon__label ${used.has(g) ? "ix-hexagon__label--lit" : ""}`}>
            {GENRES[g].label}
          </text>
        ))}
    </svg>
  );
}
