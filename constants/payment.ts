import type { ServiceTier, ScanMode } from "../types/models";

/** Legacy tier prices */
export const TIER_PRICES: Record<ServiceTier, number> = {
  ai_only: 29.99,
  video: 79.99,
  onsite: 149.99,
  workshop: 249.99,
};

/** New scan mode prices */
export const SCAN_MODE_PRICES: Record<ScanMode, number> = {
  quick_seller: 19.99,
  full_ai: 49.99,
  expert: 149.99,
};

/** Scan mode features for payment screen */
export const SCAN_MODE_FEATURES: Record<ScanMode, string[]> = {
  quick_seller: [
    "10 geführte Fotos + 2 Videos",
    "Basis-KI-Analyse",
    "Schadenserkennung",
    "Quick-Bericht in 1h",
    "Verkäufer-Link (kein App-Download)",
  ],
  full_ai: [
    "18 Fotos + 4 Video-Schwenks",
    "Vollständige KI-Analyse",
    "Reifen-DOT & Profil-Analyse",
    "Ölpeilstab-Scan",
    "Serviceheft-Analyse",
    "Detaillierter Bericht in 24h",
  ],
  expert: [
    "Alles aus Vollständiger KI-Inspektion",
    "Zertifizierter Prüfer begutachtet",
    "Verhandlungsberatung",
    "Rechtlich verwertbarer Bericht",
    "Umfassender Bericht in 48h",
  ],
};

/** Legacy tier descriptions (backwards compatible) */
export const TIER_DESCRIPTIONS: Record<ServiceTier, string[]> = {
  ai_only: ["KI-gestützte Fotoanalyse", "Automatische Schadenserkennung", "Kilometerstand-Verifizierung", "Digitaler Bericht in 24h"],
  video: ["Alles aus KI-Analyse", "Live-Videogespräch mit Prüfer", "Interaktive Begutachtung", "Detaillierter Bericht in 24h"],
  onsite: ["Alles aus Video-Inspektion", "Prüfer kommt zum Fahrzeug", "Physische Begutachtung vor Ort", "Ausführlicher Bericht in 48h"],
  workshop: ["Alles aus Vor-Ort-Inspektion", "Vollständige Werkstattprüfung", "Hebebühne & Diagnose", "Umfassender Bericht in 72h"],
};

export type PaymentMethod = "stripe" | "paypal" | "google_pay" | "apple_pay";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  stripe: "Kreditkarte",
  paypal: "PayPal",
  google_pay: "Google Pay",
  apple_pay: "Apple Pay",
};
