import type { Lane } from "@/content/intake";

/**
 * Line icons on a 24x24 grid, stroke 1.6, drawn inside a pointy-top hexagon outline.
 * The intake's Step 1 tiles, one per lane. Medical uses the Rod of Asclepius (one snake),
 * never the caduceus. No insignia.
 */
export type HexIconName = "person" | "heart" | "shield" | "asclepius" | "dumbbell";

export const ICONS: Record<HexIconName, React.ReactNode> = {
  shield: <path d="M12 3.2l6.8 2.8v5.4c0 4.2-2.9 7.9-6.8 9.4-3.9-1.5-6.8-5.2-6.8-9.4V6z" />,
  asclepius: (
    <>
      <path d="M12 4.2v16.6" />
      <path d="M9.2 7.6c.4-1.9 4.6-2 4.9-.1.3 1.8-4.6 2.4-4.7 4.4-.1 2 5 2 4.9 4.1-.1 1.9-3.6 2.4-5 1.4" />
      <circle cx="8.7" cy="7.9" r=".9" fill="currentColor" stroke="none" />
    </>
  ),
  heart: <path d="M12 20.2s-7.2-4.5-7.2-9.7A3.9 3.9 0 0 1 12 8.1a3.9 3.9 0 0 1 7.2 2.4c0 5.2-7.2 9.7-7.2 9.7z" />,
  dumbbell: <path d="M4.2 10v4M7.2 8v8M16.8 8v8M19.8 10v4M7.2 12h9.6" />,
  person: (
    <>
      <circle cx="12" cy="8.2" r="3.4" />
      <path d="M5.2 20.4c.6-3.9 3.3-6 6.8-6s6.2 2.1 6.8 6" />
    </>
  ),
};

/** Icon for each intake lane. */
export const LANE_ICON: Record<Lane, HexIconName> = {
  me: "person",
  loved: "heart",
  mil: "shield",
  clinic: "asclepius",
  athlete: "dumbbell",
};

export function HexIcon({ icon, className }: { icon: HexIconName; className: string }) {
  return (
    <svg className={className} viewBox="0 0 40 46" aria-hidden="true" focusable="false">
      <polygon className="hexicon__cell" points="20,1.5 38,11.75 38,34.25 20,44.5 2,34.25 2,11.75" />
      <g transform="translate(8 11)" className="hexicon__glyph">
        {ICONS[icon]}
      </g>
    </svg>
  );
}
