import React, { useEffect } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider, useTheme } from "../store/themeContext";
import { useAuthStore } from "../store/authStore";

function RootContent() {
  const { colors, isDark } = useTheme();
  const { user, loading, init } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = init();
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (loading) return;
    const inAuthRoute = segments[0] === "auth";
    if (!user && !inAuthRoute) {
      router.replace("/auth/login");
    } else if (user && inAuthRoute) {
      router.replace("/(tabs)");
    }
  }, [user, loading, segments]);

  if (loading) {
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
