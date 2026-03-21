/**
 * Tire Analysis Service
 * MVP: Mock analysis
 * Production: YOLOv12 + OCR for DOT codes
 */

export interface TireAnalysis {
  position: "front_left" | "front_right" | "rear_left" | "rear_right";
  treadDepth: number; // mm
  treadStatus: "good" | "acceptable" | "replace";
  dotCode: string | null;
  manufacturingWeek: number | null;
  manufacturingYear: number | null;
  ageYears: number | null;
  ageWarning: boolean;
  unevenWear: boolean;
  sidewallDamage: boolean;
  overallScore: number; // 0-100
}

export interface TireReport {
  tires: TireAnalysis[];
  overallScore: number;
  recommendation: string;
  estimatedReplacementCost: number;
}

const POSITIONS = ["front_left", "front_right", "rear_left", "rear_right"] as const;
const POSITION_LABELS: Record<string, string> = {
  front_left: "Vorne links",
  front_right: "Vorne rechts",
  rear_left: "Hinten links",
  rear_right: "Hinten rechts",
};

/**
 * Analyze tire photos. Mock for MVP.
 * Production: Use YOLOv12 for tread + OCR for DOT codes.
 */
export async function analyzeTires(imageUris: string[]): Promise<TireReport> {
  await delay(1200);

  const currentYear = new Date().getFullYear();
  const tires: TireAnalysis[] = POSITIONS.map((pos, i) => {
    const treadDepth = 2 + Math.random() * 6; // 2-8mm
    const mfgYear = currentYear - Math.floor(Math.random() * 7); // 0-7 years old
    const mfgWeek = 1 + Math.floor(Math.random() * 52);
    const age = currentYear - mfgYear;

    return {
      position: pos,
      treadDepth: Math.round(treadDepth * 10) / 10,
      treadStatus: treadDepth < 3 ? "replace" : treadDepth < 4 ? "acceptable" : "good",
      dotCode: `DOT ${mfgWeek.toString().padStart(2, "0")}${mfgYear.toString().slice(-2)}`,
      manufacturingWeek: mfgWeek,
      manufacturingYear: mfgYear,
      ageYears: age,
      ageWarning: age >= 6,
      unevenWear: Math.random() > 0.7,
      sidewallDamage: Math.random() > 0.85,
      overallScore: Math.round(Math.max(20, 100 - (8 - treadDepth) * 10 - age * 5)),
    };
  });

  const avgScore = Math.round(tires.reduce((s, t) => s + t.overallScore, 0) / tires.length);
  const needsReplacement = tires.filter(t => t.treadStatus === "replace").length;
  const oldTires = tires.filter(t => t.ageWarning).length;

  let recommendation = "Reifen in gutem Zustand.";
  let cost = 0;
  if (needsReplacement > 0) {
    recommendation = `${needsReplacement} Reifen müssen ersetzt werden.`;
    cost = needsReplacement * 120;
  } else if (oldTires > 0) {
    recommendation = `${oldTires} Reifen sind älter als 6 Jahre — Austausch empfohlen.`;
    cost = oldTires * 120;
  } else if (tires.some(t => t.treadStatus === "acceptable")) {
    recommendation = "Reifen nutzbar, aber bald fällig für Austausch.";
  }

  return { tires, overallScore: avgScore, recommendation, estimatedReplacementCost: cost };
}

export { POSITION_LABELS };
function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }
