"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { serverFetch } from "../../api-actions/server";
import { API_ENDPOINTS } from "../../constants/constants";
import { env } from "@/lib/config/env";

const API_BASE = env.API_BASE_URL;
const SOCKET_URL = API_BASE.replace(/\/api\/?$/, "");

type ChatMessage = {
  _id?: string;
  sender: string;
  receiver: string;
  message: string;
  createdAt?: string;
  status?: "sending" | "sent" | "seen";
};

// ✅ SINGLE SOCKET INSTANCE
let socket: Socket | null = null;

function ChatHook(userId?: string, receiverId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);

  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  // 🔌 SOCKET CONNECT
  useEffect(() => {
    if (!userId) return;

    // ✅ prevent multiple connections
    if (!socket) {
      socket = io(SOCKET_URL, {
        transports: ["websocket"],
      });
    }

    socket.emit("addUser", userId);

    // ✅ RECEIVE MESSAGE (MAIN REALTIME)
   socket.on("receiveMessage", (msg) => {
  setMessages((prev) => {
    const exists = prev.some((m) => m._id === msg._id);
    if (exists) return prev;

    return [...prev, { ...msg, status: "sent" }];
  });
});

    // ✅ ALSO HANDLE NOTIFICATION EVENT (backup)
    socket.on("newNotification", (data: any) => {
      const msg = data?.message;
      if (!msg) return;

      setMessages((prev) => {
        const exists = prev.some((m) => m._id === msg._id);
        if (exists) return prev;

        return [...prev, { ...msg, status: "sent" }];
      });
    });

    // ✍️ TYPING
    socket.on("typing", (senderId: string) => {
      if (senderId === receiverId) {
        setTyping(true);

        if (typingTimeout.current) clearTimeout(typingTimeout.current);

        typingTimeout.current = setTimeout(() => {
          setTyping(false);
        }, 2000);
      }
    });

    // 👀 SEEN
    socket.on("messageSeen", (messageId: string) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, status: "seen" } : msg
        )
      );
    });

    return () => {
      socket?.off("receiveMessage");
      socket?.off("newNotification");
      socket?.off("typing");
      socket?.off("messageSeen");
    };
  }, [userId, receiverId]);

 
const getMessages = useCallback(async () => {
  if (!userId || !receiverId) return;

  setLoading(true);

  try {
    const res = await serverFetch(
      `${API_ENDPOINTS.MESSAGES.GET}/${userId}/${receiverId}`,
      { method: "GET" }
    );

    const newMessages = Array.isArray(res.data?.data)
      ? res.data.data
      : [];

    // ✅ replace old chat completely when switching user
    setMessages(newMessages);

  } catch (error) {
    console.error(error);
    setMessages([]);
  } finally {
    setLoading(false);
  }
}, [userId, receiverId]);
  // 💬 SEND MESSAGE
  const sendMessage = useCallback(
    async (text: string) => {
      if (!userId || !receiverId || !text.trim()) return;

      const tempId = Date.now().toString();

      // ✅ Optimistic UI
      const tempMessage: ChatMessage = {
        _id: tempId,
        sender: userId,
        receiver: receiverId,
        message: text,
        status: "sending",
      };

      setMessages((prev) => [...prev, tempMessage]);

      try {
        const res = await fetch(
          `${API_BASE}${API_ENDPOINTS.MESSAGES.BASE}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sender: userId,
              receiver: receiverId,
              message: text,
            }),
          }
        );

        const data = await res.json();

        // ✅ replace temp message
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === tempId
              ? { ...data.data, status: "sent" }
              : msg
          )
        );

        // ✅ realtime send
        socket?.emit("sendMessage", data.data);
      } catch (error) {
        console.error("SEND ERROR:", error);
      }
    },
    [userId, receiverId]
  );

  // ✍️ TYPING SEND
  const sendTyping = useCallback(() => {
    if (!userId || !receiverId) return;

    socket?.emit("typing", {
      senderId: userId,
      receiverId,
    });
  }, [userId, receiverId]);

  // 👀 SEEN SEND
  const markSeen = useCallback(
    (messageId: string) => {
      socket?.emit("seenMessage", {
        messageId,
        receiverId,
      });
    },
    [receiverId]
  );
const deleteMessage = useCallback(async (id: string) => {
  if (!id) return;

  // ✅ Optimistic UI (pehle UI se hatao)
  setMessages((prev) => prev.filter((msg) => msg._id !== id));

  try {
    await fetch(`${API_BASE}/messages/delete/${id}`, {
      method: "DELETE",
    });

    // ✅ Realtime emit (dusre user ke liye)
    socket?.emit("deleteMessage", id);

  } catch (error) {
    console.error("DELETE ERROR:", error);

    // ❌ agar error aaye to wapas laa bhi sakte ho (optional)
  }
}, []);
  return {
    messages,
    loading,
    typing,
    sendTyping,
    sendMessage,
    getMessages,
    markSeen,
    deleteMessage
  };
}

export default ChatHook;