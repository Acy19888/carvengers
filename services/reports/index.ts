import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import type { Vehicle, InspectionCase, CaseMedia, Finding } from "../../types/models";
import { SERVICE_TIER_LABELS, SEVERITY_LABELS, MEDIA_CATEGORY_LABELS } from "../../constants/app";

interface ReportData {
  vehicle: Vehicle;
  inspectionCase: InspectionCase;
  media: CaseMedia[];
  findings: Finding[];
}

/** Generate PDF from report data and open share dialog */
export async function generateAndSharePdf(data: ReportData): Promise<void> {
  const html = buildReportHtml(data);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "Inspektionsbericht teilen" });
}

/** Preview report as print dialog */
export async function printReport(data: ReportData): Promise<void> {
  const html = buildReportHtml(data);
  await Print.printAsync({ html });
}

function buildReportHtml({ vehicle, inspectionCase, media, findings }: ReportData): string {
  const date = new Date(inspectionCase.createdAt).toLocaleDateString("de-DE", {
    year: "numeric", month: "long", day: "numeric",
  });

  const highCount = findings.filter(f => f.severity === "high").length;
  const medCount = findings.filter(f => f.severity === "medium").length;
  const lowCount = findings.filter(f => f.severity === "low").length;
  const overall = highCount > 0 ? "Mängel erkannt" : medCount > 0 ? "Hinweise vorhanden" : "Gut";
  const overallColor = highCount > 0 ? "#EF4444" : medCount > 0 ? "#F59E0B" : "#22C55E";

  const severityColor = (s: string) => s === "high" ? "#EF4444" : s === "medium" ? "#F59E0B" : "#22C55E";

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1E293B;padding:40px;font-size:14px;line-height:1.6}
.header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #3B82F6;padding-bottom:20px;margin-bottom:30px}
.logo{font-size:24px;font-weight:900;letter-spacing:3px;color:#3B82F6}
.date{color:#64748B;font-size:12px}
.badge{display:inline-block;background:${overallColor};color:white;padding:6px 16px;border-radius:20px;font-weight:700;font-size:14px}
h2{font-size:18px;font-weight:700;margin:24px 0 12px;color:#0F172A;border-bottom:1px solid #E2E8F0;padding-bottom:6px}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.info-item{display:flex}
.info-label{color:#64748B;width:120px;flex-shrink:0;font-size:13px}
.info-value{font-weight:600;font-size:13px}
.score-section{text-align:center;margin:20px 0;padding:20px;background:#F8FAFC;border-radius:12px;border:1px solid #E2E8F0}
.score-title{font-size:12px;color:#64748B;margin-bottom:8px}
.counts{display:flex;justify-content:center;gap:30px;margin-top:12px}
.count-item{text-align:center}
.count-num{font-size:24px;font-weight:800}
.count-label{font-size:11px;color:#64748B}
.finding{display:flex;align-items:flex-start;padding:10px 0;border-bottom:1px solid #F1F5F9}
.finding-dot{width:10px;height:10px;border-radius:50%;margin-top:4px;margin-right:10px;flex-shrink:0}
.finding-label{font-weight:600;font-size:13px}
.finding-meta{font-size:11px;color:#64748B}
.finding-notes{font-size:12px;color:#475569;margin-top:2px}
.media-section{margin-top:8px}
.media-count{font-size:13px;color:#64748B}
.progress-bar{height:6px;background:#E2E8F0;border-radius:3px;margin-top:6px;overflow:hidden}
.progress-fill{height:100%;background:#3B82F6;border-radius:3px}
.footer{margin-top:40px;padding-top:16px;border-top:2px solid #E2E8F0;text-align:center;color:#94A3B8;font-size:11px}
.verification{padding:12px;background:#F8FAFC;border-radius:8px;border:1px solid #E2E8F0;margin-top:8px;font-size:12px}
</style></head><body>

<div class="header">
  <div class="logo">CARVENGERS</div>
  <div>
    <div class="date">Erstellt am ${date}</div>
    <div class="date">Fall-ID: ${inspectionCase.id.slice(-8)}</div>
  </div>
</div>

<div class="score-section">
  <div class="score-title">GESAMTBEWERTUNG</div>
  <div class="badge">${overall}</div>
  <div class="counts">
    <div class="count-item"><div class="count-num" style="color:#EF4444">${highCount}</div><div class="count-label">Hoch</div></div>
    <div class="count-item"><div class="count-num" style="color:#F59E0B">${medCount}</div><div class="count-label">Mittel</div></div>
    <div class="count-item"><div class="count-num" style="color:#22C55E">${lowCount}</div><div class="count-label">Gering</div></div>
  </div>
</div>

<h2>Fahrzeugdaten</h2>
<div class="info-grid">
  <div class="info-item"><span class="info-label">Marke / Modell</span><span class="info-value">${vehicle.make} ${vehicle.model}</span></div>
  <div class="info-item"><span class="info-label">Baujahr</span><span class="info-value">${vehicle.year}</span></div>
  <div class="info-item"><span class="info-label">Kilometerstand</span><span class="info-value">${vehicle.mileage.toLocaleString("de-DE")} km</span></div>
  <div class="info-item"><span class="info-label">FIN</span><span class="info-value">${vehicle.vin}</span></div>
  <div class="info-item"><span class="info-label">Inspektionsart</span><span class="info-value">${SERVICE_TIER_LABELS[inspectionCase.serviceTier]}</span></div>
  <div class="info-item"><span class="info-label">Status</span><span class="info-value">${inspectionCase.status === "completed" ? "Abgeschlossen" : "In Bearbeitung"}</span></div>
</div>

<h2>Dokumentation</h2>
<div class="media-section">
  <div class="media-count">${media.length} von 8 Fotos hochgeladen</div>
  <div class="progress-bar"><div class="progress-fill" style="width:${(media.length / 8) * 100}%"></div></div>
</div>

<h2>Befunde (${findings.length})</h2>
${findings.length === 0 ? '<p style="color:#94A3B8;font-size:13px">Keine Befunde vorhanden.</p>' :
  findings.map(f => `
  <div class="finding">
    <div class="finding-dot" style="background:${severityColor(f.severity)}"></div>
    <div>
      <div class="finding-label">${f.label}</div>
      <div class="finding-meta">${SEVERITY_LABELS[f.severity]} · ${f.source === "ai" ? "KI-Analyse" : f.source === "inspector" ? "Prüfer" : "Bestätigt"} · ${Math.round(f.confidence * 100)}% Konfidenz</div>
      ${f.notes ? `<div class="finding-notes">${f.notes}</div>` : ""}
    </div>
  </div>`).join("")}

<h2>Verifizierung</h2>
<div class="verification">
  ${inspectionCase.status === "completed"
    ? "✅ Dieser Bericht wurde verifiziert und ist gültig."
    : "⏳ Dieser Bericht ist vorläufig und wird nach Abschluss der Prüfung finalisiert."}
</div>

<div class="footer">
  <div style="font-weight:800;letter-spacing:3px;color:#3B82F6;margin-bottom:4px">CARVENGERS</div>
  <div>KI-gestützte Gebrauchtwagenprüfung · carvengers.com</div>
  <div>Dieser Bericht wurde automatisch generiert und dient als Orientierungshilfe.</div>
</div>

</body></html>`;
}
