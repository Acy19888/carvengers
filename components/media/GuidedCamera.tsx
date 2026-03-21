import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { CameraOverlay } from "./CameraOverlay";
import { Typo } from "../ui/Typo";
import { Spacer } from "../ui/Spacer";
import { Button } from "../ui/Button";
import { Colors, Spacing, Radius } from "../../constants/theme";
import { MEDIA_CATEGORY_LABELS } from "../../constants/app";
import type { MediaCategory } from "../../types/models";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

interface Props {
  category: MediaCategory;
  onCapture: (uri: string) => void;
  onClose: () => void;
}

export function GuidedCamera({ category, onCapture, onClose }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <View style={styles.permissionWrap}>
        <Ionicons name="camera-outline" size={64} color={Colors.textMuted} />
        <Spacer size="md" />
        <Typo variant="body" center>
          Kamerazugriff wird benötigt
        </Typo>
        <Spacer size="lg" />
        <Button label="Zugriff erlauben" onPress={requestPermission} />
        <Spacer size="sm" />
        <Button label="Abbrechen" variant="ghost" onPress={onClose} />
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current) return;
    const result = await cameraRef.current.takePictureAsync({ quality: 0.8 });
    if (result) {
      setPhoto(result.uri);
    }
  };

  const confirmPhoto = () => {
    if (photo) {
      onCapture(photo);
    }
  };

  const retakePhoto = () => {
    setPhoto(null);
  };

  // Preview mode
  if (photo) {
    return (
      <View style={styles.fullscreen}>
        <Image source={{ uri: photo }} style={styles.previewImage} />
        <View style={styles.previewControls}>
          <TouchableOpacity style={styles.previewBtn} onPress={retakePhoto}>
            <Ionicons name="refresh" size={28} color={Colors.textOnPrimary} />
            <Typo variant="caption" color={Colors.textOnPrimary}>
              Nochmal
            </Typo>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.previewBtn, styles.confirmBtn]}
            onPress={confirmPhoto}
          >
            <Ionicons name="checkmark" size={28} color={Colors.textOnPrimary} />
            <Typo variant="caption" color={Colors.textOnPrimary}>
              Verwenden
            </Typo>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Camera mode
  return (
    <View style={styles.fullscreen}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" />

      {/* Overlay on top of camera (absolute positioned) */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {/* Guide overlay */}
        <CameraOverlay category={category} />

        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
          <View style={styles.categoryBadge}>
            <Typo variant="caption" color={Colors.textOnPrimary}>
              {MEDIA_CATEGORY_LABELS[category]}
            </Typo>
          </View>
          <View style={{ width: 44 }} />
        </View>

        {/* Shutter button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.shutterBtn} onPress={takePicture}>
            <View style={styles.shutterInner} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "black",
    zIndex: 999,
  },
  camera: {
    flex: 1,
  },
  permissionWrap: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  topBar: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryBadge: {
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  bottomBar: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  shutterBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "white",
  },
  previewImage: {
    flex: 1,
    resizeMode: "contain",
  },
  previewControls: {
    position: "absolute",
    bottom: 50,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  previewBtn: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: Radius.md,
  },
  confirmBtn: {
    backgroundColor: Colors.accent,
  },
});
