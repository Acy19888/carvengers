import { Stack } from "expo-router";

export default function CaseLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="create" />
      <Stack.Screen name="upload" />
      <Stack.Screen name="report" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
