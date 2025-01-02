import React, { useRef, useEffect } from 'react';
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";

interface ChatSectionProps {
  messages: Array<{ message: string; isUser: boolean }>;
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder: string;
}

const ChatSection = ({ messages, onSendMessage, isLoading, placeholder }: ChatSectionProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 min-h-[500px] flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-6 mb-4 p-2">
        {messages.map((msg, index) => (
          <ChatMessage
            key={index}
            message={msg.message}
            isUser={msg.isUser}
          />
        ))}
        <div ref={messagesEndRef} />
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