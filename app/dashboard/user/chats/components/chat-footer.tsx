"use client";

import { useState } from "react";
import { SendIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ChatFooter({
  onSend,
  onTyping
}: {
  onSend: (text: string) => void;
  onTyping: () => void;
}) {
  const [text, setText] = useState("");

  const submit = () => {
    if (!text.trim()) return;

    onSend(text);
    setText("");
  };

  return (
    <div className="lg:px-4 pt-3">
      <div className="flex items-center gap-2 rounded-md border p-2">
        <Input
          value={text}
          placeholder="Enter message..."
          onChange={(e) => {
            setText(e.target.value);
            onTyping();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
        />

        <Button onClick={submit}>
          Send <SendIcon className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}