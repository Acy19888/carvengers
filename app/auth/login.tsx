import React, { useEffect, useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Screen, Button, Input, Typo, Spacer } from "../../components/ui";
import { SocialButton } from "../../components/ui/SocialButton";
import { loginSchema, LoginFormData } from "../../features/auth/schemas";
import { useAuthStore } from "../../store/authStore";
import { useTheme } from "../../store/themeContext";
import { useGoogleAuthRequest, signInWithGoogle } from "../../services/firebase/googleAuth";
import { FontSize, Spacing } from "../../constants/theme";

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { login, loading, error, clearError } = useAuthStore();
  const [googleLoading, setGoogleLoading] = useState(false);

  // Google Auth
  const [request, response, promptAsync] = useGoogleAuthRequest();

  useEffect(() => {
    if (response?.type === "success") {
      const idToken = response.authentication?.idToken;
      if (idToken) {
        handleGoogleLogin(idToken);
      }
    }
  }, [response]);

  const handleGoogleLogin = async (idToken: string) => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle(idToken);
      // Auth state listener in store will handle redirect
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
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    await login(data.email, data.password);
  };

  return (
    <Screen scroll>
      <Spacer size="xxl" />
      <Spacer size="xl" />
      <Typo variant="h1" center style={[styles.brand, { color: colors.accent }]}>CARVENGERS</Typo>
      <Spacer size="xs" />
      <Typo variant="caption" center>Gebrauchtwagenprüfung mit Vertrauen</Typo>

      <Spacer size="xl" />

      {/* Social Login */}
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
              // Apple Sign-In needs Apple Developer Account
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

      {/* Email Login */}
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
            placeholder="••••••••"
            secureTextEntry
            value={value}
            onChangeText={onChange}
            error={errors.password?.message}
          />
        )}
      />

      {error ? (
        <Typo variant="caption" color={colors.error} center>{error}</Typo>
      ) : null}

      <Spacer size="md" />
      <Button label="Anmelden" onPress={handleSubmit(onSubmit)} loading={loading} />
      <Spacer size="md" />
      <Button
        label="Konto erstellen"
        variant="ghost"
        onPress={() => router.push("/auth/signup")}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: {
    letterSpacing: 3,
    fontSize: FontSize.xxl,
    fontWeight: "800",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    color: "#94A3B8",
  },
});
