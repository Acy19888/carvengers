import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Svg, { Path, Circle, Rect, Ellipse, Line, G, Defs, Mask } from "react-native-svg";
import { Typo } from "../ui/Typo";
import type { MediaCategory } from "../../types/models";

const { width: SW } = Dimensions.get("window");
const W = SW;
const H = SW * 1.1;

interface Props {
  category: MediaCategory;
}

const HINTS: Record<MediaCategory, string> = {
  front: "Fahrzeug mittig ausrichten",
  rear: "Heck mittig ausrichten",
  left: "Linke Seite vollständig erfassen",
  right: "Rechte Seite vollständig erfassen",
  tire: "Reifen & Profil mittig erfassen",
  interior: "Lenkrad & Armaturenbrett zeigen",
  odometer: "Kilometerstand gut lesbar erfassen",
  service_book: "Seite flach & lesbar fotografieren",
};

export function CameraOverlay({ category }: Props) {
  return (
    <View style={styles.container} pointerEvents="none">
      <Svg width={W} height={H} viewBox={`0 0 400 440`}>
        <G opacity={0.55}>
          {renderGuide(category)}
        </G>
      </Svg>
      <View style={styles.label}>
        <Typo variant="caption" color="rgba(255,255,255,0.95)" center>
          {HINTS[category]}
        </Typo>
      </View>
    </View>
  );
}

function renderGuide(cat: MediaCategory) {
  const s = "white";
  const w = 1.8;
  const d = "6,5";

  switch (cat) {
    case "front":
      return (
        <G>
          {/* Sedan front – clean outline */}
          <Path
            d="M120 300 L120 260 Q120 240 130 230 L150 200 Q160 185 180 175 L220 175 Q240 185 250 200 L270 230 Q280 240 280 260 L280 300 Z"
            stroke={s} strokeWidth={w} fill="none" strokeDasharray={d}
          />
          {/* Windshield */}
          <Path
            d="M155 200 Q200 185 245 200 L240 220 Q200 212 160 220 Z"
            stroke={s} strokeWidth={1.2} fill="none" strokeDasharray="4,4"
          />
          {/* Headlights */}
          <Ellipse cx={145} cy={255} rx={16} ry={10} stroke={s} strokeWidth={1.2} fill="none" strokeDasharray="4,4" />
          <Ellipse cx={255} cy={255} rx={16} ry={10} stroke={s} strokeWidth={1.2} fill="none" strokeDasharray="4,4" />
          {/* Grille */}
          <Rect x={170} y={262} width={60} height={18} rx={5} stroke={s} strokeWidth={1.2} fill="none" strokeDasharray="4,4" />
          {/* Bumper line */}
          <Line x1={130} y1={295} x2={270} y2={295} stroke={s} strokeWidth={1} strokeDasharray="4,4" />
          {/* Corner markers for framing */}
          <Path d="M80 150 L80 130 L100 130" stroke={s} strokeWidth={2.5} fill="none" />
          <Path d="M320 150 L320 130 L300 130" stroke={s} strokeWidth={2.5} fill="none" />
          <Path d="M80 330 L80 350 L100 350" stroke={s} strokeWidth={2.5} fill="none" />
          <Path d="M320 330 L320 350 L300 350" stroke={s} strokeWidth={2.5} fill="none" />
        </G>
      );

    case "rear":
      return (
        <G>
          {/* Sedan rear */}
          <Path
            d="M125 300 L125 260 Q125 242 135 232 L152 205 Q165 190 185 182 L215 182 Q235 190 248 205 L265 232 Q275 242 275 260 L275 300 Z"
            stroke={s} strokeWidth={w} fill="none" strokeDasharray={d}
          />
          {/* Rear window */}
          <Path
            d="M158 208 Q200 195 242 208 L238 225 Q200 218 162 225 Z"
            stroke={s} strokeWidth={1.2} fill="none" strokeDasharray="4,4"
          />
          {/* Tail lights */}
          <Rect x={130} y={250} width={28} height={14} rx={4} stroke={s} strokeWidth={1.2} fill="none" strokeDasharray="4,4" />
          <Rect x={242} y={250} width={28} height={14} rx={4} stroke={s} strokeWidth={1.2} fill="none" strokeDasharray="4,4" />
          {/* License plate */}
          <Rect x={165} y={272} width={70} height={18} rx={3} stroke={s} strokeWidth={1.5} fill="none" strokeDasharray="4,4" />
          {/* Corner markers */}
          <Path d="M80 150 L80 130 L100 130" stroke={s} strokeWidth={2.5} fill="none" />
          <Path d="M320 150 L320 130 L300 130" stroke={s} strokeWidth={2.5} fill="none" />
          <Path d="M80 330 L80 350 L100 350" stroke={s} strokeWidth={2.5} fill="none" />
          <Path d="M320 330 L320 350 L300 350" stroke={s} strokeWidth={2.5} fill="none" />
        </G>
      );

    case "left":
    case "right":
      return (
        <G>
          {/* Side profile – sedan proportions */}
          <Path
            d="M60 275 L60 250 L80 245 L110 240 L130 210 Q150 185 180 180 L250 180 Q270 185 280 195 L300 220 L330 240 L340 250 L340 275 Z"
            stroke={s} strokeWidth={w} fill="none" strokeDasharray={d}
          />
          {/* Wheels */}
          <Circle cx={115} cy={275} r={24} stroke={s} strokeWidth={w} fill="none" strokeDasharray="4,4" />
          <Circle cx={115} cy={275} r={12} stroke={s} strokeWidth={1} fill="none" strokeDasharray="3,3" />
          <Circle cx={300} cy={275} r={24} stroke={s} strokeWidth={w} fill="none" strokeDasharray="4,4" />
          <Circle cx={300} cy={275} r={12} stroke={s} strokeWidth={1} fill="none" strokeDasharray="3,3" />
          {/* Windows */}
          <Path
            d="M140 212 Q160 190 185 185 L245 185 Q260 188 268 198 L280 215 L280 235 L140 235 Z"
            stroke={s} strokeWidth={1.2} fill="none" strokeDasharray="4,4"
          />
          {/* Window divider (B-pillar) */}
          <Line x1={215} y1={188} x2={215} y2={235} stroke={s} strokeWidth={1} strokeDasharray="3,3" />
          {/* Door handle */}
          <Line x1={195} y1={248} x2={220} y2={248} stroke={s} strokeWidth={1.5} strokeDasharray="3,3" />
          {/* Corner markers */}
          <Path d="M30 150 L30 130 L50 130" stroke={s} strokeWidth={2.5} fill="none" />
          <Path d="M370 150 L370 130 L350 130" stroke={s} strokeWidth={2.5} fill="none" />
          <Path d="M30 320 L30 340 L50 340" stroke={s} strokeWidth={2.5} fill="none" />
          <Path d="M370 320 L370 340 L350 340" stroke={s} strokeWidth={2.5} fill="none" />
        </G>
      );

    case "tire":
      return (
        <G>
          {/* Outer tire */}
          <Circle cx={200} cy={220} r={95} stroke={s} strokeWidth={w} fill="none" strokeDasharray={d} />
          {/* Sidewall */}
          <Circle cx={200} cy={220} r={78} stroke={s} strokeWidth={1} fill="none" strokeDasharray="3,3" />
          {/* Rim */}
          <Circle cx={200} cy={220} r={55} stroke={s} strokeWidth={w} fill="none" strokeDasharray="4,4" />
          {/* Hub */}
          <Circle cx={200} cy={220} r={15} stroke={s} strokeWidth={1.5} fill="none" strokeDasharray="3,3" />
          {/* Spokes */}
          {[0, 72, 144, 216, 288].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            return (
              <Line
                key={angle}
                x1={200 + Math.cos(rad) * 18}
                y1={220 + Math.sin(rad) * 18}
                x2={200 + Math.cos(rad) * 52}
                y2={220 + Math.sin(rad) * 52}
                stroke={s} strokeWidth={1} strokeDasharray="3,3"
              />
            );
          })}
          {/* Label: Profil sichtbar */}
          <Path
            d="M130 340 Q200 360 270 340"
            stroke={s} strokeWidth={1} fill="none" strokeDasharray="4,4"
          />
        </G>
      );

    case "odometer":
      return (
        <G>
          {/* Gauge background */}
          <Circle cx={200} cy={220} r={85} stroke={s} strokeWidth={w} fill="none" strokeDasharray={d} />
          {/* Inner ring */}
          <Circle cx={200} cy={220} r={65} stroke={s} strokeWidth={1} fill="none" strokeDasharray="3,3" />
          {/* Speed marks */}
          {[...Array(12)].map((_, i) => {
            const angle = ((i * 30 - 90) * Math.PI) / 180;
            return (
              <Line
                key={i}
                x1={200 + Math.cos(angle) * 72}
                y1={220 + Math.sin(angle) * 72}
                x2={200 + Math.cos(angle) * 82}
                y2={220 + Math.sin(angle) * 82}
                stroke={s} strokeWidth={1.5}
              />
            );
          })}
          {/* Digital km readout area */}
          <Rect x={155} y={248} width={90} height={28} rx={6} stroke={s} strokeWidth={1.5} fill="none" strokeDasharray="4,4" />
          {/* "km" label hint */}
          <Line x1={175} y1={258} x2={225} y2={258} stroke={s} strokeWidth={1} strokeDasharray="3,3" />
        </G>
      );

    case "interior":
      return (
        <G>
          {/* Dashboard outline */}
          <Path
            d="M60 180 Q200 155 340 180 L340 300 L60 300 Z"
            stroke={s} strokeWidth={w} fill="none" strokeDasharray={d}
          />
          {/* Steering wheel */}
          <Circle cx={150} cy={260} r={45} stroke={s} strokeWidth={w} fill="none" strokeDasharray="4,4" />
          <Circle cx={150} cy={260} r={16} stroke={s} strokeWidth={1.2} fill="none" strokeDasharray="3,3" />
          {/* Steering column */}
          <Line x1={150} y1={305} x2={150} y2={290} stroke={s} strokeWidth={1.5} strokeDasharray="3,3" />
          {/* Center console / screen */}
          <Rect x={220} y={195} width={80} height={50} rx={6} stroke={s} strokeWidth={1.2} fill="none" strokeDasharray="4,4" />
          {/* Air vents */}
          <Rect x={225} y={260} width={30} height={12} rx={3} stroke={s} strokeWidth={1} fill="none" strokeDasharray="3,3" />
          <Rect x={265} y={260} width={30} height={12} rx={3} stroke={s} strokeWidth={1} fill="none" strokeDasharray="3,3" />
          {/* Corner markers */}
          <Path d="M40 140 L40 120 L60 120" stroke={s} strokeWidth={2.5} fill="none" />
          <Path d="M360 140 L360 120 L340 120" stroke={s} strokeWidth={2.5} fill="none" />
          <Path d="M40 320 L40 340 L60 340" stroke={s} strokeWidth={2.5} fill="none" />
          <Path d="M360 320 L360 340 L340 340" stroke={s} strokeWidth={2.5} fill="none" />
        </G>
      );

    case "service_book":
      return (
        <G>
          {/* Page outline */}
          <Rect x={90} y={80} width={220} height={300} rx={6} stroke={s} strokeWidth={w} fill="none" strokeDasharray={d} />
          {/* Spine shadow */}
          <Line x1={100} y1={85} x2={100} y2={375} stroke={s} strokeWidth={1} strokeDasharray="3,3" />
          {/* Header area */}
          <Rect x={120} y={110} width={160} height={14} rx={2} stroke={s} strokeWidth={1} fill="none" strokeDasharray="3,3" />
          {/* Text lines */}
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <Line
              key={i}
              x1={120} y1={155 + i * 28}
              x2={280} y2={155 + i * 28}
              stroke={s} strokeWidth={0.8} strokeDasharray="3,3"
            />
          ))}
          {/* Corner markers */}
          <Path d="M65 55 L65 40 L80 40" stroke={s} strokeWidth={2.5} fill="none" />
          <Path d="M335 55 L335 40 L320 40" stroke={s} strokeWidth={2.5} fill="none" />
          <Path d="M65 400 L65 415 L80 415" stroke={s} strokeWidth={2.5} fill="none" />
          <Path d="M335 400 L335 415 L320 415" stroke={s} strokeWidth={2.5} fill="none" />
        </G>
      );

    default:
      return null;
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    position: "absolute",
    bottom: 100,
    left: 24,
    right: 24,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
});
