/**
 * Service History Fraud Detection
 * MVP: Mock analysis
 * Production: OCR + AI reasoning layer
 */

export interface ServiceEntry {
  date: string;
  mileage: number;
  workshop: string;
  type: string;
}

export interface ServiceFraudResult {
  entries: ServiceEntry[];
  historyScore: number; // 0-100
  flags: FraudFlag[];
  recommendation: string;
}

export interface FraudFlag {
  type: "mileage_inconsistency" | "missing_years" | "unrealistic_interval" | "suspicious_pattern";
  severity: "warning" | "critical";
  description: string;
}

/**
 * Analyze service book for fraud indicators. Mock for MVP.
 */
export async function analyzeServiceHistory(imageUris: string[]): Promise<ServiceFraudResult> {
  await delay(1500);

  // Generate mock service entries
  const now = new Date();
  const entries: ServiceEntry[] = [];
  let km = 8000;
  for (let y = now.getFullYear() - 5; y <= now.getFullYear(); y++) {
    if (Math.random() > 0.15) { // 15% chance to skip a year
      km += 10000 + Math.floor(Math.random() * 8000);
      entries.push({
        date: `${y}-${(1 + Math.floor(Math.random() * 12)).toString().padStart(2, "0")}-15`,
        mileage: km,
        workshop: ["Autohaus Müller", "Werkstatt Schmidt", "ATU", "Bosch Service"][Math.floor(Math.random() * 4)],
        type: ["Inspektion", "Ölwechsel", "Großer Service", "Bremsen"][Math.floor(Math.random() * 4)],
      });
    }
  }

  const flags: FraudFlag[] = [];

  // Check for missing years
  const years = entries.map(e => parseInt(e.date.split("-")[0]));
  for (let y = years[0] + 1; y < now.getFullYear(); y++) {
    if (!years.includes(y)) {
      flags.push({
        type: "missing_years",
        severity: "warning",
        description: `Kein Serviceeintrag für ${y} gefunden`,
      });
    }
  }

  // Check for mileage jumps
  for (let i = 1; i < entries.length; i++) {
    const diff = entries[i].mileage - entries[i - 1].mileage;
    if (diff > 30000) {
      flags.push({
        type: "unrealistic_interval",
        severity: "warning",
        description: `Ungewöhnlicher km-Sprung: ${diff.toLocaleString("de-DE")} km zwischen ${entries[i - 1].date.slice(0, 4)} und ${entries[i].date.slice(0, 4)}`,
      });
    }
    if (diff < 0) {
      flags.push({
        type: "mileage_inconsistency",
        severity: "critical",
        description: `km-Stand rückläufig: ${entries[i - 1].mileage.toLocaleString("de-DE")} → ${entries[i].mileage.toLocaleString("de-DE")} km`,
      });
    }
  }

  const criticalCount = flags.filter(f => f.severity === "critical").length;
  const warningCount = flags.filter(f => f.severity === "warning").length;
  const score = Math.max(10, 100 - criticalCount * 30 - warningCount * 10);

  let recommendation = "Servicehistorie erscheint vollständig und konsistent.";
  if (criticalCount > 0) recommendation = "WARNUNG: Kritische Unregelmäßigkeiten in der Servicehistorie erkannt. Mögliche Manipulation.";
  else if (warningCount > 1) recommendation = "Mehrere Auffälligkeiten in der Servicehistorie. Genauere Prüfung empfohlen.";
  else if (warningCount === 1) recommendation = "Eine Auffälligkeit erkannt, insgesamt aber akzeptabel.";

  return { entries, historyScore: score, flags, recommendation };
}

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }
