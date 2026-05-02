import { cn } from "@/lib/utils";
import { Ellipsis, FileIcon, PlayIcon } from "lucide-react";
import { ChatMessageProps } from "../types";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import Image from "next/image";

/* ---------------- TYPES ---------------- */

type BubbleProps = {
  message: ChatMessageProps;
  deleteMessage?: (id: string) => void;
};

/* ---------------- TEXT ---------------- */

function TextChatBubble({ message, deleteMessage }: BubbleProps) {
  return (
    <div
      className={cn(
        "max-w-(--breakpoint-sm) flex flex-col space-y-1",
        {
          "items-end self-end": message.own_message,
          "items-start": !message.own_message
        }
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn("bg-muted inline-flex rounded-md border p-4", {
            "order-1": message.own_message
          })}
        >
          {message.content}
        </div>

        {message.own_message && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                <Ellipsis className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuItem
                className="text-red-500"
                onClick={() => deleteMessage?.(message._id)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <time className="text-muted-foreground text-xs font-bold">
        {message.time
          ? new Date(message.time).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            })
          : ""}
      </time>
    </div>
  );
}
/* ---------------- FILE ---------------- */

function FileChatBubble({ message, deleteMessage }: BubbleProps) {
  return (
    <div className={cn("max-w-(--breakpoint-sm)", { "self-end": message.own_message })}>
      <div className="flex items-center gap-2">
        <div className="bg-muted inline-flex items-start rounded-md border p-4">
          <FileIcon className="me-4 mt-1 size-8 opacity-50" />

          <div className="flex flex-col gap-2">
            <div className="text-sm">
              {message.data?.file_name}
              <span className="text-muted-foreground ms-2">
                ({message.data?.size})
              </span>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">Download</Button>
              <Button variant="outline" size="sm">Preview</Button>
            </div>
          </div>
        </div>

        {message.own_message && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                <Ellipsis className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuItem
                className="text-red-500"
                onClick={() => deleteMessage?.(message._id)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

/* ---------------- VIDEO ---------------- */

function VideoChatBubble({ message, deleteMessage }: BubbleProps) {
  return (
    <div className={cn("max-w-(--breakpoint-sm)", { "self-end": message.own_message })}>
      <div className="flex items-center gap-4">
        <div
          style={{ backgroundImage: `url(${message?.data?.cover})` }}
          className="relative flex aspect-4/3 w-52 items-center justify-center rounded-lg bg-cover"
        >
          <PlayIcon className="size-8 text-white" />
        </div>

        {message.own_message && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                <Ellipsis className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuItem
                className="text-red-500"
                onClick={() => deleteMessage?.(message._id)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

/* ---------------- SOUND ---------------- */

function SoundChatBubble({ message, deleteMessage }: BubbleProps) {
  return (
    <div className={cn({ "self-end": message.own_message })}>
      <audio controls className="w-80">
        <source src={message?.data?.path} type="audio/mpeg" />
      </audio>

      {message.own_message && (
        <Button
          variant="ghost"
          onClick={() => deleteMessage?.(message._id)}
        >
          <Ellipsis className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

/* ---------------- IMAGE ---------------- */

function ImageChatBubble({ message, deleteMessage }: BubbleProps) {
  const images = message?.data?.images ?? [];

  return (
    <div className={cn({ "self-end": message.own_message })}>
      <div className="grid grid-cols-2 gap-2">
        {images.map((img, i) => (
          <Image
            key={i}
            src={img}
            width={100}
            height={100}
            alt="chat"
            className="rounded-md object-cover"
          />
        ))}
      </div>

      {message.own_message && (
        <Button
          variant="ghost"
          onClick={() => deleteMessage?.(message._id)}
        >
          <Ellipsis className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

/* ---------------- MAIN ---------------- */

export function ChatBubble({
  message,
  type,
  deleteMessage
}: {
  message: ChatMessageProps;
  type?: string;
  deleteMessage?: (id: string) => void;
}) {
  switch (type) {
    case "text":
      return <TextChatBubble message={message} deleteMessage={deleteMessage} />;

    case "video":
      return <VideoChatBubble message={message} deleteMessage={deleteMessage} />;

    case "sound":
      return <SoundChatBubble message={message} deleteMessage={deleteMessage} />;

    case "image":
      return <ImageChatBubble message={message} deleteMessage={deleteMessage} />;

    case "file":
      return <FileChatBubble message={message} deleteMessage={deleteMessage} />;

    default:
      return null;
  }
}