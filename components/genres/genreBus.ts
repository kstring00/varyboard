import type { Genre } from "@/content/intake";

/**
 * Tiny window-event channel between the audience chips ("Who it's for") and the hexagon
 * ("What you can do"). No shared React tree needed: the two sections are separate islands.
 *   hint:   a chip is hovered or focused -> light that side (null clears it)
 *   select: a chip is clicked -> open that genre's card and bring the hexagon into view
 */
export const GENRE_HINT = "vb:genre-hint";
export const GENRE_SELECT = "vb:genre-select";

export const genreCardId = (g: Genre) => `genre-${g}`;

export function hintGenre(g: Genre | null) {
  window.dispatchEvent(new CustomEvent<Genre | null>(GENRE_HINT, { detail: g }));
}
export function selectGenre(g: Genre) {
  window.dispatchEvent(new CustomEvent<Genre>(GENRE_SELECT, { detail: g }));
}
