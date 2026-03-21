import React from "react";
import { View } from "react-native";
import { Spacing } from "../../constants/theme";

type Size = keyof typeof Spacing;

export function Spacer({ size = "md" }: { size?: Size }) {
  return <View style={{ height: Spacing[size] }} />;
}
