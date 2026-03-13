import React, { useRef } from "react";
import {
  Animated,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  ViewStyle,
} from "react-native";
import { useTheme } from "../../store/themeContext";
import { Spacing, FontSize, Radius } from "../../constants/theme";

interface Props {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "outline" | "ghost";
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  style,
}: Props) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const isDisabled = disabled || loading;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }).start();
  };

  const bg = variant === "primary" ? colors.accent : "transparent";
  const borderColor = variant === "outline" ? colors.accent : "transparent";
  const textColor =
    variant === "primary" ? colors.textOnPrimary :
    colors.accent;

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[
          styles.base,
          { backgroundColor: bg, borderColor },
          variant === "outline" && styles.outline,
          isDisabled && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
            style={[styles.label, { color: textColor }]}
          >
            {label}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.md,
  },
  outline: {
    borderWidth: 1.5,
  },
  disabled: { opacity: 0.5 },
  label: { fontSize: FontSize.md, fontWeight: "600" },
});
