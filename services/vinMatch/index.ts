/**
 * VIN Document Match Verification
 * Compares VIN from vehicle plate vs registration document.
 * MVP: Mock comparison
 * Production: OCR from both sources + fuzzy matching
 */

export type VinMatchResult = "verified" | "uncertain" | "mismatch";

export interface VinVerification {
  result: VinMatchResult;
  label: string;
  color: string;
  vehicleVin: string;
  documentVin: string;
  confidence: number;
  warning: string | null;
}

/**
 * Compare VIN from vehicle vs registration document.
 * In production: uses OCR results from both sources.
 */
export async function verifyVinMatch(
  vehicleVin: string,
  documentVin?: string,
): Promise<VinVerification> {
  await delay(800);

  // If no document VIN provided, simulate OCR
  const docVin = documentVin ?? simulateOcrVin(vehicleVin);

  const normalizedVehicle = vehicleVin.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const normalizedDoc = docVin.toUpperCase().replace(/[^A-Z0-9]/g, "");

  if (normalizedVehicle === normalizedDoc) {
    return {
      result: "verified",
      label: "FIN stimmt überein",
      color: "#22C55E",
      vehicleVin: normalizedVehicle,
      documentVin: normalizedDoc,
      confidence: 0.98,
      warning: null,
    };
  }

  // Check similarity (allow 1-2 char OCR errors)
  const distance = levenshtein(normalizedVehicle, normalizedDoc);
  if (distance <= 2) {
    return {
      result: "uncertain",
      label: "FIN-Abweichung",
      color: "#F59E0B",
      vehicleVin: normalizedVehicle,
      documentVin: normalizedDoc,
      confidence: 0.6,
      warning: "Kleine Abweichungen erkannt — möglicherweise ein OCR-Fehler. Manuelle Prüfung empfohlen.",
    };
  }

  return {
    result: "mismatch",
    label: "FIN stimmt NICHT überein",
    color: "#EF4444",
    vehicleVin: normalizedVehicle,
    documentVin: normalizedDoc,
    confidence: 0.95,
    warning: "WARNUNG: Die FIN am Fahrzeug stimmt nicht mit dem Fahrzeugschein überein. Dies kann auf Dokumentenbetrug oder ein gestohlenes Fahrzeug hinweisen. Dringend weitere Prüfung empfohlen.",
  };
}

/** Simulate OCR with occasional small errors */
function simulateOcrVin(vin: string): string {
  const chars = vin.split("");
  // 85% perfect match, 10% 1 char error, 5% mismatch
  const roll = Math.random();
  if (roll > 0.15) return vin; // perfect
  if (roll > 0.05) {
    // 1 char OCR error
    const pos = Math.floor(Math.random() * chars.length);
    chars[pos] = chars[pos] === "0" ? "O" : chars[pos] === "1" ? "I" : "X";
    return chars.join("");
  }
  // Full mismatch
  return "WVWZZZ1KZXW000000";
}

/** Simple Levenshtein distance */
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }
