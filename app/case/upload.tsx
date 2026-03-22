import React, { useState, useCallback } from "react";
import { View, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Button, Typo, Spacer } from "../../components/ui";
import { StepIndicator } from "../../components/ui/StepIndicator";
import { UploadStepCard } from "../../components/media/UploadStepCard";
import { GuidedCamera } from "../../components/media/GuidedCamera";
import { VideoSweepCapture } from "../../components/media/VideoSweepCapture";
import { QualityFeedback } from "../../components/media/QualityFeedback";
import { OcrResultModal } from "../../components/media/OcrResultModal";
import { uploadCaseMedia } from "../../services/firebase/media";
import { updateCaseStatus } from "../../services/firebase/cases";
import { readOdometerFromImage } from "../../services/ocr";
import { analyzeCaptureQuality, CaptureQuality } from "../../services/captureQuality";
import {
  UPLOAD_STEPS, SCAN_MODE_STEPS, EXTENDED_CATEGORY_LABELS,
  MEDIA_CATEGORY_LABELS, ExtendedCategory,
} from "../../constants/app";
import { Colors, Spacing, Radius } from "../../constants/theme";
import type { MediaCategory, ScanMode } from "../../types/models";

interface UploadState {
  uri?: string;
  uploaded: boolean;
  uploading: boolean;
  progress: number;
  quality?: CaptureQuality;
}

export default function UploadScreen() {
  const router = useRouter();
  const { caseId, scanMode: scanModeParam } = useLocalSearchParams<{ caseId: string; scanMode?: string }>();

  // Determine steps based on scan mode
  const scanMode = (scanModeParam as ScanMode) || null;
  const steps: ExtendedCategory[] = scanMode
    ? SCAN_MODE_STEPS[scanMode]
    : (UPLOAD_STEPS as ExtendedCategory[]);

  const [step, setStep] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  // OCR state
  const [ocrVisible, setOcrVisible] = useState(false);
  const [ocrKm, setOcrKm] = useState(0);
  const [ocrConf, setOcrConf] = useState(0);
  const [detectedMileage, setDetectedMileage] = useState<number | null>(null);

  const [uploads, setUploads] = useState<Record<string, UploadState>>(() => {
    const init: Record<string, UploadState> = {};
    steps.forEach((cat) => {
      init[cat] = { uploaded: false, uploading: false, progress: 0 };
    });
    return init;
  });

  const currentCategory = steps[step];
  const currentState = uploads[currentCategory] ?? { uploaded: false, uploading: false, progress: 0 };
  const uploadedCount = steps.filter((c) => uploads[c]?.uploaded).length;
  const isVideoStep = currentCategory?.startsWith("video_");
  const categoryLabel = EXTENDED_CATEGORY_LABELS[currentCategory] ?? currentCategory;

  const updateUpload = (cat: string, partial: Partial<UploadState>) => {
    setUploads((prev) => ({ ...prev, [cat]: { ...prev[cat], ...partial } }));
  };

  const handleUpload = useCallback(async (uri: string) => {
    if (!caseId) return;
    updateUpload(currentCategory, { uri, uploading: true, progress: 0 });

    // Run quality check (mock — uses heuristics)
    const quality = analyzeCaptureQuality(1920, 1080, 500, currentCategory);
    updateUpload(currentCategory, { quality });

    try {
      const mediaType = isVideoStep ? "video"
        : (currentCategory === "service_book" || currentCategory === "registration_doc") ? "document"
        : "image";

      await uploadCaseMedia(
        caseId,
        currentCategory as MediaCategory,
        uri,
        mediaType,
        (pct) => updateUpload(currentCategory, { progress: pct }),
      );
      updateUpload(currentCategory, { uploaded: true, uploading: false, progress: 100, quality });

      // OCR for odometer
      if (currentCategory === "odometer") {
        try {
          const result = await readOdometerFromImage(uri);
          if (result.success) {
            setOcrKm(result.kilometers);
            setOcrConf(result.confidence);
            setOcrVisible(true);
          }
        } catch {}
      }
    } catch {
      updateUpload(currentCategory, { uploading: false, progress: 0 });
      Alert.alert("Fehler", "Upload fehlgeschlagen. Bitte erneut versuchen.");
    }
  }, [currentCategory, caseId, isVideoStep]);

  const handleCameraCapture = (uri: string) => {
    setShowCamera(false);
    handleUpload(uri);
  };

  const handleVideoCapture = (uri: string) => {
    setShowVideo(false);
    handleUpload(uri);
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: isVideoStep ? ["videos"] : ["images"],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      handleUpload(result.assets[0].uri);
    }
  };

  const goNext = () => { if (step < steps.length - 1) setStep(step + 1); };
  const goBack = () => { if (step > 0) setStep(step - 1); else router.back(); };

  const handleFinish = async () => {
    if (uploadedCount < steps.length) {
      Alert.alert(
        "Nicht alle Aufnahmen",
        `Du hast ${uploadedCount} von ${steps.length} Aufnahmen. Trotzdem fortfahren?`,
        [{ text: "Abbrechen", style: "cancel" }, { text: "Fortfahren", onPress: submitCase }],
      );
    } else {
      await submitCase();
    }
  };

  const submitCase = async () => {
    try {
      if (caseId) {
        await updateCaseStatus(caseId, "submitted");
        // Send immediate notification
        try {
          const { notifyCaseEvent, scheduleNotification } = require("../../services/notifications");
          await notifyCaseEvent("caseSubmitted", caseId);
          // Schedule "report ready" notification after 30 seconds (mock delay)
          await scheduleNotification(
            "KI-Bericht fertig!",
            "Dein Inspektionsbericht ist jetzt verfügbar.",
            30,
            { screen: "analysis", caseId },
          );
        } catch {}
      }
      Alert.alert(
        "Hochgeladen",
        detectedMileage
          ? `Alle Aufnahmen gespeichert. Erkannter km-Stand: ${detectedMileage.toLocaleString("de-DE")} km`
          : "Alle Aufnahmen gespeichert. Dein Fall wird jetzt bearbeitet.",
        [{ text: "OK", onPress: () => router.replace("/(tabs)") }],
      );
    } catch {
      Alert.alert("Fehler", "Status konnte nicht aktualisiert werden.");
    }
  };

  const isLastStep = step === steps.length - 1;

  // Guided camera fullscreen
  if (showCamera) {
    return (
      <GuidedCamera
        category={currentCategory as MediaCategory}
        onCapture={handleCameraCapture}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  // Video sweep fullscreen
  if (showVideo) {
    return (
      <VideoSweepCapture
        category={currentCategory}
        onCapture={handleVideoCapture}
        onClose={() => setShowVideo(false)}
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
          Alert.alert("km-Stand gespeichert", `${km.toLocaleString("de-DE")} km übernommen.`);
        }}
        onDismiss={() => setOcrVisible(false)}
      />

      <Screen scroll>
        <Spacer size="md" />
        <View style={styles.topBar}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} onPress={goBack} />
          <Typo variant="h3">{isVideoStep ? "Videos aufnehmen" : "Fotos hochladen"}</Typo>
          <View style={{ width: 24 }} />
        </View>

        <StepIndicator total={steps.length} current={step} />
        <Typo variant="caption" center>
          Schritt {step + 1} von {steps.length} · {uploadedCount} hochgeladen
        </Typo>

        {/* km-Stand banner */}
        {detectedMileage !== null && (
          <View style={styles.ocrBanner}>
            <Ionicons name="speedometer" size={16} color={Colors.success} />
            <Typo variant="caption" style={{ marginLeft: 6, color: Colors.success, fontWeight: "600" }}>
              km-Stand erkannt: {detectedMileage.toLocaleString("de-DE")} km
            </Typo>
          </View>
        )}

        <Spacer size="lg" />

        {/* Current step card */}
        {isVideoStep ? (
          <View style={styles.videoCard}>
            <View style={styles.videoIconWrap}>
              <Ionicons name="videocam" size={40} color={Colors.accent} />
            </View>
            <Spacer size="md" />
            <Typo variant="body" style={{ fontWeight: "700" }} center>
              {categoryLabel}
            </Typo>
            <Spacer size="xs" />
            <Typo variant="caption" center>
              {currentState.uploaded ? "Video aufgenommen ✓" : "8 Sekunden Video-Schwenk aufnehmen"}
            </Typo>
            <Spacer size="md" />
            {currentState.uploaded ? (
              <View style={styles.doneRow}>
                <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
                <Typo variant="body" style={{ marginLeft: 8, color: Colors.success, fontWeight: "600" }}>
                  Aufgenommen
                </Typo>
              </View>
            ) : (
              <View style={styles.btnRow}>
                <Button
                  label="Video aufnehmen"
                  onPress={() => setShowVideo(true)}
                  style={{ flex: 1, marginRight: Spacing.sm }}
                />
                <Button
                  label="Galerie"
                  variant="outline"
                  onPress={pickFromGallery}
                  style={{ flex: 1 }}
                />
              </View>
            )}
          </View>
        ) : (
          <UploadStepCard
            category={currentCategory as MediaCategory}
            imageUri={currentState.uri}
            uploading={currentState.uploading}
            uploadProgress={currentState.progress}
            onPickImage={pickFromGallery}
            onTakePhoto={() => setShowCamera(true)}
          />
        )}

        {/* Quality feedback */}
        <QualityFeedback quality={currentState.quality ?? null} />

        {/* Nav buttons */}
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

        {/* Grid overview */}
        <Typo variant="body" style={{ fontWeight: "600" }}>Übersicht</Typo>
        <Spacer size="sm" />
        <View style={styles.grid}>
          {steps.map((cat, i) => {
            const s = uploads[cat];
            const isVid = cat.startsWith("video_");
            const label = (EXTENDED_CATEGORY_LABELS[cat] ?? cat).split(" / ")[0].split(": ").pop()?.split(" ")[0] ?? cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.gridItem,
                  i === step && styles.gridItemActive,
                  s?.uploaded && styles.gridItemDone,
                ]}
                onPress={() => setStep(i)}
                activeOpacity={0.7}
              >
                {s?.uploaded ? (
                  <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                ) : isVid ? (
                  <Ionicons name="videocam-outline" size={18} color={Colors.textMuted} />
                ) : (
                  <Ionicons name="ellipse-outline" size={18} color={Colors.textMuted} />
                )}
                <Typo variant="caption" style={{ fontSize: 9, marginTop: 2, textAlign: "center" }} numberOfLines={1}>
                  {label}
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
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  ocrBanner: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#F0FDF4", borderRadius: Radius.sm, paddingVertical: 8, marginTop: Spacing.sm },
  navRow: { flexDirection: "row", marginTop: Spacing.md },
  videoCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, alignItems: "center" },
  videoIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.accentLight, alignItems: "center", justifyContent: "center" },
  doneRow: { flexDirection: "row", alignItems: "center" },
  btnRow: { flexDirection: "row", width: "100%" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  gridItem: { width: "22%", alignItems: "center", paddingVertical: Spacing.sm, borderRadius: Radius.sm, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  gridItemActive: { borderColor: Colors.accent, backgroundColor: Colors.accentLight },
  gridItemDone: { borderColor: Colors.success },
});
