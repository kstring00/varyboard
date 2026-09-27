import { FIG, figureFrame, SEGMENTS, type Pose } from "./rig";

/**
 * A placeholder mannequin: a simple jointed figure from the reference, not a person.
 * Drawn from a pose at scale `u` (units per inch) with its feet at (ox, oy). The client moves it
 * by rewriting these same elements (bindFigure in choreography.ts), so the element order here
 * is the contract: per segment three lines (shadow, base, highlight) with data-s = segment index.
 */
export function Mannequin({ pose, u, ox, oy }: { pose: Pose; u: number; ox: number; oy: number }) {
  const f = figureFrame(pose, u, ox, oy);
  const line = (i: number) => {
    const W = SEGMENTS[i][2] * u;
    const s = f.segs[i];
    return (
      <g key={i} data-s={i}>
        <line {...s} stroke={FIG.dark} strokeWidth={W} strokeLinecap="round" transform={`translate(${W * 0.16} ${W * 0.22})`} />
        <line {...s} stroke={FIG.base} strokeWidth={W} strokeLinecap="round" />
        <line {...s} stroke={FIG.hi} strokeWidth={W * 0.34} strokeLinecap="round" transform={`translate(${-W * 0.18} ${-W * 0.2})`} opacity={0.8} />
      </g>
    );
  };
  return (
    <g data-fig={`${u} ${ox} ${oy}`}>
      {[0, 1, 2, 3, 4, 5, 6].map(line)}
      <polygon data-t="s" points={f.torso} fill={FIG.dark} stroke={FIG.dark} strokeWidth={2 * u} strokeLinejoin="round" transform={`translate(${0.7 * u} ${0.9 * u})`} />
      <polygon data-t="b" points={f.torso} fill={FIG.base} stroke={FIG.base} strokeWidth={2 * u} strokeLinejoin="round" />
      <line data-t="h" {...f.hi} stroke={FIG.hi} strokeWidth={1.6 * u} strokeLinecap="round" opacity={0.8} />
      {line(7)}
      <circle data-h="s" cx={f.head[0]} cy={f.head[1]} r={4.1 * u} fill={FIG.dark} transform={`translate(${0.6 * u} ${0.8 * u})`} />
      <circle data-h="b" cx={f.head[0]} cy={f.head[1]} r={4.1 * u} fill={FIG.base} />
      <circle data-h="h" cx={f.headHi[0]} cy={f.headHi[1]} r={1.9 * u} fill={FIG.hi} opacity={0.85} />
      {line(8)}
      {line(9)}
      <circle data-hand="b" cx={f.hb[0]} cy={f.hb[1]} r={1.7 * u} fill={FIG.base} />
      {line(10)}
      {line(11)}
      <circle data-hand="a" cx={f.ha[0]} cy={f.ha[1]} r={1.7 * u} fill={FIG.base} />
    </g>
  );
}
