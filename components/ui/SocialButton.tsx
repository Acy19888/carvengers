import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, Radius } from "../../constants/theme";

interface Props {
  provider: "google" | "apple";
  onPress: () => void;
  loading?: boolean;
  style?: ViewStyle;
}

const CONFIG = {
  google: {
    label: "Mit Google anmelden",
    icon: "logo-google" as const,
    bg: "#FFFFFF",
    border: "#DADCE0",
    text: "#3C4043",
    iconColor: "#4285F4",
  },
  apple: {
    label: "Mit Apple anmelden",
    icon: "logo-apple" as const,
    bg: "#000000",
    border: "#000000",
    text: "#FFFFFF",
    iconColor: "#FFFFFF",
  },
};

export function SocialButton({ provider, onPress, loading, style }: Props) {
  const c = CONFIG[provider];

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        { backgroundColor: c.bg, borderColor: c.border },
        style,
      ]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator size="small" color={c.text} />
      ) : (
        <View style={styles.inner}>
          <Ionicons name={c.icon} size={20} color={c.iconColor} />
          <Text style={[styles.label, { color: c.text }]}>{c.label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 52,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.md,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: "600",
    marginLeft: Spacing.sm,
  },
});
