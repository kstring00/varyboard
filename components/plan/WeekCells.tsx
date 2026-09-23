/**
 * "Your 4 weeks": four columns of hexagon cells that fill higher week by week, with the
 * board at the center of each column. Filling cells = progress. Static under reduced motion.
 */
const W = 46; // cell width
const H = W * 1.1547;
const ROWS = 4;

function hex(cx: number, cy: number) {
  const w = W / 2;
  const h = H / 2;
  return `${cx},${cy - h} ${cx + w},${cy - h / 2} ${cx + w},${cy + h / 2} ${cx},${cy + h} ${cx - w},${cy + h / 2} ${cx - w},${cy - h / 2}`;
}

function Board({ x, y }: { x: number; y: number }) {
  // A tiny three-section board glyph.
  return (
    <g transform={`translate(${x - 5} ${y - 14})`} className="ix-weeks__board" aria-hidden="true">
      <rect x="0" y="0" width="10" height="28" rx="2" />
      <line x1="0" y1="9.3" x2="10" y2="9.3" />
      <line x1="0" y1="18.6" x2="10" y2="18.6" />
      {[3, 6, 12.5, 15.5, 22, 25].map((cy) => (
        <circle key={cy} cx="5" cy={cy} r="1.1" />
      ))}
    </g>
  );
}

export function WeekCells({ counts, labels }: { counts: number[]; labels: string[] }) {
  const colW = W + 26;
  const width = colW * 4 + 10;
  const height = H * 0.75 * ROWS + H * 0.25 + 44;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="ix-weeks" role="img" aria-label={`Four weeks: ${labels.join(", ")}`}>
      {counts.map((count, col) => {
        const cx = 5 + colW * col + colW / 2;
        return (
          <g key={col}>
            {Array.from({ length: ROWS }).map((_, row) => {
              const level = ROWS - row; // 1 at the bottom
              const cy = H / 2 + row * H * 0.75 + 4;
              const filled = level <= count;
              return <polygon key={row} points={hex(cx, cy)} className={`ix-weeks__cell ${filled ? "ix-weeks__cell--lit" : ""}`} style={{ animationDelay: `${col * 200 + (ROWS - row) * 90}ms` }} />;
            })}
            <Board x={cx} y={H / 2 + (ROWS / 2 - 0.5) * H * 0.75 + 4} />
            <text x={cx} y={height - 8} textAnchor="middle" className="ix-weeks__label">
              {labels[col]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
