"use client";

import { useEffect, useRef } from "react";

/**
 * The two top-down rooms in "Why it's different", ported from the reference's #clinic script.
 * Left: the usual PT gym with seven stations. When the rooms scroll into view, one session plays
 * slowly (6 s), then seven fast ones (0.9 s each); every finished path turns gray, so they build
 * into a tangle. Right: one wall, one 3 x 3 ft spot, the six genre hexagons light as the first
 * session reaches each matching station. Counters: exercises equal on both sides; trips 72 vs 0.
 * Replay reruns it. prefers-reduced-motion: the final tangle and counters, drawn once.
 * An illustration of one day of sessions, not measured data (the page says so).
 */
type StationKey = "T" | "L" | "P" | "B" | "S" | "M" | "BP" | "PB";
const ST: Record<StationKey, [number, number][]> = {
  T: [[92, 302]],
  L: [[72, 58]],
  P: [[196, 76]],
  B: [[344, 92]],
  S: [[335, 168]],
  M: [[86, 146]],
  BP: [[212, 196]],
  PB: [[178, 329], [276, 329]],
};
/** Station -> the genre hexagon it lights on the right (GENRE_LIST order). */
const GEN: Partial<Record<StationKey, number>> = { L: 0, B: 1, P: 2, M: 3, BP: 4, PB: 4, S: 5 };
const MID: StationKey[] = ["L", "P", "B", "S", "BP", "PB", "M"];
const SLOW = 6000;
const FAST = 900;
const hex = (cx: number, cy: number, r: number) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = Math.PI / 2 + (i * Math.PI) / 3;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");

/** Seeded (Park-Miller) so the tangle is the same every visit. */
function rng(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}
/** The day's eight sessions: the first in a fixed order, then seven shuffles. */
const ROUTES: StationKey[][] = (() => {
  const rnd = rng(7);
  const out: StationKey[][] = [MID.slice()];
  for (let i = 0; i < 7; i++) {
    const a = MID.slice();
    for (let j = a.length - 1; j > 0; j--) {
      const k = Math.floor(rnd() * (j + 1));
      [a[j], a[k]] = [a[k], a[j]];
    }
    out.push(a);
  }
  return out;
})();

export interface ClinicCompareCopy {
  oldTitle: string;
  oldTag: string;
  oldLabel: string;
  stations: string[];
  newTitle: string;
  newTag: string;
  newLabel: string;
  board: string;
  spot: string;
  spare: string;
  genres: string[];
  exercises: string;
  trips: string;
  replay: string;
  fine: string;
}

function Meter({ id, label, trips }: { id: string; label: string; trips?: boolean }) {
  return (
    <div className={trips ? "cl-meter cl-meter--trips" : "cl-meter"}>
      <b data-meter={id}>0</b>
      <span>{label}</span>
    </div>
  );
}

const Lbl = ({ x, y, dark, anchor = "middle", children }: { x: number; y: number; dark?: boolean; anchor?: "start" | "middle" | "end"; children: string }) => (
  <text x={x} y={y} textAnchor={anchor} className={`cl-lbl${dark ? " cl-lbl--dark" : ""}`}>
    {children}
  </text>
);

export function ClinicCompare({ copy }: { copy: ClinicCompareCopy }) {
  const root = useRef<HTMLDivElement>(null);
  const trailsRef = useRef<SVGGElement>(null);
  const walkerRef = useRef<SVGCircleElement>(null);
  const pulseRef = useRef<SVGCircleElement>(null);
  const chipsRef = useRef<SVGGElement>(null);
  const replayRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const trails = trailsRef.current!;
    const walker = walkerRef.current!;
    const pulse = pulseRef.current!;
    const chips = [...chipsRef.current!.querySelectorAll<SVGPolygonElement>("polygon")];
    const meter = (k: string) => root.current!.querySelector<HTMLElement>(`[data-meter="${k}"]`);
    const c = { oEx: meter("oEx"), oTrips: meter("oTrips"), nEx: meter("nEx"), nTrips: meter("nTrips") };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const NS = "http://www.w3.org/2000/svg";
    let runs: { path: SVGPathElement; total: number; segs: { end: number; tag: StationKey | null }[] }[] = [];
    let raf = 0;
    let t0 = 0;

    function buildPath(order: StationKey[], jit: number, rnd: () => number) {
      const pts: [number, number][] = [ST.T[0]];
      const tags: (StationKey | null)[] = [null];
      order.forEach((s) =>
        ST[s].forEach((p, i) => {
          pts.push([p[0] + (rnd() - 0.5) * jit, p[1] + (rnd() - 0.5) * jit]);
          tags.push(i === ST[s].length - 1 ? s : null);
        }),
      );
      pts.push(ST.T[0]);
      tags.push("T");
      let d = "M" + pts[0].join(" ");
      for (let i = 1; i < pts.length; i++) {
        const [x0, y0] = pts[i - 1];
        const [x1, y1] = pts[i];
        const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, bow = (rnd() - 0.5) * 70;
        d += ` Q ${(mx - (dy / L) * bow).toFixed(1)} ${(my + (dx / L) * bow).toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
      }
      const path = document.createElementNS(NS, "path");
      path.setAttribute("d", d);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "#62BBA6");
      path.setAttribute("stroke-width", "2.4");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-linejoin", "round");
      trails.appendChild(path);
      // segment boundaries along the path
      const segs: { end: number; tag: StationKey | null }[] = [];
      const tmp = document.createElementNS(NS, "path");
      trails.appendChild(tmp);
      let dd = "M" + pts[0].join(" ");
      d.split(" Q ")
        .slice(1)
        .forEach((q, i) => {
          dd += " Q " + q;
          tmp.setAttribute("d", dd);
          segs.push({ end: tmp.getTotalLength(), tag: tags[i + 1] });
        });
      tmp.remove();
      const total = path.getTotalLength();
      path.style.strokeDasharray = String(total);
      path.style.strokeDashoffset = String(total);
      return { path, total, segs };
    }

    function reset() {
      cancelAnimationFrame(raf);
      trails.replaceChildren();
      const rnd = rng(7);
      runs = ROUTES.map((r, i) => buildPath(r, i ? 22 : 0, rnd));
      for (const ch of chips) {
        ch.setAttribute("fill", "#E7EBE8");
        ch.setAttribute("stroke", "#C4CEC9");
      }
      for (const k of ["oEx", "oTrips", "nEx", "nTrips"] as const) if (c[k]) c[k]!.textContent = "0";
    }

    function frame(now: number) {
      const t = now - t0;
      let ex = 0;
      let trips = 0;
      let done = true;
      runs.forEach((r, i) => {
        const s = i === 0 ? 0 : SLOW + (i - 1) * FAST;
        const dur = i === 0 ? SLOW : FAST;
        const k = Math.max(0, Math.min(1, (t - s) / dur));
        const len = r.total * k;
        if (k < 1) done = false;
        r.path.style.strokeDashoffset = (r.total - len).toFixed(1);
        if (k >= 1) {
          r.path.setAttribute("stroke", "rgba(22,48,58,.26)");
          r.path.setAttribute("stroke-width", "1.6");
        }
        for (const sg of r.segs)
          if (len >= sg.end - 0.5) {
            trips++;
            if (sg.tag && sg.tag !== "T") ex++;
          }
        if (k > 0 && k < 1) {
          const pt = r.path.getPointAtLength(len);
          walker.setAttribute("cx", String(pt.x));
          walker.setAttribute("cy", String(pt.y));
          walker.setAttribute("opacity", "1");
        }
        if (i === 0)
          for (const sg of r.segs) {
            const g = sg.tag ? GEN[sg.tag] : undefined;
            if (g !== undefined && len >= sg.end - 0.5) {
              chips[g].setAttribute("fill", "#9ED6C6");
              chips[g].setAttribute("stroke", "#62BBA6");
            }
          }
      });
      if (c.oEx) c.oEx.textContent = String(ex);
      if (c.nEx) c.nEx.textContent = String(ex);
      if (c.oTrips) c.oTrips.textContent = String(trips);
      const ph = (t % 900) / 900;
      pulse.setAttribute("r", String(8 + ph * 18));
      pulse.setAttribute("opacity", String(done ? 0 : (1 - ph) * 0.9));
      if (done) {
        walker.setAttribute("opacity", "0");
        return;
      }
      raf = requestAnimationFrame(frame);
    }

    function play() {
      reset();
      if (reduce) {
        t0 = performance.now() - 1e6;
        frame(performance.now());
        return;
      }
      t0 = performance.now();
      raf = requestAnimationFrame(frame);
    }

    reset();
    const io = new IntersectionObserver(
      (es) => {
        if (es[0].isIntersecting) {
          play();
          io.disconnect();
        }
      },
      { threshold: 0.45 },
    );
    io.observe(root.current!);
    const btn = replayRef.current!;
    btn.addEventListener("click", play);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      btn.removeEventListener("click", play);
    };
  }, []);

  const eq = { fill: "#DCE4E1", stroke: "#A9B8B4", strokeWidth: 1.4 };
  const [table, ladder, pulley, bands, stairs, mat, pad, bars] = copy.stations;

  return (
    <>
      <div className="cl-compare" ref={root}>
        <div className="cl-panel cl-panel--old">
          <div className="cl-panel__head">
            <h3>{copy.oldTitle}</h3>
            <span className="cl-panel__tag">{copy.oldTag}</span>
          </div>
          <svg viewBox="0 0 400 400" role="img" aria-label={copy.oldLabel}>
            <rect x={8} y={8} width={384} height={384} rx={12} fill="#F6F4EF" stroke="#C9D1CE" strokeWidth={2} />
            <g>
              <rect x={52} y={314} width={76} height={34} rx={5} {...eq} />
              <rect x={44} y={14} width={56} height={10} rx={2} {...eq} fill="#B9C7C4" />
              <circle cx={196} cy={30} r={11} {...eq} fill="none" />
              <line x1={196} y1={14} x2={196} y2={19} {...eq} />
              <rect x={374} y={60} width={12} height={62} rx={2} {...eq} fill="#B9C7C4" />
              <rect x={300} y={176} width={70} height={62} rx={3} {...eq} />
              {[1, 2, 3, 4].map((i) => (
                <line key={i} x1={300} y1={176 + i * 12.4} x2={370} y2={176 + i * 12.4} {...eq} />
              ))}
              <rect x={40} y={160} width={92} height={44} rx={6} {...eq} />
              <circle cx={212} cy={196} r={20} {...eq} />
              <line x1={170} y1={314} x2={284} y2={314} {...eq} strokeWidth={4} />
              <line x1={170} y1={344} x2={284} y2={344} {...eq} strokeWidth={4} />
            </g>
            <g ref={trailsRef} />
            <g>
              <Lbl x={90} y={368}>{table}</Lbl>
              <Lbl x={72} y={42}>{ladder}</Lbl>
              <Lbl x={196} y={60}>{pulley}</Lbl>
              <Lbl x={366} y={136} anchor="end">{bands}</Lbl>
              <Lbl x={335} y={256}>{stairs}</Lbl>
              <Lbl x={86} y={222}>{mat}</Lbl>
              <Lbl x={212} y={234}>{pad}</Lbl>
              <Lbl x={227} y={368}>{bars}</Lbl>
              <circle ref={walkerRef} r={7} fill="#1B4753" stroke="#fff" strokeWidth={2.5} opacity={0} />
            </g>
          </svg>
          <div className="cl-meters">
            <Meter id="oEx" label={copy.exercises} />
            <Meter id="oTrips" label={copy.trips} trips />
          </div>
        </div>

        <div className="cl-panel cl-panel--new">
          <div className="cl-panel__head">
            <h3>{copy.newTitle}</h3>
            <span className="cl-panel__tag">{copy.newTag}</span>
          </div>
          <svg viewBox="0 0 400 400" role="img" aria-label={copy.newLabel}>
            <rect x={8} y={8} width={384} height={384} rx={12} fill="#F6F4EF" stroke="#C9D1CE" strokeWidth={2} />
            <g>
              <rect x={181} y={14} width={38} height={9} rx={2} fill="#4fa5c6" />
              <Lbl x={244} y={22} dark anchor="start">{copy.board}</Lbl>
              <rect x={172} y={26} width={56} height={56} rx={3} fill="rgba(98,187,166,.16)" stroke="#62BBA6" strokeWidth={1.8} strokeDasharray="5 4" />
              <Lbl x={200} y={98}>{copy.spot}</Lbl>
              <circle cx={200} cy={54} r={7} fill="#1B4753" stroke="#fff" strokeWidth={2.5} />
              <circle ref={pulseRef} cx={200} cy={54} r={8} fill="none" stroke="#62BBA6" strokeWidth={2} opacity={0} />
              <g ref={chipsRef}>
                {copy.genres.map((n, i) => {
                  const x = 120 + (i % 3) * 80;
                  const y = 142 + Math.floor(i / 3) * 70;
                  return (
                    <g key={n}>
                      <polygon points={hex(x, y, 17)} fill="#E7EBE8" stroke="#C4CEC9" strokeWidth={1.4} />
                      <Lbl x={x} y={y + 33} dark>
                        {n}
                      </Lbl>
                    </g>
                  );
                })}
              </g>
            </g>
            <rect x={60} y={296} width={280} height={74} rx={10} fill="none" stroke="#D2D9D5" strokeWidth={1.4} strokeDasharray="6 6" />
            <Lbl x={200} y={338}>{copy.spare}</Lbl>
          </svg>
          <div className="cl-meters">
            <Meter id="nEx" label={copy.exercises} />
            <Meter id="nTrips" label={copy.trips} trips />
          </div>
        </div>
      </div>
      <button ref={replayRef} className="cl-replay" type="button">
        <span aria-hidden="true">↻ </span>
        {copy.replay}
      </button>
      <p className="cl-fine">{copy.fine}</p>
    </>
  );
}
