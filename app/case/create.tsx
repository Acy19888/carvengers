import React, { useState, useMemo } from "react";
import { View, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Button, Input, Typo, Spacer, Picker } from "../../components/ui";
import { StepIndicator } from "../../components/ui/StepIndicator";
import { ScanModePicker } from "../../components/case/ScanModePicker";
import { PaymentMethodPicker } from "../../components/case/PaymentMethodPicker";
import { BookingCalendar } from "../../components/case/BookingCalendar";
import { VinScanner } from "../../components/media/VinScanner";
import { createCaseSchema, CreateCaseFormData } from "../../features/cases/schemas";
import { useAuthStore } from "../../store/authStore";
import { useTheme } from "../../store/themeContext";
import { useCaseStore } from "../../store/caseStore";
import { Spacing, Radius } from "../../constants/theme";
import { SCAN_MODE_LABELS, SCAN_MODE_STEPS } from "../../constants/app";
import { SCAN_MODE_PRICES, SCAN_MODE_FEATURES } from "../../constants/payment";
import type { PaymentMethod } from "../../constants/payment";
import { VEHICLE_MAKES, VEHICLE_MODELS, getYearOptions, getVariants } from "../../constants/vehicles";
import { processPayment } from "../../services/payments";
import type { ScanMode } from "../../types/models";

const MONTHS = ["Jan.", "Feb.", "März", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sep.", "Okt.", "Nov.", "Dez."];
const TOTAL_STEPS = 4;

function fmtBooking(ds: string) {
  const [y, m, d] = ds.split("-").map(Number);
  return `${d}. ${MONTHS[m - 1]} ${y}`;
}

export default function CreateCaseScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { colors } = useTheme();
  const { submitNewCase, loading } = useCaseStore();

  const [step, setStep] = useState(0);
  const [scanMode, setScanMode] = useState<ScanMode | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [showVinScanner, setShowVinScanner] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [bookedDate, setBookedDate] = useState<string | null>(null);
  const [bookedTime, setBookedTime] = useState<string | null>(null);

  const needsBooking = scanMode === "expert";

  const { control, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm<CreateCaseFormData>({
    resolver: zodResolver(createCaseSchema),
    defaultValues: { vin: "", make: "", model: "", variant: "", year: "", mileage: "", notes: "" },
  });

  const selectedMake = watch("make");
  const selectedModel = watch("model");
  const modelOptions = useMemo(() => selectedMake ? (VEHICLE_MODELS[selectedMake] ?? []) : [], [selectedMake]);
  const variantOptions = useMemo(() => (selectedMake && selectedModel) ? getVariants(selectedMake, selectedModel) : [], [selectedMake, selectedModel]);
  const yearOptions = useMemo(() => getYearOptions().map(String), []);

  const goNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  const goBack = () => { if (step === 0) router.back(); else setStep((s) => s - 1); };

  const onSelectMode = () => {
    if (!scanMode) { Alert.alert("Bitte auswählen", "Wähle eine Inspektionsart."); return; }
    if (needsBooking && (!bookedDate || !bookedTime)) { Alert.alert("Termin fehlt", "Bitte wähle einen Termin."); return; }
    goNext();
  };

  const tierFromMode = (m: ScanMode) => m === "quick_seller" ? "ai_only" as const : m === "full_ai" ? "ai_only" as const : "onsite" as const;

  const onProcessPayment = async () => {
    if (!paymentMethod || !scanMode) return;
    setPaymentProcessing(true);
    try {
      const result = await processPayment(tierFromMode(scanMode), paymentMethod);
      if (result.success) { setTransactionId(result.transactionId); goNext(); }
      else Alert.alert("Fehler", result.error ?? "Bitte erneut versuchen.");
    } catch { Alert.alert("Fehler", "Zahlung fehlgeschlagen."); }
    finally { setPaymentProcessing(false); }
  };

  const onConfirm = async () => {
    if (!user || !scanMode) return;
    const v = getValues();
    const modelDisplay = v.variant ? `${v.model} ${v.variant}` : v.model;
    try {
      const newCase = await submitNewCase({
        vin: v.vin.toUpperCase(), make: v.make, model: modelDisplay,
        year: parseInt(v.year, 10), mileage: parseInt((v.mileage ?? "0").replace(/\./g, ""), 10),
        notes: v.notes ?? "", serviceTier: tierFromMode(scanMode), userId: user.id,
      });
      router.replace(`/case/upload?caseId=${newCase.id}&scanMode=${scanMode}`);
    } catch { Alert.alert("Fehler", "Inspektion konnte nicht erstellt werden."); }
  };

  if (showVinScanner) {
    return <VinScanner onScan={(vin) => { setValue("vin", vin); setShowVinScanner(false); }} onClose={() => setShowVinScanner(false)} />;
  }

  return (
    <Screen scroll>
      <Spacer size="md" />
      <View style={s.topBar}>
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} onPress={goBack} />
        <Typo variant="h3">Neue Inspektion</Typo>
        <View style={{ width: 24 }} />
      </View>
      <StepIndicator total={TOTAL_STEPS} current={step} />

      {/* ═══ Step 0: Fahrzeugdaten ═══ */}
      {step === 0 && (
        <View>
          <Typo variant="h3">Fahrzeugdaten</Typo>
          <Spacer size="xs" />
          <Typo variant="caption">Gib die Informationen zum Fahrzeug ein.</Typo>
          <Spacer size="lg" />

          <Controller control={control} name="vin" render={({ field: { onChange, value } }) => (
            <View style={s.vinRow}>
              <View style={{ flex: 1 }}>
                <Input label="FIN (Fahrzeug-Identifizierungsnummer)" placeholder="z.B. WVWZZZ3CZWE123456" autoCapitalize="characters" maxLength={17} value={value} onChangeText={onChange} error={errors.vin?.message} />
              </View>
              <TouchableOpacity style={[s.scanBtn, { borderColor: colors.accent, backgroundColor: colors.accentLight }]} onPress={() => setShowVinScanner(true)}>
                <Ionicons name="scan" size={22} color={colors.accent} />
                <Typo variant="caption" style={{ fontSize: 9, marginTop: 2 }}>Scannen</Typo>
              </TouchableOpacity>
            </View>
          )} />

          <Controller control={control} name="make" render={({ field: { onChange, value } }) => (
            <Picker label="Marke" placeholder="Marke auswählen…" value={value} options={[...VEHICLE_MAKES]} onSelect={(v) => { onChange(v); setValue("model", ""); setValue("variant", ""); }} error={errors.make?.message} />
          )} />
          <Controller control={control} name="model" render={({ field: { onChange, value } }) => (
            <Picker label="Modell" placeholder={selectedMake ? "Modell auswählen…" : "Zuerst Marke wählen"} value={value} options={modelOptions} onSelect={(v) => { onChange(v); setValue("variant", ""); }} error={errors.model?.message} />
          )} />
          {variantOptions.length > 0 && (
            <Controller control={control} name="variant" render={({ field: { onChange, value } }) => (
              <Picker label="Motorisierung (optional)" placeholder="Variante…" value={value ?? ""} options={variantOptions} onSelect={onChange} searchable={false} />
            )} />
          )}
          <Controller control={control} name="year" render={({ field: { onChange, value } }) => (
            <Picker label="Baujahr" placeholder="Baujahr…" value={value} options={yearOptions} onSelect={onChange} error={errors.year?.message} searchable={false} />
          )} />
          <Controller control={control} name="mileage" render={({ field: { onChange, value } }) => (
            <Input label="km-Stand (optional – wird vom Tacho erkannt)" placeholder="z.B. 85000" keyboardType="number-pad" maxLength={6} value={value} onChangeText={onChange} error={errors.mileage?.message} />
          )} />
          <Controller control={control} name="notes" render={({ field: { onChange, value } }) => (
            <Input label="Anmerkungen (optional)" placeholder="Hinweise für den Prüfer?" multiline value={value} onChangeText={onChange} style={{ height: 80, textAlignVertical: "top", paddingTop: 12 }} />
          )} />
          <Spacer size="md" />
          <Button label="Weiter" onPress={handleSubmit(() => goNext())} />
        </View>
      )}

      {/* ═══ Step 1: Scan-Modus ═══ */}
      {step === 1 && (
        <View>
          <Typo variant="h3">Inspektionsart wählen</Typo>
          <Spacer size="xs" />
          <Typo variant="caption">Wie soll das Fahrzeug geprüft werden?</Typo>
          <Spacer size="lg" />

          <ScanModePicker selected={scanMode} onSelect={(m) => { setScanMode(m); setBookedDate(null); setBookedTime(null); }} />

          {/* Quick Seller Scan info */}
          {scanMode === "quick_seller" && (
            <View style={[s.infoBox, { backgroundColor: colors.infoLight, borderColor: colors.info }]}>
              <Ionicons name="information-circle" size={18} color={colors.info} />
              <Typo variant="caption" style={{ marginLeft: 8, flex: 1, fontSize: 12 }}>
                Du erhältst einen Link zum Teilen. Der Verkäufer führt die Inspektion im Browser durch — kein App-Download nötig.
              </Typo>
            </View>
          )}

          {/* Expert booking */}
          {needsBooking && (
            <>
              <Spacer size="md" />
              <TouchableOpacity
                style={[s.bookingCard, { borderColor: bookedDate ? colors.accent : colors.border, backgroundColor: bookedDate ? colors.accentLight : colors.surface }]}
                onPress={() => setShowCalendar(true)}
              >
                <Ionicons name="calendar" size={24} color={bookedDate ? colors.accent : colors.textMuted} />
                <View style={{ marginLeft: Spacing.md, flex: 1 }}>
                  {bookedDate && bookedTime ? (
                    <>
                      <Typo variant="body" style={{ fontWeight: "600" }}>{fmtBooking(bookedDate)} um {bookedTime} Uhr</Typo>
                      <Typo variant="caption">Tippen zum Ändern</Typo>
                    </>
                  ) : (
                    <>
                      <Typo variant="body" style={{ fontWeight: "600" }}>Termin auswählen</Typo>
                      <Typo variant="caption">Datum und Uhrzeit für die Expertenprüfung</Typo>
                    </>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </>
          )}

          <Spacer size="lg" />
          <Button label="Weiter" onPress={onSelectMode} />
        </View>
      )}

      <BookingCalendar visible={showCalendar} title="Experten-Termin" onConfirm={(d, t) => { setBookedDate(d); setBookedTime(t); setShowCalendar(false); }} onClose={() => setShowCalendar(false)} />

      {/* ═══ Step 2: Zahlung ═══ */}
      {step === 2 && scanMode && (
        <View>
          <Typo variant="h3">Zahlung</Typo>
          <Spacer size="xs" />
          <Typo variant="caption">Wähle deine Zahlungsmethode.</Typo>
          <Spacer size="lg" />

          <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Typo variant="body" style={{ fontWeight: "700" }}>{SCAN_MODE_LABELS[scanMode]}</Typo>
            <Spacer size="sm" />
            {SCAN_MODE_FEATURES[scanMode].map((f, i) => (
              <View key={i} style={s.featureRow}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Typo variant="caption" style={{ marginLeft: 8, flex: 1 }}>{f}</Typo>
              </View>
            ))}
            {bookedDate && bookedTime && (
              <View style={[s.featureRow, { marginTop: 4 }]}>
                <Ionicons name="calendar" size={16} color={colors.accent} />
                <Typo variant="caption" style={{ marginLeft: 8 }}>{fmtBooking(bookedDate)} um {bookedTime} Uhr</Typo>
              </View>
            )}
            <Spacer size="md" />
            <View style={[s.priceRow, { borderTopColor: colors.border }]}>
              <Typo variant="body" style={{ fontWeight: "600" }}>Gesamt</Typo>
              <Typo variant="h2" style={{ color: colors.accent }}>{SCAN_MODE_PRICES[scanMode].toFixed(2).replace(".", ",")} €</Typo>
            </View>
          </View>

          <Spacer size="lg" />
          <Typo variant="body" style={{ fontWeight: "600" }}>Zahlungsmethode</Typo>
          <Spacer size="sm" />
          <PaymentMethodPicker selected={paymentMethod} onSelect={setPaymentMethod} />
          <Spacer size="lg" />
          <Button
            label={paymentProcessing ? "Wird verarbeitet…" : `${SCAN_MODE_PRICES[scanMode].toFixed(2).replace(".", ",")} € bezahlen`}
            onPress={onProcessPayment} loading={paymentProcessing} disabled={!paymentMethod}
          />
        </View>
      )}

      {/* ═══ Step 3: Bestätigung ═══ */}
      {step === 3 && (
        <View>
          <View style={{ alignItems: "center", marginTop: Spacing.lg }}>
            <Ionicons name="checkmark-circle" size={60} color={colors.success} />
          </View>
          <Spacer size="md" />
          <Typo variant="h3" center>Zahlung erfolgreich</Typo>
          <Spacer size="xs" />
          <Typo variant="caption" center>ID: {transactionId}</Typo>
          <Spacer size="xl" />

          <Typo variant="h3">Zusammenfassung</Typo>
          <Spacer size="md" />
          <Row label="FIN" value={getValues("vin").toUpperCase()} c={colors.border} />
          <Row label="Marke" value={getValues("make")} c={colors.border} />
          <Row label="Modell" value={getValues("variant") ? `${getValues("model")} ${getValues("variant")}` : getValues("model")} c={colors.border} />
          <Row label="Baujahr" value={getValues("year")} c={colors.border} />
          {getValues("mileage") ? <Row label="km-Stand" value={`${getValues("mileage")} km`} c={colors.border} /> : null}
          <Row label="Modus" value={scanMode ? SCAN_MODE_LABELS[scanMode] : ""} c={colors.border} />
          <Row label="Schritte" value={scanMode ? `${SCAN_MODE_STEPS[scanMode].length} Aufnahmen` : ""} c={colors.border} />
          {bookedDate && bookedTime && <Row label="Termin" value={`${fmtBooking(bookedDate)}, ${bookedTime}`} c={colors.border} />}
          <Row label="Bezahlt" value={scanMode ? `${SCAN_MODE_PRICES[scanMode].toFixed(2).replace(".", ",")} €` : ""} c={colors.border} />
          <Spacer size="lg" />
          <Button label="Inspektion starten" onPress={onConfirm} loading={loading} />
        </View>
      )}
    </Screen>
  );
}

function Row({ label, value, c }: { label: string; value: string; c: string }) {
  return (
    <View style={[s.summaryRow, { borderBottomColor: c }]}>
      <Typo variant="caption" style={{ width: 80 }}>{label}</Typo>
      <Typo variant="body" style={{ flex: 1, fontWeight: "500" }}>{value}</Typo>
    </View>
  );
}

const s = StyleSheet.create({
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  vinRow: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm },
  scanBtn: { marginTop: 22, width: 56, height: 48, borderRadius: Radius.md, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  bookingCard: { flexDirection: "row", alignItems: "center", padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1.5 },
  infoBox: { flexDirection: "row", alignItems: "center", padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, marginTop: Spacing.md },
  card: { borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1 },
  featureRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, paddingTop: Spacing.md },
  summaryRow: { flexDirection: "row", paddingVertical: Spacing.sm, borderBottomWidth: 1 },
});
