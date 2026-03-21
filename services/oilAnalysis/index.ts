/**
 * Oil Dipstick Analysis Service
 * MVP: Mock analysis
 * Production: Computer vision for oil color/level
 */

export interface OilAnalysis {
  healthScore: number; // 0-100
  level: "ok" | "low" | "critical";
  condition: "clean" | "used" | "dirty" | "contaminated";
  milkyContamination: boolean;
  sludge: boolean;
  recommendation: string;
}

/**
 * Analyze oil dipstick photo. Mock for MVP.
 */
export async function analyzeOilDipstick(imageUri: string): Promise<OilAnalysis> {
  await delay(1000);

  const score = 40 + Math.floor(Math.random() * 55);
  const milky = Math.random() > 0.9;
  const sludge = Math.random() > 0.85;

  const level = score > 70 ? "ok" : score > 40 ? "low" : "critical";
  const condition = milky ? "contaminated"
    : sludge ? "dirty"
    : score > 70 ? "clean"
    : "used";

  let recommendation = "Ölstand und Zustand in Ordnung.";
  if (milky) recommendation = "ACHTUNG: Milchige Verfärbung — mögliche Kühlmittelkontamination. Werkstatt empfohlen.";
  else if (sludge) recommendation = "Ablagerungen erkannt. Ölwechsel dringend empfohlen.";
  else if (level === "low") recommendation = "Ölstand niedrig — bitte nachfüllen oder Ölwechsel durchführen.";
  else if (level === "critical") recommendation = "Ölstand kritisch niedrig — nicht weiterfahren!";
  else if (condition === "used") recommendation = "Öl gebraucht, Ölwechsel bald empfohlen.";

  return { healthScore: score, level, condition, milkyContamination: milky, sludge, recommendation };
}

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }
