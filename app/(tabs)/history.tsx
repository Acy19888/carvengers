import React, { useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Typo, Spacer } from "../../components/ui";
import { useAuthStore } from "../../store/authStore";
import { useCaseStore } from "../../store/caseStore";
import { CASE_STATUS_LABELS, SERVICE_TIER_LABELS } from "../../constants/app";
import { Colors, Spacing, Radius } from "../../constants/theme";
import { formatDate } from "../../utils/helpers";

export default function HistoryScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { cases, loadCases, loading } = useCaseStore();

  useEffect(() => {
    if (user) loadCases(user.id);
  }, [user]);

  return (
    <Screen scroll>
      <Spacer size="xxl" />
      <Typo variant="h2">Inspektionsverlauf</Typo>
      <Spacer size="lg" />

      {loading ? (
        <ActivityIndicator size="large" color={Colors.accent} style={{ marginTop: 40 }} />
      ) : cases.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={48} color={Colors.textMuted} />
          <Spacer size="md" />
          <Typo variant="caption" center>
            Deine bisherigen Inspektionen erscheinen hier.
          </Typo>
        </View>
      ) : (
        cases.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={styles.caseCard}
            activeOpacity={0.7}
            onPress={() => router.push(`/case/${c.id}`)}
          >
            <View style={styles.caseRow}>
              <View style={{ flex: 1 }}>
                <Typo variant="body" style={{ fontWeight: "600" }}>
                  Fall #{c.id.slice(-6)}
                </Typo>
                <Typo variant="caption">
                  {SERVICE_TIER_LABELS[c.serviceTier]}
                </Typo>
                <Typo variant="caption" style={{ fontSize: 11 }}>
                  {formatDate(c.createdAt)}
                </Typo>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <View style={[styles.badge, { backgroundColor: statusColor(c.status) }]}>
                  <Typo variant="caption" color={Colors.textOnPrimary} style={{ fontSize: 11 }}>
                    {CASE_STATUS_LABELS[c.status]}
                  </Typo>
                </View>
                <Spacer size="xs" />
                <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}
    </Screen>
  );
}

function statusColor(status: string) {
  switch (status) {
    case "completed": return Colors.success;
    case "reviewing": return Colors.warning;
    case "submitted": return Colors.info;
    default: return Colors.textMuted;
  }
}

const styles = StyleSheet.create({
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  caseCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  caseRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
});
