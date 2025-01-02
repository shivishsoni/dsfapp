import React from 'react';
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";

interface ChatSectionProps {
  messages: Array<{ message: string; isUser: boolean }>;
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder: string;
}

const ChatSection = ({ messages, onSendMessage, isLoading, placeholder }: ChatSectionProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 min-h-[500px] flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg, index) => (
          <ChatMessage
            key={index}
            message={msg.message}
            isUser={msg.isUser}
          />
        ))}
      </div>
      <ChatInput 
        onSendMessage={onSendMessage} 
        isLoading={isLoading}
        placeholder={placeholder}
      />
    </div>
  );
};

export default ChatSection;