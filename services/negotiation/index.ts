/**
 * Negotiation Advisor Service
 * Generates actionable negotiation tips based on inspection results.
 * MVP: Rule-based logic
 * Production: OpenAI reasoning layer
 */

import type { DamageDetection } from "../damageDetection";
import type { TireReport } from "../tireAnalysis";
import type { OilAnalysis } from "../oilAnalysis";
import type { ServiceFraudResult } from "../serviceFraud";

export interface NegotiationTip {
  category: string;
  argument: string;
  estimatedSaving: number;
  priority: "high" | "medium" | "low";
}

export interface NegotiationAdvice {
  tips: NegotiationTip[];
  totalSavingPotential: number;
  suggestedOffer: number;
  openingLine: string;
  summary: string;
}

export function generateNegotiationAdvice(
  askingPrice: number,
  damages: DamageDetection[],
  tires: TireReport | null,
  oil: OilAnalysis | null,
  serviceHistory: ServiceFraudResult | null,
): NegotiationAdvice {
  const tips: NegotiationTip[] = [];

  // Damage-based tips
  const repairTotal = damages.reduce((s, d) => s + d.estimatedRepairCost, 0);
  if (repairTotal > 0) {
    tips.push({
      category: "Schäden",
      argument: `Sichtbare Schäden erfordern Reparaturen im Wert von ca. ${repairTotal.toLocaleString("de-DE")}€.`,
      estimatedSaving: Math.round(repairTotal * 0.8),
      priority: repairTotal > 1000 ? "high" : "medium",
    });
  }

  const highDmg = damages.filter(d => d.severity === "high");
  if (highDmg.length > 0) {
    tips.push({
      category: "Schwere Mängel",
      argument: `${highDmg.length} schwerwiegende Mängel erkannt — das mindert den Wert erheblich.`,
      estimatedSaving: highDmg.length * 500,
      priority: "high",
    });
  }

  // Tire tips
  if (tires) {
    if (tires.estimatedReplacementCost > 0) {
      tips.push({
        category: "Reifen",
        argument: `Reifen müssen ersetzt werden — geschätzte Kosten: ${tires.estimatedReplacementCost}€.`,
        estimatedSaving: tires.estimatedReplacementCost,
        priority: "medium",
      });
    }
    const oldTires = tires.tires.filter(t => t.ageWarning);
    if (oldTires.length > 0) {
      tips.push({
        category: "Reifenalter",
        argument: `${oldTires.length} Reifen sind über 6 Jahre alt — Sicherheitsrisiko und Austausch fällig.`,
        estimatedSaving: oldTires.length * 80,
        priority: "medium",
      });
    }
  }

  // Oil tips
  if (oil) {
    if (oil.level === "low" || oil.level === "critical") {
      tips.push({
        category: "Ölstand",
        argument: "Ölstand niedrig — zeigt möglicherweise mangelnde Wartung.",
        estimatedSaving: 150,
        priority: oil.level === "critical" ? "high" : "low",
      });
    }
    if (oil.milkyContamination) {
      tips.push({
        category: "Ölkontamination",
        argument: "Mögliche Kühlmittelkontamination im Öl — kann teurer Motorschaden sein.",
        estimatedSaving: 2000,
        priority: "high",
      });
    }
  }

  // Service history tips
  if (serviceHistory) {
    const criticals = serviceHistory.flags.filter(f => f.severity === "critical");
    if (criticals.length > 0) {
      tips.push({
        category: "Servicehistorie",
        argument: "Kritische Unregelmäßigkeiten in der Servicehistorie — mögliche Manipulation.",
        estimatedSaving: Math.round(askingPrice * 0.15),
        priority: "high",
      });
    }
    const missingYears = serviceHistory.flags.filter(f => f.type === "missing_years");
    if (missingYears.length > 0) {
      tips.push({
        category: "Lücken im Service",
        argument: `${missingYears.length} Jahre ohne Servicenachweis — unklare Wartungshistorie.`,
        estimatedSaving: missingYears.length * 200,
        priority: "medium",
      });
    }
  }

  // Sort by priority
  tips.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });

  const totalSaving = tips.reduce((s, t) => s + t.estimatedSaving, 0);
  const suggestedOffer = Math.max(askingPrice * 0.5, askingPrice - totalSaving);

  const openingLine = totalSaving > askingPrice * 0.1
    ? `Basierend auf der Inspektion sehe ich Mängel im Wert von ca. ${totalSaving.toLocaleString("de-DE")}€. Mein Angebot: ${Math.round(suggestedOffer).toLocaleString("de-DE")}€.`
    : `Das Fahrzeug hat einige Punkte, die den Preis beeinflussen. Ich würde ${Math.round(suggestedOffer).toLocaleString("de-DE")}€ vorschlagen.`;

  const summary = tips.length === 0
    ? "Keine wesentlichen Verhandlungspunkte gefunden. Der Preis scheint fair."
    : `${tips.length} Verhandlungspunkte mit einem Gesamtsparpotenzial von ${totalSaving.toLocaleString("de-DE")}€.`;

  return { tips, totalSavingPotential: totalSaving, suggestedOffer: Math.round(suggestedOffer), openingLine, summary };
}
