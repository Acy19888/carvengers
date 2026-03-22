import React, { useState, useEffect, useRef } from "react";
import {
  View, StyleSheet, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Typo } from "../../components/ui/Typo";
import { Spacer } from "../../components/ui/Spacer";
import { useAuthStore } from "../../store/authStore";
import { useTheme } from "../../store/themeContext";
import {
  getOrCreateChat, sendMessage, subscribeToMessages, markAsRead,
  Chat, ChatMessage,
} from "../../services/chat";
import { Spacing, Radius, FontSize } from "../../constants/theme";

export default function ChatScreen() {
  const { caseId } = useLocalSearchParams<{ caseId: string }>();
  const { user } = useAuthStore();
  const { colors } = useTheme();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Init chat
  useEffect(() => {
    if (!caseId || !user) return;
    (async () => {
      try {
        const c = await getOrCreateChat(caseId, user.id);
        setChat(c);
        markAsRead(c.id);
      } catch {
        Alert.alert("Fehler", "Chat konnte nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    })();
  }, [caseId, user]);

  // Subscribe to messages
  useEffect(() => {
    if (!chat) return;
    const unsub = subscribeToMessages(chat.id, (msgs) => {
      setMessages(msgs);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });
    return unsub;
  }, [chat]);

  const handleSend = async () => {
    if (!text.trim() || !chat || !user) return;
    const msg = text.trim();
    setText("");
    setSending(true);
    try {
      await sendMessage(chat.id, user.id, "buyer", msg);
      // Simulate inspector auto-reply after 2s
      setTimeout(async () => {
        try {
          const replies = [
            "Danke für die Information! Ich schaue mir die Bilder an.",
            "Guter Hinweis. Können Sie noch ein Foto vom Unterboden machen?",
            "Das sieht soweit gut aus. Ich erstelle den Bericht.",
            "Haben Sie den Fahrzeugschein zur Hand?",
            "Die Reifen sehen abgefahren aus — empfehle Austausch vor Kauf.",
          ];
          await sendMessage(chat.id, "inspector_001", "inspector", replies[Math.floor(Math.random() * replies.length)]);
        } catch {}
      }, 2000);
    } catch (e: any) {
      console.error("Chat send error:", e);
      Alert.alert("Fehler", e?.message ?? "Nachricht konnte nicht gesendet werden.");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMe = item.senderId === user?.id;
    const isSystem = item.senderRole === "system";

    if (isSystem) {
      return (
        <View style={s.systemMsg}>
          <Typo variant="caption" style={{ fontSize: 11, color: colors.textMuted, textAlign: "center" }}>
            {item.text}
          </Typo>
        </View>
      );
    }

    return (
      <View style={[s.bubbleRow, isMe && s.bubbleRowRight]}>
        {!isMe && (
          <View style={[s.avatar, { backgroundColor: colors.accent }]}>
            <Ionicons name="person" size={14} color="white" />
          </View>
        )}
        <View
          style={[
            s.bubble,
            isMe
              ? { backgroundColor: colors.accent, borderBottomRightRadius: 4 }
              : { backgroundColor: colors.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.border },
          ]}
        >
          {!isMe && (
            <Typo variant="caption" style={{ fontSize: 10, fontWeight: "600", color: colors.accent, marginBottom: 2 }}>
              Prüfer
            </Typo>
          )}
          <Typo variant="body" style={{ fontSize: 14, color: isMe ? "white" : colors.textPrimary, lineHeight: 20 }}>
            {item.text}
          </Typo>
          <Typo variant="caption" style={{ fontSize: 9, color: isMe ? "rgba(255,255,255,0.6)" : colors.textMuted, textAlign: "right", marginTop: 4 }}>
            {formatTime(item.createdAt)}
          </Typo>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[s.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[s.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={[s.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: Spacing.md }}>
          <Typo variant="body" style={{ fontWeight: "700" }}>Inspektion #{caseId?.slice(-6)}</Typo>
          <Typo variant="caption" style={{ fontSize: 11, color: colors.success }}>Prüfer online</Typo>
        </View>
        <Ionicons name="ellipsis-vertical" size={20} color={colors.textMuted} />
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(m) => m.id}
        contentContainerStyle={s.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Input */}
      <View style={[s.inputBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity style={s.attachBtn}>
          <Ionicons name="camera" size={22} color={colors.accent} />
        </TouchableOpacity>
        <TextInput
          style={[s.textInput, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
          placeholder="Nachricht schreiben…"
          placeholderTextColor={colors.textMuted}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[s.sendBtn, { backgroundColor: text.trim() ? colors.accent : colors.border }]}
          onPress={handleSend}
          disabled={!text.trim() || sending}
        >
          <Ionicons name="send" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", alignItems: "center", paddingTop: 50, paddingBottom: 12, paddingHorizontal: Spacing.lg, borderBottomWidth: 1 },
  messageList: { padding: Spacing.md, paddingBottom: 8 },
  systemMsg: { alignItems: "center", paddingVertical: Spacing.sm },
  bubbleRow: { flexDirection: "row", marginBottom: Spacing.sm, alignItems: "flex-end", maxWidth: "85%" },
  bubbleRowRight: { alignSelf: "flex-end", flexDirection: "row-reverse" },
  avatar: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", marginRight: 8 },
  bubble: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, maxWidth: "90%" },
  inputBar: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: Spacing.sm, paddingTop: Spacing.sm, paddingBottom: 34, borderTopWidth: 1 },
  attachBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  textInput: { flex: 1, borderRadius: Radius.lg, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, maxHeight: 100, borderWidth: 1 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", marginLeft: 8 },
});
