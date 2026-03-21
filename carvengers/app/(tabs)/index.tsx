import React, { useEffect } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Button, Typo, Spacer, AnimatedCard } from "../../components/ui";
import { useTheme } from "../../store/themeContext";
import { useAuthStore } from "../../store/authStore";
import { useCaseStore } from "../../store/caseStore";
import { Spacing, Radius, FontSize } from "../../constants/theme";
import { CASE_STATUS_LABELS, SERVICE_TIER_LABELS } from "../../constants/app";
import { formatDate } from "../../utils/helpers";

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, logout } = useAuthStore();
  const { cases, loadCases } = useCaseStore();

  useEffect(() => {
    if (user) loadCases(user.id);
  }, [user]);

  return (
    <Screen scroll>
      <Spacer size="lg" />
      <View style={styles.header}>
        <View>
          <Typo variant="h2" style={[styles.brand, { color: colors.accent }]}>CARVENGERS</Typo>
          <Typo variant="caption">Willkommen, {user?.email}</Typo>
        </View>
        <Ionicons name="log-out-outline" size={24} color={colors.textSecondary} onPress={logout} />
      </View>

      <Spacer size="xl" />

      <AnimatedCard delay={100} style={{ alignItems: "center" }}>
        <Ionicons name="car-sport" size={48} color={colors.accent} />
        <Spacer size="md" />
        <Typo variant="h2" center>Fahrzeug prüfen</Typo>
        <Spacer size="xs" />
        <Typo variant="caption" center>
          Fotos hochladen, KI-Analyse erhalten und Expertenprüfung anfordern.
        </Typo>
        <Spacer size="lg" />
        <Button label="Neue Inspektion starten" onPress={() => router.push("/case/create")} />
      </AnimatedCard>

      <Spacer size="xl" />

      <Typo variant="h3">Letzte Fälle</Typo>
      <Spacer size="sm" />

      {cases.length === 0 ? (
        <AnimatedCard delay={200} style={{ alignItems: "center" }}>
          <Ionicons name="folder-open-outline" size={40} color={colors.textMuted} />
          <Spacer size="sm" />
          <Typo variant="caption" center>Noch keine Inspektionen. Starte deine erste oben!</Typo>
        </AnimatedCard>
      ) : (
        cases.map((c, i) => (
          <AnimatedCard key={c.id} delay={200 + i * 80}>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push(`/case/${c.id}`)}>
              <View style={styles.caseRow}>
                <View style={{ flex: 1 }}>
                  <Typo variant="body" style={{ fontWeight: "600" }}>Fall #{c.id.slice(-6)}</Typo>
                  <Typo variant="caption">{SERVICE_TIER_LABELS[c.serviceTier]} · {formatDate(c.createdAt)}</Typo>
                </View>
                <View style={[styles.badge, { backgroundColor: statusColor(c.status, colors) }]}>
                  <Typo variant="caption" color={colors.textOnPrimary} style={{ fontSize: 11 }}>
                    {CASE_STATUS_LABELS[c.status]}
                  </Typo>
                </View>
              </View>
            </TouchableOpacity>
          </AnimatedCard>
        ))
      )}
    </Screen>
  );
}

function statusColor(status: string, colors: any) {
  switch (status) {
    case "completed": return colors.success;
    case "reviewing": return colors.warning;
    case "submitted": return colors.info;
    default: return colors.textMuted;
  }
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brand: { letterSpacing: 3, fontSize: FontSize.lg, fontWeight: "800" },
  caseRow: { flexDirection: "row", alignItems: "center" },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.full },
});
