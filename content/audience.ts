import type { Lane } from "./intake";

/**
 * Who the Vary Board serves: the hero's closing ticker. Each item links into the intake at its
 * lane. Icons are simple line drawings; medical uses the Rod of Asclepius (one snake), never the
 * caduceus, and there is no VA seal or branch insignia anywhere.
 */
export type AudienceIcon = "star" | "shield" | "asclepius" | "clinic" | "heart" | "home" | "bandage" | "dumbbell" | "clipboard";

export interface AudienceItem {
  label: string;
  lane: Lane;
  icon: AudienceIcon;
}

export const audience: AudienceItem[] = [
  { label: "Veterans", lane: "mil", icon: "star" },
  { label: "Active Duty", lane: "mil", icon: "shield" },
  { label: "Physical Therapists", lane: "clinic", icon: "asclepius" },
  { label: "Clinics & Hospitals", lane: "clinic", icon: "clinic" },
  { label: "Caregivers", lane: "loved", icon: "heart" },
  { label: "Aging Well at Home", lane: "me", icon: "home" },
  { label: "Post-Surgery Recovery", lane: "me", icon: "bandage" },
  { label: "Athletes", lane: "athlete", icon: "dumbbell" },
  { label: "Coaches & Trainers", lane: "athlete", icon: "clipboard" },
];
