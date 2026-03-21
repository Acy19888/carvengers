import React from "react";
import { View, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Typo } from "../ui/Typo";
import { Colors, Spacing, Radius, FontSize } from "../../constants/theme";
import { MEDIA_CATEGORY_LABELS } from "../../constants/app";
import type { MediaCategory } from "../../types/models";

interface Props {
  category: MediaCategory;
  imageUri?: string;
  uploading?: boolean;
  uploadProgress?: number;
  onPickImage: () => void;
  onTakePhoto: () => void;
}

const CATEGORY_ICONS: Record<MediaCategory, string> = {
  front: "car-outline",
  rear: "car-outline",
  left: "car-outline",
  right: "car-outline",
  tire: "ellipse-outline",
  interior: "car-sport-outline",
  odometer: "speedometer-outline",
  service_book: "document-text-outline",
};

const CATEGORY_HINTS: Record<MediaCategory, string> = {
  front: "Fotografiere die Vorderansicht des Fahrzeugs",
  rear: "Fotografiere die Rückansicht des Fahrzeugs",
  left: "Fotografiere die linke Seite des Fahrzeugs",
  right: "Fotografiere die rechte Seite des Fahrzeugs",
  tire: "Fotografiere die Reifen (Profil sichtbar)",
  interior: "Fotografiere den Innenraum / Fahrersitz",
  odometer: "Fotografiere den Tacho mit aktuellem km-Stand",
  service_book: "Fotografiere das Serviceheft oder lade ein Dokument hoch",
};

export function UploadStepCard({
  category,
  imageUri,
  uploading,
  uploadProgress,
  onPickImage,
  onTakePhoto,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons
          name={CATEGORY_ICONS[category] as any}
          size={24}
          color={Colors.accent}
        />
        <View style={{ marginLeft: Spacing.sm, flex: 1 }}>
          <Typo variant="body" style={{ fontWeight: "600" }}>
            {MEDIA_CATEGORY_LABELS[category]}
          </Typo>
          <Typo variant="caption" style={{ fontSize: FontSize.xs }}>
            {CATEGORY_HINTS[category]}
          </Typo>
        </View>
      </View>

      {imageUri ? (
        <View style={styles.previewWrap}>
          <Image source={{ uri: imageUri }} style={styles.preview} />
          {uploading && (
            <View style={styles.progressOverlay}>
              <Typo variant="body" color={Colors.textOnPrimary} center style={{ fontWeight: "700" }}>
                {uploadProgress ?? 0}%
              </Typo>
            </View>
          )}
          {!uploading && (
            <TouchableOpacity style={styles.replaceBadge} onPress={onPickImage}>
              <Ionicons name="refresh" size={18} color={Colors.textOnPrimary} />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={onTakePhoto}>
            <Ionicons name="camera" size={28} color={Colors.accent} />
            <Typo variant="caption" style={{ marginTop: 4 }}>Kamera</Typo>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={onPickImage}>
            <Ionicons name="images" size={28} color={Colors.accent} />
            <Typo variant="caption" style={{ marginTop: 4 }}>Galerie</Typo>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  previewWrap: {
    position: "relative",
    borderRadius: Radius.md,
    overflow: "hidden",
  },
  preview: {
    width: "100%",
    height: 200,
    borderRadius: Radius.md,
    backgroundColor: Colors.border,
  },
  progressOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
  },
  replaceBadge: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  actionBtn: {
    flex: 1,
    height: 100,
    backgroundColor: Colors.accentLight,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.accent,
    borderStyle: "dashed",
  },
});
