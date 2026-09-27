import { HERO } from "@/content/hero";
import { SOURCES } from "@/content/sources";

/** Beat 1's three touching hexagons on the empty wall. Decorative copy: the text is in the hero's sr-only block. */
const HEX = "43.3,0 86.6,25 86.6,75 43.3,100 0,75 0,25";
/** Axial (q, r) of each hexagon in the cluster: two on top, one tucked under. */
const CLUSTER: [number, number][] = [[0, 0], [1, 0], [0, 1]];

export function StakesHexes() {
  return (
    <div className="sb-stakes" data-sb="stakes" aria-hidden="true">
      {HERO.problem.stats.map((s, i) => {
        const upTo = s.figure.match(/^Up to\s+(.+)$/i);
        return (
          <div key={s.key} className={`sb-sx${"alt" in s && s.alt ? " sb-sx--alt" : ""}`} data-q={CLUSTER[i][0]} data-r={CLUSTER[i][1]}>
            <svg viewBox="0 0 86.6 100" preserveAspectRatio="none">
              <polygon points={HEX} />
            </svg>
            <b>
              {upTo ? (
                <>
                  <small>UP TO</small>
                  {upTo[1]}
                </>
              ) : (
                s.figure
              )}
            </b>
            <span>{s.caption.value}</span>
            <i>{SOURCES[s.source].short}</i>
          </div>
        );
      })}
    </div>
  );
}
