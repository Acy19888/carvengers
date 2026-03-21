import React, { useState, useCallback } from "react";
import { View, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Button, Typo, Spacer } from "../../components/ui";
import { StepIndicator } from "../../components/ui/StepIndicator";
import { UploadStepCard } from "../../components/media/UploadStepCard";
import { GuidedCamera } from "../../components/media/GuidedCamera";
import { OcrResultModal } from "../../components/media/OcrResultModal";
import { uploadCaseMedia } from "../../services/firebase/media";
import { updateCaseStatus } from "../../services/firebase/cases";
import { readOdometerFromImage } from "../../services/ocr";
import { UPLOAD_STEPS, MEDIA_CATEGORY_LABELS } from "../../constants/app";
import { Colors, Spacing, Radius } from "../../constants/theme";
import type { MediaCategory } from "../../types/models";

interface UploadState {
  uri?: string;
  uploaded: boolean;
  uploading: boolean;
  progress: number;
}

export default function UploadScreen() {
  const router = useRouter();
  const { caseId } = useLocalSearchParams<{ caseId: string }>();
  const [step, setStep] = useState(0);
  const [showCamera, setShowCamera] = useState(false);

  // OCR state
  const [ocrVisible, setOcrVisible] = useState(false);
  const [ocrKm, setOcrKm] = useState(0);
  const [ocrConf, setOcrConf] = useState(0);
  const [detectedMileage, setDetectedMileage] = useState<number | null>(null);

  const [uploads, setUploads] = useState<Record<MediaCategory, UploadState>>(
    () => {
      const init: any = {};
      UPLOAD_STEPS.forEach((cat) => {
        init[cat] = { uploaded: false, uploading: false, progress: 0 };
      });
      return init;
    },
  );

  const currentCategory = UPLOAD_STEPS[step];
  const currentState = uploads[currentCategory];
  const uploadedCount = UPLOAD_STEPS.filter((c) => uploads[c].uploaded).length;

  const updateUpload = (cat: MediaCategory, partial: Partial<UploadState>) => {
    setUploads((prev) => ({ ...prev, [cat]: { ...prev[cat], ...partial } }));
  };

  const handleUpload = useCallback(async (uri: string) => {
    if (!caseId) return;
    updateUpload(currentCategory, { uri, uploading: true, progress: 0 });

    try {
      await uploadCaseMedia(
        caseId,
        currentCategory,
        uri,
        currentCategory === "service_book" ? "document" : "image",
        (pct) => updateUpload(currentCategory, { progress: pct }),
      );
      updateUpload(currentCategory, { uploaded: true, uploading: false, progress: 100 });

      // Trigger OCR for odometer photos
      if (currentCategory === "odometer") {
        try {
          const result = await readOdometerFromImage(uri);
          if (result.success) {
            setOcrKm(result.kilometers);
            setOcrConf(result.confidence);
            setOcrVisible(true);
          }
        } catch {
          // OCR failed silently, user can enter manually
        }
      }
    } catch {
      updateUpload(currentCategory, { uploading: false, progress: 0 });
      Alert.alert("Fehler", "Upload fehlgeschlagen. Bitte erneut versuchen.");
    }
  }, [currentCategory, caseId]);

  const handleCameraCapture = (uri: string) => {
    setShowCamera(false);
    handleUpload(uri);
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      handleUpload(result.assets[0].uri);
    }
  };

  const goNext = () => {
    if (step < UPLOAD_STEPS.length - 1) setStep(step + 1);
  };
  const goBack = () => {
    if (step > 0) setStep(step - 1);
    else router.back();
  };

  const handleFinish = async () => {
    if (uploadedCount < UPLOAD_STEPS.length) {
      Alert.alert(
        "Nicht alle Fotos",
        `Du hast ${uploadedCount} von ${UPLOAD_STEPS.length} Fotos hochgeladen. Trotzdem fortfahren?`,
        [
          { text: "Abbrechen", style: "cancel" },
          { text: "Fortfahren", onPress: submitCase },
        ],
      );
    } else {
      await submitCase();
    }
  };

  const submitCase = async () => {
    try {
      if (caseId) await updateCaseStatus(caseId, "submitted");
      Alert.alert(
        "Hochgeladen",
        detectedMileage
          ? `Alle Fotos gespeichert. Erkannter km-Stand: ${detectedMileage.toLocaleString("de-DE")} km`
          : "Alle Fotos wurden gespeichert. Dein Fall wird jetzt bearbeitet.",
        [{ text: "OK", onPress: () => router.replace("/(tabs)") }],
      );
    } catch {
      Alert.alert("Fehler", "Status konnte nicht aktualisiert werden.");
    }
  };

  const isLastStep = step === UPLOAD_STEPS.length - 1;

  if (showCamera) {
    return (
      <GuidedCamera
        category={currentCategory}
        onCapture={handleCameraCapture}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  return (
    <>
      <OcrResultModal
        visible={ocrVisible}
        detectedKm={ocrKm}
        confidence={ocrConf}
        onConfirm={(km) => {
          setDetectedMileage(km);
          setOcrVisible(false);
          Alert.alert(
            "km-Stand gespeichert",
            `${km.toLocaleString("de-DE")} km wurde als Kilometerstand übernommen.`,
          );
        }}
        onDismiss={() => setOcrVisible(false)}
      />

      <Screen scroll>
        <Spacer size="md" />

        <View style={styles.topBar}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} onPress={goBack} />
          <Typo variant="h3">Fotos hochladen</Typo>
          <View style={{ width: 24 }} />
        </View>

        <StepIndicator total={UPLOAD_STEPS.length} current={step} />
        <Typo variant="caption" center>
          Schritt {step + 1} von {UPLOAD_STEPS.length} · {uploadedCount} hochgeladen
        </Typo>

        {detectedMileage !== null && (
          <View style={styles.ocrBanner}>
            <Ionicons name="speedometer" size={16} color={Colors.success} />
            <Typo variant="caption" style={{ marginLeft: 6, color: Colors.success, fontWeight: "600" }}>
              km-Stand erkannt: {detectedMileage.toLocaleString("de-DE")} km
            </Typo>
          </View>
        )}

        <Spacer size="lg" />

        <UploadStepCard
          category={currentCategory}
          imageUri={currentState.uri}
          uploading={currentState.uploading}
          uploadProgress={currentState.progress}
          onPickImage={pickFromGallery}
          onTakePhoto={() => setShowCamera(true)}
        />

        <View style={styles.navRow}>
          {step > 0 && (
            <Button
              label="Zurück"
              variant="outline"
              onPress={goBack}
              style={{ flex: 1, marginRight: Spacing.sm }}
            />
          )}
          {isLastStep ? (
            <Button label="Abschließen" onPress={handleFinish} style={{ flex: 1 }} />
          ) : (
            <Button
              label={currentState.uploaded || currentState.uri ? "Weiter" : "Überspringen"}
              variant={currentState.uploaded || currentState.uri ? "primary" : "outline"}
              onPress={goNext}
              style={{ flex: 1 }}
            />
          )}
        </View>

        <Spacer size="lg" />

        <Typo variant="body" style={{ fontWeight: "600" }}>Übersicht</Typo>
        <Spacer size="sm" />
        <View style={styles.grid}>
          {UPLOAD_STEPS.map((cat, i) => {
            const s = uploads[cat];
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.gridItem,
                  i === step && styles.gridItemActive,
                  s.uploaded && styles.gridItemDone,
                ]}
                onPress={() => setStep(i)}
                activeOpacity={0.7}
              >
                {s.uploaded ? (
                  <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                ) : (
                  <Ionicons name="ellipse-outline" size={18} color={Colors.textMuted} />
                )}
                <Typo variant="caption" style={{ fontSize: 10, marginTop: 2, textAlign: "center" }}>
                  {MEDIA_CATEGORY_LABELS[cat].split(" / ")[0].split(" ")[0]}
                </Typo>
              </TouchableOpacity>
            );
          })}
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ocrBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0FDF4",
    borderRadius: Radius.sm,
    paddingVertical: 8,
    marginTop: Spacing.sm,
  },
  navRow: {
    flexDirection: "row",
    marginTop: Spacing.md,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  gridItem: {
    width: "22%",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gridItemActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentLight,
  },
  gridItemDone: {
    borderColor: Colors.success,
  },
});
