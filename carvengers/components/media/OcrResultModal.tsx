import React, { useState } from "react";
import { View, StyleSheet, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Typo } from "../ui/Typo";
import { Spacer } from "../ui/Spacer";
import { Colors, Spacing, Radius } from "../../constants/theme";

interface Props {
  visible: boolean;
  detectedKm: number;
  confidence: number;
  onConfirm: (km: number) => void;
  onDismiss: () => void;
}

export function OcrResultModal({
  visible,
  detectedKm,
  confidence,
  onConfirm,
  onDismiss,
}: Props) {
  const [editValue, setEditValue] = useState(String(detectedKm));
  const confPct = Math.round(confidence * 100);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Ionicons name="speedometer-outline" size={40} color={Colors.accent} />
          <Spacer size="md" />
          <Typo variant="h3" center>Kilometerstand erkannt</Typo>
          <Spacer size="xs" />
          <Typo variant="caption" center>
            Erkennungsgenauigkeit: {confPct}%
          </Typo>

          <Spacer size="lg" />

          <View style={styles.resultBox}>
            <Typo variant="h2" center style={{ color: Colors.accent }}>
              {parseInt(editValue || "0", 10).toLocaleString("de-DE")} km
            </Typo>
          </View>

          <Spacer size="md" />

          <Input
            label="Wert korrigieren (falls nötig)"
            placeholder="z.B. 85000"
            keyboardType="number-pad"
            maxLength={6}
            value={editValue}
            onChangeText={setEditValue}
          />

          <View style={styles.btnRow}>
            <Button
              label="Verwerfen"
              variant="outline"
              onPress={onDismiss}
              style={{ flex: 1, marginRight: Spacing.sm }}
            />
            <Button
              label="Bestätigen"
              onPress={() => {
                const km = parseInt(editValue.replace(/\./g, ""), 10);
                if (!isNaN(km) && km >= 0) onConfirm(km);
              }}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: "center",
  },
  resultBox: {
    backgroundColor: Colors.accentLight,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    width: "100%",
    alignItems: "center",
  },
  btnRow: {
    flexDirection: "row",
    width: "100%",
  },
});
