import React, { useEffect, useState } from "react";
import { View, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Button, Typo, Spacer } from "../../components/ui";
import {
  fetchCase, fetchVehicle, fetchCaseMedia,
  fetchFindings, generateMockFindings, fetchVinHistory,
} from "../../services/firebase";
import {
  CASE_STATUS_LABELS, SERVICE_TIER_LABELS,
  MEDIA_CATEGORY_LABELS, SEVERITY_COLORS, SEVERITY_LABELS,
} from "../../constants/app";
import { Colors, Spacing, Radius, FontSize } from "../../constants/theme";
import { formatDate } from "../../utils/helpers";
import type { InspectionCase, Vehicle, CaseMedia, Finding } from "../../types/models";

export default function CaseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState<InspectionCase | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [media, setMedia] = useState<CaseMedia[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [vinHistory, setVinHistory] = useState<InspectionCase[]>([]);

  useEffect(() => {
    loadAll();
  }, [id]);

  const loadAll = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const c = await fetchCase(id);
      setCaseData(c);
      if (c) {
        const [v, m, f] = await Promise.all([
          fetchVehicle(c.vehicleId),
          fetchCaseMedia(c.id),
          fetchFindings(c.id),
        ]);
        setVehicle(v);
        setMedia(m);

        if (f.length === 0 && c.status === "submitted") {
          const mocked = await generateMockFindings(c.id);
          setFindings(mocked);
        } else {
          setFindings(f);
        }

        // Load VIN history
        if (v) {
          const history = await fetchVinHistory(v.vin);
          // Exclude current case
          setVinHistory(history.filter((h) => h.id !== c.id));
        }
      }
    } catch {
      Alert.alert("Fehler", "Daten konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      </Screen>
    );
  }

  if (!caseData || !vehicle) {
    return (
      <Screen>
        <Spacer size="xxl" />
        <Typo variant="h3" center>Fall nicht gefunden</Typo>
        <Spacer size="lg" />
        <Button label="Zurück" variant="outline" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Spacer size="md" />
      <View style={styles.topBar}>
        <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} onPress={() => router.back()} />
        <Typo variant="h3">Falldetails</Typo>
        <View style={{ width: 24 }} />
      </View>

      <Spacer size="lg" />

      {/* Status */}
      <View style={styles.statusRow}>
        <View style={[styles.statusBadge, { backgroundColor: statusColor(caseData.status) }]}>
          <Typo variant="caption" color={Colors.textOnPrimary} style={{ fontSize: 12, fontWeight: "600" }}>
            {CASE_STATUS_LABELS[caseData.status]}
          </Typo>
        </View>
        <Typo variant="caption">{formatDate(caseData.createdAt)}</Typo>
      </View>

      <Spacer size="lg" />

      {/* Vehicle */}
      <View style={styles.card}>
        <Typo variant="body" style={styles.sectionTitle}>Fahrzeug</Typo>
        <Spacer size="sm" />
        <InfoRow label="Marke" value={vehicle.make} />
        <InfoRow label="Modell" value={vehicle.model} />
        <InfoRow label="Baujahr" value={String(vehicle.year)} />
        <InfoRow label="km-Stand" value={`${vehicle.mileage.toLocaleString("de-DE")} km`} />
        <InfoRow label="FIN" value={vehicle.vin} />
      </View>

      <Spacer size="md" />

      {/* Tier */}
      <View style={styles.card}>
        <Typo variant="body" style={styles.sectionTitle}>Inspektionsart</Typo>
        <Spacer size="sm" />
        <Typo variant="body">{SERVICE_TIER_LABELS[caseData.serviceTier]}</Typo>
        {caseData.notes ? (
          <Typo variant="caption" style={{ marginTop: 4 }}>Notizen: {caseData.notes}</Typo>
        ) : null}
      </View>

      <Spacer size="md" />

      {/* Photos */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Typo variant="body" style={styles.sectionTitle}>Fotos ({media.length}/8)</Typo>
          <TouchableOpacity onPress={() => router.push(`/case/upload?caseId=${caseData.id}`)}>
            <Typo variant="caption" color={Colors.accent}>Ergänzen</Typo>
          </TouchableOpacity>
        </View>
        <Spacer size="sm" />
        {media.length === 0 ? (
          <EmptyState icon="images-outline" text="Noch keine Fotos hochgeladen" />
        ) : (
          <View style={styles.photoGrid}>
            {media.map((m) => (
              <View key={m.id} style={styles.photoItem}>
                <Image source={{ uri: m.url }} style={styles.photoThumb} />
                <Typo variant="caption" style={styles.photoLabel}>
                  {MEDIA_CATEGORY_LABELS[m.category]?.split(" / ")[0]?.split(" ")[0]}
                </Typo>
              </View>
            ))}
          </View>
        )}
      </View>

      <Spacer size="md" />

      {/* Findings */}
      <View style={styles.card}>
        <Typo variant="body" style={styles.sectionTitle}>Befunde ({findings.length})</Typo>
        <Spacer size="sm" />
        {findings.length === 0 ? (
          <EmptyState icon="search-outline" text="Noch keine Befunde" />
        ) : (
          findings.map((f) => (
            <View key={f.id} style={styles.findingItem}>
              <View style={[styles.dot, { backgroundColor: SEVERITY_COLORS[f.severity] }]} />
              <View style={{ flex: 1 }}>
                <Typo variant="body" style={{ fontSize: FontSize.sm, fontWeight: "600" }}>{f.label}</Typo>
                <Typo variant="caption" style={{ fontSize: FontSize.xs }}>
                  {SEVERITY_LABELS[f.severity]} · {f.source === "ai" ? "KI" : f.source === "inspector" ? "Prüfer" : "Bestätigt"} · {Math.round(f.confidence * 100)}%
                </Typo>
                {f.notes ? <Typo variant="caption" style={{ fontSize: FontSize.xs, marginTop: 2 }}>{f.notes}</Typo> : null}
              </View>
            </View>
          ))
        )}
      </View>

      <Spacer size="md" />

      {/* VIN History */}
      <View style={styles.card}>
        <Typo variant="body" style={styles.sectionTitle}>
          FIN-Verlauf ({vinHistory.length} weitere)
        </Typo>
        <Spacer size="sm" />
        {vinHistory.length === 0 ? (
          <EmptyState icon="car-outline" text="Keine weiteren Inspektionen für diese FIN" />
        ) : (
          vinHistory.map((h) => (
            <TouchableOpacity
              key={h.id}
              style={styles.historyItem}
              onPress={() => router.push(`/case/${h.id}`)}
            >
              <View style={{ flex: 1 }}>
                <Typo variant="body" style={{ fontSize: FontSize.sm, fontWeight: "600" }}>
                  Fall #{h.id.slice(-6)}
                </Typo>
                <Typo variant="caption" style={{ fontSize: FontSize.xs }}>
                  {formatDate(h.createdAt)} · {CASE_STATUS_LABELS[h.status]}
                </Typo>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          ))
        )}
      </View>

      <Spacer size="lg" />

      {/* Actions */}
      {caseData.status === "draft" && (
        <Button label="Fotos hochladen" onPress={() => router.push(`/case/upload?caseId=${caseData.id}`)} />
      )}
      {caseData.status !== "draft" && (
        <Button label="Bericht anzeigen" onPress={() => router.push(`/case/report?caseId=${caseData.id}`)} />
      )}

      <Spacer size="xxl" />
    </Screen>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Typo variant="caption" style={{ width: 75 }}>{label}</Typo>
      <Typo variant="body" style={{ flex: 1, fontWeight: "500", fontSize: FontSize.sm }}>{value}</Typo>
    </View>
  );
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name={icon as any} size={28} color={Colors.textMuted} />
      <Spacer size="xs" />
      <Typo variant="caption" center>{text}</Typo>
    </View>
  );
}

function statusColor(s: string) {
  switch (s) {
    case "completed": return Colors.success;
    case "reviewing": return Colors.warning;
    case "submitted": return Colors.info;
    default: return Colors.textMuted;
  }
}

const styles = StyleSheet.create({
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  statusRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  statusBadge: { paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: Radius.full },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  sectionTitle: { fontWeight: "700" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  infoRow: { flexDirection: "row", paddingVertical: 5 },
  emptyState: { alignItems: "center", paddingVertical: Spacing.md },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  photoItem: { width: "48%", marginBottom: Spacing.xs },
  photoThumb: { width: "100%", height: 100, borderRadius: Radius.sm, backgroundColor: Colors.border },
  photoLabel: { fontSize: 10, textAlign: "center", marginTop: 3 },
  findingItem: { flexDirection: "row", alignItems: "flex-start", paddingVertical: Spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 4, marginRight: Spacing.sm },
  historyItem: { flexDirection: "row", alignItems: "center", paddingVertical: Spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border },
});
