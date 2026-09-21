/**
 * BoardDiagram: an SVG line drawing of the Vary Board at true proportion.
 *
 * Units are inches. Body 8 wide x 25 per section. Each section: 47 flat-top hexagon anchor
 * points in three staggered columns (16 / 15 / 16), the middle column offset half a cell;
 * a handrail line down each side standing off the body on short posts; a hairline seam
 * between sections; a rounded top cap. Nothing beyond that spec.
 *
 * Every path carries pathLength="1" so a single CSS rule can draw it on (stroke-dashoffset 1 -> 0).
 * Strokes are in user units (no vector-effect): Chromium does not honour pathLength together with
 * non-scaling-stroke, which turns the dash pattern into repeating segments.
 */
export interface BoardDiagramProps {
  sections: 3 | 4;
  className?: string;
  /** Adds the draw-on animation class. */
  animate?: boolean;
  title?: string;
}

const W = 8;
const SECTION_H = 25;
const PITCH = 1.45; // vertical cell pitch
const R_CELL = PITCH / Math.sqrt(3); // cell circumradius (flat-to-flat == pitch)
const COL_PITCH = 1.5 * R_CELL;
const R_HOLE = 0.62; // drawn hexagon circumradius (wall thickness = pitch - flat-to-flat)
const COLUMNS = [16, 15, 16] as const;
const RAIL_X = 0.85; // rail stand-off from the body edge
const POST_Y = [4, 12.5, 21] as const;

function hexPoints(cx: number, cy: number, r: number): string {
  // flat-top hexagon: vertices at 0°, 60°, ... (points left/right, flat top/bottom)
  const pts: string[] = [];
  for (let k = 0; k < 6; k++) {
    const a = (Math.PI / 3) * k;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(3)},${(cy + r * Math.sin(a)).toFixed(3)}`);
  }
  return pts.join(" ");
}

function sectionHexPath(top: number): string {
  let d = "";
  COLUMNS.forEach((count, c) => {
    const cx = W / 2 + (c - 1) * COL_PITCH;
    for (let i = 0; i < count; i++) {
      const cy = top + SECTION_H / 2 + (i - (count - 1) / 2) * PITCH;
      const p = hexPoints(cx, cy, R_HOLE).split(" ");
      d += `M${p[0]}L${p.slice(1).join("L")}Z`;
    }
  });
  return d;
}

export function BoardDiagram({ sections, className = "", animate = true, title }: BoardDiagramProps) {
  const H = sections * SECTION_H;
  const pad = 1.6; // room for the rails
  const vb = `${-pad} -0.5 ${W + pad * 2} ${H + 1}`;
  const stroke = "var(--color-pine)";
  return (
    <svg
      viewBox={vb}
      className={`board-diagram ${animate ? "board-diagram--animate" : ""} ${className}`}
      role="img"
      aria-label={title ?? `${sections}-section Vary Board diagram`}
      preserveAspectRatio="xMidYMax meet"
    >
      {/* Body with a rounded top cap */}
      <path
        pathLength={1}
        d={`M0,${H} L0,1.2 A1.2,1.2 0 0 1 1.2,0 L${W - 1.2},0 A1.2,1.2 0 0 1 ${W},1.2 L${W},${H} Z`}
        fill="rgb(133 181 178 / 0.12)"
        stroke={stroke}
        strokeWidth={0.22}
        strokeLinejoin="round"
      />
      {/* Seams between sections */}
      {Array.from({ length: sections - 1 }, (_, i) => (
        <path key={`seam-${i}`} pathLength={1} d={`M0,${(i + 1) * SECTION_H} L${W},${(i + 1) * SECTION_H}`} stroke={stroke} strokeWidth={0.16} strokeOpacity={0.55} />
      ))}
      {/* Anchor points: 47 per section */}
      {Array.from({ length: sections }, (_, s) => (
        <path key={`hex-${s}`} className="board-diagram__hex" pathLength={1} d={sectionHexPath(s * SECTION_H)} fill="rgb(133 181 178 / 0.12)" stroke={stroke} strokeWidth={0.14} strokeLinejoin="round" />
      ))}
      {/* Handrails on posts, both sides */}
      {[-RAIL_X, W + RAIL_X].map((x, side) => (
        <g key={`rail-${side}`}>
          <path pathLength={1} d={`M${x},1.5 L${x},${H - 1.5}`} stroke={stroke} strokeWidth={0.32} strokeLinecap="round" />
          {Array.from({ length: sections }, (_, s) =>
            POST_Y.map((py) => (
              <path key={`post-${side}-${s}-${py}`} pathLength={1} d={`M${side === 0 ? 0 : W},${s * SECTION_H + py} L${x},${s * SECTION_H + py}`} stroke={stroke} strokeWidth={0.16} strokeOpacity={0.7} />
            )),
          )}
        </g>
      ))}
    </svg>
  );
}
