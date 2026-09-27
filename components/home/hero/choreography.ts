import {
  BEAT_STARTS,
  clamp,
  ease,
  figureFrame,
  hexPts,
  lerp,
  MINI,
  MINI_OFFSET,
  MINI_PERIOD_MS,
  MINI_REST,
  poseAt,
  seg,
  toBuild,
  VB,
  type Joint,
  type Pose,
  type Pt,
} from "./rig";

/**
 * The scroll-build choreography, ported frame for frame from reference/varyboard-scroll-build.html.
 * Runs against the server-rendered markup (ScrollBuildHero), finding its parts by data-sb.
 *
 *   - Native scroll only: one passive scroll listener, throttled to one rAF per frame.
 *   - Raw scroll progress maps to the build timeline through KN (rig.ts), as in the reference.
 *   - The wall honeycomb and every layout number are recomputed on resize only.
 *   - The finale's mini demos loop only while the finale is showing, the stage is on screen
 *     and the tab is visible. The rotating hook line has the same guard.
 *   - prefers-reduced-motion: the finale's final state is drawn once; nothing moves.
 * Returns a cleanup function.
 */
const SVG = "http://www.w3.org/2000/svg";

/** Rewrites a <Mannequin>'s elements for a new pose. Returns the placed joints. */
function bindFigure(g: SVGGElement) {
  const [u, ox, oy] = (g.dataset.fig ?? "1 0 0").split(" ").map(Number);
  const segs = [...g.querySelectorAll<SVGGElement>("[data-s]")].map((s) => [...s.querySelectorAll("line")]);
  const torso = [...g.querySelectorAll<SVGPolygonElement>('[data-t="s"], [data-t="b"]')];
  const hi = g.querySelector<SVGLineElement>('[data-t="h"]')!;
  const heads = [...g.querySelectorAll<SVGCircleElement>('[data-h="s"], [data-h="b"]')];
  const headHi = g.querySelector<SVGCircleElement>('[data-h="h"]')!;
  const handA = g.querySelector<SVGCircleElement>('[data-hand="a"]')!;
  const handB = g.querySelector<SVGCircleElement>('[data-hand="b"]')!;
  return (pose: Pose): Record<Joint, Pt> => {
    const f = figureFrame(pose, u, ox, oy);
    segs.forEach((lines, i) => {
      const s = f.segs[i];
      for (const l of lines) {
        l.setAttribute("x1", s.x1);
        l.setAttribute("y1", s.y1);
        l.setAttribute("x2", s.x2);
        l.setAttribute("y2", s.y2);
      }
    });
    for (const t of torso) t.setAttribute("points", f.torso);
    hi.setAttribute("x1", String(f.hi.x1));
    hi.setAttribute("y1", String(f.hi.y1));
    hi.setAttribute("x2", String(f.hi.x2));
    hi.setAttribute("y2", String(f.hi.y2));
    for (const c of heads) {
      c.setAttribute("cx", String(f.head[0]));
      c.setAttribute("cy", String(f.head[1]));
    }
    headHi.setAttribute("cx", String(f.headHi[0]));
    headHi.setAttribute("cy", String(f.headHi[1]));
    handA.setAttribute("cx", String(f.ha[0]));
    handA.setAttribute("cy", String(f.ha[1]));
    handB.setAttribute("cx", String(f.hb[0]));
    handB.setAttribute("cy", String(f.hb[1]));
    return f.M;
  };
}

export function mountScrollBuild(build: HTMLElement): () => void {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = <T extends Element>(k: string) => build.querySelector<T>(`[data-sb="${k}"]`)!;
  const $$ = <T extends Element>(k: string) => [...build.querySelectorAll<T>(`[data-sb="${k}"]`)];

  const stage = $<HTMLElement>("stage");
  const world = $<HTMLElement>("world");
  const copy = $<HTMLElement>("copy");
  const comb = $<SVGSVGElement>("comb");
  const ring = $<HTMLElement>("ring");
  const cap = $<HTMLElement>("cap");
  const hub = $<HTMLElement>("hub");
  const beats = [...build.querySelectorAll<HTMLElement>(".sb-beat")];
  const dots = [...build.querySelectorAll<HTMLElement>(".sb-progress i")];
  const rot = [...build.querySelectorAll<HTMLElement>('[data-sb="rot"] > span')];

  // Board scene
  const sections = $$<SVGGElement>("section");
  const holes = [...build.querySelectorAll<SVGPolygonElement>(".sb-hole")]
    .sort((a, b) => Number(a.dataset.rank) - Number(b.dataset.rank))
    .map((node) => ({ node, on: false }));
  const cars = $$<SVGGElement>("car").map((g) => ({ g, x: Number(g.dataset.x), y: Number(g.dataset.y), loop: g.querySelector<SVGPathElement>('[data-sb="loop"]')!, lt: 0 }));
  const foot = $<SVGGElement>("foot");
  const footLine = $<SVGPolygonElement>("foot-line");
  const footFill = $<SVGPolygonElement>("foot-fill");
  const footLab = $<SVGTextElement>("foot-label");
  const carsG = $<SVGGElement>("cars");
  const shadow = $<SVGGElement>("shadow");
  const band = $<SVGLineElement>("band");
  const figG = $<SVGGElement>("fig");
  const setFig = bindFigure(figG.querySelector<SVGGElement>("[data-fig]")!);

  // Finale
  const hexes = $$<HTMLAnchorElement>("hx").map((a, i) => ({
    a,
    q: Number(a.dataset.q),
    r: Number(a.dataset.r),
    x: 0,
    y: 0,
    set: bindFigure(a.querySelector<SVGGElement>("[data-fig]")!),
    band: a.querySelector<SVGLineElement>('[data-sb="miniband"]'),
    fn: MINI[i],
    off: i * MINI_OFFSET,
  }));
  const ghosts = $$<HTMLElement>("ghost").map((d) => ({ d, q: Number(d.dataset.q), r: Number(d.dataset.r), x: 0, y: 0, ok: false }));
  const stakes = [...build.querySelectorAll<HTMLElement>(".sb-sx")].map((d) => ({ d, q: Number(d.dataset.q), r: Number(d.dataset.r), x: 0, y: 0 }));

  // Caption: Eric's clinical term on hover or focus
  const defaultCap = cap.textContent ?? "";
  const showCap = (h: (typeof hexes)[number]) => {
    const b = document.createElement("b");
    b.textContent = h.a.dataset.name ?? "";
    cap.replaceChildren(b, ` ${h.a.dataset.term}. ${h.a.dataset.caption}`);
    h.a.classList.add("is-hot");
  };
  const hideCap = (h: (typeof hexes)[number]) => {
    h.a.classList.remove("is-hot");
    cap.textContent = defaultCap;
  };
  const listeners: [EventTarget, string, EventListener, AddEventListenerOptions?][] = [];
  const on = (t: EventTarget, type: string, fn: EventListener, opts?: AddEventListenerOptions) => {
    t.addEventListener(type, fn, opts);
    listeners.push([t, type, fn, opts]);
  };
  for (const h of hexes) {
    const show = () => showCap(h);
    const hide = () => hideCap(h);
    on(h.a, "mouseenter", show);
    on(h.a, "focus", show);
    on(h.a, "mouseleave", hide);
    on(h.a, "blur", hide);
  }

  /* ------------------------------------------------------------------ layout ---- */
  let M = { sw: 0, sh: 0, mobile: false, k: 1, wl: 0, wt: 0, R: 60, cx: 0, cy: 0, copyRight: 0 };

  function drawComb() {
    const w = comb.clientWidth;
    const h = comb.clientHeight;
    if (!w) return;
    comb.setAttribute("viewBox", `0 0 ${w} ${h}`);
    const R = w < 700 ? 22 : 34;
    const dx = Math.sqrt(3) * R;
    const dy = 1.5 * R;
    const frag = document.createDocumentFragment();
    for (let r = -1; r * dy < h + R; r++)
      for (let x = (r % 2 ? dx / 2 : 0) - dx; x < w + dx; x += dx) {
        const p = document.createElementNS(SVG, "polygon");
        p.setAttribute("points", hexPts(x, r * dy, R * 0.92));
        p.setAttribute("fill", "none");
        p.setAttribute("stroke", `rgba(63,157,192,${(0.05 + (x / w) * 0.12).toFixed(3)})`);
        p.setAttribute("stroke-width", "1");
        frag.appendChild(p);
      }
    comb.replaceChildren(frag);
  }

  /** Phones: the lowest point of the copy in the given beats (beats sit under the header, stacked from the top). */
  const copyBottom = (which: number[]) => copy.offsetTop + Math.max(0, ...beats.filter((b) => which.includes(Number(b.dataset.b))).map((b) => b.offsetHeight));

  function measure() {
    const sw = stage.clientWidth;
    const sh = stage.clientHeight;
    const mobile = sw < 760;
    const hdr = document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 64;
    // Phones: the reference's 52svh board, made shorter when a beat's copy would reach it
    // (world bottom 40px, 12px gap). Short phones only; the choreography is unchanged.
    if (mobile) stage.style.setProperty("--wh", `${clamp(sh - 40 - copyBottom([2, 3, 4]) - 12, sh * 0.3, sh * 0.52)}px`);
    else stage.style.removeProperty("--wh");
    const k = world.clientHeight / VB.h;
    const copyRight = mobile ? 0 : copy.offsetLeft + copy.offsetWidth;
    let R: number, cx: number, cy: number;
    if (mobile) {
      // ...and the finale ring kept clear of the finale's copy.
      R = Math.min(62, (sw - 24) / 5.5, (sh - 18 - copyBottom([5]) - 10) / 5.015);
      cx = sw / 2;
      cy = sh - 2.55 * R - 18;
    } else {
      R = clamp(Math.min(sh * 0.118, (sw - copyRight - 40) / 5.6), 56, 116);
      cx = (copyRight + sw) / 2 + 10;
      cy = (sh + hdr) / 2 - sh * 0.03;
    }
    M = { sw, sh, mobile, k, wl: world.offsetLeft, wt: world.offsetTop, R, cx, cy, copyRight };
    const hw = Math.sqrt(3) * R * 0.965;
    const hh = 2 * R * 0.965;
    stage.style.setProperty("--hw", `${hw}px`);
    stage.style.setProperty("--hh", `${hh}px`);
    stage.style.setProperty("--R", `${R}px`);
    const pos = (q: number, r: number): Pt => [cx + Math.sqrt(3) * R * (q + r / 2), cy + 1.5 * R * r];
    for (const h of hexes) [h.x, h.y] = pos(h.q, h.r);
    for (const g of ghosts) {
      [g.x, g.y] = pos(g.q, g.r);
      g.ok = mobile ? g.y > cy - 2.2 * R && g.x > R * 0.4 && g.x < sw - R * 0.4 : g.x - R > copyRight + 10 && g.y - R > hdr - R * 0.4 && g.y < sh - R * 0.2;
    }
    // The hidden problem: three touching hexagons on the empty wall
    const SR = mobile ? Math.min(98, (sw - 24) / 3.6) : clamp(Math.min(sh * 0.168, (sw - copyRight - 40) / 3.7), 80, 150);
    const scx = mobile ? sw / 2 : cx;
    const scy = mobile ? sh - 1.75 * SR - 70 : (sh + hdr) / 2 - sh * 0.02;
    stage.style.setProperty("--SR", `${SR}px`);
    const g = 1.04;
    for (const x of stakes) {
      x.x = scx + Math.sqrt(3) * SR * g * (x.q + x.r / 2) - (Math.sqrt(3) * SR * g) / 2;
      x.y = scy + 1.5 * SR * g * x.r - 0.75 * SR * g;
    }
    cap.style.left = `${cx - 3 * R}px`;
    cap.style.width = `${6 * R}px`;
    cap.style.top = `${cy + 2.62 * R}px`;
    drawComb();
  }

  /* ----------------------------------------------------------------- frames ---- */
  const local = (ux: number, uy: number): Pt => [(ux - VB.x) * M.k, (uy - VB.y) * M.k];
  let lastB = -1;
  let miniOn = false;
  let miniRaf = 0;
  let stageVisible = true;

  function miniFrame(time: number) {
    for (const h of hexes) {
      const t = reduce ? MINI_REST : (time / MINI_PERIOD_MS + h.off) % 1;
      const J = h.set(h.fn(t));
      if (h.band) {
        h.band.setAttribute("x2", String(J.ha[0]));
        h.band.setAttribute("y2", String(J.ha[1]));
      }
    }
  }
  function loop(time: number) {
    miniRaf = 0;
    if (!miniOn || !stageVisible || document.hidden) return;
    miniFrame(time);
    miniRaf = requestAnimationFrame(loop);
  }
  const startMini = () => {
    if (reduce) miniFrame(0);
    else if (!miniRaf && miniOn && stageVisible && !document.hidden) miniRaf = requestAnimationFrame(loop);
  };

  function render(p: number) {
    stage.style.setProperty("--p", p.toFixed(3));
    // 01 · sections land, footprint draws
    const s1 = ease(seg(p, 0.1, 0.16)), s2 = ease(seg(p, 0.21, 0.26)), s3 = ease(seg(p, 0.24, 0.29));
    [s1, s2, s3].forEach((t, i) => {
      sections[i].setAttribute("transform", `translate(0 ${(i === 0 ? lerp(40, 0, t) : lerp(-90, 0, t)).toFixed(1)})`);
      sections[i].style.opacity = t.toFixed(3);
    });
    footLine.setAttribute("stroke-dashoffset", (1 - ease(seg(p, 0.13, 0.21))).toFixed(3));
    footFill.setAttribute("opacity", seg(p, 0.17, 0.22).toFixed(3));
    footLab.setAttribute("opacity", seg(p, 0.18, 0.23).toFixed(3));
    // 02 · anchors light from the floor up, carabiners clip in
    const lit = Math.round(seg(p, 0.3, 0.38) * holes.length);
    holes.forEach((h, i) => {
      const lightUp = i < lit;
      if (h.on !== lightUp) {
        h.on = lightUp;
        h.node.classList.toggle("is-lit", lightUp);
        if (lightUp) h.node.setAttribute("filter", "url(#sb-glow)");
        else h.node.removeAttribute("filter");
      }
    });
    cars.forEach((c, i) => {
      const t = ease(seg(p, 0.36 + i * 0.025, 0.39 + i * 0.025));
      c.lt = ease(seg(p, 0.375 + i * 0.025, 0.41 + i * 0.025));
      c.g.setAttribute("transform", `translate(${c.x} ${c.y}) scale(${lerp(2.2, 1.3, t).toFixed(3)})`);
      c.g.setAttribute("opacity", t.toFixed(3));
    });
    // 03-04 · the figure walks in, stretches, pulls the band
    const figIn = ease(seg(p, 0.455, 0.49));
    const sceneOut = 1 - ease(seg(p, 0.83, 0.86));
    figG.setAttribute("opacity", (figIn * sceneOut).toFixed(3));
    shadow.setAttribute("opacity", (figIn * sceneOut).toFixed(3));
    figG.setAttribute("transform", `translate(${lerp(24, 0, figIn).toFixed(1)} 0)`);
    const J = setFig(poseAt(p));
    const bandOn = seg(p, 0.578, 0.59) * (1 - seg(p, 0.83, 0.85));
    const hc = cars[2];
    band.setAttribute("x1", String(hc.x));
    band.setAttribute("y1", String(hc.y + 23));
    band.setAttribute("x2", J.ha[0].toFixed(1));
    band.setAttribute("y2", J.ha[1].toFixed(1));
    band.setAttribute("opacity", bandOn.toFixed(3));
    cars.forEach((c, i) => c.loop.setAttribute("transform", `translate(0 18) scale(1 ${(c.lt * (i === 2 ? 1 - bandOn : 1)).toFixed(3)}) translate(0 -18)`));
    foot.setAttribute("opacity", sceneOut.toFixed(3));
    carsG.setAttribute("opacity", sceneOut.toFixed(3));
    // camera: a gentle push-in on the first section, then the finale lifts the board into the hub
    const s0 = lerp(1.1, 1, ease(seg(p, 0.12, 0.3)));
    const L0 = local(32, 600);
    const Cb = local(32, 298);
    const fz = ease(seg(p, 0.845, 0.905));
    const s1f = (1.5 * M.R) / (604 * M.k);
    const tx = lerp((1 - s0) * L0[0], M.cx - M.wl - s1f * Cb[0], fz);
    const ty = lerp((1 - s0) * L0[1], M.cy - M.wt - s1f * Cb[1], fz);
    world.style.transform = `translate3d(${tx.toFixed(2)}px,${ty.toFixed(2)}px,0) scale(${lerp(s0, s1f, fz).toFixed(4)})`;
    // 05 · six hexagons bloom out of the board
    hub.style.opacity = ease(seg(p, 0.87, 0.91)).toFixed(3);
    hub.style.transform = `translate(${M.cx}px,${M.cy}px) translate(-50%,-50%) scale(${lerp(0.6, 1, ease(seg(p, 0.86, 0.91))).toFixed(3)})`;
    hexes.forEach((h, i) => {
      const t = ease(seg(p, 0.885 + i * 0.012, 0.935 + i * 0.012));
      const x = lerp(M.cx, h.x, t);
      const y = lerp(M.cy, h.y, t);
      h.a.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%) scale(${lerp(0.18, 1, t).toFixed(3)})`;
      h.a.style.opacity = seg(t, 0, 0.35).toFixed(3);
      h.a.style.setProperty("--c", seg(t, 0.65, 1).toFixed(3));
      h.a.tabIndex = t > 0.9 ? 0 : -1;
    });
    const gt = ease(seg(p, 0.95, 0.99));
    for (const g of ghosts) {
      g.d.style.opacity = g.ok ? gt.toFixed(3) : "0";
      g.d.style.transform = `translate(${g.x}px,${g.y}px) translate(-50%,-50%) scale(${lerp(0.85, 1, gt).toFixed(3)})`;
    }
    ring.classList.toggle("is-live", p > 0.95);
    cap.classList.toggle("is-on", p > 0.97);
    const wantMini = p > 0.87;
    if (wantMini && !miniOn) {
      miniOn = true;
      startMini();
    }
    if (!wantMini) miniOn = false;
  }

  function frameRaw(raw: number) {
    render(toBuild(raw));
    // the hidden problem's three hexagons
    stakes.forEach((x, i) => {
      const tin = ease(seg(raw, 0.085 + i * 0.012, 0.115 + i * 0.012));
      const tout = ease(seg(raw, 0.158, 0.172));
      const sc = lerp(0.82, 1, tin) * lerp(1, 0.9, tout);
      x.d.style.opacity = (tin * (1 - tout)).toFixed(3);
      x.d.style.transform = `translate(${x.x.toFixed(1)}px,${x.y.toFixed(1)}px) translate(-50%,-50%) scale(${sc.toFixed(3)})`;
    });
    let b = 0;
    for (let i = 0; i < BEAT_STARTS.length; i++) if (raw >= BEAT_STARTS[i]) b = i;
    if (b !== lastB) {
      lastB = b;
      beats.forEach((e, i) => e.classList.toggle("is-on", i === b));
      dots.forEach((d, i) => d.classList.toggle("is-on", b > i));
      stage.classList.toggle("is-final", b === 5);
    }
  }

  /* -------------------------------------------------------------- wiring ---- */
  const readScroll = () => {
    const r = build.getBoundingClientRect();
    const total = build.offsetHeight - stage.offsetHeight;
    return total > 0 ? clamp(-r.top / total, 0, 1) : 1;
  };
  let prog = reduce ? 1 : readScroll();
  measure();
  miniFrame(0);
  frameRaw(prog);

  const ro = new ResizeObserver(() => {
    measure();
    frameRaw(reduce ? 1 : prog);
  });
  ro.observe(stage);

  const io = new IntersectionObserver(([e]) => {
    stageVisible = e.isIntersecting;
    if (stageVisible) startMini();
  });
  io.observe(stage);
  on(document, "visibilitychange", () => {
    if (!document.hidden) startMini();
  });

  let rotTimer = 0;
  let ri = 0;
  if (!reduce)
    rotTimer = window.setInterval(() => {
      if (lastB !== 0 || document.hidden || !stageVisible || rot.length < 2) return;
      rot[ri].classList.remove("is-on");
      ri = (ri + 1) % rot.length;
      rot[ri].classList.add("is-on");
    }, 2300);

  let ticking = false;
  let scrollRaf = 0;
  if (!reduce)
    on(
      window,
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        scrollRaf = requestAnimationFrame(() => {
          ticking = false;
          prog = readScroll();
          frameRaw(prog);
        });
      },
      { passive: true },
    );

  build.dataset.ready = "true";

  return () => {
    for (const [t, type, fn, opts] of listeners) t.removeEventListener(type, fn, opts);
    ro.disconnect();
    io.disconnect();
    window.clearInterval(rotTimer);
    cancelAnimationFrame(scrollRaf);
    cancelAnimationFrame(miniRaf);
    miniOn = false;
  };
}
