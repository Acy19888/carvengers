/**
 * German Environmental Sticker Check (Umweltplakette)
 * Determines which sticker a vehicle qualifies for based on emissions class.
 */

export type StickerType = "green" | "yellow" | "red" | "none";

export interface UmweltplaketteResult {
  sticker: StickerType;
  label: string;
  color: string;
  euroClass: string;
  zoneAccess: string;
  description: string;
}

const STICKER_INFO: Record<StickerType, { label: string; color: string; zoneAccess: string }> = {
  green: { label: "Grüne Plakette", color: "#22C55E", zoneAccess: "Zufahrt zu allen Umweltzonen erlaubt" },
  yellow: { label: "Gelbe Plakette", color: "#F59E0B", zoneAccess: "Eingeschränkter Zugang — viele Städte gesperrt" },
  red: { label: "Rote Plakette", color: "#EF4444", zoneAccess: "Kein Zugang zu den meisten Umweltzonen" },
  none: { label: "Keine Plakette", color: "#94A3B8", zoneAccess: "Kein Zugang zu Umweltzonen" },
};

/**
 * Determine sticker based on fuel type and vehicle year.
 * Simplified logic — in production use emissions class from registration doc.
 */
export function checkUmweltplakette(
  fuelType: "petrol" | "diesel" | "hybrid" | "electric" | "lpg",
  year: number,
  euroClass?: string,
): UmweltplaketteResult {
  let sticker: StickerType;
  let euro: string;

  if (fuelType === "electric") {
    sticker = "green";
    euro = "Emissionsfrei";
  } else if (fuelType === "hybrid") {
    sticker = "green";
    euro = "Euro 5+";
  } else if (fuelType === "diesel") {
    if (year >= 2015) { sticker = "green"; euro = "Euro 6"; }
    else if (year >= 2011) { sticker = "green"; euro = "Euro 5"; }
    else if (year >= 2006) { sticker = "green"; euro = "Euro 4"; }
    else if (year >= 2001) { sticker = "yellow"; euro = "Euro 3"; }
    else if (year >= 1997) { sticker = "red"; euro = "Euro 2"; }
    else { sticker = "none"; euro = "Euro 1 oder älter"; }
  } else {
    // Petrol / LPG
    if (year >= 2006) { sticker = "green"; euro = "Euro 4+"; }
    else if (year >= 2001) { sticker = "green"; euro = "Euro 3 (Benzin)"; }
    else if (year >= 1993) { sticker = "green"; euro = "Euro 1 mit Kat"; }
    else { sticker = "none"; euro = "Ohne Katalysator"; }
  }

  if (euroClass) euro = euroClass;

  const info = STICKER_INFO[sticker];

  return {
    sticker,
    label: info.label,
    color: info.color,
    euroClass: euro,
    zoneAccess: info.zoneAccess,
    description: sticker === "green"
      ? "Dieses Fahrzeug darf alle deutschen Umweltzonen befahren."
      : sticker === "yellow"
      ? "Einige deutsche Städte verweigern diesem Fahrzeug die Einfahrt in Umweltzonen."
      : sticker === "red"
      ? "Die meisten deutschen Umweltzonen sind für dieses Fahrzeug gesperrt."
      : "Dieses Fahrzeug hat keinen Anspruch auf eine Umweltplakette.",
  };
}
