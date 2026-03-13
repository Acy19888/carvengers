import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useTheme } from "../../store/themeContext";
import { Typo } from "../../components/ui/Typo";
import { Button } from "../../components/ui/Button";
import { Spacer } from "../../components/ui/Spacer";
import { Spacing, FontSize, Radius } from "../../constants/theme";

const { width: SCREEN_W } = Dimensions.get("window");
const ONBOARDING_KEY = "carvengers_onboarding_done";

interface Slide {
  icon: string;
  title: string;
  description: string;
  color: string;
}

const SLIDES: Slide[] = [
  {
    icon: "car-sport",
    title: "Gebrauchtwagen\nsicher kaufen",
    description:
      "Carvengers prüft jedes Fahrzeug mit KI-Analyse und Experten. Nie wieder versteckte Mängel.",
    color: "#3B82F6",
  },
  {
    icon: "camera",
    title: "Fotos aufnehmen,\nKI analysiert",
    description:
      "Geführte Kamera mit Overlays zeigt dir genau, wie du fotografieren sollst. Die KI erkennt Schäden automatisch.",
    color: "#22C55E",
  },
  {
    icon: "document-text",
    title: "Detaillierter\nBericht erhalten",
    description:
      "Strukturierter Inspektionsbericht mit Befunden, Bewertung und FIN-Historie. Transparent und teilbar.",
    color: "#F59E0B",
  },
];

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  const finishOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    router.replace("/auth/login");
  };

  const goNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      finishOnboarding();
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const renderSlide = ({ item, index }: { item: Slide; index: number }) => (
    <View style={[styles.slide, { width: SCREEN_W }]}>
      <View style={[styles.iconCircle, { backgroundColor: `${item.color}18` }]}>
        <View style={[styles.iconInner, { backgroundColor: `${item.color}30` }]}>
          <Ionicons name={item.icon as any} size={64} color={item.color} />
        </View>
      </View>
      <Spacer size="xl" />
      <Typo variant="h1" center style={{ fontSize: 28, lineHeight: 36 }}>
        {item.title}
      </Typo>
      <Spacer size="md" />
      <Typo
        variant="body"
        center
        style={{ paddingHorizontal: 40, lineHeight: 24, color: colors.textSecondary }}
      >
        {item.description}
      </Typo>
    </View>
  );

  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Skip button */}
      <View style={styles.skipRow}>
        {!isLast ? (
          <TouchableOpacity onPress={finishOnboarding} style={styles.skipBtn}>
            <Typo variant="caption" style={{ color: colors.textMuted }}>
              Überspringen
            </Typo>
          </TouchableOpacity>
        ) : (
          <View />
        )}
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />

      {/* Bottom area */}
      <View style={styles.bottomArea}>
        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((slide, i) => {
            const inputRange = [
              (i - 1) * SCREEN_W,
              i * SCREEN_W,
              (i + 1) * SCREEN_W,
            ];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 28, 8],
              extrapolate: "clamp",
            });
            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });
            return (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity: dotOpacity,
                    backgroundColor: slide.color,
                  },
                ]}
              />
            );
          })}
        </View>

        <Spacer size="xl" />

        <View style={{ paddingHorizontal: Spacing.xl }}>
          <Button
            label={isLast ? "Loslegen" : "Weiter"}
            onPress={goNext}
          />
        </View>

        <Spacer size="xxl" />
      </View>
    </View>
  );
}

/** Check if onboarding was already completed */
export async function hasCompletedOnboarding(): Promise<boolean> {
  const val = await AsyncStorage.getItem(ONBOARDING_KEY);
  return val === "true";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingTop: 55,
    paddingHorizontal: Spacing.lg,
  },
  skipBtn: {
    padding: Spacing.sm,
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 100,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  iconInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomArea: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
