import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Rect, Circle, Text as SvgText, G } from "react-native-svg";
import { Typo } from "../ui/Typo";
import { Spacing, Radius } from "../../constants/theme";
import { useTheme } from "../../store/themeContext";
import type { DamageDetection, DamageLocation } from "../../services/damageDetection";

interface Props {
  damages: DamageDetection[];
}

// Map damage locations to XY on a top-down car view (400x250 viewBox)
const LOCATION_COORDS: Record<DamageLocation, { x: number; y: number }> = {
  front_bumper: { x: 200, y: 25 },
  hood: { x: 200, y: 60 },
  windshield: { x: 200, y: 95 },
  roof: { x: 200, y: 130 },
  trunk: { x: 200, y: 195 },
  rear_bumper: { x: 200, y: 230 },
  left_fender: { x: 100, y: 65 },
  right_fender: { x: 300, y: 65 },
  left_door: { x: 95, y: 130 },
  right_door: { x: 305, y: 130 },
  left_quarter: { x: 100, y: 185 },
  right_quarter: { x: 300, y: 185 },
  headlight_left: { x: 140, y: 30 },
  headlight_right: { x: 260, y: 30 },
  taillight_left: { x: 140, y: 225 },
  taillight_right: { x: 260, y: 225 },
};

const SEV_COLORS = { low: "#22C55E", medium: "#F59E0B", high: "#EF4444" };

export function DamageVisualization({ damages }: Props) {
  const { colors } = useTheme();

  if (damages.length === 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Typo variant="body" style={{ fontWeight: "700", marginBottom: Spacing.sm }}>
        Schadensübersicht
      </Typo>

      <Svg width="100%" height={250} viewBox="0 0 400 250">
        {/* Car outline - top down view */}
        <G opacity={0.15}>
          {/* Body */}
          <Rect x={120} y={15} width={160} height={220} rx={30} fill={colors.textPrimary} />
          {/* Windshield */}
          <Rect x={140} y={80} width={120} height={35} rx={8} fill={colors.textPrimary} opacity={0.5} />
          {/* Rear window */}
          <Rect x={145} y={175} width={110} height={30} rx={8} fill={colors.textPrimary} opacity={0.5} />
          {/* Side mirrors */}
          <Rect x={105} y={85} width={20} height={12} rx={6} fill={colors.textPrimary} />
          <Rect x={275} y={85} width={20} height={12} rx={6} fill={colors.textPrimary} />
          {/* Wheels */}
          <Rect x={108} y={55} width={18} height={35} rx={5} fill={colors.textPrimary} opacity={0.7} />
          <Rect x={274} y={55} width={18} height={35} rx={5} fill={colors.textPrimary} opacity={0.7} />
          <Rect x={108} y={165} width={18} height={35} rx={5} fill={colors.textPrimary} opacity={0.7} />
          <Rect x={274} y={165} width={18} height={35} rx={5} fill={colors.textPrimary} opacity={0.7} />
        </G>

        {/* Damage markers */}
        {damages.map((d, i) => {
          const pos = LOCATION_COORDS[d.location];
          if (!pos) return null;
          const color = SEV_COLORS[d.severity];
          return (
            <G key={d.id}>
              <Circle cx={pos.x} cy={pos.y} r={14} fill={color} opacity={0.25} />
              <Circle cx={pos.x} cy={pos.y} r={9} fill={color} />
              <SvgText
                x={pos.x}
                y={pos.y + 4}
                fontSize={10}
                fontWeight="bold"
                fill="white"
                textAnchor="middle"
              >
                {i + 1}
              </SvgText>
            </G>
          );
        })}

        {/* Direction label */}
        <SvgText x={200} y={12} fontSize={9} fill={colors.textMuted} textAnchor="middle">FRONT</SvgText>
        <SvgText x={200} y={248} fontSize={9} fill={colors.textMuted} textAnchor="middle">HECK</SvgText>
      </Svg>

      {/* Legend */}
      <View style={styles.legend}>
        {damages.map((d, i) => (
          <View key={d.id} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: SEV_COLORS[d.severity] }]}>
              <Typo variant="caption" color="white" style={{ fontSize: 9, fontWeight: "700" }}>{i + 1}</Typo>
            </View>
            <View style={{ flex: 1 }}>
              <Typo variant="caption" style={{ fontSize: 11, fontWeight: "600" }}>{d.description}</Typo>
              <Typo variant="caption" style={{ fontSize: 10, color: colors.textMuted }}>
                {d.confidence > 0.8 ? "Hohe" : "Mittlere"} Konfidenz · {d.estimatedRepairCost > 0 ? `~${d.estimatedRepairCost}€ Reparatur` : "Kosmetisch"}
              </Typo>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1 },
  legend: { marginTop: Spacing.sm },
  legendItem: { flexDirection: "row", alignItems: "center", paddingVertical: 4 },
  legendDot: { width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", marginRight: Spacing.sm },
});
