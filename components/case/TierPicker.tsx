import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Typo } from "../ui/Typo";
import { Colors, Spacing, Radius, FontSize } from "../../constants/theme";
import { SERVICE_TIER_LABELS } from "../../constants/app";
import type { ServiceTier } from "../../types/models";

interface Props {
  selected: ServiceTier | null;
  onSelect: (tier: ServiceTier) => void;
}

const TIERS: { key: ServiceTier; icon: string; desc: string }[] = [
  { key: "ai_only", icon: "sparkles", desc: "Schnelle KI-Analyse deiner Fotos" },
  { key: "video", icon: "videocam", desc: "Live-Videogespräch mit zertifiziertem Prüfer" },
  { key: "onsite", icon: "location", desc: "Prüfer kommt zum Standort des Fahrzeugs" },
  { key: "workshop", icon: "build", desc: "Vollständige Werkstattprüfung mit Hebebühne" },
];

export function TierPicker({ selected, onSelect }: Props) {
  return (
    <View>
      {TIERS.map((t) => {
        const isActive = selected === t.key;
        return (
          <TouchableOpacity
            key={t.key}
            style={[styles.card, isActive && styles.cardActive]}
            activeOpacity={0.7}
            onPress={() => onSelect(t.key)}
          >
            <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
              <Ionicons
                name={t.icon as any}
                size={22}
                color={isActive ? Colors.textOnPrimary : Colors.accent}
              />
            </View>
            <View style={styles.textWrap}>
              <Typo variant="body" style={{ fontWeight: "600", fontSize: FontSize.sm }}>
                {SERVICE_TIER_LABELS[t.key]}
              </Typo>
              <Typo variant="caption" style={{ fontSize: FontSize.xs }}>
                {t.desc}
              </Typo>
            </View>
            {isActive && (
              <Ionicons name="checkmark-circle" size={24} color={Colors.accent} />
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
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  cardActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentLight,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: Colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  iconWrapActive: { backgroundColor: Colors.accent },
  textWrap: { flex: 1 },
});
