import type { ServiceTier } from "../types/models";

/** Prices in EUR per inspection tier */
export const TIER_PRICES: Record<ServiceTier, number> = {
  ai_only: 29.99,
  video: 79.99,
  onsite: 149.99,
  workshop: 249.99,
};

/** Tier descriptions for payment screen */
export const TIER_DESCRIPTIONS: Record<ServiceTier, string[]> = {
  ai_only: [
    "KI-gestützte Fotoanalyse",
    "Automatische Schadenserkennung",
    "Kilometerstand-Verifizierung",
    "Digitaler Bericht in 24h",
  ],
  video: [
    "Alles aus KI-Analyse",
    "Live-Videogespräch mit Prüfer",
    "Interaktive Begutachtung",
    "Detaillierter Bericht in 24h",
  ],
  onsite: [
    "Alles aus Video-Inspektion",
    "Prüfer kommt zum Fahrzeug",
    "Physische Begutachtung vor Ort",
    "Ausführlicher Bericht in 48h",
  ],
  workshop: [
    "Alles aus Vor-Ort-Inspektion",
    "Vollständige Werkstattprüfung",
    "Hebebühne & Diagnose",
    "Umfassender Bericht in 72h",
  ],
};

export type PaymentMethod = "stripe" | "paypal" | "google_pay" | "apple_pay";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  stripe: "Kreditkarte",
  paypal: "PayPal",
  google_pay: "Google Pay",
  apple_pay: "Apple Pay",
};
