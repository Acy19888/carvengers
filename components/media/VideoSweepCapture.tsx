import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { Typo } from "../ui/Typo";
import { Spacing } from "../../constants/theme";

const { width: SW } = Dimensions.get("window");

interface Props {
  category: string;
  onCapture: (uri: string) => void;
  onClose: () => void;
}

const SWEEP_INFO: Record<string, { title: string; instruction: string }> = {
  video_front_sweep: { title: "Front-Schwenk", instruction: "Schwenke langsam von links nach rechts über die Fahrzeugfront" },
  video_rear_sweep: { title: "Heck-Schwenk", instruction: "Schwenke langsam von links nach rechts über das Heck" },
  video_left_sweep: { title: "Linke Seite", instruction: "Schwenke langsam von vorne nach hinten" },
  video_right_sweep: { title: "Rechte Seite", instruction: "Schwenke langsam von vorne nach hinten" },
};

const BURST_COUNT = 3;
const BURST_LABELS = ["Links / Anfang", "Mitte", "Rechts / Ende"];

export function VideoSweepCapture({ category, onCapture, onClose }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [capturing, setCapturing] = useState(false);
  const [burstIndex, setBurstIndex] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturedUris, setCapturedUris] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const arrowAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const info = SWEEP_INFO[category] ?? { title: "Schwenk", instruction: "Fahrzeug aufnehmen" };

  // Arrow animation
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(arrowAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(arrowAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  if (!permission) return null;
  if (!permission.granted) {
    requestPermission();
    return (
      <View style={[styles.fullscreen, { justifyContent: "center", alignItems: "center" }]}>
        <Typo variant="body" color="white" center>Kamera-Berechtigung wird benötigt</Typo>
      </View>
    );
  }

  const startBurstCapture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    setBurstIndex(0);
    setCapturedUris([]);

    const uris: string[] = [];

    for (let i = 0; i < BURST_COUNT; i++) {
      setBurstIndex(i);

      // Countdown 3-2-1
      for (let c = 3; c > 0; c--) {
        setCountdown(c);
        await delay(700);
      }
      setCountdown(null);

      // Take photo
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
        if (photo?.uri) uris.push(photo.uri);
      } catch {}

      // Update progress
      Animated.timing(progressAnim, {
        toValue: (i + 1) / BURST_COUNT,
        duration: 300,
        useNativeDriver: false,
      }).start();

      // Brief pause between shots
      if (i < BURST_COUNT - 1) {
        await delay(500);
      }
    }

    setCapturedUris(uris);
    setCapturing(false);
    setDone(true);

    // Return the first captured URI (all are saved but we pass one back)
    if (uris.length > 0) {
      // Small delay to show done state
      await delay(800);
      onCapture(uris[0]);
    }
  };

  const arrowTranslate = arrowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-30, 30],
  });

  return (
    <View style={styles.fullscreen}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" />

      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
          <View style={styles.titleBadge}>
            <Ionicons name="scan" size={16} color="white" style={{ marginRight: 6 }} />
            <Typo variant="caption" color="white" style={{ fontWeight: "600" }}>
              {info.title}
            </Typo>
          </View>
          <View style={{ width: 44 }} />
        </View>

        {/* Center content */}
        <View style={styles.centerArea}>
          {countdown !== null ? (
            <View style={styles.countdownCircle}>
              <Typo variant="h1" color="white" style={{ fontSize: 64, fontWeight: "900" }}>
                {countdown}
              </Typo>
            </View>
          ) : capturing ? (
            <View>
              <Ionicons name="camera" size={48} color="white" style={{ opacity: 0.8, textAlign: "center" }} />
              <Typo variant="caption" color="white" center style={{ marginTop: 8, fontSize: 14 }}>
                Foto {burstIndex + 1} von {BURST_COUNT}
              </Typo>
              <Typo variant="caption" color="rgba(255,255,255,0.6)" center style={{ marginTop: 4 }}>
                {BURST_LABELS[burstIndex]}
              </Typo>
            </View>
          ) : done ? (
            <View>
              <Ionicons name="checkmark-circle" size={64} color="#22C55E" style={{ textAlign: "center" }} />
              <Typo variant="body" color="white" center style={{ marginTop: 8, fontWeight: "700" }}>
                {capturedUris.length} Fotos aufgenommen!
              </Typo>
            </View>
          ) : (
            <Animated.View style={{ transform: [{ translateX: arrowTranslate }] }}>
              <Typo variant="h1" color="white" style={{ fontSize: 48, opacity: 0.5 }}>
                →
              </Typo>
            </Animated.View>
          )}
        </View>

        {/* Instruction */}
        <View style={styles.instructionBar}>
          <Typo variant="caption" color="white" center style={{ fontSize: 13, lineHeight: 18 }}>
            {capturing
              ? `Schwenke langsam weiter… Foto ${burstIndex + 1}/${BURST_COUNT}`
              : done
              ? "Fertig! Wird gespeichert…"
              : info.instruction}
          </Typo>
        </View>

        {/* Progress bar */}
        {capturing && (
          <View style={styles.progressBg}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
          </View>
        )}

        {/* Burst indicators */}
        {(capturing || done) && (
          <View style={styles.burstDots}>
            {Array.from({ length: BURST_COUNT }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.burstDot,
                  i < capturedUris.length && styles.burstDotDone,
                  i === burstIndex && capturing && styles.burstDotActive,
                ]}
              />
            ))}
          </View>
        )}

        {/* Start button */}
        {!capturing && !done && (
          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.startBtn} onPress={startBurstCapture} activeOpacity={0.7}>
              <Ionicons name="scan" size={32} color="white" />
            </TouchableOpacity>
            <Typo variant="caption" color="rgba(255,255,255,0.7)" style={{ marginTop: 8, fontSize: 11 }}>
              Tippen zum Starten · 3 Fotos werden aufgenommen
            </Typo>
          </View>
        )}
      </View>
    </View>
  );
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

const styles = StyleSheet.create({
  fullscreen: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "black", zIndex: 999 },
  camera: { flex: 1 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 50, paddingHorizontal: 16 },
  closeBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
  titleBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(59,130,246,0.8)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  centerArea: { flex: 1, alignItems: "center", justifyContent: "center" },
  countdownCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(59,130,246,0.6)", alignItems: "center", justifyContent: "center" },
  instructionBar: { paddingHorizontal: 20, paddingVertical: 12, backgroundColor: "rgba(0,0,0,0.5)" },
  progressBg: { height: 4, backgroundColor: "rgba(255,255,255,0.2)" },
  progressFill: { height: 4, borderRadius: 2, backgroundColor: "#3B82F6" },
  burstDots: { flexDirection: "row", justifyContent: "center", gap: 12, paddingVertical: 12 },
  burstDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.3)" },
  burstDotDone: { backgroundColor: "#22C55E" },
  burstDotActive: { backgroundColor: "#3B82F6", transform: [{ scale: 1.3 }] },
  bottomBar: { alignItems: "center", paddingBottom: 40, paddingTop: 16 },
  startBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(59,130,246,0.8)", alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "white" },
});
