"use client";

import { useEffect, useRef } from "react";
import ChatHook from "@/lib/api/services/chat/chat";
import useChatStore from "@/app/dashboard/(auth)/apps/chat/useChatStore";

import {
  ChatHeader,
} from "./chat-header";
 import { ChatBubble } from "./chat-bubbles";
import Image from "next/image";
import { ChatFooter } from "./chat-footer";

export function ChatContent() {
  const { selectedChat } = useChatStore();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const currentUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("currentUser") || "{}")
      : null;

  const userId = currentUser?.id;
  const receiverId = selectedChat?.user?.id;

  const {
    messages,
    getMessages,
    sendMessage,
    typing,
    sendTyping
  } = ChatHook(userId, receiverId);

  useEffect(() => {
    if (receiverId) {
      getMessages();
    }
  }, [receiverId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  if (!selectedChat) {
    return (
      <figure className="hidden h-full items-center justify-center lg:flex">
        <Image
          width={200}
          height={200}
          src="/not-selected-chat.svg"
          alt="chat"
          unoptimized
        />
      </figure>
    );
  }

  const uiMessages = messages.map((msg: any) => ({
    content: msg.message,
    own_message: msg.sender === userId,
    type: "text",
    status: msg.status,
      time: msg.createdAt

  }));

  return (
     <div
    key={selectedChat?.user?.id}
    className="bg-background fixed inset-0 z-50 flex h-full flex-col p-4 lg:relative lg:z-10 lg:p-0"
  >
      <ChatHeader user={selectedChat.user} />

      <div className="flex-1 overflow-y-auto px-2 lg:px-4">
        <div className="flex flex-col gap-4 py-6">
          {uiMessages.map((item: any, i: number) => (
            <ChatBubble key={i} message={item} type="text" />
          ))}

          {typing && (
            <div className="text-sm text-muted-foreground px-2">
              typing...
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      <ChatFooter
        onSend={sendMessage}
        onTyping={sendTyping}
      />
    </div>
  );
}