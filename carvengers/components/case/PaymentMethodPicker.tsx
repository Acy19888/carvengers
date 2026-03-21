import React from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Typo } from "../ui/Typo";
import { Colors, Spacing, Radius, FontSize } from "../../constants/theme";
import type { PaymentMethod } from "../../constants/payment";

interface Props {
  selected: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
}

const METHODS: { key: PaymentMethod; icon: string; label: string; color: string; platforms: string[] }[] = [
  { key: "stripe", icon: "card", label: "Kreditkarte / Debitkarte", color: "#635BFF", platforms: ["ios", "android"] },
  { key: "paypal", icon: "logo-paypal", label: "PayPal", color: "#003087", platforms: ["ios", "android"] },
  { key: "google_pay", icon: "logo-google", label: "Google Pay", color: "#4285F4", platforms: ["android"] },
  { key: "apple_pay", icon: "logo-apple", label: "Apple Pay", color: "#000000", platforms: ["ios"] },
];

export function PaymentMethodPicker({ selected, onSelect }: Props) {
  const available = METHODS.filter((m) => m.platforms.includes(Platform.OS));

  return (
    <View>
      {available.map((m) => {
        const isActive = selected === m.key;
        return (
          <TouchableOpacity
            key={m.key}
            style={[styles.card, isActive && styles.cardActive]}
            activeOpacity={0.7}
            onPress={() => onSelect(m.key)}
          >
            <View style={[styles.iconWrap, { backgroundColor: isActive ? m.color : `${m.color}18` }]}>
              <Ionicons
                name={m.icon as any}
                size={20}
                color={isActive ? "#FFFFFF" : m.color}
              />
            </View>
            <Typo variant="body" style={{ flex: 1, fontWeight: "500", fontSize: FontSize.sm }}>
              {m.label}
            </Typo>
            {isActive && (
              <Ionicons name="checkmark-circle" size={22} color={Colors.accent} />
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
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
});
