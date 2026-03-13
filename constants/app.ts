import type { CaseStatus, MediaCategory, ServiceTier, Severity } from "../types/models";

export const MEDIA_CATEGORY_LABELS: Record<MediaCategory, string> = {
  front: "Front / Vorne",
  rear: "Heck / Hinten",
  left: "Linke Seite",
  right: "Rechte Seite",
  tire: "Reifen",
  interior: "Innenraum / Fahrersitz",
  odometer: "Tacho / Kilometerstand",
  service_book: "Serviceheft",
};

export const UPLOAD_STEPS: MediaCategory[] = [
  "front", "rear", "left", "right", "tire", "interior", "odometer", "service_book",
];

export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  draft: "Entwurf",
  submitted: "Eingereicht",
  reviewing: "In Prüfung",
  completed: "Abgeschlossen",
};

export const SERVICE_TIER_LABELS: Record<ServiceTier, string> = {
  ai_only: "Nur KI-Analyse",
  video: "Video-Inspektion",
  onsite: "Vor-Ort-Inspektion",
  workshop: "Werkstatt-Inspektion",
};

export const SEVERITY_COLORS: Record<Severity, string> = {
  low: "#22C55E",
  medium: "#F59E0B",
  high: "#EF4444",
};

export const SEVERITY_LABELS: Record<Severity, string> = {
  low: "Gering",
  medium: "Mittel",
  high: "Hoch",
};
