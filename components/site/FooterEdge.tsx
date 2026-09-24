/**
 * The footer never starts with a straight line. Mirrors the hero's bottom edge, upside down:
 * a row of whole hexagons at the top dissolving downward into hexagon outlines and small
 * Y vertex marks. Static, server-rendered SVG with a seeded layout, so it is identical on
 * the server and the client and costs nothing at runtime. Same tokens as HexEdge: the
 * fill is the next background (here the mint wash), the strokes are low-alpha ink.
 */
const R = 26;
const DX = Math.sqrt(3) * R;
const DY = 1.5 * R;
const W = 2600;
const H = Math.round(R * 0.65 + DY * 2 + R);

function rng(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}
function hex(cx: number, cy: number, r: number) {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / 3;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(" ");
}

type Piece = { kind: "fill" | "line"; pts: string; op: number } | { kind: "mark"; d: string; op: number };

function build(): Piece[] {
  const r = rng(7);
  const out: Piece[] = [];
  const rows = [
    { y: -R * 0.35, fillP: 0.72, outP: 1, op: 1 },
    { y: -R * 0.35 + DY, fillP: 0.12, outP: 0.62, op: 0.8 },
    { y: -R * 0.35 + DY * 2, fillP: 0, outP: 0.22, op: 0.55 },
  ];
  rows.forEach((row, ri) => {
    for (let x = (ri % 2 ? DX / 2 : 0) - DX; x < W + DX; x += DX) {
      const roll = r();
      if (roll < row.fillP) out.push({ kind: "fill", pts: hex(x, row.y, R * 0.9), op: row.op });
      else if (roll < row.outP) out.push({ kind: "line", pts: hex(x, row.y, R * 0.86), op: row.op });
      else if (ri > 0 && r() < 0.7) {
        const vy = row.y + R * 0.2;
        const a = R * 0.24;
        out.push({ kind: "mark", d: `M${x.toFixed(1)} ${vy.toFixed(1)}v${(a * 1.1).toFixed(1)}M${x.toFixed(1)} ${vy.toFixed(1)}l${(-a * 0.87).toFixed(1)} ${(-a * 0.5).toFixed(1)}M${x.toFixed(1)} ${vy.toFixed(1)}l${(a * 0.87).toFixed(1)} ${(-a * 0.5).toFixed(1)}`, op: row.op });
      }
    }
  });
  return out;
}
const PIECES = build();

export function FooterEdge() {
  return (
    <svg className="ft-edge" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMinYMin slice" aria-hidden="true" focusable="false">
      {PIECES.map((p, i) =>
        p.kind === "mark" ? (
          <path key={i} d={p.d} className="ft-edge__mark" opacity={p.op} />
        ) : (
          <polygon key={i} points={p.pts} className={p.kind === "fill" ? "ft-edge__fill" : "ft-edge__line"} opacity={p.op} />
        ),
      )}
    </svg>
  );
}
