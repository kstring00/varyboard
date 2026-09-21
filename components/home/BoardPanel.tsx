import Image from "next/image";
import Link from "next/link";
import { BoardDiagram } from "@/components/BoardDiagram";
import { formatPrice, products } from "@/content/facts";

/**
 * Hero product panel: both boards side by side on a shared baseline, the XT 4/3 taller.
 * Sits inside the honeycomb shader (transparent). Pass `photoSrc` to show a real photo of
 * the two boards instead of the line drawings; the labels stay the same.
 */
export function BoardPanel({ photoSrc, photoAlt }: { photoSrc?: string; photoAlt?: string }) {
  const std = products.board;
  const xt = products.boardXT;
  const labels = (
    <div className="board-panel__labels">
      <Link href={std.path} className="board-panel__label">
        <span className="board-panel__name">{std.name}</span>
        <span className="board-panel__spec">75 in · 3 sections</span>
        <span className="board-panel__price">{formatPrice(std.price)}</span>
      </Link>
      <Link href={xt.path} className="board-panel__label">
        <span className="board-panel__name">{xt.name}</span>
        <span className="board-panel__spec">100 in · 4 sections · for 6&apos;3&quot; and taller</span>
        <span className="board-panel__price">{formatPrice(xt.price)}</span>
      </Link>
    </div>
  );

  if (photoSrc) {
    return (
      <div className="board-panel">
        <div className="board-panel__photo">
          <Image src={photoSrc} alt={photoAlt ?? "The Vary Board and the Vary Board XT side by side"} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-contain object-bottom" />
        </div>
        {labels}
        <Link href="#pricing" className="board-panel__compare">
          Compare
        </Link>
      </div>
    );
  }

  return (
    <div className="board-panel">
      <div className="board-panel__boards">
        <Link href={std.path} className="board-panel__board" aria-label={`${std.name}, 75 inches, 3 sections, ${formatPrice(std.price)}`}>
          <BoardDiagram sections={3} title={`${std.name}: 3 sections, 75 inches`} />
        </Link>
        <Link href={xt.path} className="board-panel__board board-panel__board--xt" aria-label={`${xt.name}, 100 inches, 4 sections, ${formatPrice(xt.price)}`}>
          <BoardDiagram sections={4} title={`${xt.name}: 4 sections, 100 inches`} />
        </Link>
      </div>
      {labels}
      <Link href="#pricing" className="board-panel__compare">
        Compare
      </Link>
    </div>
  );
}
