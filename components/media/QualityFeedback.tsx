import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Typo } from "../ui/Typo";
import { Spacing, Radius } from "../../constants/theme";
import type { CaptureQuality } from "../../services/captureQuality";

interface Props {
  quality: CaptureQuality | null;
}

export function QualityFeedback({ quality }: Props) {
  if (!quality || (quality.isAcceptable && quality.issues.length === 0)) return null;

  const hasError = quality.issues.some(i => i.severity === "error");
  const bgColor = hasError ? "rgba(239,68,68,0.12)" : "rgba(245,158,11,0.12)";
  const borderColor = hasError ? "#EF4444" : "#F59E0B";
  const iconColor = hasError ? "#EF4444" : "#F59E0B";
  const icon = hasError ? "alert-circle" : "warning";

  return (
    <View style={[styles.container, { backgroundColor: bgColor, borderColor }]}>
      <Ionicons name={icon as any} size={20} color={iconColor} />
      <View style={styles.textWrap}>
        {quality.issues.map((issue, i) => (
          <Typo key={i} variant="caption" style={{ fontSize: 12, fontWeight: "600", marginBottom: i < quality.issues.length - 1 ? 2 : 0 }}>
            {issue.label}
          </Typo>
        ))}
        {!quality.isAcceptable && (
          <Typo variant="caption" style={{ fontSize: 10, marginTop: 2, color: iconColor }}>
            Bitte erneut aufnehmen für bessere Ergebnisse
          </Typo>
        )}
      </View>
      <View style={[styles.scoreBadge, { backgroundColor: borderColor }]}>
        <Typo variant="caption" color="white" style={{ fontSize: 11, fontWeight: "700" }}>
          {quality.score}%
        </Typo>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginTop: Spacing.sm,
  },
  textWrap: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  scoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: Spacing.sm,
  },
});
