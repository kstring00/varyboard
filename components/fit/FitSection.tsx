import { Reveal } from "@/components/ui/Reveal";
import { fitPlanner } from "@/content/config";
import { board, products } from "@/content/facts";
import { SNAPS_TO_STUDS } from "@/lib/fit";
import { RoomPlannerLazy } from "./RoomPlannerLazy";

export const FIT_ANCHOR = "will-it-fit";

const SPACE = board.minSpacePerUser.replace("x", "×");

/**
 * "Will it fit?" — the room planner with its heading and spec note. H2 on the homepage,
 * H1 on /fit. Copy reads from facts.ts and config.ts: the stud sentence disappears when
 * fitPlanner.mountMethod is "any".
 */
export function FitSection({ standalone = false }: { standalone?: boolean }) {
  const Heading = standalone ? "h1" : "h2";
  const s = board.section;
  return (
    <section id={FIT_ANCHOR} aria-label="Will it fit your home? Try the board in a room" className="fit">
      <div className="container-site">
        <Reveal>
          <p className="eyebrow">Will it fit?</p>
          <Heading className="fit__title">Drag it and see.</Heading>
          <p className="fit__lede" id="fit-lede">
            Grab the board and move it to any wall. {SNAPS_TO_STUDS ? `It snaps to studs ${fitPlanner.studSpacingIn} inches apart, and the` : "The"} mint square shows the {SPACE} of floor you need to use it. Drag empty space to look around.
          </p>
        </Reveal>
        <div className="fit__body">
          <RoomPlannerLazy autoFocus={standalone} roomHeading={standalone ? "h2" : "h3"} />
        </div>
        <p className="fit__note">
          Board drawn to spec: each section is {s.heightIn} × {s.widthIn} × {s.depthIn} in with {board.anchorPointsPerSection} hexagon anchor points. The {products.board.name} stacks {products.board.sections} sections to {products.board.heightIn} in; the XT stacks {products.boardXT.sections} to {products.boardXT.heightIn} in. Shown mounted {fitPlanner.mountBottomIn} in above the floor. Rooms and furniture are for scale.
        </p>
      </div>
    </section>
  );
}
