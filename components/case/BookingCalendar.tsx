import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Typo } from "../ui/Typo";
import { Button } from "../ui/Button";
import { Spacer } from "../ui/Spacer";
import { useTheme } from "../../store/themeContext";
import { Spacing, Radius, FontSize } from "../../constants/theme";

interface Props {
  visible: boolean;
  onConfirm: (date: string, time: string) => void;
  onClose: () => void;
  title?: string;
}

const DAYS_DE = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MONTHS_DE = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

/** Generate available time slots */
function getTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 9; h <= 17; h++) {
    slots.push(`${h.toString().padStart(2, "0")}:00`);
    if (h < 17) slots.push(`${h.toString().padStart(2, "0")}:30`);
  }
  return slots;
}

/** Simulate some slots being taken */
function getAvailableSlots(dateStr: string): string[] {
  const all = getTimeSlots();
  // Mock: remove some random slots based on date hash
  const hash = dateStr.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return all.filter((_, i) => (hash + i) % 4 !== 0);
}

/** Get calendar days for a month */
function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = (firstDay.getDay() + 6) % 7; // Monday = 0

  const days: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

export function BookingCalendar({ visible, onConfirm, onClose, title = "Termin wählen" }: Props) {
  const { colors } = useTheme();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const calendarDays = useMemo(() => getCalendarDays(viewYear, viewMonth), [viewYear, viewMonth]);

  const availableSlots = useMemo(
    () => (selectedDate ? getAvailableSlots(selectedDate) : []),
    [selectedDate],
  );

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const isPast = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return d < t;
  };

  const isWeekend = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    return d.getDay() === 0; // Sunday closed
  };

  const isToday = (day: number) => {
    return (
      viewYear === today.getFullYear() &&
      viewMonth === today.getMonth() &&
      day === today.getDate()
    );
  };

  const formatDateStr = (day: number) =>
    `${viewYear}-${(viewMonth + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

  const handleDayPress = (day: number) => {
    if (isPast(day) || isWeekend(day)) return;
    const ds = formatDateStr(day);
    setSelectedDate(ds);
    setSelectedTime(null);
  };

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      onConfirm(selectedDate, selectedTime);
    }
  };

  const formatDisplayDate = (ds: string) => {
    const [y, m, d] = ds.split("-").map(Number);
    return `${d}. ${MONTHS_DE[m - 1]} ${y}`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <Typo variant="h3">{title}</Typo>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Month nav */}
            <View style={styles.monthNav}>
              <TouchableOpacity onPress={goPrevMonth}>
                <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
              <Typo variant="body" style={{ fontWeight: "700" }}>
                {MONTHS_DE[viewMonth]} {viewYear}
              </Typo>
              <TouchableOpacity onPress={goNextMonth}>
                <Ionicons name="chevron-forward" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Day headers */}
            <View style={styles.dayHeaderRow}>
              {DAYS_DE.map((d) => (
                <View key={d} style={styles.dayHeaderCell}>
                  <Typo variant="caption" style={{ fontWeight: "600", fontSize: 11 }}>{d}</Typo>
                </View>
              ))}
            </View>

            {/* Calendar grid */}
            <View style={styles.calGrid}>
              {calendarDays.map((day, i) => {
                if (day === null) return <View key={`e${i}`} style={styles.dayCell} />;
                const ds = formatDateStr(day);
                const disabled = isPast(day) || isWeekend(day);
                const selected = selectedDate === ds;
                const todayMark = isToday(day);

                return (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.dayCell,
                      selected && { backgroundColor: colors.accent, borderRadius: 10 },
                      todayMark && !selected && {
                        borderWidth: 1.5,
                        borderColor: colors.accent,
                        borderRadius: 10,
                      },
                    ]}
                    onPress={() => handleDayPress(day)}
                    disabled={disabled}
                    activeOpacity={0.6}
                  >
                    <Typo
                      variant="body"
                      style={{
                        fontWeight: selected || todayMark ? "700" : "400",
                        fontSize: FontSize.sm,
                        color: disabled
                          ? colors.textMuted
                          : selected
                          ? colors.textOnPrimary
                          : colors.textPrimary,
                      }}
                    >
                      {day}
                    </Typo>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Time slots */}
            {selectedDate && (
              <>
                <Spacer size="lg" />
                <Typo variant="body" style={{ fontWeight: "700", paddingHorizontal: Spacing.lg }}>
                  Verfügbare Zeiten — {formatDisplayDate(selectedDate)}
                </Typo>
                <Spacer size="sm" />
                <View style={styles.timeGrid}>
                  {availableSlots.length === 0 ? (
                    <Typo variant="caption" style={{ paddingHorizontal: Spacing.lg }}>
                      Keine freien Termine an diesem Tag.
                    </Typo>
                  ) : (
                    availableSlots.map((slot) => {
                      const active = selectedTime === slot;
                      return (
                        <TouchableOpacity
                          key={slot}
                          style={[
                            styles.timeSlot,
                            {
                              borderColor: active ? colors.accent : colors.border,
                              backgroundColor: active ? colors.accent : colors.surface,
                            },
                          ]}
                          onPress={() => setSelectedTime(slot)}
                          activeOpacity={0.7}
                        >
                          <Typo
                            variant="body"
                            style={{
                              fontSize: FontSize.sm,
                              fontWeight: active ? "700" : "400",
                              color: active ? colors.textOnPrimary : colors.textPrimary,
                            }}
                          >
                            {slot}
                          </Typo>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
              </>
            )}

            <Spacer size="lg" />

            {/* Confirm */}
            {selectedDate && selectedTime && (
              <View style={{ paddingHorizontal: Spacing.lg }}>
                <View
                  style={[
                    styles.summaryBar,
                    { backgroundColor: colors.accentLight, borderColor: colors.accent },
                  ]}
                >
                  <Ionicons name="calendar" size={18} color={colors.accent} />
                  <Typo variant="body" style={{ marginLeft: 8, fontWeight: "600", fontSize: FontSize.sm }}>
                    {formatDisplayDate(selectedDate)} um {selectedTime} Uhr
                  </Typo>
                </View>
                <Spacer size="md" />
                <Button label="Termin bestätigen" onPress={handleConfirm} />
              </View>
            )}
            <Spacer size="xl" />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    paddingBottom: 30,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
  },
  monthNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  dayHeaderRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.sm,
  },
  dayHeaderCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
  },
  calGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.sm,
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  timeSlot: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: Radius.md,
    borderWidth: 1.5,
  },
  summaryBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
});
