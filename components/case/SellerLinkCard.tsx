import React, { useState } from "react";
import { View, StyleSheet, Alert, Share } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { Typo } from "../ui/Typo";
import { Button } from "../ui/Button";
import { Spacer } from "../ui/Spacer";
import { useTheme } from "../../store/themeContext";
import { Spacing, Radius, FontSize } from "../../constants/theme";
import { createSellerLink, SellerLink } from "../../services/sellerLink";

interface Props {
  caseId: string;
  userId: string;
}

export function SellerLinkCard({ caseId, userId }: Props) {
  const { colors } = useTheme();
  const [link, setLink] = useState<SellerLink | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const newLink = await createSellerLink(caseId, userId);
      setLink(newLink);
    } catch {
      Alert.alert("Fehler", "Link konnte nicht erstellt werden.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!link) return;
    await Clipboard.setStringAsync(link.url);
    Alert.alert("Kopiert", "Link wurde in die Zwischenablage kopiert.");
  };

  const handleShare = async () => {
    if (!link) return;
    try {
      await Share.share({
        message: `Hallo! Bitte führe eine schnelle Fahrzeuginspektion durch. Öffne diesen Link auf deinem Handy:\n\n${link.url}\n\nDauert nur ca. 5 Minuten. Danke!`,
        title: "Carvengers Inspektions-Link",
      });
    } catch {}
  };

  if (!link) {
    return (
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.row}>
          <Ionicons name="link" size={24} color={colors.accent} />
          <View style={{ marginLeft: Spacing.md, flex: 1 }}>
            <Typo variant="body" style={{ fontWeight: "600" }}>
              Verkäufer-Link erstellen
            </Typo>
            <Typo variant="caption" style={{ fontSize: FontSize.xs }}>
              Der Verkäufer kann die Inspektion im Browser durchführen — ohne App.
            </Typo>
          </View>
        </View>
        <Spacer size="md" />
        <Button label="Link generieren" onPress={handleGenerate} loading={generating} />
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.accent }]}>
      <View style={styles.row}>
        <Ionicons name="checkmark-circle" size={24} color={colors.success} />
        <View style={{ marginLeft: Spacing.md, flex: 1 }}>
          <Typo variant="body" style={{ fontWeight: "600" }}>
            Inspektions-Link bereit
          </Typo>
          <Typo variant="caption" style={{ fontSize: FontSize.xs, color: colors.textMuted }}>
            Gültig für 7 Tage
          </Typo>
        </View>
      </View>

      <Spacer size="sm" />

      <View style={[styles.urlBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <Typo variant="caption" style={{ fontSize: 11, fontFamily: "monospace" }} numberOfLines={1}>
          {link.url}
        </Typo>
      </View>

      <Spacer size="md" />

      <View style={styles.btnRow}>
        <Button label="Kopieren" variant="outline" onPress={handleCopy} style={{ flex: 1, marginRight: Spacing.sm }} />
        <Button label="Teilen" onPress={handleShare} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  urlBox: {
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  btnRow: {
    flexDirection: "row",
  },
});
