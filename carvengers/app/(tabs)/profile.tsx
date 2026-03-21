import React, { useState } from "react";
import { View, StyleSheet, Image, TouchableOpacity, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Button, Input, Typo, Spacer, Picker, AnimatedCard } from "../../components/ui";
import { useTheme } from "../../store/themeContext";
import { useAuthStore } from "../../store/authStore";
import {
  updateUserProfile,
  uploadProfilePhoto,
  changePassword,
} from "../../services/firebase/profile";
import { fetchUserDoc } from "../../services/firebase/auth";
import { Spacing, Radius, FontSize } from "../../constants/theme";

export default function ProfileScreen() {
  const { colors, mode, setMode, isDark } = useTheme();
  const { user, logout } = useAuthStore();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPwModal, setShowPwModal] = useState(false);

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [address, setAddress] = useState(user?.address ?? "");
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl ?? "");

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0] && user) {
      try {
        const url = await uploadProfilePhoto(user.id, result.assets[0].uri);
        setPhotoUrl(url);
        const updated = await fetchUserDoc(user.id);
        if (updated) useAuthStore.setState({ user: updated });
      } catch {
        Alert.alert("Fehler", "Profilbild konnte nicht hochgeladen werden.");
      }
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateUserProfile(user.id, { firstName, lastName, phone, address });
      const updated = await fetchUserDoc(user.id);
      if (updated) useAuthStore.setState({ user: updated });
      setEditing(false);
      Alert.alert("Gespeichert", "Profil wurde aktualisiert.");
    } catch {
      Alert.alert("Fehler", "Profil konnte nicht gespeichert werden.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPw.length < 6) { Alert.alert("Fehler", "Mindestens 6 Zeichen."); return; }
    if (newPw !== confirmPw) { Alert.alert("Fehler", "Passwörter stimmen nicht überein."); return; }
    setPwLoading(true);
    try {
      await changePassword(currentPw, newPw);
      setShowPwModal(false);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      Alert.alert("Fertig", "Passwort wurde geändert.");
    } catch (e: any) {
      Alert.alert("Fehler", e.message ?? "Passwort konnte nicht geändert werden.");
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <Screen scroll>
      <Spacer size="xxl" />
      <Typo variant="h2">Profil</Typo>
      <Spacer size="lg" />

      {/* Avatar */}
      <TouchableOpacity style={styles.avatarWrap} onPress={handlePickPhoto}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.accentLight }]}>
            <Ionicons name="person" size={40} color={colors.textMuted} />
          </View>
        )}
        <View style={[styles.cameraBadge, { backgroundColor: colors.accent }]}>
          <Ionicons name="camera" size={14} color={colors.textOnPrimary} />
        </View>
      </TouchableOpacity>

      <Spacer size="sm" />
      <Typo variant="body" center style={{ fontWeight: "600" }}>
        {firstName || lastName ? `${firstName} ${lastName}`.trim() : user?.email}
      </Typo>
      <Typo variant="caption" center>Kunde</Typo>

      <Spacer size="xl" />

      {/* Dark mode toggle */}
      <AnimatedCard delay={50}>
        <Typo variant="body" style={{ fontWeight: "700" }}>Darstellung</Typo>
        <Spacer size="md" />
        <View style={styles.themeRow}>
          {(["light", "dark", "system"] as const).map((m) => (
            <TouchableOpacity
              key={m}
              style={[
                styles.themeOption,
                { borderColor: mode === m ? colors.accent : colors.border, backgroundColor: mode === m ? colors.accentLight : colors.surface },
              ]}
              onPress={() => setMode(m)}
            >
              <Ionicons
                name={m === "light" ? "sunny" : m === "dark" ? "moon" : "phone-portrait"}
                size={20}
                color={mode === m ? colors.accent : colors.textMuted}
              />
              <Typo variant="caption" style={{ marginTop: 4, fontSize: 11 }}>
                {m === "light" ? "Hell" : m === "dark" ? "Dunkel" : "System"}
              </Typo>
            </TouchableOpacity>
          ))}
        </View>
      </AnimatedCard>

      <Spacer size="md" />

      {/* Profile fields */}
      <AnimatedCard delay={100}>
        <Typo variant="body" style={{ fontWeight: "700" }}>Persönliche Daten</Typo>
        <Spacer size="md" />
        <Input label="Vorname" placeholder="Max" value={firstName} onChangeText={setFirstName} editable={editing} />
        <Input label="Nachname" placeholder="Mustermann" value={lastName} onChangeText={setLastName} editable={editing} />
        <Input label="E-Mail" value={user?.email ?? ""} editable={false} style={{ backgroundColor: colors.background }} />
        <Input label="Telefon (optional)" placeholder="+49 170 1234567" keyboardType="phone-pad" value={phone} onChangeText={setPhone} editable={editing} />
        <Input label="Adresse (optional)" placeholder="Musterstraße 1, 12345 Berlin" value={address} onChangeText={setAddress} editable={editing} />

        <Spacer size="md" />
        {editing ? (
          <View style={styles.buttonRow}>
            <Button label="Abbrechen" variant="outline" onPress={() => setEditing(false)} style={{ flex: 1, marginRight: Spacing.sm }} />
            <Button label="Speichern" onPress={handleSave} loading={saving} style={{ flex: 1 }} />
          </View>
        ) : (
          <Button label="Profil bearbeiten" variant="outline" onPress={() => setEditing(true)} />
        )}
      </AnimatedCard>

      <Spacer size="md" />

      {/* Security */}
      <AnimatedCard delay={150}>
        <Typo variant="body" style={{ fontWeight: "700" }}>Sicherheit</Typo>
        <Spacer size="md" />
        {showPwModal ? (
          <>
            <Input label="Aktuelles Passwort" placeholder="••••••••" secureTextEntry value={currentPw} onChangeText={setCurrentPw} />
            <Input label="Neues Passwort" placeholder="Mindestens 6 Zeichen" secureTextEntry value={newPw} onChangeText={setNewPw} />
            <Input label="Neues Passwort bestätigen" placeholder="••••••••" secureTextEntry value={confirmPw} onChangeText={setConfirmPw} />
            <Spacer size="md" />
            <View style={styles.buttonRow}>
              <Button label="Abbrechen" variant="outline" onPress={() => { setShowPwModal(false); setCurrentPw(""); setNewPw(""); setConfirmPw(""); }} style={{ flex: 1, marginRight: Spacing.sm }} />
              <Button label="Ändern" onPress={handleChangePassword} loading={pwLoading} style={{ flex: 1 }} />
            </View>
          </>
        ) : (
          <Button label="Passwort ändern" variant="outline" onPress={() => setShowPwModal(true)} />
        )}
      </AnimatedCard>

      <Spacer size="xl" />
      <Button label="Abmelden" variant="ghost" onPress={logout} />
      <Spacer size="xxl" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatarWrap: { alignSelf: "center", position: "relative" },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  avatarPlaceholder: { width: 90, height: 90, borderRadius: 45, alignItems: "center", justifyContent: "center" },
  cameraBadge: { position: "absolute", bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "white" },
  themeRow: { flexDirection: "row", gap: Spacing.sm },
  themeOption: { flex: 1, alignItems: "center", paddingVertical: Spacing.md, borderRadius: Radius.md, borderWidth: 1.5 },
  buttonRow: { flexDirection: "row" },
});
