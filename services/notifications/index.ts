/**
 * Push Notification Service
 * MVP: Local notifications only (works in Expo Go)
 * Production: Add Expo Push Token with projectId in production build
 */

import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/** Request notification permissions (no push token in Expo Go) */
export async function registerForPushNotifications(): Promise<void> {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing !== "granted") {
      await Notifications.requestPermissionsAsync();
    }

    // Android channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Carvengers",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      });
    }
  } catch {
    // Silent fail — notifications not critical for MVP
  }
}

/** Send local notification (immediate) */
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data: data ?? {}, sound: true },
      trigger: null,
    });
  } catch {}
}

/** Schedule notification for later */
export async function scheduleNotification(
  title: string,
  body: string,
  delaySeconds: number,
  data?: Record<string, string>,
): Promise<string | null> {
  try {
    return await Notifications.scheduleNotificationAsync({
      content: { title, body, data: data ?? {}, sound: true },
      trigger: { seconds: delaySeconds, type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL },
    });
  } catch {
    return null;
  }
}

/** Cancel all pending notifications */
export async function cancelAllNotifications(): Promise<void> {
  try { await Notifications.cancelAllScheduledNotificationsAsync(); } catch {}
}

/** Trigger notification for case events */
export async function notifyCaseEvent(
  event: string,
  caseId: string,
  extra?: Record<string, string>,
): Promise<void> {
  const templates: Record<string, { title: string; body: string }> = {
    caseSubmitted: {
      title: "Inspektion eingereicht",
      body: "Deine Fotos werden jetzt von der KI analysiert.",
    },
    reportReady: {
      title: "KI-Bericht fertig!",
      body: "Dein Inspektionsbericht ist jetzt verfügbar.",
    },
    newChatMessage: {
      title: "Neue Nachricht vom Prüfer",
      body: "Du hast eine neue Nachricht erhalten.",
    },
    sellerScanStarted: {
      title: "Verkäufer hat Scan gestartet",
      body: "Der Verkäufer beginnt mit der Inspektion.",
    },
    sellerScanComplete: {
      title: "Seller Scan abgeschlossen!",
      body: "Alle Fotos hochgeladen. KI-Bericht anfordern.",
    },
  };

  const t = templates[event];
  if (t) {
    await sendLocalNotification(t.title, t.body, { screen: event, caseId, ...extra });
  }
}
