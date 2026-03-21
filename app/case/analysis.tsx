import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Alert, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Button, Typo, Spacer } from "../../components/ui";
import { DamageVisualization } from "../../components/case/DamageVisualization";
import { fetchCase, fetchVehicle, fetchCaseMedia, fetchFindings, generateMockFindings } from "../../services/firebase";
import { detectDamage, DamageDetection, getTotalRepairCost } from "../../services/damageDetection";
import { analyzeTires, TireReport, POSITION_LABELS } from "../../services/tireAnalysis";
import { analyzeOilDipstick, OilAnalysis } from "../../services/oilAnalysis";
import { analyzeServiceHistory, ServiceFraudResult } from "../../services/serviceFraud";
import { calculateCarHealthScore, calculateDealRisk, calculateTravelDecision, CarHealthScore, DealRiskScore, TravelDecision } from "../../services/scoring";
import { generateNegotiationAdvice, NegotiationAdvice } from "../../services/negotiation";
import { checkUmweltplakette, UmweltplaketteResult } from "../../services/umweltplakette";
import { verifyVinMatch, VinVerification } from "../../services/vinMatch";
import { compareMarketPrice, MarketComparison } from "../../services/marketPrice";
import { estimateVehicleValue, ValuationResult } from "../../services/valuation";
import { generateFullReportPdf } from "../../services/reports";
import { Colors, Spacing, Radius, FontSize } from "../../constants/theme";
import type { InspectionCase, Vehicle, CaseMedia, Finding } from "../../types/models";

export default function AnalysisScreen() {
  const { caseId } = useLocalSearchParams<{ caseId: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [caseData, setCaseData] = useState<InspectionCase | null>(null);

  // Analysis results
  const [damages, setDamages] = useState<DamageDetection[]>([]);
  const [tires, setTires] = useState<TireReport | null>(null);
  const [oil, setOil] = useState<OilAnalysis | null>(null);
  const [serviceHistory, setServiceHistory] = useState<ServiceFraudResult | null>(null);
  const [healthScore, setHealthScore] = useState<CarHealthScore | null>(null);
  const [dealRisk, setDealRisk] = useState<DealRiskScore | null>(null);
  const [travelDecision, setTravelDecision] = useState<TravelDecision | null>(null);
  const [negotiation, setNegotiation] = useState<NegotiationAdvice | null>(null);
  const [umwelt, setUmwelt] = useState<UmweltplaketteResult | null>(null);
  const [vinMatch, setVinMatch] = useState<VinVerification | null>(null);
  const [market, setMarket] = useState<MarketComparison | null>(null);
  const [valuation, setValuation] = useState<ValuationResult | null>(null);

  useEffect(() => { if (caseId) runAnalysis(); }, [caseId]);

  const runAnalysis = async () => {
    try {
      const c = await fetchCase(caseId!);
      const v = c ? await fetchVehicle(c.vehicleId) : null;
      if (!c || !v) { Alert.alert("Fehler"); return; }
      setCaseData(c); setVehicle(v);

      // Run all analyses in parallel
      const [dmg, tire, oilRes, svcHist, vinRes, mkt, val] = await Promise.all([
        detectDamage([]),
        analyzeTires([]),
        analyzeOilDipstick(""),
        analyzeServiceHistory([]),
        verifyVinMatch(v.vin),
        compareMarketPrice(v.make, v.model, v.year, v.mileage),
        estimateVehicleValue(v, []),
      ]);

      setDamages(dmg);
      setTires(tire);
      setOil(oilRes);
      setServiceHistory(svcHist);
      setVinMatch(vinRes);
      setMarket(mkt);
      setValuation(val);

      // Calculate scores
      const health = calculateCarHealthScore(dmg, tire, oilRes, svcHist);
      setHealthScore(health);

      const risk = calculateDealRisk(health.score, val, mkt.averagePrice, svcHist);
      setDealRisk(risk);

      const travel = calculateTravelDecision(health.score, risk.risk);
      setTravelDecision(travel);

      // Negotiation
      const neg = generateNegotiationAdvice(mkt.averagePrice, dmg, tire, oilRes, svcHist);
      setNegotiation(neg);

      // Umweltplakette
      const plakette = checkUmweltplakette(v.year >= 2015 ? "diesel" : "petrol", v.year);
      setUmwelt(plakette);

    } catch { Alert.alert("Fehler", "Analyse fehlgeschlagen."); }
    finally { setLoading(false); }
  };

  const handleExportPdf = async () => {
    if (!vehicle || !caseData) return;
    try {
      await generateFullReportPdf({
        vehicle, inspectionCase: caseData,
        healthScore, dealRisk, travelDecision,
        damages, tires, oil, serviceHistory,
        market, negotiation, umwelt, vinMatch,
      });
    } catch { Alert.alert("Fehler", "PDF konnte nicht erstellt werden."); }
  };

  if (loading) {
    return (
      <Screen>
        <View style={s.center}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Spacer size="md" />
          <Typo variant="caption">KI-Analyse läuft…</Typo>
          <Spacer size="xs" />
          <Typo variant="caption" style={{ color: Colors.textMuted, fontSize: 11 }}>Schäden · Reifen · Öl · Service · Markt</Typo>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Spacer size="md" />
      <View style={s.topBar}>
        <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} onPress={() => router.back()} />
        <Typo variant="h3">KI-Analyse</Typo>
        <View style={{ width: 24 }} />
      </View>

      {vehicle && (
        <Typo variant="caption" center style={{ marginTop: 4 }}>
          {vehicle.make} {vehicle.model} · {vehicle.year} · {vehicle.mileage.toLocaleString("de-DE")} km
        </Typo>
      )}

      <Spacer size="lg" />

      {/* ═══ Key Summary ═══ */}
      {healthScore && dealRisk && travelDecision && (
        <View style={s.card}>
          <Typo variant="body" style={s.sectionTitle}>Zusammenfassung</Typo>
          <Spacer size="md" />

          <View style={s.scoreRow}>
            <ScoreCircle value={healthScore.score} label="Zustand" color={healthScore.color} />
            <View style={s.scoreDivider} />
            <View style={{ flex: 1, alignItems: "center" }}>
              <View style={[s.riskBadge, { backgroundColor: dealRisk.color }]}>
                <Typo variant="caption" color="white" style={{ fontWeight: "700", fontSize: 12 }}>{dealRisk.label}</Typo>
              </View>
              <Typo variant="caption" style={{ marginTop: 4, fontSize: 10 }}>Deal-Risiko</Typo>
            </View>
            <View style={s.scoreDivider} />
            <View style={{ flex: 1, alignItems: "center" }}>
              <Ionicons
                name={travelDecision.recommendation === "yes" ? "airplane" : travelDecision.recommendation === "caution" ? "warning" : "close-circle"}
                size={28}
                color={travelDecision.color}
              />
              <Typo variant="caption" style={{ marginTop: 4, fontSize: 10, textAlign: "center" }}>{travelDecision.label}</Typo>
            </View>
          </View>

          <Spacer size="sm" />
          <Typo variant="caption" style={{ fontSize: 11, color: Colors.textMuted, lineHeight: 16 }}>
            {travelDecision.explanation}
          </Typo>
        </View>
      )}

      <Spacer size="md" />

      {/* ═══ Health Breakdown ═══ */}
      {healthScore && (
        <View style={s.card}>
          <Typo variant="body" style={s.sectionTitle}>Zustandsbewertung</Typo>
          <Spacer size="sm" />
          {healthScore.breakdown.map((b) => (
            <View key={b.category} style={s.breakdownRow}>
              <Typo variant="caption" style={{ flex: 1, fontSize: 12 }}>{b.category}</Typo>
              <View style={s.barBg}>
                <View style={[s.barFill, { width: `${b.score}%`, backgroundColor: b.score >= 70 ? Colors.success : b.score >= 50 ? Colors.warning : Colors.error }]} />
              </View>
              <Typo variant="caption" style={{ width: 35, textAlign: "right", fontWeight: "700", fontSize: 12 }}>{b.score}</Typo>
            </View>
          ))}
        </View>
      )}

      <Spacer size="md" />

      {/* ═══ Damage Visualization ═══ */}
      <DamageVisualization damages={damages} />

      {damages.length > 0 && (
        <>
          <Spacer size="xs" />
          <View style={[s.costBar, { backgroundColor: Colors.errorLight }]}>
            <Ionicons name="construct" size={16} color={Colors.error} />
            <Typo variant="caption" style={{ marginLeft: 8, fontWeight: "600", color: Colors.error }}>
              Geschätzte Reparaturkosten: {getTotalRepairCost(damages).toLocaleString("de-DE")}€
            </Typo>
          </View>
        </>
      )}

      <Spacer size="md" />

      {/* ═══ Tires ═══ */}
      {tires && (
        <View style={s.card}>
          <View style={s.rowBetween}>
            <Typo variant="body" style={s.sectionTitle}>Reifenanalyse</Typo>
            <View style={[s.scoreMini, { backgroundColor: tires.overallScore >= 70 ? Colors.success : tires.overallScore >= 50 ? Colors.warning : Colors.error }]}>
              <Typo variant="caption" color="white" style={{ fontWeight: "700", fontSize: 11 }}>{tires.overallScore}</Typo>
            </View>
          </View>
          <Spacer size="sm" />
          {tires.tires.map((t) => (
            <View key={t.position} style={s.tireRow}>
              <Typo variant="caption" style={{ width: 90, fontSize: 11 }}>{POSITION_LABELS[t.position]}</Typo>
              <Typo variant="caption" style={{ width: 50, fontWeight: "700", fontSize: 11, color: t.treadStatus === "good" ? Colors.success : t.treadStatus === "acceptable" ? Colors.warning : Colors.error }}>
                {t.treadDepth}mm
              </Typo>
              <Typo variant="caption" style={{ flex: 1, fontSize: 10, color: Colors.textMuted }}>
                {t.dotCode} · {t.ageYears}J{t.ageWarning ? " ⚠️" : ""}
              </Typo>
            </View>
          ))}
          <Spacer size="xs" />
          <Typo variant="caption" style={{ fontSize: 11, color: Colors.textMuted }}>{tires.recommendation}</Typo>
        </View>
      )}

      <Spacer size="md" />

      {/* ═══ Oil ═══ */}
      {oil && (
        <View style={s.card}>
          <View style={s.rowBetween}>
            <Typo variant="body" style={s.sectionTitle}>Ölanalyse</Typo>
            <View style={[s.scoreMini, { backgroundColor: oil.healthScore >= 70 ? Colors.success : oil.healthScore >= 50 ? Colors.warning : Colors.error }]}>
              <Typo variant="caption" color="white" style={{ fontWeight: "700", fontSize: 11 }}>{oil.healthScore}</Typo>
            </View>
          </View>
          <Spacer size="sm" />
          <InfoRow label="Ölstand" value={oil.level === "ok" ? "OK" : oil.level === "low" ? "Niedrig" : "Kritisch"} color={oil.level === "ok" ? Colors.success : Colors.error} />
          <InfoRow label="Zustand" value={oil.condition === "clean" ? "Sauber" : oil.condition === "used" ? "Gebraucht" : oil.condition === "dirty" ? "Verschmutzt" : "Kontaminiert"} color={oil.condition === "clean" ? Colors.success : oil.milkyContamination ? Colors.error : Colors.warning} />
          {oil.milkyContamination && <Typo variant="caption" style={{ color: Colors.error, fontSize: 11, fontWeight: "600", marginTop: 4 }}>⚠️ Mögliche Kühlmittelkontamination!</Typo>}
          <Spacer size="xs" />
          <Typo variant="caption" style={{ fontSize: 11, color: Colors.textMuted }}>{oil.recommendation}</Typo>
        </View>
      )}

      <Spacer size="md" />

      {/* ═══ Service History ═══ */}
      {serviceHistory && (
        <View style={s.card}>
          <View style={s.rowBetween}>
            <Typo variant="body" style={s.sectionTitle}>Servicehistorie</Typo>
            <View style={[s.scoreMini, { backgroundColor: serviceHistory.historyScore >= 70 ? Colors.success : serviceHistory.historyScore >= 50 ? Colors.warning : Colors.error }]}>
              <Typo variant="caption" color="white" style={{ fontWeight: "700", fontSize: 11 }}>{serviceHistory.historyScore}</Typo>
            </View>
          </View>
          <Spacer size="sm" />
          <Typo variant="caption" style={{ fontSize: 11 }}>{serviceHistory.entries.length} Einträge gefunden</Typo>
          {serviceHistory.flags.length > 0 && (
            <>
              <Spacer size="xs" />
              {serviceHistory.flags.map((f, i) => (
                <View key={i} style={[s.flagRow, { borderLeftColor: f.severity === "critical" ? Colors.error : Colors.warning }]}>
                  <Typo variant="caption" style={{ fontSize: 11 }}>{f.description}</Typo>
                </View>
              ))}
            </>
          )}
          <Spacer size="xs" />
          <Typo variant="caption" style={{ fontSize: 11, color: Colors.textMuted }}>{serviceHistory.recommendation}</Typo>
        </View>
      )}

      <Spacer size="md" />

      {/* ═══ Market Price ═══ */}
      {market && (
        <View style={s.card}>
          <Typo variant="body" style={s.sectionTitle}>Marktpreisvergleich</Typo>
          <Spacer size="sm" />
          <View style={{ alignItems: "center" }}>
            <Typo variant="h2" style={{ color: Colors.accent }}>{market.averagePrice.toLocaleString("de-DE")}€</Typo>
            <Typo variant="caption">Durchschnittspreis ({market.sampleSize} Angebote)</Typo>
          </View>
          <Spacer size="sm" />
          <InfoRow label="Günstigstes" value={`${market.lowestPrice.toLocaleString("de-DE")}€`} />
          <InfoRow label="Teuerstes" value={`${market.highestPrice.toLocaleString("de-DE")}€`} />
          <View style={[s.positionBadge, { backgroundColor: market.pricePosition === "below" ? Colors.successLight : market.pricePosition === "above" ? Colors.errorLight : Colors.warningLight }]}>
            <Typo variant="caption" style={{ fontSize: 11, fontWeight: "600" }}>{market.pricePositionLabel}</Typo>
          </View>
        </View>
      )}

      <Spacer size="md" />

      {/* ═══ VIN Match ═══ */}
      {vinMatch && (
        <View style={[s.card, vinMatch.result === "mismatch" && { borderColor: Colors.error, borderWidth: 2 }]}>
          <View style={s.rowBetween}>
            <Typo variant="body" style={s.sectionTitle}>FIN-Abgleich</Typo>
            <Ionicons name={vinMatch.result === "verified" ? "checkmark-circle" : vinMatch.result === "uncertain" ? "help-circle" : "alert-circle"} size={24} color={vinMatch.color} />
          </View>
          <Spacer size="xs" />
          <Typo variant="caption" style={{ fontWeight: "700", color: vinMatch.color }}>{vinMatch.label}</Typo>
          {vinMatch.warning && <Typo variant="caption" style={{ fontSize: 11, marginTop: 4, color: Colors.textMuted }}>{vinMatch.warning}</Typo>}
        </View>
      )}

      <Spacer size="md" />

      {/* ═══ Umweltplakette ═══ */}
      {umwelt && (
        <View style={s.card}>
          <View style={s.rowBetween}>
            <Typo variant="body" style={s.sectionTitle}>Umweltplakette</Typo>
            <View style={[s.plaketteDot, { backgroundColor: umwelt.color }]} />
          </View>
          <Spacer size="xs" />
          <Typo variant="caption" style={{ fontWeight: "700" }}>{umwelt.label} · {umwelt.euroClass}</Typo>
          <Typo variant="caption" style={{ fontSize: 11, color: Colors.textMuted, marginTop: 2 }}>{umwelt.zoneAccess}</Typo>
        </View>
      )}

      <Spacer size="md" />

      {/* ═══ Negotiation ═══ */}
      {negotiation && negotiation.tips.length > 0 && (
        <View style={[s.card, { borderColor: Colors.accent }]}>
          <Typo variant="body" style={s.sectionTitle}>Verhandlungsberater</Typo>
          <Spacer size="sm" />

          <View style={[s.savingBanner, { backgroundColor: Colors.accentLight }]}>
            <Typo variant="caption" style={{ fontSize: 11 }}>Sparpotenzial</Typo>
            <Typo variant="h3" style={{ color: Colors.accent }}>{negotiation.totalSavingPotential.toLocaleString("de-DE")}€</Typo>
          </View>

          <Spacer size="sm" />
          {negotiation.tips.slice(0, 5).map((t, i) => (
            <View key={i} style={s.tipRow}>
              <Ionicons
                name={t.priority === "high" ? "alert-circle" : t.priority === "medium" ? "warning" : "information-circle"}
                size={16}
                color={t.priority === "high" ? Colors.error : t.priority === "medium" ? Colors.warning : Colors.info}
              />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Typo variant="caption" style={{ fontSize: 11, fontWeight: "600" }}>{t.category}</Typo>
                <Typo variant="caption" style={{ fontSize: 10, color: Colors.textMuted }}>{t.argument}</Typo>
              </View>
              <Typo variant="caption" style={{ fontSize: 11, fontWeight: "700", color: Colors.success }}>-{t.estimatedSaving.toLocaleString("de-DE")}€</Typo>
            </View>
          ))}

          <Spacer size="md" />
          <Typo variant="caption" style={{ fontSize: 11, fontWeight: "600" }}>Vorgeschlagener Eröffnungssatz:</Typo>
          <View style={[s.quoteBox, { backgroundColor: Colors.surface, borderColor: Colors.border }]}>
            <Typo variant="caption" style={{ fontSize: 12, fontStyle: "italic", lineHeight: 18 }}>
              „{negotiation.openingLine}"
            </Typo>
          </View>
        </View>
      )}

      <Spacer size="lg" />

      {/* PDF Export */}
      <Button label="PDF exportieren & teilen" onPress={handleExportPdf} />
      <Spacer size="sm" />
      <Button label="Zurück zur Übersicht" variant="outline" onPress={() => router.back()} />

      <Spacer size="xl" />
    </Screen>
  );
}

// ── Helper Components ──

function ScoreCircle({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <View style={[s.circleOuter, { borderColor: color }]}>
        <Typo variant="h2" style={{ color, fontSize: 24 }}>{value}</Typo>
      </View>
      <Typo variant="caption" style={{ marginTop: 4, fontSize: 10 }}>{label}</Typo>
    </View>
  );
}

function InfoRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={s.infoRow}>
      <Typo variant="caption" style={{ fontSize: 11, color: Colors.textMuted }}>{label}</Typo>
      <Typo variant="caption" style={{ fontSize: 11, fontWeight: "700", color: color ?? Colors.textPrimary }}>{value}</Typo>
    </View>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  sectionTitle: { fontWeight: "700" },
  scoreRow: { flexDirection: "row", alignItems: "center" },
  scoreDivider: { width: 1, height: 50, backgroundColor: Colors.border, marginHorizontal: Spacing.sm },
  riskBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.full },
  circleOuter: { width: 60, height: 60, borderRadius: 30, borderWidth: 3, alignItems: "center", justifyContent: "center" },
  scoreMini: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  breakdownRow: { flexDirection: "row", alignItems: "center", paddingVertical: 4 },
  barBg: { flex: 1, height: 6, backgroundColor: Colors.border, borderRadius: 3, marginHorizontal: Spacing.sm, overflow: "hidden" },
  barFill: { height: 6, borderRadius: 3 },
  costBar: { flexDirection: "row", alignItems: "center", padding: Spacing.sm, borderRadius: Radius.sm },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  tireRow: { flexDirection: "row", alignItems: "center", paddingVertical: 3 },
  flagRow: { borderLeftWidth: 3, paddingLeft: Spacing.sm, paddingVertical: 4, marginBottom: 4 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  positionBadge: { alignItems: "center", padding: Spacing.sm, borderRadius: Radius.sm, marginTop: Spacing.sm },
  plaketteDot: { width: 24, height: 24, borderRadius: 12 },
  savingBanner: { alignItems: "center", padding: Spacing.md, borderRadius: Radius.sm },
  tipRow: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border },
  quoteBox: { padding: Spacing.md, borderRadius: Radius.sm, borderWidth: 1, marginTop: Spacing.sm },
});
