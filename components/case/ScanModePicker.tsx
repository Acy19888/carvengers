import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Typo } from "../ui/Typo";
import { useTheme } from "../../store/themeContext";
import { Spacing, Radius, FontSize } from "../../constants/theme";
import { SCAN_MODE_LABELS, SCAN_MODE_DESCRIPTIONS, SCAN_MODE_TIMES, SCAN_MODE_ICONS, SCAN_MODE_STEPS } from "../../constants/app";
import type { ScanMode } from "../../types/models";

interface Props {
  selected: ScanMode | null;
  onSelect: (mode: ScanMode) => void;
}

const MODES: ScanMode[] = ["quick_seller", "full_ai", "expert"];

export function ScanModePicker({ selected, onSelect }: Props) {
  const { colors } = useTheme();

  return (
    <View>
      {MODES.map((mode) => {
        const isActive = selected === mode;
        const stepCount = SCAN_MODE_STEPS[mode].length;

        return (
          <TouchableOpacity
            key={mode}
            style={[
              styles.card,
              {
                borderColor: isActive ? colors.accent : colors.border,
                backgroundColor: isActive ? colors.accentLight : colors.surface,
              },
            ]}
            activeOpacity={0.7}
            onPress={() => onSelect(mode)}
          >
            <View style={[
              styles.iconWrap,
              { backgroundColor: isActive ? colors.accent : `${colors.accent}18` },
            ]}>
              <Ionicons
                name={SCAN_MODE_ICONS[mode] as any}
                size={22}
                color={isActive ? colors.textOnPrimary : colors.accent}
              />
            </View>

            <View style={styles.textWrap}>
              <View style={styles.titleRow}>
                <Typo variant="body" style={{ fontWeight: "700", fontSize: FontSize.sm }}>
                  {SCAN_MODE_LABELS[mode]}
                </Typo>
                <View style={[styles.timeBadge, { backgroundColor: isActive ? colors.accent : colors.border }]}>
                  <Typo variant="caption" style={{ fontSize: 10, fontWeight: "600", color: isActive ? colors.textOnPrimary : colors.textSecondary }}>
                    {SCAN_MODE_TIMES[mode]}
                  </Typo>
                </View>
              </View>
              <Typo variant="caption" style={{ fontSize: FontSize.xs, marginTop: 2 }}>
                {SCAN_MODE_DESCRIPTIONS[mode]}
              </Typo>
              <Typo variant="caption" style={{ fontSize: 10, marginTop: 4, color: colors.textMuted }}>
                {stepCount} Schritte
              </Typo>
            </View>

            {isActive && (
              <Ionicons name="checkmark-circle" size={24} color={colors.accent} style={{ marginLeft: 8 }} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1.5,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  textWrap: { flex: 1 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
});
