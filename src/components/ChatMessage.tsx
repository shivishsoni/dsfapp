import React from "react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isUser, timestamp }) => {
  return (
    <div 
      className={cn(
        "p-4 rounded-lg max-w-[80%] whitespace-pre-wrap",
        isUser ? "ml-auto bg-primary text-white" : "mr-auto bg-gray-100",
        "animate-slide-up"
      )}
    >
      <p className="text-sm md:text-base leading-relaxed">{message}</p>
      {timestamp && (
        <span className="text-xs opacity-70 mt-1 block">
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
    </div>
  );
};

export default ChatMessage;