import type { CaseStatus, MediaCategory, ServiceTier, Severity, ScanMode } from "../types/models";

// ── Media Categories ──
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

// Extended categories for new scan modes
export type ExtendedCategory = MediaCategory
  | "tire_front_left" | "tire_front_right" | "tire_rear_left" | "tire_rear_right"
  | "engine_bay" | "oil_dipstick" | "registration_doc"
  | "video_front_sweep" | "video_rear_sweep" | "video_left_sweep" | "video_right_sweep";

export const EXTENDED_CATEGORY_LABELS: Record<ExtendedCategory, string> = {
  front: "Front / Vorne",
  rear: "Heck / Hinten",
  left: "Linke Seite",
  right: "Rechte Seite",
  tire: "Reifen (Übersicht)",
  tire_front_left: "Reifen vorne links",
  tire_front_right: "Reifen vorne rechts",
  tire_rear_left: "Reifen hinten links",
  tire_rear_right: "Reifen hinten rechts",
  interior: "Innenraum / Fahrersitz",
  odometer: "Tacho / Kilometerstand",
  service_book: "Serviceheft",
  engine_bay: "Motorraum",
  oil_dipstick: "Ölpeilstab",
  registration_doc: "Fahrzeugschein",
  video_front_sweep: "Video: Front-Schwenk",
  video_rear_sweep: "Video: Heck-Schwenk",
  video_left_sweep: "Video: Linke Seite",
  video_right_sweep: "Video: Rechte Seite",
};

// ── Scan Modes ──
export const SCAN_MODE_LABELS: Record<ScanMode, string> = {
  quick_seller: "Quick Seller Scan",
  full_ai: "Vollständige KI-Inspektion",
  expert: "Experten-Inspektion",
};

export const SCAN_MODE_DESCRIPTIONS: Record<ScanMode, string> = {
  quick_seller: "Schnelle Fernprüfung durch den Verkäufer. Link wird generiert, kein App-Download nötig.",
  full_ai: "Umfassende KI-Analyse mit allen Fotos, Videos und Dokumenten.",
  expert: "Maximale Sicherheit: KI-Analyse plus Begutachtung durch zertifizierten Prüfer.",
};

export const SCAN_MODE_TIMES: Record<ScanMode, string> = {
  quick_seller: "~5 Min.",
  full_ai: "~10 Min.",
  expert: "~20 Min.",
};

export const SCAN_MODE_ICONS: Record<ScanMode, string> = {
  quick_seller: "flash",
  full_ai: "sparkles",
  expert: "shield-checkmark",
};

/** Upload steps per scan mode */
export const SCAN_MODE_STEPS: Record<ScanMode, ExtendedCategory[]> = {
  quick_seller: [
    "front", "rear", "left", "right",
    "video_front_sweep", "video_rear_sweep",
    "odometer", "interior",
    "tire_front_left", "tire_front_right",
  ],
  full_ai: [
    "front", "rear", "left", "right",
    "video_front_sweep", "video_rear_sweep", "video_left_sweep", "video_right_sweep",
    "tire_front_left", "tire_front_right", "tire_rear_left", "tire_rear_right",
    "interior", "odometer",
    "engine_bay", "oil_dipstick",
    "service_book", "registration_doc",
  ],
  expert: [
    "front", "rear", "left", "right",
    "video_front_sweep", "video_rear_sweep", "video_left_sweep", "video_right_sweep",
    "tire_front_left", "tire_front_right", "tire_rear_left", "tire_rear_right",
    "interior", "odometer",
    "engine_bay", "oil_dipstick",
    "service_book", "registration_doc",
  ],
};

// Legacy upload steps (backwards compatible)
export const UPLOAD_STEPS: MediaCategory[] = [
  "front", "rear", "left", "right", "tire", "interior", "odometer", "service_book",
];

// ── Case Status ──
export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  draft: "Entwurf",
  submitted: "Eingereicht",
  reviewing: "In Prüfung",
  completed: "Abgeschlossen",
};

// ── Service Tier (legacy, kept for compatibility) ──
export const SERVICE_TIER_LABELS: Record<ServiceTier, string> = {
  ai_only: "Nur KI-Analyse",
  video: "Video-Inspektion",
  onsite: "Vor-Ort-Inspektion",
  workshop: "Werkstatt-Inspektion",
};

// ── Severity ──
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
