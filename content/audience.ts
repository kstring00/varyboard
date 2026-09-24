import type { AudienceKey } from "./audiences";

/**
 * Who the Vary Board serves: the hero's closing ticker. Each item scrolls to one of the four
 * audience cards in "Who it's for" (content/audiences.ts); caregivers and aging well at home
 * fold into patients & families. Icons are simple line drawings; medical uses the Rod of Asclepius (one snake), never the
 * caduceus, and there is no VA seal or branch insignia anywhere.
 */
export type AudienceIcon = "star" | "shield" | "asclepius" | "clinic" | "heart" | "home" | "bandage" | "dumbbell" | "clipboard";

export interface AudienceItem {
  label: string;
  audience: AudienceKey;
  icon: AudienceIcon;
}

export const audience: AudienceItem[] = [
  { label: "Veterans", audience: "military", icon: "star" },
  { label: "Active Duty", audience: "military", icon: "shield" },
  { label: "Physical Therapists", audience: "clinics", icon: "asclepius" },
  { label: "Clinics & Hospitals", audience: "clinics", icon: "clinic" },
  { label: "Caregivers", audience: "patients", icon: "heart" },
  { label: "Aging Well at Home", audience: "patients", icon: "home" },
  { label: "Post-Surgery Recovery", audience: "patients", icon: "bandage" },
  { label: "Athletes", audience: "athletes", icon: "dumbbell" },
  { label: "Coaches & Trainers", audience: "athletes", icon: "clipboard" },
];
