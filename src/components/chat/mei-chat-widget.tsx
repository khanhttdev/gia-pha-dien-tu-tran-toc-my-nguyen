"use client";

import { useState, useRef, useEffect } from "react";
import { useChatStore } from "@/lib/chat-store";
import { MeiChatMessages } from "./mei-chat-messages";
import { MeiAvatar } from "./mei-avatar";
import { cn } from "@/lib/utils";
import { X, Send, MessageCircle, Trash2 } from "lucide-react";

export function MeiChatWidget() {
  const {
    messages,
    isOpen,
    isLoading,
    toggleChat,
    sendMessage,
    clearMessages,
  } = useChatStore();
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    await sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={toggleChat}
        className={cn(
          "fixed bottom-6 right-6 z-50 transition-all duration-300",
          "rounded-full shadow-2xl",
          "hover:scale-110 active:scale-95",
          isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100",
        )}
        aria-label="Mở chat Mei Trần"
      >
        <div className="relative">
          <MeiAvatar size="lg" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-[#31090A] animate-pulse" />
        </div>
      </button>

      {/* Chat Panel */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 transition-all duration-300 ease-out",
          "w-[380px] h-[520px] max-h-[80vh]",
          "rounded-3xl overflow-hidden flex flex-col",
          "bg-[#1a0a0b]/95 backdrop-blur-xl",
          "border border-white/10 shadow-2xl shadow-black/50",
          isOpen
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-75 opacity-0 translate-y-8 pointer-events-none",
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-white/5">
          <MeiAvatar size="sm" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white">Mei Trần 🌸</h3>
            <p className="text-[11px] text-white/50">Trợ lý AI Gia Phả</p>
          </div>
          <button
            onClick={clearMessages}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
            aria-label="Xóa tin nhắn"
            title="Xóa cuộc trò chuyện"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={toggleChat}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
            aria-label="Đóng chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <MeiChatMessages messages={messages} isLoading={isLoading} />

        {/* Input */}
        <div className="px-4 py-3 border-t border-white/10 bg-white/5">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Hỏi Mei về gia phả..."
                disabled={isLoading}
                className={cn(
                  "w-full pl-9 pr-3 py-2.5 rounded-xl text-sm",
                  "bg-white/5 border border-white/10",
                  "text-white placeholder:text-white/30",
                  "focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30",
                  "disabled:opacity-50 transition-all",
                )}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={cn(
                "p-2.5 rounded-xl transition-all",
                "bg-amber-500 text-black hover:bg-amber-400",
                "disabled:opacity-30 disabled:cursor-not-allowed",
                "active:scale-90",
              )}
              aria-label="Gửi tin nhắn"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
