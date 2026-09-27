/**
 * The colour tokens as values, for renderers that cannot read CSS variables: the OG images
 * (satori, sharp), the browser theme colour, and the 3D room planner (three.js).
 * The source of truth is the :root block at the top of app/globals.css; these must match it
 * exactly (npm run check:colors fails if they drift). Same roles, same rules.
 */
export const COLORS = {
  bg: "#f1efea",
  surface: "#fbfaf7",
  brand: "#1b4753",
  ink: "#15303a",
  ink2: "#4b5e63",
  ink3: "#586a6d",
  accentText: "#256a85",
  product: "#3f9dc0",
  progress: "#62bba6",
  progressSoft: "#9ed6c6",
  onBrand: "#ffffff",
  onBrand2: "#cfe2de",
  lineCool: "#c9d3cf",
  fitStage: "#e8e5de",
} as const;
