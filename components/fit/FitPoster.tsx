import Image from "next/image";
import { ROOMS } from "@/content/rooms";
import { MODELS, fitSummary } from "@/lib/fit";
import { products } from "@/content/facts";

/** Real render of the bedroom scene, captured from the planner itself (scripts/fit-poster.mjs). */
export const POSTER = {
  src: "/images/fit/poster-bedroom.jpg",
  alt: `The ${products.board.name} on the left wall of a ${ROOMS[0].meta.split(" ·")[0]} guest bedroom, drawn to scale, with a mint square on the floor marking the 3 by 3 foot space in front of it.`,
  width: 1280,
  height: 760,
};

const spotsWord = (n: number) => (n === 1 ? "1 good spot" : `${n} good spots`);

/**
 * What stands in for the canvas: before the visitor taps (a still of the scene and one
 * button), while the chunk loads, and when WebGL is unavailable (the still plus a plain
 * text room-by-room summary from the same rules).
 */
export function FitPoster({ onTap, loading = false, fallback = false }: { onTap?: () => void; loading?: boolean; fallback?: boolean }) {
  const image = <Image src={POSTER.src} alt={POSTER.alt} fill sizes="(min-width: 920px) 62vw, 100vw" className="fit-poster__img" />;
  if (fallback) {
    const rows = fitSummary();
    return (
      <div className="fit-planner fit-planner--fallback">
        <div className="fit-stage fit-stage--still">{image}</div>
        <aside className="fit-status" aria-label="Fit check">
          <p className="eyebrow">Room by room</p>
          <p className="fit-status__meta">The 3D view needs WebGL, which this browser has turned off. Here is what it shows, in words:</p>
          <ul className="fit-summary">
            {rows.map((r, i) => (
              <li key={r.room}>
                <strong>{r.room}</strong> ({ROOMS[i].meta}): {spotsWord(r.std)} for the {MODELS.std.name}
                {r.xt ? `, ${spotsWord(r.xt)} for the ${MODELS.xt.name}.` : `. The ${MODELS.xt.name} is too tall for this room.`}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    );
  }
  return (
    <div className="fit-stage fit-stage--still">
      {image}
      <button type="button" className="fit-poster__tap" onClick={onTap} disabled={loading} aria-busy={loading}>
        <span className="fit-poster__label">{loading ? "Loading the room…" : "Tap to try it"}</span>
      </button>
    </div>
  );
}
