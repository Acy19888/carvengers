import React, { useRef, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Image, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import Svg, { Rect, Line, G } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { Typo } from "../ui/Typo";
import { Button } from "../ui/Button";
import { Spacer } from "../ui/Spacer";
import { Colors, Spacing, Radius } from "../../constants/theme";

interface Props {
  onScan: (vin: string) => void;
  onClose: () => void;
}

export function VinScanner({ onScan, onClose }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <View style={styles.permWrap}>
        <Ionicons name="camera-outline" size={64} color={Colors.textMuted} />
        <Spacer size="md" />
        <Typo variant="body" center>Kamerazugriff wird benötigt</Typo>
        <Spacer size="lg" />
        <Button label="Zugriff erlauben" onPress={requestPermission} />
        <Spacer size="sm" />
        <Button label="Abbrechen" variant="ghost" onPress={onClose} />
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current) return;
    const result = await cameraRef.current.takePictureAsync({ quality: 0.9 });
    if (result) {
      setPhoto(result.uri);
      // TODO: Send to OCR service to extract VIN text
      // For now, show the photo and let user confirm
      Alert.alert(
        "FIN-Erkennung",
        "Die automatische FIN-Erkennung wird in einem zukünftigen Update aktiviert. Bitte gib die FIN manuell ein.",
        [
          { text: "OK", onPress: onClose },
        ],
      );
    }
  };

  return (
    <View style={styles.fullscreen}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        {/* VIN scan overlay */}
        <View style={styles.overlay}>
          <Svg width="100%" height="100%" viewBox="0 0 400 440">
            <G opacity={0.7}>
              {/* Scan window */}
              <Rect
                x={30} y={170} width={340} height={80}
                rx={8}
                stroke="white" strokeWidth={2.5} fill="none"
              />
              {/* Scan line */}
              <Line
                x1={50} y1={210} x2={350} y2={210}
                stroke={Colors.accent} strokeWidth={2}
              />
              {/* Corner accents */}
              <Line x1={30} y1={185} x2={30} y2={170} stroke={Colors.accent} strokeWidth={3} />
              <Line x1={30} y1={170} x2={55} y2={170} stroke={Colors.accent} strokeWidth={3} />
              <Line x1={370} y1={185} x2={370} y2={170} stroke={Colors.accent} strokeWidth={3} />
              <Line x1={370} y1={170} x2={345} y2={170} stroke={Colors.accent} strokeWidth={3} />
              <Line x1={30} y1={235} x2={30} y2={250} stroke={Colors.accent} strokeWidth={3} />
              <Line x1={30} y1={250} x2={55} y2={250} stroke={Colors.accent} strokeWidth={3} />
              <Line x1={370} y1={235} x2={370} y2={250} stroke={Colors.accent} strokeWidth={3} />
              <Line x1={370} y1={250} x2={345} y2={250} stroke={Colors.accent} strokeWidth={3} />
            </G>
          </Svg>
        </View>

        {/* Instructions */}
        <View style={styles.hintTop}>
          <Typo variant="caption" color="white" center>
            FIN (Fahrzeug-Identifizierungsnummer) im Rahmen ausrichten
          </Typo>
        </View>
        <View style={styles.hintBottom}>
          <Typo variant="caption" color="rgba(255,255,255,0.7)" center style={{ fontSize: 11 }}>
            Die FIN findest du im Fahrzeugschein, an der Windschutzscheibe oder am Türrahmen
          </Typo>
        </View>

        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
        </View>

        {/* Shutter */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.shutterBtn} onPress={takePicture}>
            <Ionicons name="scan" size={32} color="white" />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "black",
    zIndex: 999,
  },
  camera: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  permWrap: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  topBar: {
    position: "absolute",
    top: 50,
    left: Spacing.md,
  },
  closeBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  hintTop: {
    position: "absolute",
    top: "28%",
    left: 24, right: 24,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  hintBottom: {
    position: "absolute",
    bottom: 120,
    left: 24, right: 24,
  },
  bottomBar: {
    position: "absolute",
    bottom: 50,
    left: 0, right: 0,
    alignItems: "center",
  },
  shutterBtn: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 3,
    borderColor: Colors.accent,
    backgroundColor: "rgba(59,130,246,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
});
