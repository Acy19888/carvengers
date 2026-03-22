import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, RefreshControl, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Typo, Spacer } from "../../components/ui";
import { useAuthStore } from "../../store/authStore";
import { useTheme } from "../../store/themeContext";
import { useCaseStore } from "../../store/caseStore";
import { Spacing, Radius, FontSize } from "../../constants/theme";
import { CASE_STATUS_LABELS } from "../../constants/app";
import { formatDate } from "../../utils/helpers";

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const { colors } = useTheme();
  const { cases, loadCases } = useCaseStore();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { if (user) loadCases(user.id); }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user) await loadCases(user.id);
    setRefreshing(false);
  };

  const total = cases.length;
  const submitted = cases.filter(c => c.status === "submitted").length;
  const reviewing = cases.filter(c => c.status === "reviewing").length;
  const completed = cases.filter(c => c.status === "completed").length;
  const pending = cases.filter(c => c.status === "submitted" || c.status === "reviewing");

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        <Spacer size="xxl" />
        <Spacer size="md" />
        <Typo variant="h2">Dashboard</Typo>
        <Typo variant="caption" style={{ color: colors.textMuted }}>Übersicht deiner Inspektionen</Typo>

        <Spacer size="lg" />

        {/* Stats 2x2 */}
        <View style={s.statsRow}>
          <View style={[s.statCard, { backgroundColor: colors.accent }]}>
            <Typo variant="h2" color="white">{total}</Typo>
            <Typo variant="caption" color="rgba(255,255,255,0.8)" style={{ fontSize: 11 }}>Gesamt</Typo>
          </View>
          <View style={[s.statCard, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}>
            <Typo variant="h2" style={{ color: colors.warning }}>{submitted}</Typo>
            <Typo variant="caption" style={{ fontSize: 11 }}>Eingereicht</Typo>
          </View>
        </View>
        <View style={s.statsRow}>
          <View style={[s.statCard, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}>
            <Typo variant="h2" style={{ color: colors.info }}>{reviewing}</Typo>
            <Typo variant="caption" style={{ fontSize: 11 }}>In Prüfung</Typo>
          </View>
          <View style={[s.statCard, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}>
            <Typo variant="h2" style={{ color: colors.success }}>{completed}</Typo>
            <Typo variant="caption" style={{ fontSize: 11 }}>Abgeschlossen</Typo>
          </View>
        </View>

        <Spacer size="lg" />

        {/* Quick Actions */}
        <Typo variant="body" style={{ fontWeight: "700" }}>Schnellaktionen</Typo>
        <Spacer size="sm" />
        <View style={s.actionsRow}>
          <TouchableOpacity style={[s.actionCard, { backgroundColor: colors.accent }]} onPress={() => router.push("/case/create")} activeOpacity={0.7}>
            <Ionicons name="add-circle" size={24} color="white" />
            <Typo variant="caption" color="white" style={{ fontWeight: "600", marginTop: 4, fontSize: 11 }}>Neue Inspektion</Typo>
          </TouchableOpacity>
          <TouchableOpacity style={[s.actionCard, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]} onPress={() => router.push("/(tabs)/history")} activeOpacity={0.7}>
            <Ionicons name="list" size={24} color={colors.accent} />
            <Typo variant="caption" style={{ fontWeight: "600", marginTop: 4, fontSize: 11 }}>Alle Fälle</Typo>
          </TouchableOpacity>
          <TouchableOpacity style={[s.actionCard, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]} onPress={() => router.push("/(tabs)/marketplace")} activeOpacity={0.7}>
            <Ionicons name="car-sport" size={24} color={colors.accent} />
            <Typo variant="caption" style={{ fontWeight: "600", marginTop: 4, fontSize: 11 }}>Marktplatz</Typo>
          </TouchableOpacity>
        </View>

        <Spacer size="lg" />

        {/* Pending */}
        <Typo variant="body" style={{ fontWeight: "700" }}>Offene Fälle ({pending.length})</Typo>
        <Spacer size="sm" />

        {pending.length === 0 ? (
          <View style={[s.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="checkmark-circle" size={28} color={colors.success} />
            <Spacer size="xs" />
            <Typo variant="caption">Keine offenen Fälle</Typo>
          </View>
        ) : (
          pending.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[s.caseCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => router.push(`/case/${c.id}`)}
              activeOpacity={0.7}
            >
              <View style={[s.dot, { backgroundColor: c.status === "submitted" ? colors.warning : colors.info }]} />
              <View style={{ flex: 1 }}>
                <Typo variant="body" style={{ fontWeight: "600", fontSize: FontSize.sm }}>Fall #{c.id.slice(-6)}</Typo>
                <Typo variant="caption" style={{ fontSize: 11, color: colors.textMuted }}>{formatDate(c.createdAt)} · {CASE_STATUS_LABELS[c.status]}</Typo>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ))
        )}

        <Spacer size="lg" />

        {/* Completed */}
        {completed > 0 && (
          <>
            <Typo variant="body" style={{ fontWeight: "700" }}>Kürzlich abgeschlossen</Typo>
            <Spacer size="sm" />
            {cases.filter(c => c.status === "completed").slice(0, 3).map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[s.caseCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => router.push(`/case/${c.id}`)}
                activeOpacity={0.7}
              >
                <View style={[s.dot, { backgroundColor: colors.success }]} />
                <View style={{ flex: 1 }}>
                  <Typo variant="body" style={{ fontWeight: "600", fontSize: FontSize.sm }}>Fall #{c.id.slice(-6)}</Typo>
                  <Typo variant="caption" style={{ fontSize: 11, color: colors.textMuted }}>{formatDate(c.createdAt)}</Typo>
                </View>
                <Ionicons name="document-text" size={18} color={colors.accent} />
              </TouchableOpacity>
            ))}
          </>
        )}

        <Spacer size="xxl" />
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  statsRow: { flexDirection: "row", gap: Spacing.sm, marginBottom: Spacing.sm },
  statCard: { flex: 1, borderRadius: Radius.lg, paddingVertical: Spacing.lg, alignItems: "center" },
  actionsRow: { flexDirection: "row", gap: Spacing.sm },
  actionCard: { flex: 1, borderRadius: Radius.lg, paddingVertical: Spacing.lg, alignItems: "center" },
  emptyCard: { borderRadius: Radius.lg, padding: Spacing.xl, alignItems: "center", borderWidth: 1 },
  caseCard: { flexDirection: "row", alignItems: "center", padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, marginBottom: Spacing.sm },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: Spacing.md },
});
