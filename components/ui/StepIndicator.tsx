import React from "react";
import { View, StyleSheet } from "react-native";
import { Colors, Spacing } from "../../constants/theme";

interface Props {
  total: number;
  current: number;
}

export function StepIndicator({ total, current }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[styles.dot, i <= current ? styles.active : styles.inactive]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
    marginVertical: Spacing.md,
  },
  dot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  active: {
    backgroundColor: Colors.accent,
  },
  inactive: {
    backgroundColor: Colors.border,
  },
});
