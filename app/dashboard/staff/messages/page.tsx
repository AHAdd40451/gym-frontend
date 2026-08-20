import { ChatContent } from "../../user/chats/components/chat-content";
import { ChatSidebar } from "../../user/chats/components";

export default function StaffMessagesPage() {
  return (
    <div className="flex h-[calc(100vh-var(--header-height)-3rem)] w-full">
      <ChatSidebar />
      <div className="grow">
        <ChatContent />
      </div>
    </div>
  );
}
