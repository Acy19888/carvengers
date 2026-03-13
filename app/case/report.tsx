import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Button, Typo, Spacer } from "../../components/ui";
import { fetchCase, fetchVehicle, fetchCaseMedia, fetchFindings } from "../../services/firebase";
import { CASE_STATUS_LABELS, SERVICE_TIER_LABELS, SEVERITY_COLORS, SEVERITY_LABELS } from "../../constants/app";
import { Colors, Spacing, Radius, FontSize } from "../../constants/theme";
import { formatDate } from "../../utils/helpers";
import type { InspectionCase, Vehicle, CaseMedia, Finding } from "../../types/models";

export default function ReportScreen() {
  const { caseId } = useLocalSearchParams<{ caseId: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState<InspectionCase | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [media, setMedia] = useState<CaseMedia[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);

  useEffect(() => {
    loadData();
  }, [caseId]);

  const loadData = async () => {
    if (!caseId) return;
    setLoading(true);
    try {
      const c = await fetchCase(caseId);
      setCaseData(c);
      if (c) {
        const [v, m, f] = await Promise.all([
          fetchVehicle(c.vehicleId),
          fetchCaseMedia(c.id),
          fetchFindings(c.id),
        ]);
        setVehicle(v);
        setMedia(m);
        setFindings(f);
      }
    } catch {
      Alert.alert("Fehler", "Bericht konnte nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Spacer size="md" />
          <Typo variant="caption">Bericht wird generiert…</Typo>
        </View>
      </Screen>
    );
  }

  if (!caseData || !vehicle) {
    return (
      <Screen>
        <Spacer size="xxl" />
        <Typo variant="h3" center>Bericht nicht verfügbar</Typo>
        <Spacer size="lg" />
        <Button label="Zurück" variant="outline" onPress={() => router.back()} />
      </Screen>
    );
  }

  const highFindings = findings.filter((f) => f.severity === "high").length;
  const medFindings = findings.filter((f) => f.severity === "medium").length;
  const lowFindings = findings.filter((f) => f.severity === "low").length;

  const overallScore = highFindings > 0 ? "Mängel erkannt" : medFindings > 0 ? "Hinweise vorhanden" : "Gut";
  const overallColor = highFindings > 0 ? Colors.error : medFindings > 0 ? Colors.warning : Colors.success;

  return (
    <Screen scroll>
      <Spacer size="md" />
      <View style={styles.topBar}>
        <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} onPress={() => router.back()} />
        <Typo variant="h3">Inspektionsbericht</Typo>
        <View style={{ width: 24 }} />
      </View>

      <Spacer size="lg" />

      {/* Report header */}
      <View style={[styles.card, { alignItems: "center" }]}>
        <Ionicons name="document-text" size={40} color={Colors.accent} />
        <Spacer size="sm" />
        <Typo variant="h3" center>
          {vehicle.make} {vehicle.model}
        </Typo>
        <Typo variant="caption" center>
          Baujahr {vehicle.year} · {vehicle.mileage.toLocaleString("de-DE")} km
        </Typo>
        <Spacer size="md" />

        {/* Overall score */}
        <View style={[styles.scoreBadge, { backgroundColor: overallColor }]}>
          <Typo variant="body" color={Colors.textOnPrimary} style={{ fontWeight: "700" }}>
            {overallScore}
          </Typo>
        </View>

        <Spacer size="sm" />
        <Typo variant="caption">
          Erstellt am {formatDate(caseData.createdAt)}
        </Typo>
      </View>

      <Spacer size="md" />

      {/* Vehicle summary */}
      <View style={styles.card}>
        <Typo variant="body" style={styles.sectionTitle}>Fahrzeugdaten</Typo>
        <Spacer size="sm" />
        <InfoRow icon="car" label="Marke / Modell" value={`${vehicle.make} ${vehicle.model}`} />
        <InfoRow icon="calendar" label="Baujahr" value={String(vehicle.year)} />
        <InfoRow icon="speedometer" label="Kilometerstand" value={`${vehicle.mileage.toLocaleString("de-DE")} km`} />
        <InfoRow icon="barcode" label="FIN" value={vehicle.vin} />
        <InfoRow icon="shield-checkmark" label="Inspektionsart" value={SERVICE_TIER_LABELS[caseData.serviceTier]} />
      </View>

      <Spacer size="md" />

      {/* Media summary */}
      <View style={styles.card}>
        <Typo variant="body" style={styles.sectionTitle}>Dokumentation</Typo>
        <Spacer size="sm" />
        <Typo variant="body">
          {media.length} von 8 Fotos hochgeladen
        </Typo>
        <Spacer size="xs" />
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(media.length / 8) * 100}%` }]} />
        </View>
        <Spacer size="xs" />
        <Typo variant="caption">
          {media.length === 8 ? "Vollständige Dokumentation" : "Unvollständige Dokumentation"}
        </Typo>
      </View>

      <Spacer size="md" />

      {/* Findings summary */}
      <View style={styles.card}>
        <Typo variant="body" style={styles.sectionTitle}>
          Befunde ({findings.length})
        </Typo>
        <Spacer size="sm" />

        {/* Summary counts */}
        <View style={styles.findingSummaryRow}>
          <FindingCount color={Colors.error} count={highFindings} label="Hoch" />
          <FindingCount color={Colors.warning} count={medFindings} label="Mittel" />
          <FindingCount color={Colors.success} count={lowFindings} label="Gering" />
        </View>

        <Spacer size="md" />

        {findings.map((f) => (
          <View key={f.id} style={styles.findingItem}>
            <View style={[styles.dot, { backgroundColor: SEVERITY_COLORS[f.severity] }]} />
            <View style={{ flex: 1 }}>
              <Typo variant="body" style={{ fontSize: FontSize.sm, fontWeight: "600" }}>
                {f.label}
              </Typo>
              <Typo variant="caption" style={{ fontSize: FontSize.xs }}>
                {SEVERITY_LABELS[f.severity]} · {f.source === "ai" ? "KI-Analyse" : f.source === "inspector" ? "Prüfer" : "Bestätigt"}
              </Typo>
              {f.notes ? (
                <Typo variant="caption" style={{ fontSize: FontSize.xs, marginTop: 2 }}>{f.notes}</Typo>
              ) : null}
            </View>
          </View>
        ))}
      </View>

      <Spacer size="md" />

      {/* Verification */}
      <View style={styles.card}>
        <Typo variant="body" style={styles.sectionTitle}>Verifizierung</Typo>
        <Spacer size="sm" />
        <View style={styles.verifyRow}>
          <Ionicons
            name={caseData.status === "completed" ? "checkmark-circle" : "time"}
            size={20}
            color={caseData.status === "completed" ? Colors.success : Colors.warning}
          />
          <Typo variant="body" style={{ marginLeft: 8 }}>
            Status: {CASE_STATUS_LABELS[caseData.status]}
          </Typo>
        </View>
        <Spacer size="xs" />
        <Typo variant="caption">
          {caseData.status === "completed"
            ? "Dieser Bericht wurde verifiziert und ist gültig."
            : "Dieser Bericht ist vorläufig und wird nach Abschluss der Prüfung finalisiert."}
        </Typo>
      </View>

      <Spacer size="lg" />

      <Button
        label="PDF exportieren (demnächst)"
        variant="outline"
        disabled
        onPress={() => {}}
      />

      <Spacer size="xxl" />
    </Screen>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon as any} size={16} color={Colors.textSecondary} />
      <Typo variant="caption" style={{ marginLeft: 8, width: 110 }}>{label}</Typo>
      <Typo variant="body" style={{ flex: 1, fontWeight: "500", fontSize: FontSize.sm }}>{value}</Typo>
    </View>
  );
}

function FindingCount({ color, count, label }: { color: string; count: number; label: string }) {
  return (
    <View style={styles.findingCountItem}>
      <View style={[styles.findingCountDot, { backgroundColor: color }]}>
        <Typo variant="body" color={Colors.textOnPrimary} style={{ fontSize: 14, fontWeight: "700" }}>
          {count}
        </Typo>
      </View>
      <Typo variant="caption" style={{ marginTop: 4 }}>{label}</Typo>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: { fontWeight: "700" },
  scoreBadge: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    backgroundColor: Colors.accent,
    borderRadius: 3,
  },
  findingSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  findingCountItem: {
    alignItems: "center",
  },
  findingCountDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  findingItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
    marginRight: Spacing.sm,
  },
  verifyRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});
