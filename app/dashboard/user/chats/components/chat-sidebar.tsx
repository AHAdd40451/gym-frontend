"use client";

import React from "react";
import { Search } from "lucide-react";
import { io } from "socket.io-client";

import useChatStore from "@/app/dashboard/(auth)/apps/chat/useChatStore";
import { ChatItemProps } from "@/app/dashboard/(auth)/apps/chat/types";

import { Input } from "@/components/ui/input";
import { ChatListItem } from "@/app/dashboard/(auth)/apps/chat/components/chat-list-item";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ActionDropdown } from "@/app/dashboard/(auth)/apps/chat/components/action-dropdown";
import { usersApi } from "@/lib/api/services/users/users";

export function ChatSidebar() {
  const { selectedChat } = useChatStore();

  const [onlineUsers, setOnlineUsers] = React.useState<string[]>([]);
  const [allChats, setAllChats] = React.useState<ChatItemProps[]>([]);
  const [filteredChats, setFilteredChats] = React.useState<ChatItemProps[]>([]);
  const [loading, setLoading] = React.useState(true);

  // ------------------------------------
  // SOCKET CONNECT
  // ------------------------------------
  React.useEffect(() => {
    const currentUser = JSON.parse(
      localStorage.getItem("currentUser") || "{}"
    );

    if (!currentUser?.id) return;

    const socket = io("http://localhost:5003", {
      transports: ["websocket"],
    });

    socket.emit("addUser", currentUser.id);

    socket.on("getUsers", (users: any[]) => {
      // backend sends: [[userId, socketId]]
      const ids = users.map((item) => item[0]);
      setOnlineUsers(ids);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // ------------------------------------
  // FETCH USERS ONLY ONCE
  // ------------------------------------
  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        const res = await usersApi.getAll();

        const users =
          res?.data?.users ||
          res?.data?.data?.users ||
          res?.users ||
          [];

        const formattedChats: ChatItemProps[] = users.map((user: any) => ({
          id: user._id,
          user: {
            id: user._id,
            name: user.firstName || user.name || "Unknown User",
            avatar: user.avatar || "",
            email: user.email || "",
            online_status: "offline",
          },
          lastMessage: "",
          unread: 0,
        }));

        setAllChats(formattedChats);
        setFilteredChats(formattedChats);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // ------------------------------------
  // UPDATE ONLINE STATUS LIVE
  // ------------------------------------
  React.useEffect(() => {
    const updated = allChats.map((chat) => ({
      ...chat,
      user: {
        ...chat.user,
        online_status: onlineUsers.includes(chat.user.id)
          ? "online"
          : "offline",
      },
    }));

    setFilteredChats(updated);
    setAllChats(updated);
  }, [onlineUsers]);

  // ------------------------------------
  // SEARCH
  // ------------------------------------
  const changeHandle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const search = e.target.value.toLowerCase();

    const filtered = allChats.filter((chat) =>
      chat.user.name.toLowerCase().includes(search)
    );

    setFilteredChats(filtered);
  };

  return (
    <Card className="w-full lg:w-96 h-full flex flex-col overflow-hidden pb-0">
      <CardHeader>
        <CardTitle className="text-xl">Chats</CardTitle>

        <CardAction>
          <ActionDropdown />
        </CardAction>

        <CardDescription className="relative mt-4 flex items-center">
          <Search className="absolute left-3 size-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search..."
            onChange={changeHandle}
          />
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center">Loading...</div>
        ) : filteredChats.length ? (
          filteredChats.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              active={selectedChat?.id === chat.id}
            />
          ))
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            No chat found
          </div>
        )}
      </CardContent>
    </Card>
  );
}