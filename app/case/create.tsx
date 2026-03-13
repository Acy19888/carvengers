import React, { useState, useMemo } from "react";
import { View, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Button, Input, Typo, Spacer, Picker } from "../../components/ui";
import { StepIndicator } from "../../components/ui/StepIndicator";
import { TierPicker } from "../../components/case/TierPicker";
import { PaymentMethodPicker } from "../../components/case/PaymentMethodPicker";
import { VinScanner } from "../../components/media/VinScanner";
import { createCaseSchema, CreateCaseFormData } from "../../features/cases/schemas";
import { useAuthStore } from "../../store/authStore";
import { useCaseStore } from "../../store/caseStore";
import { Colors, Spacing, Radius } from "../../constants/theme";
import { SERVICE_TIER_LABELS } from "../../constants/app";
import { TIER_PRICES, TIER_DESCRIPTIONS } from "../../constants/payment";
import type { PaymentMethod } from "../../constants/payment";
import { VEHICLE_MAKES, VEHICLE_MODELS, getYearOptions, getVariants } from "../../constants/vehicles";
import { processPayment } from "../../services/payments";
import type { ServiceTier } from "../../types/models";

const TOTAL_STEPS = 4; // vehicle → tier → payment → confirm

export default function CreateCaseScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { submitNewCase, loading } = useCaseStore();
  const [step, setStep] = useState(0);
  const [tier, setTier] = useState<ServiceTier | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [showVinScanner, setShowVinScanner] = useState(false);

  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateCaseFormData>({
    resolver: zodResolver(createCaseSchema),
    defaultValues: { vin: "", make: "", model: "", variant: "", year: "", mileage: "", notes: "" },
  });

  const selectedMake = watch("make");
  const selectedModel = watch("model");
  const modelOptions = useMemo(() => selectedMake ? (VEHICLE_MODELS[selectedMake] ?? []) : [], [selectedMake]);
  const variantOptions = useMemo(() => (selectedMake && selectedModel) ? getVariants(selectedMake, selectedModel) : [], [selectedMake, selectedModel]);
  const yearOptions = useMemo(() => getYearOptions().map(String), []);

  const goNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  const goBack = () => {
    if (step === 0) router.back();
    else setStep((s) => s - 1);
  };

  const onSelectTier = () => {
    if (!tier) {
      Alert.alert("Bitte auswählen", "Wähle eine Inspektionsart aus.");
      return;
    }
    goNext();
  };

  const onProcessPayment = async () => {
    if (!paymentMethod || !tier) {
      Alert.alert("Zahlungsart wählen", "Bitte wähle eine Zahlungsmethode.");
      return;
    }
    setPaymentProcessing(true);
    try {
      const result = await processPayment(tier, paymentMethod);
      if (result.success) {
        setTransactionId(result.transactionId);
        setPaymentDone(true);
        goNext();
      } else {
        Alert.alert("Zahlung fehlgeschlagen", result.error ?? "Bitte versuche es erneut.");
      }
    } catch {
      Alert.alert("Fehler", "Zahlung konnte nicht verarbeitet werden.");
    } finally {
      setPaymentProcessing(false);
    }
  };

  const onConfirm = async () => {
    if (!user || !tier) return;
    const v = getValues();
    const modelDisplay = v.variant ? `${v.model} ${v.variant}` : v.model;
    try {
      const newCase = await submitNewCase({
        vin: v.vin.toUpperCase(),
        make: v.make,
        model: modelDisplay,
        year: parseInt(v.year, 10),
        mileage: parseInt((v.mileage ?? "0").replace(/\./g, ""), 10),
        notes: v.notes ?? "",
        serviceTier: tier,
        userId: user.id,
      });
      router.replace(`/case/upload?caseId=${newCase.id}`);
    } catch {
      Alert.alert("Fehler", "Inspektion konnte nicht erstellt werden.");
    }
  };

  if (showVinScanner) {
    return (
      <VinScanner
        onScan={(vin) => { setValue("vin", vin); setShowVinScanner(false); }}
        onClose={() => setShowVinScanner(false)}
      />
    );
  }

  return (
    <Screen scroll>
      <Spacer size="md" />
      <View style={styles.topBar}>
        <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} onPress={goBack} />
        <Typo variant="h3">Neue Inspektion</Typo>
        <View style={{ width: 24 }} />
      </View>

      <StepIndicator total={TOTAL_STEPS} current={step} />

      {/* ─── Step 0: Fahrzeugdaten ─── */}
      {step === 0 && (
        <View>
          <Typo variant="h3">Fahrzeugdaten</Typo>
          <Spacer size="xs" />
          <Typo variant="caption">Gib die Informationen zum Fahrzeug ein.</Typo>
          <Spacer size="lg" />

          <Controller
            control={control}
            name="vin"
            render={({ field: { onChange, value } }) => (
              <View>
                <View style={styles.vinRow}>
                  <View style={{ flex: 1 }}>
                    <Input
                      label="FIN (Fahrzeug-Identifizierungsnummer)"
                      placeholder="z.B. WVWZZZ3CZWE123456"
                      autoCapitalize="characters"
                      maxLength={17}
                      value={value}
                      onChangeText={onChange}
                      error={errors.vin?.message}
                    />
                  </View>
                  <TouchableOpacity style={styles.scanBtn} onPress={() => setShowVinScanner(true)} activeOpacity={0.7}>
                    <Ionicons name="scan" size={22} color={Colors.accent} />
                    <Typo variant="caption" style={{ fontSize: 9, marginTop: 2 }}>Scannen</Typo>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />

          <Controller control={control} name="make"
            render={({ field: { onChange, value } }) => (
              <Picker label="Marke" placeholder="Marke auswählen…" value={value} options={[...VEHICLE_MAKES]}
                onSelect={(v) => { onChange(v); setValue("model", ""); setValue("variant", ""); }} error={errors.make?.message} />
            )} />

          <Controller control={control} name="model"
            render={({ field: { onChange, value } }) => (
              <Picker label="Modell" placeholder={selectedMake ? "Modell auswählen…" : "Zuerst Marke wählen"} value={value} options={modelOptions}
                onSelect={(v) => { onChange(v); setValue("variant", ""); }} error={errors.model?.message} />
            )} />

          {variantOptions.length > 0 && (
            <Controller control={control} name="variant"
              render={({ field: { onChange, value } }) => (
                <Picker label="Motorisierung / Variante (optional)" placeholder="Variante auswählen…" value={value ?? ""} options={variantOptions} onSelect={onChange} searchable={false} />
              )} />
          )}

          <Controller control={control} name="year"
            render={({ field: { onChange, value } }) => (
              <Picker label="Baujahr" placeholder="Baujahr auswählen…" value={value} options={yearOptions} onSelect={onChange} error={errors.year?.message} searchable={false} />
            )} />

          <Controller control={control} name="mileage"
            render={({ field: { onChange, value } }) => (
              <Input label="Kilometerstand in km (optional – wird vom Tacho-Foto erkannt)" placeholder="z.B. 85000 oder leer lassen" keyboardType="number-pad" maxLength={6} value={value} onChangeText={onChange} error={errors.mileage?.message} />
            )} />

          <Controller control={control} name="notes"
            render={({ field: { onChange, value } }) => (
              <Input label="Anmerkungen (optional)" placeholder="Gibt es etwas, das der Prüfer wissen sollte?" multiline value={value} onChangeText={onChange} style={{ height: 80, textAlignVertical: "top", paddingTop: 12 }} />
            )} />

          <Spacer size="md" />
          <Button label="Weiter" onPress={handleSubmit(() => goNext())} />
        </View>
      )}

      {/* ─── Step 1: Inspektionsart ─── */}
      {step === 1 && (
        <View>
          <Typo variant="h3">Inspektionsart</Typo>
          <Spacer size="xs" />
          <Typo variant="caption">Wie soll das Fahrzeug geprüft werden?</Typo>
          <Spacer size="lg" />
          <TierPicker selected={tier} onSelect={setTier} />
          <Spacer size="lg" />
          <Button label="Weiter" onPress={onSelectTier} />
        </View>
      )}

      {/* ─── Step 2: Zahlung ─── */}
      {step === 2 && tier && (
        <View>
          <Typo variant="h3">Zahlung</Typo>
          <Spacer size="xs" />
          <Typo variant="caption">Wähle deine Zahlungsmethode.</Typo>
          <Spacer size="lg" />

          {/* Order summary */}
          <View style={styles.orderCard}>
            <Typo variant="body" style={{ fontWeight: "700" }}>
              {SERVICE_TIER_LABELS[tier]}
            </Typo>
            <Spacer size="sm" />
            {TIER_DESCRIPTIONS[tier].map((d, i) => (
              <View key={i} style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Typo variant="caption" style={{ marginLeft: 8, flex: 1 }}>{d}</Typo>
              </View>
            ))}
            <Spacer size="md" />
            <View style={styles.priceRow}>
              <Typo variant="body" style={{ fontWeight: "600" }}>Gesamt</Typo>
              <Typo variant="h2" style={{ color: Colors.accent }}>
                {TIER_PRICES[tier].toFixed(2).replace(".", ",")} €
              </Typo>
            </View>
          </View>

          <Spacer size="lg" />
          <Typo variant="body" style={{ fontWeight: "600" }}>Zahlungsmethode</Typo>
          <Spacer size="sm" />

          <PaymentMethodPicker selected={paymentMethod} onSelect={setPaymentMethod} />

          <Spacer size="lg" />
          <Button
            label={paymentProcessing ? "Wird verarbeitet…" : `${TIER_PRICES[tier].toFixed(2).replace(".", ",")} € bezahlen`}
            onPress={onProcessPayment}
            loading={paymentProcessing}
            disabled={!paymentMethod}
          />
        </View>
      )}

      {/* ─── Step 3: Bestätigung ─── */}
      {step === 3 && (
        <View>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={60} color={Colors.success} />
          </View>
          <Spacer size="md" />
          <Typo variant="h3" center>Zahlung erfolgreich</Typo>
          <Spacer size="xs" />
          <Typo variant="caption" center>Transaktions-ID: {transactionId}</Typo>

          <Spacer size="xl" />

          <Typo variant="h3">Zusammenfassung</Typo>
          <Spacer size="md" />
          <SummaryRow label="FIN" value={getValues("vin").toUpperCase()} />
          <SummaryRow label="Marke" value={getValues("make")} />
          <SummaryRow label="Modell" value={getValues("variant") ? `${getValues("model")} ${getValues("variant")}` : getValues("model")} />
          <SummaryRow label="Baujahr" value={getValues("year")} />
          {getValues("mileage") ? <SummaryRow label="km-Stand" value={`${getValues("mileage")} km`} /> : null}
          {getValues("notes") ? <SummaryRow label="Notizen" value={getValues("notes")!} /> : null}
          <SummaryRow label="Art" value={tier ? SERVICE_TIER_LABELS[tier] : ""} />
          <SummaryRow label="Bezahlt" value={tier ? `${TIER_PRICES[tier].toFixed(2).replace(".", ",")} €` : ""} />

          <Spacer size="lg" />
          <Button label="Inspektion starten" onPress={onConfirm} loading={loading} />
        </View>
      )}
    </Screen>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Typo variant="caption" style={{ width: 80 }}>{label}</Typo>
      <Typo variant="body" style={{ flex: 1, fontWeight: "500" }}>{value}</Typo>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  vinRow: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm },
  scanBtn: {
    marginTop: 22, width: 56, height: 48, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.accent, backgroundColor: Colors.accentLight,
    alignItems: "center", justifyContent: "center",
  },
  orderCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border,
  },
  featureRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  priceRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.md,
  },
  successIcon: { alignItems: "center", marginTop: Spacing.lg },
  summaryRow: {
    flexDirection: "row", paddingVertical: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
});
