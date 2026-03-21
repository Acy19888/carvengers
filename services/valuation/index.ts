import type { Vehicle, Finding } from "../../types/models";

export interface ValuationResult {
  estimatedMin: number;
  estimatedMax: number;
  marketAverage: number;
  condition: "sehr gut" | "gut" | "befriedigend" | "mangelhaft";
  adjustments: { label: string; amount: number }[];
}

/**
 * Mock vehicle valuation based on age, mileage, and findings.
 * In production: use DAT, Schwacke, or similar valuation API.
 */
export async function estimateVehicleValue(
  vehicle: Vehicle,
  findings: Finding[],
): Promise<ValuationResult> {
  await delay(800);

  // Base price estimation (very simplified mock)
  const age = new Date().getFullYear() - vehicle.year;
  const basePrices: Record<string, number> = {
    Volkswagen: 28000, "Mercedes-Benz": 42000, BMW: 40000, Audi: 38000,
    Opel: 22000, "Škoda": 24000, Ford: 23000, Toyota: 26000,
    Hyundai: 25000, Renault: 21000, Tesla: 45000, Porsche: 75000,
  };
  const basePrice = basePrices[vehicle.make] ?? 25000;

  // Age depreciation (~12% per year, decreasing)
  const ageFactor = Math.max(0.15, Math.pow(0.88, age));
  let estimated = basePrice * ageFactor;

  // Mileage adjustment (~€0.05 per km over 15k/year expected)
  const expectedKm = age * 15000;
  const kmDiff = vehicle.mileage - expectedKm;
  const kmAdjust = Math.round(kmDiff * -0.04);

  const adjustments: { label: string; amount: number }[] = [];

  if (kmDiff > 10000) {
    adjustments.push({ label: "Überdurchschnittliche Laufleistung", amount: kmAdjust });
  } else if (kmDiff < -10000) {
    adjustments.push({ label: "Unterdurchschnittliche Laufleistung", amount: Math.abs(kmAdjust) });
  }

  // Finding adjustments
  const highFindings = findings.filter(f => f.severity === "high").length;
  const medFindings = findings.filter(f => f.severity === "medium").length;

  if (highFindings > 0) {
    const deduction = highFindings * -1500;
    adjustments.push({ label: `${highFindings} schwere Mängel`, amount: deduction });
    estimated += deduction;
  }
  if (medFindings > 0) {
    const deduction = medFindings * -500;
    adjustments.push({ label: `${medFindings} mittlere Hinweise`, amount: deduction });
    estimated += deduction;
  }

  estimated += kmAdjust;
  estimated = Math.max(500, Math.round(estimated / 100) * 100);

  // Condition
  const condition = highFindings > 0 ? "mangelhaft" :
    medFindings > 1 ? "befriedigend" :
    medFindings > 0 ? "gut" : "sehr gut";

  return {
    estimatedMin: Math.round(estimated * 0.9 / 100) * 100,
    estimatedMax: Math.round(estimated * 1.1 / 100) * 100,
    marketAverage: estimated,
    condition,
    adjustments,
  };
}

function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}
