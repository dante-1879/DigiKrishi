"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { Message } from "@/type/chat.type";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  currentUserId: string;
}

export default function ChatInterface({ messages, onSendMessage, currentUserId }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  // Get first letter of sender ID for avatar - with null check
  const getAvatarText = (senderId: string | undefined) => {
    return senderId ? senderId.charAt(0).toUpperCase() : '?';
  };

  // Determine if message is from current user - with null check
  const isCurrentUser = (senderId: string | undefined) => {
    return senderId === currentUserId;
  };

  return (
    <div className="flex flex-col h-[500px]">
      <ScrollArea className="flex-grow mb-4 p-4 bg-gray-50 rounded-md">
        <div className="space-y-4">
          {messages.length > 0 ? (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  isCurrentUser(msg.sender) ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    isCurrentUser(msg.sender)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>
                        {getAvatarText(msg.sender)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-semibold">
                      {isCurrentUser(msg.sender) ? "You" : `User ${msg.sender ? msg.sender.substring(0, 6) : 'Unknown'}`}
                    </span>
                  </div>
                  <p className="break-words">{msg.content}</p>
                  <p className="text-xs opacity-75 text-right mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-10">
              No messages yet. Start the conversation!
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow"
        />
        <Button type="submit" disabled={!message.trim()}>
          <Send className="h-4 w-4 mr-2" />
          Send
        </Button>
      </form>
    </div>
  );
}
