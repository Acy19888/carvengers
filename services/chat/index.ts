/**
 * Chat Service — Firestore-based messaging.
 * Uses caseId as chatId (no index needed).
 */

import {
  collection, doc, setDoc, query, orderBy, onSnapshot,
  getDoc, updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { generateId } from "../../utils/helpers";

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderRole: "buyer" | "inspector" | "system";
  text: string;
  imageUri?: string;
  createdAt: number;
  read: boolean;
}

export interface Chat {
  id: string;
  caseId: string;
  buyerId: string;
  inspectorId: string | null;
  lastMessage: string;
  lastMessageAt: number;
  status: "open" | "closed";
}

/** Get or create chat — uses caseId as the chat document ID */
export async function getOrCreateChat(caseId: string, buyerId: string): Promise<Chat> {
  const chatRef = doc(db, "chats", caseId);
  const snap = await getDoc(chatRef);

  if (snap.exists()) {
    return { id: snap.id, ...snap.data() } as Chat;
  }

  // Create new chat
  const chat: Chat = {
    id: caseId,
    caseId,
    buyerId,
    inspectorId: null,
    lastMessage: "Chat gestartet",
    lastMessageAt: Date.now(),
    status: "open",
  };
  await setDoc(chatRef, chat);

  // System welcome message
  const msgId = generateId("msg");
  await setDoc(doc(db, "chats", caseId, "messages", msgId), {
    id: msgId,
    chatId: caseId,
    senderId: "system",
    senderRole: "system",
    text: "Willkommen! Ein Prüfer wird sich in Kürze melden.",
    createdAt: Date.now(),
    read: false,
  });

  return chat;
}

/** Send a message */
export async function sendMessage(
  chatId: string,
  senderId: string,
  senderRole: "buyer" | "inspector" | "system",
  text: string,
  imageUri?: string,
): Promise<ChatMessage> {
  const msgId = generateId("msg");
  const msg: any = {
    id: msgId,
    chatId,
    senderId,
    senderRole,
    text,
    createdAt: Date.now(),
    read: false,
  };
  if (imageUri) msg.imageUri = imageUri;

  await setDoc(doc(db, "chats", chatId, "messages", msgId), msg);

  // Update chat last message
  try {
    await updateDoc(doc(db, "chats", chatId), {
      lastMessage: text.slice(0, 100),
      lastMessageAt: Date.now(),
    });
  } catch {}

  return msg;
}

/** Subscribe to messages (real-time) */
export function subscribeToMessages(
  chatId: string,
  callback: (messages: ChatMessage[]) => void,
): () => void {
  const q = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("createdAt", "asc"),
  );
  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ChatMessage));
    callback(messages);
  }, () => {
    // Error fallback — return empty
    callback([]);
  });
}

/** Mark chat as read */
export async function markAsRead(chatId: string): Promise<void> {
  // In production: update unread counters
}
