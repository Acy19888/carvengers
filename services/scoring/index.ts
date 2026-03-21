/**
 * Carvengers Scoring Engine
 * Combines all analysis results into actionable scores.
 */

import type { DamageDetection } from "../damageDetection";
import type { TireReport } from "../tireAnalysis";
import type { OilAnalysis } from "../oilAnalysis";
import type { ServiceFraudResult } from "../serviceFraud";
import type { ValuationResult } from "../valuation";

// ── Car Health Score ──
export interface CarHealthScore {
  score: number; // 0-100
  label: "Sehr gut" | "Gut" | "Befriedigend" | "Mangelhaft" | "Ungenügend";
  color: string;
  breakdown: { category: string; score: number; weight: number }[];
}

export function calculateCarHealthScore(
  damages: DamageDetection[],
  tires: TireReport | null,
  oil: OilAnalysis | null,
  serviceHistory: ServiceFraudResult | null,
): CarHealthScore {
  const breakdown: { category: string; score: number; weight: number }[] = [];

  // Exterior (40%)
  const highDmg = damages.filter(d => d.severity === "high").length;
  const medDmg = damages.filter(d => d.severity === "medium").length;
  const extScore = Math.max(0, 100 - highDmg * 25 - medDmg * 10);
  breakdown.push({ category: "Exterieur", score: extScore, weight: 0.4 });

  // Tires (20%)
  const tireScore = tires?.overallScore ?? 75;
  breakdown.push({ category: "Reifen", score: tireScore, weight: 0.2 });

  // Oil (15%)
  const oilScore = oil?.healthScore ?? 75;
  breakdown.push({ category: "Öl", score: oilScore, weight: 0.15 });

  // Service History (25%)
  const serviceScore = serviceHistory?.historyScore ?? 75;
  breakdown.push({ category: "Servicehistorie", score: serviceScore, weight: 0.25 });

  const score = Math.round(breakdown.reduce((s, b) => s + b.score * b.weight, 0));
  const label = score >= 85 ? "Sehr gut" : score >= 70 ? "Gut" : score >= 50 ? "Befriedigend" : score >= 30 ? "Mangelhaft" : "Ungenügend";
  const color = score >= 85 ? "#22C55E" : score >= 70 ? "#84CC16" : score >= 50 ? "#F59E0B" : score >= 30 ? "#F97316" : "#EF4444";

  return { score, label, color, breakdown };
}

// ── Deal Risk Score ──
export type DealRisk = "low" | "medium" | "high";

export interface DealRiskScore {
  risk: DealRisk;
  label: string;
  color: string;
  factors: { factor: string; impact: "positive" | "negative" | "neutral" }[];
}

export function calculateDealRisk(
  healthScore: number,
  valuation: ValuationResult | null,
  askingPrice: number | null,
  serviceHistory: ServiceFraudResult | null,
): DealRiskScore {
  const factors: { factor: string; impact: "positive" | "negative" | "neutral" }[] = [];
  let riskPoints = 0;

  // Health
  if (healthScore >= 75) { factors.push({ factor: "Fahrzeugzustand gut", impact: "positive" }); }
  else if (healthScore < 50) { factors.push({ factor: "Fahrzeugzustand mangelhaft", impact: "negative" }); riskPoints += 3; }
  else { factors.push({ factor: "Fahrzeugzustand befriedigend", impact: "neutral" }); riskPoints += 1; }

  // Price comparison
  if (valuation && askingPrice) {
    if (askingPrice > valuation.estimatedMax * 1.1) {
      factors.push({ factor: "Preis deutlich über Marktwert", impact: "negative" });
      riskPoints += 2;
    } else if (askingPrice < valuation.estimatedMin) {
      factors.push({ factor: "Preis unter Marktwert — mögliches Schnäppchen", impact: "positive" });
    } else {
      factors.push({ factor: "Preis im Marktbereich", impact: "neutral" });
    }
  }

  // Service fraud
  if (serviceHistory) {
    const criticals = serviceHistory.flags.filter(f => f.severity === "critical").length;
    if (criticals > 0) {
      factors.push({ factor: "Kritische Servicehistorie-Auffälligkeiten", impact: "negative" });
      riskPoints += 3;
    } else if (serviceHistory.flags.length > 0) {
      factors.push({ factor: "Leichte Servicehistorie-Auffälligkeiten", impact: "neutral" });
      riskPoints += 1;
    } else {
      factors.push({ factor: "Servicehistorie unauffällig", impact: "positive" });
    }
  }

  const risk: DealRisk = riskPoints >= 4 ? "high" : riskPoints >= 2 ? "medium" : "low";
  const label = risk === "low" ? "Niedriges Risiko" : risk === "medium" ? "Mittleres Risiko" : "Hohes Risiko";
  const color = risk === "low" ? "#22C55E" : risk === "medium" ? "#F59E0B" : "#EF4444";

  return { risk, label, color, factors };
}

// ── Travel Decision Score ──
export type TravelRecommendation = "yes" | "caution" | "no";

export interface TravelDecision {
  recommendation: TravelRecommendation;
  label: string;
  color: string;
  explanation: string;
}

export function calculateTravelDecision(
  healthScore: number,
  dealRisk: DealRisk,
): TravelDecision {
  if (healthScore >= 65 && dealRisk !== "high") {
    return {
      recommendation: "yes",
      label: "Reise empfohlen",
      color: "#22C55E",
      explanation: "Das Fahrzeug erscheint den Besuch wert. Zustand und Risikobewertung sind akzeptabel.",
    };
  }

  if (dealRisk === "high" || healthScore < 40) {
    return {
      recommendation: "no",
      label: "Reise nicht empfohlen",
      color: "#EF4444",
      explanation: "Basierend auf den Inspektionsergebnissen erscheint das Fahrzeug aktuell nicht lohnenswert für eine längere Anreise.",
    };
  }

  return {
    recommendation: "caution",
    label: "Mit Vorsicht",
    color: "#F59E0B",
    explanation: "Das Fahrzeug könnte sich lohnen, aber es wurden Risikoindikatoren erkannt. Preis nachverhandeln empfohlen.",
  };
}
