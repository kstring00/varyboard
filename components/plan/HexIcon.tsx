import type { AudienceIcon } from "@/content/audience";
import type { Lane } from "@/content/intake";

/**
 * Line icons on a 24x24 grid, stroke 1.6, drawn inside a pointy-top hexagon outline.
 * Shared by the audience ticker and the intake's Step 1 tiles so the stroke matches everywhere.
 * Medical uses the Rod of Asclepius (one snake), never the caduceus. No insignia.
 */
export type HexIconName = AudienceIcon | "person";

export const ICONS: Record<HexIconName, React.ReactNode> = {
  star: <path d="M12 3.6l2.5 5.2 5.7.8-4.1 4 1 5.7L12 16.6l-5.1 2.7 1-5.7-4.1-4 5.7-.8z" />,
  shield: <path d="M12 3.2l6.8 2.8v5.4c0 4.2-2.9 7.9-6.8 9.4-3.9-1.5-6.8-5.2-6.8-9.4V6z" />,
  asclepius: (
    <>
      <path d="M12 4.2v16.6" />
      <path d="M9.2 7.6c.4-1.9 4.6-2 4.9-.1.3 1.8-4.6 2.4-4.7 4.4-.1 2 5 2 4.9 4.1-.1 1.9-3.6 2.4-5 1.4" />
      <circle cx="8.7" cy="7.9" r=".9" fill="currentColor" stroke="none" />
    </>
  ),
  clinic: (
    <>
      <path d="M5 20.5V8.5h14v12M3.5 20.5h17" />
      <path d="M12 11v6M9 14h6" />
      <path d="M8 8.5V5h8v3.5" />
    </>
  ),
  heart: <path d="M12 20.2s-7.2-4.5-7.2-9.7A3.9 3.9 0 0 1 12 8.1a3.9 3.9 0 0 1 7.2 2.4c0 5.2-7.2 9.7-7.2 9.7z" />,
  home: (
    <>
      <path d="M4 11.2l8-6.8 8 6.8" />
      <path d="M6.2 10v10.2h11.6V10" />
      <path d="M10.2 20.2v-5.4h3.6v5.4" />
    </>
  ),
  bandage: (
    <>
      <rect x="3.2" y="9.2" width="17.6" height="5.6" rx="2.8" transform="rotate(-45 12 12)" />
      <path d="M10.8 12.2h.01M12 10.9h.01M13.2 12.2h.01M12 13.4h.01" strokeWidth="1.9" />
    </>
  ),
  dumbbell: <path d="M4.2 10v4M7.2 8v8M16.8 8v8M19.8 10v4M7.2 12h9.6" />,
  clipboard: (
    <>
      <path d="M9.2 4.5h5.6v2.6H9.2zM9.2 5.6H6.4v14.9h11.2V5.6h-2.8" />
      <path d="M9.4 13.3l1.9 1.9 3.6-3.8" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="8.2" r="3.4" />
      <path d="M5.2 20.4c.6-3.9 3.3-6 6.8-6s6.2 2.1 6.8 6" />
    </>
  ),
};

/** Icon for each intake lane, matching the ticker's vocabulary. */
export const LANE_ICON: Record<Lane, HexIconName> = {
  me: "person",
  loved: "heart",
  mil: "shield",
  clinic: "asclepius",
  athlete: "dumbbell",
};

export function HexIcon({ icon, className = "ticker__hex" }: { icon: HexIconName; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 46" aria-hidden="true" focusable="false">
      <polygon className="ticker__hex-cell" points="20,1.5 38,11.75 38,34.25 20,44.5 2,34.25 2,11.75" />
      <g transform="translate(8 11)" className="ticker__hex-icon">
        {ICONS[icon]}
      </g>
    </svg>
  );
}

/** The Y vertex mark from the honeycomb system, used as a separator. */
export function VertexMark({ className = "ticker__sep" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 12 12" aria-hidden="true" focusable="false">
      <path d="M6 6V1.2M6 6l-4.2 2.4M6 6l4.2 2.4" />
    </svg>
  );
}
