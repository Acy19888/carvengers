import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, FlatList, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Typo, Spacer, Button } from "../../components/ui";
import { useTheme } from "../../store/themeContext";
import { Spacing, Radius, FontSize } from "../../constants/theme";

interface MarketplaceListing {
  id: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  location: string;
  healthScore: number;
  inspected: boolean;
  imageUrl: string | null;
  seller: string;
  daysOnMarket: number;
}

// Mock listings
const MOCK_LISTINGS: MarketplaceListing[] = [
  { id: "1", make: "Volkswagen", model: "Golf 8 1.5 TSI", year: 2021, mileage: 42000, price: 22900, location: "München", healthScore: 88, inspected: true, imageUrl: null, seller: "Privat", daysOnMarket: 3 },
  { id: "2", make: "BMW", model: "320i M Sport", year: 2020, mileage: 58000, price: 29500, location: "Berlin", healthScore: 76, inspected: true, imageUrl: null, seller: "Händler", daysOnMarket: 7 },
  { id: "3", make: "Mercedes-Benz", model: "A 200 AMG Line", year: 2022, mileage: 31000, price: 32900, location: "Hamburg", healthScore: 92, inspected: true, imageUrl: null, seller: "Privat", daysOnMarket: 1 },
  { id: "4", make: "Audi", model: "A4 Avant 40 TFSI", year: 2019, mileage: 87000, price: 24500, location: "Frankfurt", healthScore: 71, inspected: true, imageUrl: null, seller: "Händler", daysOnMarket: 14 },
  { id: "5", make: "Tesla", model: "Model 3 Long Range", year: 2023, mileage: 18000, price: 38900, location: "Stuttgart", healthScore: 95, inspected: true, imageUrl: null, seller: "Privat", daysOnMarket: 2 },
  { id: "6", make: "Škoda", model: "Octavia RS 2.0 TSI", year: 2021, mileage: 55000, price: 28900, location: "Köln", healthScore: 83, inspected: true, imageUrl: null, seller: "Privat", daysOnMarket: 5 },
  { id: "7", make: "Hyundai", model: "Tucson 1.6 T-GDI", year: 2022, mileage: 28000, price: 31500, location: "Düsseldorf", healthScore: 89, inspected: true, imageUrl: null, seller: "Händler", daysOnMarket: 4 },
  { id: "8", make: "Toyota", model: "Corolla Hybrid", year: 2023, mileage: 15000, price: 26900, location: "München", healthScore: 96, inspected: true, imageUrl: null, seller: "Privat", daysOnMarket: 1 },
];

type SortBy = "price_asc" | "price_desc" | "score" | "newest";

export default function MarketplaceScreen() {
  const { colors } = useTheme();
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [filter, setFilter] = useState<string | null>(null);

  const sortedListings = [...MOCK_LISTINGS].sort((a, b) => {
    switch (sortBy) {
      case "price_asc": return a.price - b.price;
      case "price_desc": return b.price - a.price;
      case "score": return b.healthScore - a.healthScore;
      case "newest": return a.daysOnMarket - b.daysOnMarket;
      default: return 0;
    }
  });

  const filteredListings = filter
    ? sortedListings.filter(l => l.make === filter)
    : sortedListings;

  const makes = [...new Set(MOCK_LISTINGS.map(l => l.make))];

  const scoreColor = (score: number) =>
    score >= 85 ? colors.success : score >= 70 ? colors.warning : colors.error;

  const renderListing = ({ item }: { item: MarketplaceListing }) => (
    <TouchableOpacity
      style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      activeOpacity={0.7}
    >
      {/* Image placeholder */}
      <View style={[s.imagePlaceholder, { backgroundColor: colors.border }]}>
        <Ionicons name="car" size={40} color={colors.textMuted} />
        {item.daysOnMarket <= 2 && (
          <View style={[s.newBadge, { backgroundColor: colors.accent }]}>
            <Typo variant="caption" color="white" style={{ fontSize: 9, fontWeight: "700" }}>NEU</Typo>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={s.cardBody}>
        <View style={s.rowBetween}>
          <Typo variant="body" style={{ fontWeight: "700", fontSize: FontSize.sm, flex: 1 }} numberOfLines={1}>
            {item.make} {item.model}
          </Typo>
          <View style={[s.scoreBadge, { backgroundColor: scoreColor(item.healthScore) }]}>
            <Typo variant="caption" color="white" style={{ fontSize: 10, fontWeight: "700" }}>{item.healthScore}</Typo>
          </View>
        </View>

        <Spacer size="xs" />

        <View style={s.detailRow}>
          <Typo variant="caption" style={{ fontSize: 11, color: colors.textMuted }}>
            {item.year} · {item.mileage.toLocaleString("de-DE")} km · {item.location}
          </Typo>
        </View>

        <Spacer size="xs" />

        <View style={s.rowBetween}>
          <Typo variant="h3" style={{ color: colors.accent }}>
            {item.price.toLocaleString("de-DE")}€
          </Typo>
          <View style={s.tagRow}>
            {item.inspected && (
              <View style={[s.tag, { backgroundColor: colors.successLight, borderColor: colors.success }]}>
                <Ionicons name="shield-checkmark" size={10} color={colors.success} />
                <Typo variant="caption" style={{ fontSize: 9, marginLeft: 3, color: colors.success, fontWeight: "600" }}>Geprüft</Typo>
              </View>
            )}
            <View style={[s.tag, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Typo variant="caption" style={{ fontSize: 9, color: colors.textMuted }}>{item.seller}</Typo>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Screen>
      <Spacer size="xxl" />
      <Spacer size="md" />
      <View style={s.rowBetween}>
        <View>
          <Typo variant="h2">Marktplatz</Typo>
          <Typo variant="caption" style={{ color: colors.textMuted }}>
            Geprüfte Gebrauchtwagen
          </Typo>
        </View>
        <View style={[s.countBadge, { backgroundColor: colors.accentLight }]}>
          <Typo variant="caption" style={{ color: colors.accent, fontWeight: "700" }}>
            {filteredListings.length} Angebote
          </Typo>
        </View>
      </View>

      <Spacer size="md" />

      {/* Sort chips */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[
          { key: "newest", label: "Neueste" },
          { key: "price_asc", label: "Preis ↑" },
          { key: "price_desc", label: "Preis ↓" },
          { key: "score", label: "Bester Score" },
        ]}
        keyExtractor={i => i.key}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[s.chip, { backgroundColor: sortBy === item.key ? colors.accent : colors.surface, borderColor: sortBy === item.key ? colors.accent : colors.border }]}
            onPress={() => setSortBy(item.key as SortBy)}
          >
            <Typo variant="caption" style={{ fontSize: 12, fontWeight: "600", color: sortBy === item.key ? "white" : colors.textSecondary }}>
              {item.label}
            </Typo>
          </TouchableOpacity>
        )}
        style={{ marginBottom: Spacing.sm }}
      />

      {/* Make filter */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[{ key: "all", label: "Alle" }, ...makes.map(m => ({ key: m, label: m }))]}
        keyExtractor={i => i.key}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[s.chipSmall, { backgroundColor: (filter === null && item.key === "all") || filter === item.key ? colors.accentLight : "transparent", borderColor: colors.border }]}
            onPress={() => setFilter(item.key === "all" ? null : item.key)}
          >
            <Typo variant="caption" style={{ fontSize: 11, color: (filter === null && item.key === "all") || filter === item.key ? colors.accent : colors.textMuted }}>
              {item.label}
            </Typo>
          </TouchableOpacity>
        )}
        style={{ marginBottom: Spacing.md }}
      />

      {/* Listings */}
      <FlatList
        data={filteredListings}
        renderItem={renderListing}
        keyExtractor={l => l.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingVertical: Spacing.xl }}>
            <Ionicons name="search" size={40} color={colors.textMuted} />
            <Spacer size="sm" />
            <Typo variant="caption">Keine Angebote gefunden</Typo>
          </View>
        }
      />
    </Screen>
  );
}

const s = StyleSheet.create({
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  countBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.full },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1, marginRight: Spacing.sm },
  chipSmall: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full, borderWidth: 1, marginRight: 6 },
  card: { borderRadius: Radius.lg, borderWidth: 1, marginBottom: Spacing.md, overflow: "hidden" },
  imagePlaceholder: { height: 140, alignItems: "center", justifyContent: "center", position: "relative" },
  newBadge: { position: "absolute", top: 8, left: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  cardBody: { padding: Spacing.md },
  detailRow: { flexDirection: "row", alignItems: "center" },
  scoreBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  tagRow: { flexDirection: "row", gap: 6 },
  tag: { flexDirection: "row", alignItems: "center", paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.full, borderWidth: 1 },
});
