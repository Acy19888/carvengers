import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import type { Vehicle, InspectionCase } from "../../types/models";
import type { DamageDetection } from "../damageDetection";
import type { TireReport } from "../tireAnalysis";
import type { OilAnalysis } from "../oilAnalysis";
import type { ServiceFraudResult } from "../serviceFraud";
import type { CarHealthScore, DealRiskScore, TravelDecision } from "../scoring";
import type { MarketComparison } from "../marketPrice";
import type { NegotiationAdvice } from "../negotiation";
import type { UmweltplaketteResult } from "../umweltplakette";
import type { VinVerification } from "../vinMatch";
import { SERVICE_TIER_LABELS } from "../../constants/app";
import { getTotalRepairCost, DAMAGE_LABELS, LOCATION_LABELS } from "../damageDetection";
import { POSITION_LABELS } from "../tireAnalysis";

interface FullReportData {
  vehicle: Vehicle;
  inspectionCase: InspectionCase;
  healthScore: CarHealthScore | null;
  dealRisk: DealRiskScore | null;
  travelDecision: TravelDecision | null;
  damages: DamageDetection[];
  tires: TireReport | null;
  oil: OilAnalysis | null;
  serviceHistory: ServiceFraudResult | null;
  market: MarketComparison | null;
  negotiation: NegotiationAdvice | null;
  umwelt: UmweltplaketteResult | null;
  vinMatch: VinVerification | null;
}

export async function generateFullReportPdf(data: FullReportData): Promise<void> {
  const html = buildFullReportHtml(data);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "KI-Inspektionsbericht teilen" });
}

// Keep backwards compatible
export async function generateAndSharePdf(data: { vehicle: Vehicle; inspectionCase: InspectionCase; media: any[]; findings: any[] }): Promise<void> {
  const simpleHtml = buildSimpleHtml(data);
  const { uri } = await Print.printToFileAsync({ html: simpleHtml, base64: false });
  await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "Inspektionsbericht teilen" });
}

export async function printReport(data: any): Promise<void> {
  const html = buildSimpleHtml(data);
  await Print.printAsync({ html });
}

function buildFullReportHtml(d: FullReportData): string {
  const { vehicle: v, inspectionCase: c, healthScore: hs, dealRisk: dr, travelDecision: td, damages, tires, oil, serviceHistory: sh, market, negotiation: neg, umwelt, vinMatch: vm } = d;
  const date = new Date(c.createdAt).toLocaleDateString("de-DE", { year: "numeric", month: "long", day: "numeric" });
  const repairCost = getTotalRepairCost(damages);

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1E293B;padding:32px;font-size:12px;line-height:1.5}
.header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #3B82F6;padding-bottom:16px;margin-bottom:24px}
.logo{font-size:22px;font-weight:900;letter-spacing:3px;color:#3B82F6}
.meta{color:#64748B;font-size:10px;text-align:right}
h2{font-size:15px;font-weight:700;margin:20px 0 8px;color:#0F172A;border-bottom:1px solid #E2E8F0;padding-bottom:4px}
.badge{display:inline-block;color:white;padding:4px 12px;border-radius:16px;font-weight:700;font-size:12px}
.summary-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin:12px 0}
.summary-card{text-align:center;padding:12px;border-radius:8px;border:1px solid #E2E8F0;background:#F8FAFC}
.summary-card .big{font-size:28px;font-weight:900}
.summary-card .label{font-size:9px;color:#64748B;margin-top:2px}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px}
.info-item{display:flex}.info-label{color:#64748B;width:110px;font-size:11px}.info-value{font-weight:600;font-size:11px}
.bar-row{display:flex;align-items:center;padding:3px 0}
.bar-label{width:100px;font-size:11px}.bar-bg{flex:1;height:6px;background:#E2E8F0;border-radius:3px;margin:0 8px;overflow:hidden}
.bar-fill{height:6px;border-radius:3px}.bar-score{width:30px;text-align:right;font-weight:700;font-size:11px}
.dmg-item{display:flex;align-items:center;padding:4px 0;border-bottom:1px solid #F1F5F9}
.dmg-dot{width:10px;height:10px;border-radius:50%;margin-right:8px;flex-shrink:0}
.dmg-text{font-size:11px;flex:1}.dmg-cost{font-size:11px;font-weight:700;color:#64748B}
.tire-row{display:flex;padding:3px 0}.tire-pos{width:90px;font-size:11px}.tire-depth{width:50px;font-weight:700;font-size:11px}.tire-dot{font-size:11px;color:#64748B;flex:1}
.flag{border-left:3px solid;padding:4px 8px;margin:4px 0;font-size:11px}
.tip-row{display:flex;padding:4px 0;border-bottom:1px solid #F1F5F9;font-size:11px}
.tip-cat{width:100px;font-weight:600}.tip-arg{flex:1;color:#64748B}.tip-save{width:60px;text-align:right;font-weight:700;color:#22C55E}
.cost-bar{background:#FEF2F2;padding:8px;border-radius:6px;margin:8px 0;font-weight:600;color:#EF4444;font-size:11px}
.quote{background:#F8FAFC;border:1px solid #E2E8F0;border-radius:6px;padding:10px;margin:8px 0;font-style:italic;font-size:11px}
.footer{margin-top:24px;padding-top:12px;border-top:2px solid #E2E8F0;text-align:center;color:#94A3B8;font-size:9px}
.page-break{page-break-before:always}
</style></head><body>

<div class="header">
  <div class="logo">CARVENGERS</div>
  <div class="meta">KI-Inspektionsbericht<br>${date}<br>Fall-ID: ${c.id.slice(-8)}</div>
</div>

<!-- Key Summary -->
<div class="summary-grid">
  <div class="summary-card">
    <div class="big" style="color:${hs?.color ?? '#64748B'}">${hs?.score ?? '—'}</div>
    <div class="label">CAR HEALTH SCORE</div>
    <div style="font-size:10px;font-weight:600;color:${hs?.color ?? '#64748B'}">${hs?.label ?? '—'}</div>
  </div>
  <div class="summary-card">
    <div class="badge" style="background:${dr?.color ?? '#64748B'}">${dr?.label ?? '—'}</div>
    <div class="label" style="margin-top:8px">DEAL-RISIKO</div>
  </div>
  <div class="summary-card">
    <div style="font-size:20px">${td?.recommendation === 'yes' ? '✈️' : td?.recommendation === 'caution' ? '⚠️' : '❌'}</div>
    <div class="label">${td?.label ?? '—'}</div>
    <div style="font-size:9px;color:#64748B;margin-top:2px">${td?.explanation?.slice(0, 80) ?? ''}…</div>
  </div>
</div>

<h2>Fahrzeugdaten</h2>
<div class="info-grid">
  <div class="info-item"><span class="info-label">Marke / Modell</span><span class="info-value">${v.make} ${v.model}</span></div>
  <div class="info-item"><span class="info-label">Baujahr</span><span class="info-value">${v.year}</span></div>
  <div class="info-item"><span class="info-label">Kilometerstand</span><span class="info-value">${v.mileage.toLocaleString("de-DE")} km</span></div>
  <div class="info-item"><span class="info-label">FIN</span><span class="info-value">${v.vin}</span></div>
</div>

<h2>Zustandsbewertung</h2>
${(hs?.breakdown ?? []).map(b => `<div class="bar-row"><span class="bar-label">${b.category}</span><div class="bar-bg"><div class="bar-fill" style="width:${b.score}%;background:${b.score >= 70 ? '#22C55E' : b.score >= 50 ? '#F59E0B' : '#EF4444'}"></div></div><span class="bar-score">${b.score}</span></div>`).join("")}

<h2>Exterieur-Schäden (${damages.length})</h2>
${damages.length === 0 ? '<p style="color:#94A3B8">Keine Schäden erkannt.</p>' : damages.map(d => `<div class="dmg-item"><div class="dmg-dot" style="background:${d.severity === 'high' ? '#EF4444' : d.severity === 'medium' ? '#F59E0B' : '#22C55E'}"></div><span class="dmg-text">${d.description} · ${Math.round(d.confidence * 100)}%</span><span class="dmg-cost">${d.estimatedRepairCost > 0 ? d.estimatedRepairCost + '€' : '—'}</span></div>`).join("")}
${repairCost > 0 ? `<div class="cost-bar">Geschätzte Reparaturkosten: ${repairCost.toLocaleString("de-DE")}€</div>` : ''}

<h2>Reifenanalyse${tires ? ` (Score: ${tires.overallScore})` : ''}</h2>
${tires ? tires.tires.map(t => `<div class="tire-row"><span class="tire-pos">${POSITION_LABELS[t.position]}</span><span class="tire-depth" style="color:${t.treadStatus === 'good' ? '#22C55E' : t.treadStatus === 'acceptable' ? '#F59E0B' : '#EF4444'}">${t.treadDepth}mm</span><span class="tire-dot">${t.dotCode ?? '—'} · ${t.ageYears}J${t.ageWarning ? ' ⚠️' : ''}</span></div>`).join("") + `<p style="font-size:10px;color:#64748B;margin-top:4px">${tires.recommendation}</p>` : '<p style="color:#94A3B8">Keine Reifenanalyse verfügbar.</p>'}

<h2>Ölanalyse${oil ? ` (Score: ${oil.healthScore})` : ''}</h2>
${oil ? `<div class="info-grid"><div class="info-item"><span class="info-label">Ölstand</span><span class="info-value" style="color:${oil.level === 'ok' ? '#22C55E' : '#EF4444'}">${oil.level === 'ok' ? 'OK' : oil.level === 'low' ? 'Niedrig' : 'Kritisch'}</span></div><div class="info-item"><span class="info-label">Zustand</span><span class="info-value">${oil.condition === 'clean' ? 'Sauber' : oil.condition === 'used' ? 'Gebraucht' : oil.condition === 'dirty' ? 'Verschmutzt' : 'Kontaminiert'}</span></div></div>${oil.milkyContamination ? '<p style="color:#EF4444;font-weight:600;margin-top:4px">⚠️ Mögliche Kühlmittelkontamination!</p>' : ''}<p style="font-size:10px;color:#64748B;margin-top:4px">${oil.recommendation}</p>` : ''}

<div class="page-break"></div>

<div class="header">
  <div class="logo">CARVENGERS</div>
  <div class="meta">Seite 2 · ${date}</div>
</div>

<h2>Servicehistorie${sh ? ` (Score: ${sh.historyScore})` : ''}</h2>
${sh ? `<p style="font-size:11px">${sh.entries.length} Einträge gefunden</p>${sh.flags.map(f => `<div class="flag" style="border-color:${f.severity === 'critical' ? '#EF4444' : '#F59E0B'}">${f.description}</div>`).join("")}<p style="font-size:10px;color:#64748B;margin-top:4px">${sh.recommendation}</p>` : ''}

<h2>Marktpreisvergleich</h2>
${market ? `<div style="text-align:center;padding:8px"><div style="font-size:24px;font-weight:900;color:#3B82F6">${market.averagePrice.toLocaleString("de-DE")}€</div><div style="font-size:10px;color:#64748B">Durchschnitt (${market.sampleSize} Angebote)</div></div><div class="info-grid"><div class="info-item"><span class="info-label">Günstigstes</span><span class="info-value">${market.lowestPrice.toLocaleString("de-DE")}€</span></div><div class="info-item"><span class="info-label">Teuerstes</span><span class="info-value">${market.highestPrice.toLocaleString("de-DE")}€</span></div></div><p style="text-align:center;margin-top:6px;font-weight:600;font-size:11px">${market.pricePositionLabel}</p>` : ''}

<h2>FIN-Abgleich</h2>
${vm ? `<p><span style="font-weight:700;color:${vm.color}">${vm.label}</span></p>${vm.warning ? `<p style="font-size:10px;color:#64748B;margin-top:2px">${vm.warning}</p>` : ''}` : ''}

<h2>Umweltplakette</h2>
${umwelt ? `<p><span style="display:inline-block;width:14px;height:14px;border-radius:7px;background:${umwelt.color};vertical-align:middle;margin-right:6px"></span><strong>${umwelt.label}</strong> · ${umwelt.euroClass}</p><p style="font-size:10px;color:#64748B">${umwelt.zoneAccess}</p>` : ''}

<h2>Verhandlungsberater</h2>
${neg && neg.tips.length > 0 ? `<div style="text-align:center;padding:8px;background:#DBEAFE;border-radius:6px"><div style="font-size:10px;color:#64748B">Sparpotenzial</div><div style="font-size:22px;font-weight:900;color:#3B82F6">${neg.totalSavingPotential.toLocaleString("de-DE")}€</div></div>${neg.tips.map(t => `<div class="tip-row"><span class="tip-cat">${t.category}</span><span class="tip-arg">${t.argument}</span><span class="tip-save">-${t.estimatedSaving.toLocaleString("de-DE")}€</span></div>`).join("")}<div class="quote">„${neg.openingLine}"</div>` : '<p style="color:#94A3B8">Keine Verhandlungspunkte.</p>'}

<div class="footer">
  <div style="font-weight:800;letter-spacing:3px;color:#3B82F6;margin-bottom:2px">CARVENGERS</div>
  <p>KI-gestützte Gebrauchtwagenprüfung · carvengers.com</p>
  <p>Dieser Bericht wurde automatisch generiert und dient als Orientierungshilfe. Keine Gewährleistung.</p>
</div>
</body></html>`;
}

function buildSimpleHtml(data: any): string {
  const { vehicle: v, inspectionCase: c } = data;
  const date = new Date(c.createdAt).toLocaleDateString("de-DE", { year: "numeric", month: "long", day: "numeric" });
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
body{font-family:sans-serif;padding:32px;font-size:13px;color:#1E293B}
.logo{font-size:22px;font-weight:900;letter-spacing:3px;color:#3B82F6;border-bottom:3px solid #3B82F6;padding-bottom:12px;margin-bottom:16px}
h2{font-size:15px;margin:16px 0 6px;border-bottom:1px solid #E2E8F0;padding-bottom:4px}
</style></head><body>
<div class="logo">CARVENGERS</div>
<p style="color:#64748B">${date} · Fall-ID: ${c.id.slice(-8)}</p>
<h2>Fahrzeug</h2>
<p><strong>${v.make} ${v.model}</strong> · ${v.year} · ${v.mileage.toLocaleString("de-DE")} km · FIN: ${v.vin}</p>
<h2>Status</h2>
<p>${c.status === "completed" ? "Abgeschlossen" : "In Bearbeitung"}</p>
<p style="margin-top:20px;text-align:center;color:#94A3B8;font-size:10px">CARVENGERS · carvengers.com</p>
</body></html>`;
}
