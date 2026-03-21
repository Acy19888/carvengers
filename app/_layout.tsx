import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeProvider, useTheme } from "../store/themeContext";
import { useAuthStore } from "../store/authStore";

const ONBOARDING_KEY = "carvengers_onboarding_done";

function RootContent() {
  const { colors, isDark } = useTheme();
  const { user, loading: authLoading, init } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Check onboarding status
  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((val) => {
      setNeedsOnboarding(val !== "true");
      setCheckingOnboarding(false);
    });
  }, []);

  // Init auth
  useEffect(() => {
    const unsubscribe = init();
    return unsubscribe;
  }, []);

  // Routing logic
  useEffect(() => {
    if (checkingOnboarding || authLoading) return;

    const inOnboarding = segments[0] === "onboarding";
    const inAuth = segments[0] === "auth";

    // First launch → onboarding
    if (needsOnboarding && !inOnboarding) {
      router.replace("/onboarding");
      return;
    }

    // After onboarding or returning user
    if (!needsOnboarding) {
      if (!user && !inAuth) {
        router.replace("/auth/login");
      } else if (user && (inAuth || inOnboarding)) {
        router.replace("/(tabs)");
      }
    }
  }, [user, authLoading, checkingOnboarding, needsOnboarding, segments]);

  // Listen for onboarding completion
  useEffect(() => {
    if (segments[0] === "auth" && needsOnboarding) {
      setNeedsOnboarding(false);
    }
  }, [segments]);

  if (checkingOnboarding || authLoading) {
    return (
      <View style={[styles.splash, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Slot />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
