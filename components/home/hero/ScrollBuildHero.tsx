import { existsSync } from "node:fs";
import path from "node:path";
import { vaPacket } from "@/content/config";
import { fill, HERO, heroProof, heroQuote, splitSwap } from "@/content/hero";
import { INLINE_ANCHOR, link } from "@/content/routes";
import { SOURCES } from "@/content/sources";
import { BoardSvg } from "./BoardSvg";
import { GenreRing, GenreRingBackground } from "./GenreRing";
import { ScrollBuildStage } from "./ScrollBuildStage";
import { StakesHexes } from "./StakesHexes";

/**
 * HERO: the scroll-build (reference/varyboard-scroll-build.html). A 760vh section with a sticky
 * 100svh stage: the Vary Board is drawn piece by piece as you scroll, over six copy beats.
 * Native scroll only; ScrollBuildStage reads it in a rAF-throttled passive listener.
 *
 * Server-rendered at scroll position 0: the H1 (the page's only H1) is in the HTML and stays in
 * the accessibility tree at every scroll position. Inactive beats are visibility:hidden, so every
 * beat's text is also in the sr-only block, in order; the visual beats are aria-hidden except
 * the H1 and the finale's links.
 *
 * prefers-reduced-motion: no pin, no extra height; the finale's final state, drawn once.
 */
const Arrow = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path d="M3 9h11m-4-4 4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** The provider packet PDF once Eric supplies it; until then the military plan, which ends in the printable provider page. */
const packetHref = () => (existsSync(path.join(process.cwd(), "public", vaPacket.pdfPath)) ? vaPacket.pdfPath : link("/plan", { query: "for=mil" }).href);

export function ScrollBuildHero() {
  const { hook, problem, space, served, program, finale } = HERO;
  const quote = heroQuote();
  const proof = heroProof();
  const swap = splitSwap(space.swap.value);
  const whoList = (
    <>
      Built for{" "}
      {finale.who.map((w, i) => (
        <span key={w}>
          <b>{w}</b>
          {i < finale.who.length - 2 ? ", " : i === finale.who.length - 2 ? " and " : "."}
        </span>
      ))}
    </>
  );
  const stars = (n: number) => "★".repeat(n);
  const cite = (k: keyof typeof SOURCES) => SOURCES[k];

  return (
    <>
      <ScrollBuildStage>
        <div className="sb-stage" data-sb="stage">
          <div className="sb-light" aria-hidden="true" />
          <svg className="sb-comb" data-sb="comb" aria-hidden="true" focusable="false" />
          <div className="sb-floor" aria-hidden="true" />
          <GenreRingBackground />

          <div className="sb-world" data-sb="world" aria-hidden="true">
            <BoardSvg />
          </div>

          <div className="sb-copy" data-sb="copy">
            {/* 0 · Hook. Opacity only, never visibility, so the H1 is always in the accessibility tree. */}
            <div className="sb-beat sb-beat--hook is-on" data-b="0">
              <p className="sb-eyebrow" aria-hidden="true">
                {hook.eyebrow.value}
              </p>
              <h1 className="sb-h1" id="sb-title">
                {hook.headline.lead} <em>{hook.headline.accent}</em>
              </h1>
              <p className="sb-kg" aria-hidden="true">
                {hook.rotatePrefix}{" "}
                <span className="sb-rot" data-sb="rot">
                  {hook.rotating.map((r, i) => (
                    <span key={r} className={i === 0 ? "is-on" : undefined}>
                      {r}
                    </span>
                  ))}
                </span>
                <span className="sb-rot-static">{hook.rotatingStatic}</span>
              </p>
              <span className="sb-cue" aria-hidden="true">
                <span />
                {hook.cue}
              </span>
            </div>

            {/* Every beat's text, in order, for screen readers (the visual beats below are aria-hidden). */}
            <div className="sr-only">
              <p>{hook.eyebrow.value}</p>
              <p>
                {hook.rotatePrefix} {hook.rotatingStatic}
              </p>
              <p>{problem.eyebrow}</p>
              <h2>
                {problem.headline.lead} {problem.headline.accent}
              </h2>
              <p>{problem.lead.value}</p>
              <ul>
                {problem.stats.map((s) => (
                  <li key={s.key}>
                    {s.figure} {s.caption.value} ({cite(s.source).short})
                  </li>
                ))}
              </ul>
              <p>{space.eyebrow}</p>
              <h2>{fill(space.headline.value)}</h2>
              <p>{fill(space.lead.value)}</p>
              <p>{space.swap.value}.</p>
              <p>{served.eyebrow}</p>
              <h2>{served.headline.value}</h2>
              <ul>
                {served.stats.map((s) => (
                  <li key={s.key}>
                    {fill(s.figure)} {s.caption.value}
                  </li>
                ))}
              </ul>
              <p>{served.lead.value}</p>
              <p>Sources: {served.sources.map((k) => `${cite(k).authors}, ${cite(k).journal ? `${cite(k).journal}, ` : ""}${cite(k).year}`).join("; ")}.</p>
              <p>{program.eyebrow}</p>
              <h2>{program.headline}</h2>
              <p>{program.lead.value}</p>
              <figure>
                <blockquote>{quote.text}</blockquote>
                <figcaption>
                  {quote.author}, {quote.context}
                  {quote.stars ? `, ${quote.stars} out of 5 stars` : ""}
                </figcaption>
              </figure>
              <p>{finale.eyebrow}</p>
              <h2>
                {finale.headline.lead} {finale.headline.accent} {finale.headline.tail}
              </h2>
              <p>{whoList}</p>
              <p>
                {proof.reviews}. {proof.price}.
              </p>
            </div>

            <div className="sb-beat" data-b="1" aria-hidden="true">
              <p className="sb-eyebrow">{problem.eyebrow}</p>
              <h2 className="sb-h2">
                {problem.headline.lead} <em className="sb-accent">{problem.headline.accent}</em>
              </h2>
              <p className="sb-lead">{problem.lead.value}</p>
            </div>

            <div className="sb-beat" data-b="2" aria-hidden="true">
              <p className="sb-eyebrow">{space.eyebrow}</p>
              <h2 className="sb-h2">{fill(space.headline.value)}</h2>
              <p className="sb-lead">
                {fill(space.lead.value)
                  .split(/(The Vary Board)/)
                  .map((part, i) => (part === "The Vary Board" ? <strong key={i}>{part}</strong> : part))}
              </p>
              <p className="sb-swap">
                {swap.lead}{" "}
                {swap.items.map((it) => (
                  <span key={it}>{it}</span>
                ))}
              </p>
            </div>

            <div className="sb-beat" data-b="3" aria-hidden="true">
              <p className="sb-eyebrow">{served.eyebrow}</p>
              <h2 className="sb-h2">{served.headline.value}</h2>
              <div className="sb-mstats">
                {served.stats.map((s) => (
                  <div key={s.key} className={"solution" in s && s.solution ? "sb-mstats__sol" : undefined}>
                    <b>{fill(s.figure)}</b>
                    <span>{s.caption.value}</span>
                  </div>
                ))}
              </div>
              <p className="sb-lead sb-mlead">
                <span className="sb-mlead__dk">{served.lead.value}</span>
                <span className="sb-mlead__mb">{served.leadShort.value}</span>
              </p>
              <p className="sb-msrc">
                {served.sources.map((k, i) => (
                  <span key={k}>
                    {i > 0 && " · "}
                    {cite(k).authors.replace(" (via Sword Health)", "")}, {cite(k).journal && <i>{cite(k).journal}</i>}
                    {cite(k).journal && ", "}
                    {cite(k).year}
                  </span>
                ))}
              </p>
            </div>

            <div className="sb-beat" data-b="4" aria-hidden="true">
              <p className="sb-eyebrow">{program.eyebrow}</p>
              <h2 className="sb-h2">{program.headline}</h2>
              <p className="sb-lead">{program.lead.value}</p>
              <figure className="sb-quote">
                <blockquote>&ldquo;{quote.text}&rdquo;</blockquote>
                <figcaption>
                  {quote.author} · {quote.context}
                  {quote.stars ? ` · ${stars(quote.stars)}` : ""}
                </figcaption>
              </figure>
            </div>

            <div className="sb-beat" data-b="5">
              <p className="sb-eyebrow" aria-hidden="true">
                {finale.eyebrow}
              </p>
              <h2 className="sb-h1" aria-hidden="true">
                {finale.headline.lead} <em>{finale.headline.accent}</em> {finale.headline.tail}
              </h2>
              <p className="sb-who" aria-hidden="true">
                {whoList}
              </p>
              <p className="sb-proof" aria-hidden="true">
                <span className="sb-proof__stars">{stars(proof.stars)}</span> {proof.reviews} <i /> {proof.price}
              </p>
              <div className="sb-ctas">
                <a className="sb-btn" href={`#${INLINE_ANCHOR}`}>
                  {finale.cta} <Arrow />
                </a>
              </div>
              <p className="sb-va">
                {finale.va.value} <a href={packetHref()}>{finale.vaLink}</a>
              </p>
            </div>
          </div>

          <GenreRing />
          <StakesHexes />
          <div className="sb-progress" data-sb="progress">
            {[0, 1, 2, 3, 4].map((i) => (
              <i key={i} aria-hidden="true" />
            ))}
            <a className="sb-skip" href="#how-it-works">
              {HERO.progressLabel}
            </a>
          </div>
        </div>
      </ScrollBuildStage>
      <div id="hero-end" aria-hidden="true" />
    </>
  );
}
