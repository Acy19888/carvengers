import React, { useEffect, useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Screen, Button, Input, Typo, Spacer } from "../../components/ui";
import { SocialButton } from "../../components/ui/SocialButton";
import { signupSchema, SignupFormData } from "../../features/auth/schemas";
import { useAuthStore } from "../../store/authStore";
import { useGoogleAuthRequest, signInWithGoogle } from "../../services/firebase/googleAuth";
import { Colors, Spacing } from "../../constants/theme";

export default function SignupScreen() {
  const router = useRouter();
  const { register, loading, error, clearError } = useAuthStore();
  const [googleLoading, setGoogleLoading] = useState(false);

  const [request, response, promptAsync] = useGoogleAuthRequest();

  useEffect(() => {
    if (response?.type === "success") {
      const idToken = response.authentication?.idToken;
      if (idToken) {
        handleGoogleSignup(idToken);
      }
    }
  }, [response]);

  const handleGoogleSignup = async (idToken: string) => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle(idToken);
    } catch (e: any) {
      useAuthStore.setState({ error: e.message });
    } finally {
      setGoogleLoading(false);
    }
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: SignupFormData) => {
    clearError();
    await register(data.email, data.password);
  };

  return (
    <Screen scroll>
      <Spacer size="xxl" />
      <Typo variant="h2" center>Konto erstellen</Typo>
      <Spacer size="xs" />
      <Typo variant="caption" center>Starte jetzt mit der Fahrzeugprüfung</Typo>

      <Spacer size="xl" />

      {/* Social */}
      <SocialButton
        provider="google"
        onPress={() => promptAsync()}
        loading={googleLoading}
      />
      <Spacer size="sm" />
      {Platform.OS === "ios" && (
        <>
          <SocialButton
            provider="apple"
            onPress={() => {
              useAuthStore.setState({
                error: "Apple-Anmeldung wird in einem zukünftigen Update aktiviert.",
              });
            }}
          />
          <Spacer size="sm" />
        </>
      )}

      {/* Divider */}
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Typo variant="caption" style={styles.dividerText}>oder</Typo>
        <View style={styles.dividerLine} />
      </View>

      <Spacer size="md" />

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <Input
            label="E-Mail"
            placeholder="deine@email.de"
            keyboardType="email-address"
            autoCapitalize="none"
            value={value}
            onChangeText={onChange}
            error={errors.email?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Passwort"
            placeholder="Mindestens 6 Zeichen"
            secureTextEntry
            value={value}
            onChangeText={onChange}
            error={errors.password?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Passwort bestätigen"
            placeholder="Passwort erneut eingeben"
            secureTextEntry
            value={value}
            onChangeText={onChange}
            error={errors.confirmPassword?.message}
          />
        )}
      />

      {error ? (
        <Typo variant="caption" color={Colors.error} center>{error}</Typo>
      ) : null}

      <Spacer size="md" />
      <Button label="Registrieren" onPress={handleSubmit(onSubmit)} loading={loading} />
      <Spacer size="md" />
      <Button
        label="Bereits ein Konto? Anmelden"
        variant="ghost"
        onPress={() => router.back()}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    color: Colors.textMuted,
  },
});
