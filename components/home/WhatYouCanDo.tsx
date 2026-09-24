import { DraftBanner } from "@/components/plan/DraftBanner";
import { GenreExplorer, type GenreCard } from "@/components/genres/GenreExplorer";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ANCHORS, GENRE_LIST, fillFacts, unreviewedGenres } from "@/content/genres";
import { products } from "@/content/facts";

/**
 * WHAT YOU CAN DO (#how-it-works; the header's "How it works" lands here). The six kinds of
 * practice as one hexagon. All copy from content/genres.ts; anchor counts from facts.ts.
 */
export function WhatYouCanDo() {
  const cards: GenreCard[] = GENRE_LIST.map((g) => ({
    key: g.key,
    plainName: g.plainName,
    clinicalName: g.clinicalName,
    whatItIs: g.whatItIs ? fillFacts(g.whatItIs.value) : null,
    how: g.howTheBoardDoesIt ? fillFacts(g.howTheBoardDoesIt.value) : null,
    example: g.exampleMove ? fillFacts(g.exampleMove.value) : null,
  }));
  return (
    <section id="how-it-works" aria-labelledby="do-title" className="wycd">
      <div className="container-site">
        <DraftBanner items={unreviewedGenres()} />
        <Reveal>
          <SectionHeading
            eyebrow="What you can do"
            title={<span id="do-title">Six kinds of practice. One wall.</span>}
            intro={`Every side of the hexagon is one way to use the board. The ${products.board.name} has ${ANCHORS.board} anchor points (${ANCHORS.perSection} per section) to hold, clip and reach for.`}
          />
        </Reveal>
        <div className="wycd__body">
          <GenreExplorer cards={cards} />
        </div>
      </div>
    </section>
  );
}
