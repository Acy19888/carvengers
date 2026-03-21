import React from "react";
import { Text, StyleSheet, TextProps } from "react-native";
import { useTheme } from "../../store/themeContext";
import { FontSize } from "../../constants/theme";

interface Props extends TextProps {
  variant?: "h1" | "h2" | "h3" | "body" | "caption";
  color?: string;
  center?: boolean;
}

export function Typo({ variant = "body", color, center, style, ...rest }: Props) {
  const { colors } = useTheme();

  const variantColor =
    variant === "caption" ? colors.textSecondary : colors.textPrimary;

  return (
    <Text
      style={[
        styles[variant],
        { color: color ?? variantColor },
        center && styles.center,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: FontSize.xxl, fontWeight: "700", letterSpacing: -0.5 },
  h2: { fontSize: FontSize.xl, fontWeight: "600" },
  h3: { fontSize: FontSize.lg, fontWeight: "600" },
  body: { fontSize: FontSize.md, lineHeight: 24 },
  caption: { fontSize: FontSize.sm },
  center: { textAlign: "center" },
});
