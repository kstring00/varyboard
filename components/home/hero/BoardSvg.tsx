import { board } from "@/content/facts";
import { Mannequin } from "./Mannequin";
import { boardHoles, carabinerHoles, hexPts, OX, OY, POSES, SEC_GAP, SEC_H, SEC_W, U, VB, FLOOR_Y } from "./rig";

/**
 * The Vary Board as an on-spec DRAWING (never labelled or styled as a photo): three 25 x 8 x 3 in
 * sections, 19 anchor rows alternating 2 and 3 hexagons = 47 per section, 141 in all; gray side
 * rails, blue-teal platform, a 3 x 3 ft mint footprint on the floor, three carabiners with band
 * loops, and the placeholder mannequin. 8 viewBox units = 1 inch.
 *
 * TODO(real-cutouts): swap this drawing for cutouts of the real board photographed flat (one per
 * section, same 25 x 8 in footprint) once those photos exist. Keep the anchor positions in rig.ts
 * so the lighting, carabiners and band still land on real anchors.
 *
 * Server-rendered in its scroll-position-0 state (empty wall). choreography.ts animates it.
 */
const FOOT_PTS = "6,600 294,600 338,712 -38,712";

/** "3 x 3 ft" -> "3 FT × 3 FT" */
const footLabel = () => {
  const m = board.minSpacePerUser.match(/(\d+)\s*x\s*(\d+)\s*ft/i);
  return m ? `${m[1]} FT × ${m[2]} FT` : board.minSpacePerUser.toUpperCase();
};

export function BoardSvg() {
  const holes = boardHoles();
  const cars = carabinerHoles(holes);
  const W = SEC_W;
  return (
    <svg viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} className="sb-sv" aria-hidden="true" focusable="false">
      <defs>
        <filter id="sb-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="sb-plat" x1="0" x2="1">
          <stop offset="0" stopColor="#2e7f9e" />
          <stop offset=".5" stopColor="#4fa5c6" />
          <stop offset="1" stopColor="#2e7f9e" />
        </linearGradient>
      </defs>

      {/* 3 ft x 3 ft floor footprint, in perspective */}
      <g data-sb="foot">
        <polygon data-sb="foot-fill" points={FOOT_PTS} fill="rgba(98,187,166,.16)" opacity={0} />
        <polygon data-sb="foot-line" points={FOOT_PTS} fill="none" stroke="#62BBA6" strokeWidth={2.2} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1} />
        <text data-sb="foot-label" x={150} y={694} textAnchor="middle" className="sb-foot-label" opacity={0}>
          {footLabel()}
        </text>
      </g>

      {/* The board: three sections, bottom first */}
      <g>
        {[0, 1, 2].map((s) => {
          const y0 = FLOOR_Y - (s + 1) * SEC_H - s * SEC_GAP;
          return (
            <g key={s} data-sb="section" style={{ opacity: 0 }} transform={`translate(0 ${s === 0 ? 40 : -90})`}>
              <rect x={8} y={y0 + 4} width={W} height={SEC_H - 4} rx={5} fill="rgba(40,50,56,.18)" transform="translate(6,8)" />
              <rect x={14} y={y0} width={W} height={SEC_H} rx={5} fill="#7B8A92" />
              {[0, 1, 2, 3, 4, 5].map((k) => (
                <rect key={k} x={W + 12} y={y0 + 18 + k * 32} width={5} height={7} rx={1.5} fill="#6A7880" />
              ))}
              <rect x={0} y={y0} width={W} height={SEC_H} rx={6} fill="url(#sb-plat)" />
              {[0.5, W - 7.5].map((x) => (
                <rect key={x} x={x} y={y0 + 2} width={7} height={SEC_H - 4} rx={3.5} fill="#8C979C" />
              ))}
              {holes
                .filter((h) => h.section === s)
                .map((h) => (
                  <polygon key={`${h.x}-${h.y}`} className="sb-hole" data-rank={h.rank} points={hexPts(h.x, h.y, 5.1)} />
                ))}
              {s !== 1 && <circle cx={W / 2} cy={y0 + (s === 0 ? SEC_H - 8 : 8)} r={2} fill="#1B2F36" />}
            </g>
          );
        })}
      </g>

      {/* Carabiners with band loops at the low, chest and overhead anchors */}
      <g data-sb="cars">
        {cars.map((h, i) => (
          <g key={i} data-sb="car" data-x={h.x} data-y={h.y} opacity={0} transform={`translate(${h.x} ${h.y}) scale(2.2)`}>
            <ellipse cx={0} cy={0} rx={3.2} ry={2.2} fill="#0F2129" />
            <path data-sb="loop" d="M -2 18 C -12 74 10 74 2 18" fill="none" stroke="#E5484D" strokeWidth={3.4} strokeLinecap="round" transform="translate(0 18) scale(1 0) translate(0 -18)" />
            <rect x={-5.5} y={-3} width={11} height={22} rx={5.5} fill="none" stroke="#34444B" strokeWidth={2.6} />
            <rect x={-5.5} y={-3} width={11} height={22} rx={5.5} fill="none" stroke="#B4C2C6" strokeWidth={0.9} transform="translate(-.6 -.6)" />
            <line x1={4.6} y1={3} x2={4.6} y2={13} stroke="#34444B" strokeWidth={1.8} />
          </g>
        ))}
      </g>

      <g data-sb="shadow" opacity={0}>
        <ellipse cx={OX} cy={OY + 4} rx={92} ry={10} fill="rgba(40,50,56,.13)" />
      </g>
      <line data-sb="band" x1={cars[2].x} y1={cars[2].y + 23} x2={cars[2].x} y2={cars[2].y + 23} stroke="#E5484D" strokeWidth={3.4} strokeLinecap="round" opacity={0} />
      <g data-sb="fig" opacity={0} transform="translate(24 0)">
        <Mannequin pose={POSES.STAND} u={U} ox={OX} oy={OY} />
      </g>
    </svg>
  );
}
