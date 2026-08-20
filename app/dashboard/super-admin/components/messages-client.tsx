"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { superAdminApi } from "@/lib/api/services/super-admin/super-admin";

export default function MessagesClient() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [detail, setDetail] = useState<any>(null);
  const [text, setText] = useState("");

  const loadConversations = async () => {
    const data = await superAdminApi.listConversations();
    setConversations(data);
    if (!selectedId && data[0]?._id) setSelectedId(data[0]._id);
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    superAdminApi.getConversation(selectedId).then(setDetail).catch(() => {});
  }, [selectedId]);

  const send = async () => {
    if (!detail?.conversation || !text.trim()) return;
    await superAdminApi.sendConversationMessage({
      conversationId: detail.conversation._id,
      gymId: detail.conversation.gymId?._id || detail.conversation.gymId,
      text,
    });
    setText("");
    setDetail(await superAdminApi.getConversation(detail.conversation._id));
    loadConversations();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Support Messages</h1>
        <p className="text-muted-foreground text-sm">Dedicated support inbox for gym owners.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card>
          <CardHeader><CardTitle>Conversations</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {conversations.map((conversation) => (
              <button
                key={conversation._id}
                onClick={() => setSelectedId(conversation._id)}
                className={`w-full rounded-lg border p-3 text-left text-sm ${
                  selectedId === conversation._id ? "border-primary bg-primary/5" : ""
                }`}
              >
                <p className="font-medium">{conversation.gymId?.name}</p>
                <p className="text-muted-foreground">
                  {conversation.ownerUserId?.firstName} {conversation.ownerUserId?.lastName}
                </p>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{detail?.conversation?.gymId?.name || "Conversation"}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-[420px] space-y-3 overflow-y-auto rounded-lg border p-4">
              {(detail?.messages || []).map((message: any) => (
                <div key={message._id} className="rounded-lg border p-3">
                  <p className="text-sm font-medium">
                    {message.senderId?.firstName} {message.senderId?.lastName}
                  </p>
                  <p className="text-sm">{message.text}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Reply to gym owner" />
              <Button onClick={send}>Send</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
