export const LightColors = {
  primary: "#0F172A",
  primaryLight: "#1E293B",
  accent: "#3B82F6",
  accentLight: "#DBEAFE",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",
  border: "#E2E8F0",
  borderFocus: "#3B82F6",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  textOnPrimary: "#FFFFFF",
  success: "#22C55E",
  successLight: "#F0FDF4",
  warning: "#F59E0B",
  warningLight: "#FFFBEB",
  error: "#EF4444",
  errorLight: "#FEF2F2",
  info: "#3B82F6",
  infoLight: "#EFF6FF",
  shadow: "rgba(15, 23, 42, 0.08)",
  overlay: "rgba(0, 0, 0, 0.5)",
} as const;

export const DarkColors = {
  primary: "#F8FAFC",
  primaryLight: "#E2E8F0",
  accent: "#60A5FA",
  accentLight: "#1E3A5F",
  background: "#0B1120",
  surface: "#151D2E",
  surfaceElevated: "#1C2640",
  border: "#253045",
  borderFocus: "#60A5FA",
  textPrimary: "#F1F5F9",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  textOnPrimary: "#FFFFFF",
  success: "#4ADE80",
  successLight: "#0A2619",
  warning: "#FBBF24",
  warningLight: "#2A1F00",
  error: "#FB7185",
  errorLight: "#2D0A0A",
  info: "#60A5FA",
  infoLight: "#0C1F3D",
  shadow: "rgba(0, 0, 0, 0.3)",
  overlay: "rgba(0, 0, 0, 0.7)",
} as const;

// Default export (will be overridden by theme context)
export const Colors = LightColors;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const Radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 20,
  full: 999,
} as const;
