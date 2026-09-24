"use client";

import type { Genre } from "@/content/intake";
import { genreCardId, hintGenre, selectGenre } from "./genreBus";

/**
 * A small hexagon chip for one genre. Hover or focus lights that side of the hexagon in
 * "What you can do"; a click opens that genre's card there. Without JavaScript it is a plain
 * link to the card.
 */
export function GenreChip({ genre, label }: { genre: Genre; label: string }) {
  return (
    <a
      href={`#${genreCardId(genre)}`}
      className="gchip"
      onMouseEnter={() => hintGenre(genre)}
      onMouseLeave={() => hintGenre(null)}
      onFocus={() => hintGenre(genre)}
      onBlur={() => hintGenre(null)}
      onClick={(e) => {
        e.preventDefault();
        hintGenre(null);
        selectGenre(genre);
      }}
      data-genre-chip={genre}
    >
      <svg viewBox="0 0 14 16" width="12" height="14" aria-hidden="true">
        <path d="M7 1 13 4.5v7L7 15 1 11.5v-7Z" />
      </svg>
      {label}
    </a>
  );
}
