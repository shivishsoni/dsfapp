import React from "react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isUser, timestamp }) => {
  return (
    <div className={cn("message", isUser ? "message-user" : "message-bot")}>
      <p className="text-sm md:text-base">{message}</p>
      {timestamp && (
        <span className="text-xs opacity-70 mt-1 block">
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
    </div>
  );
};

export default ChatMessage;