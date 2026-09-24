import type { Genre } from "@/content/intake";

/**
 * One small looping line drawing per genre. SVG + CSS keyframes only (app/globals.css,
 * `.ga-*`). Fixed 120 x 90 box, so nothing around it moves. The base styles are a
 * meaningful still frame: prefers-reduced-motion turns the keyframes off and shows it,
 * and the loop is paused while the section is off screen ([data-inview="false"]).
 */
const hex = (cx: number, cy: number, r: number) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = Math.PI / 2 + (i * Math.PI) / 3;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");

/** Climb: cells lighting upward, row by row, like hands walking up the board. */
function Climb() {
  const r = 8;
  const dx = Math.sqrt(3) * r;
  const rows = 5;
  const cells: { x: number; y: number; row: number }[] = [];
  for (let row = 0; row < rows; row++) {
    const y = 80 - row * 1.5 * r;
    const shift = row % 2 ? dx / 2 : 0;
    for (let c = 0; c < 3; c++) cells.push({ x: 60 - dx + c * dx + shift - dx / 4, y, row });
  }
  return (
    <>
      {cells.map((c, i) => (
        <polygon key={i} points={hex(c.x, c.y, r - 0.8)} className={`ga-cell${c.row < 2 ? " ga-cell--on" : ""}`} style={{ animationDelay: `${c.row * 0.42}s` }} />
      ))}
    </>
  );
}

/** Strengthen: a band clipped to an anchor tenses from slack to straight and eases back. */
function Strengthen() {
  return (
    <>
      <polygon points={hex(18, 45, 7)} className="ga-anchor" />
      <path d="M18 45 Q58 74 96 45" className="ga-band ga-band--slack" />
      <path d="M18 45 L100 45" className="ga-band ga-band--taut" />
      <g className="ga-handle">
        <rect x="96" y="37" width="7" height="16" rx="3.5" className="ga-grip" />
      </g>
    </>
  );
}

/** Stretch: a ring filling slowly, the length of an easy hold. */
function Stretch() {
  return (
    <>
      <circle cx="60" cy="45" r="28" className="ga-ring" />
      <circle cx="60" cy="45" r="28" className="ga-ring-fill" pathLength={100} transform="rotate(-90 60 45)" />
      <circle cx="60" cy="45" r="3" className="ga-dot" />
    </>
  );
}

/** Loosen: an arc traced across a row of cells, a joint moving through its path. */
function Loosen() {
  const r = 9;
  const dx = Math.sqrt(3) * r;
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <polygon key={i} points={hex(60 - 1.5 * dx + i * dx, 62, r - 0.8)} className="ga-cell" />
      ))}
      <path d="M22 60 C 36 16, 84 16, 98 60" className="ga-arc" pathLength={100} />
    </>
  );
}

/** Steady: a dot that wobbles and settles between the rails. */
function Steady() {
  return (
    <>
      <line x1="22" y1="20" x2="22" y2="74" className="ga-rail" />
      <line x1="98" y1="20" x2="98" y2="74" className="ga-rail" />
      <line x1="30" y1="74" x2="90" y2="74" className="ga-floor" />
      <g className="ga-wobble">
        <line x1="60" y1="74" x2="60" y2="40" className="ga-stem" />
        <circle cx="60" cy="34" r="6" className="ga-dot ga-dot--big" />
      </g>
    </>
  );
}

/** Rise: sit-to-stand in three ghost frames. */
function Rise() {
  const figure = (hip: [number, number], knee: [number, number], foot: [number, number], shoulder: [number, number], head: [number, number]) =>
    `M${foot.join(" ")} L${knee.join(" ")} L${hip.join(" ")} L${shoulder.join(" ")} M${head[0]} ${head[1] + 5}`;
  const frames = [
    { d: figure([30, 58], [44, 58], [44, 78], [27, 38], [26, 30]), head: [26, 30] },
    { d: figure([56, 52], [64, 64], [64, 78], [62, 34], [63, 26]), head: [63, 26] },
    { d: figure([90, 54], [90, 66], [90, 78], [90, 34], [90, 25]), head: [90, 25] },
  ];
  return (
    <>
      <path d="M22 60 H40 M24 60 V78 M38 60 V78" className="ga-floor" />
      <line x1="108" y1="30" x2="108" y2="78" className="ga-rail" />
      {frames.map((f, i) => (
        <g key={i} className={`ga-frame ga-frame--${i}`}>
          <path d={f.d} className="ga-body" />
          <circle cx={f.head[0]} cy={f.head[1]} r="5" className="ga-head" />
        </g>
      ))}
    </>
  );
}

const DRAW: Record<Genre, () => React.JSX.Element> = { climb: Climb, strengthen: Strengthen, stretch: Stretch, loosen: Loosen, steady: Steady, rise: Rise };

export function GenreAnim({ genre, className = "" }: { genre: Genre; className?: string }) {
  const Draw = DRAW[genre];
  return (
    <svg viewBox="0 0 120 90" className={`ga ga--${genre} ${className}`} aria-hidden="true" focusable="false">
      <Draw />
    </svg>
  );
}
