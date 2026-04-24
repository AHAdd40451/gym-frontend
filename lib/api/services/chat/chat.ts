import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { serverFetch } from "../../api-actions/server";
import { API_ENDPOINTS } from "../../constants/constants";

let socket: Socket;

function ChatHook(userId?: string, receiverId?: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔌 INIT SOCKET
  useEffect(() => {
    socket = io("http://localhost:5003");

    if (userId) {
      socket.emit("addUser", userId);
    }

    // 📩 receive message realtime
    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  // 📥 GET CHAT HISTORY (API)
  const getMessages = useCallback(async () => {
    if (!userId || !receiverId) return;

    setLoading(true);

    try {
      const res = await serverFetch<any>(
        `${API_ENDPOINTS.MESSAGES.GET}/${userId}/${receiverId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setMessages(res.data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, receiverId]);

  // 💬 SEND MESSAGE
  const sendMessage = useCallback(
    (message: string) => {
      if (!socket || !userId || !receiverId || !message.trim()) return;

      socket.emit("sendMessage", {
        senderId: userId,
        receiverId,
        message,
      });

      // optimistic UI update
      setMessages((prev) => [
        ...prev,
        {
          sender: userId,
          receiver: receiverId,
          message,
          createdAt: new Date().toISOString(),
        },
      ]);
    },
    [userId, receiverId]
  );

  return {
    messages,
    loading,
    sendMessage,
    getMessages,
  };
}

export default ChatHook;