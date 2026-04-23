"use client";

import { useAuth } from "@/hooks/useAuth";
import { useNotes } from "@/hooks/useNotes";
import { sendMessage } from "@/lib/thaillm";
import { cn } from "@/lib/utils";
import { Sparkles, Send, RotateCcw, Bot } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import type { ChatMessage } from "@/types";

const suggestions = [
  { label: "สรุปภาพรวม", prompt: "เดือนนี้บันทึกอะไรบ้าง? สรุปให้หน่อย" },
  { label: "การเงิน", prompt: "สรุปโน้ตการเงินและค่าใช้จ่ายที่บันทึกไว้" },
  { label: "ความรู้", prompt: "มีเทคนิคหรือความรู้อะไรใหม่ๆ ที่บันทึกไว้บ้าง?" },
  { label: "งาน & โปรเจกต์", prompt: "สรุปงานที่ต้องทำหรือโน้ตเกี่ยวกับงานให้หน่อย" },
  { label: "สุขภาพ", prompt: "บันทึกเรื่องสุขภาพล่าสุดคืออะไร?" },
  { label: "ไอเดียใหม่", prompt: "ช่วยดึงไอเดียที่ฉันเคยจดไว้มานำเสนอหน่อย" },
];

export default function AIPage() {
  const { user } = useAuth();
  const { notes } = useNotes(user?.uid);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const response = await sendMessage(content, messages, notes);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "ขออภัย เกิดข้อผิดพลาด กรุณาลองใหม่",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-grow
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 96) + "px";
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="fixed inset-0 top-16 md:top-0 md:left-72 bottom-24 md:bottom-0 flex flex-col bg-base z-10">
      <div className="max-w-[800px] w-full mx-auto px-6 py-4 md:px-10 md:py-8 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
        <div>
          <h1 className="font-sans font-semibold text-text-hi text-base">
            JamDai AI
          </h1>
          <p className="text-[10px] text-text-lo">
            ถามอะไรก็ได้เกี่ยวกับโน้ตของคุณ
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="w-8 h-8 flex items-center justify-center rounded-md text-text-lo hover:text-text-md hover:bg-border/50 transition-colors duration-150 cursor-pointer"
            title="ล้างแชท"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto hide-scrollbar space-y-4 pb-4">
        {messages.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-12 h-12 rounded-lg bg-gold-mist flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5 text-gold" />
            </div>
            <p className="font-display font-bold text-xl text-text-hi mb-2 tracking-tight">
              มีอะไรให้ช่วยจำได้บ้าง?
            </p>
            <p className="text-xs text-text-lo mb-6">
              ถามเกี่ยวกับโน้ตที่คุณบันทึกไว้
            </p>
            <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
              {suggestions.map((s) => (
                <button
                  key={s.label}
                  onClick={() => handleSend(s.prompt)}
                  className="px-4 py-2 rounded-2xl text-xs font-medium bg-surface border border-border text-text-lo hover:border-gold/50 hover:text-gold hover:bg-gold-mist/10 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md active:scale-[0.97]"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Chat messages */
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-2 max-w-[75%] animate-[fade-in-up_0.3s_ease-out]",
                msg.role === "user" ? "ml-auto flex-row-reverse" : ""
              )}
            >
              {/* Avatar */}
              {msg.role === "assistant" && (
                <div className="w-6 h-6 rounded-md bg-gold-mist flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3 h-3 text-gold" />
                </div>
              )}

              {/* Bubble */}
              <div
                className={cn(
                  "px-5 py-3.5 text-[15px] leading-relaxed shadow-sm",
                  msg.role === "user"
                    ? "bg-gold text-text-inv rounded-[22px] rounded-br-none"
                    : "bg-surface border border-border text-text-hi rounded-[22px] rounded-bl-none shadow-gold/5"
                )}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex gap-2 max-w-[75%]">
            <div className="w-6 h-6 rounded-md bg-gold-mist flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-3 h-3 text-gold" />
            </div>
            <div className="bg-surface border border-border rounded-lg rounded-bl-sm px-4 py-3 flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-text-lo animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-border pt-3 flex items-end gap-2">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder="พิมพ์ข้อความ..."
            rows={1}
            className="w-full bg-surface border border-border rounded-2xl px-5 py-4 text-base text-text-hi placeholder:text-text-lo/50 focus:border-gold/40 focus:ring-4 focus:ring-gold/5 focus:outline-none resize-none max-h-32 transition-all duration-200 leading-relaxed shadow-inner"
          />
        </div>
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isLoading}
          className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 cursor-pointer shadow-lg",
            input.trim()
              ? "bg-gold text-text-inv hover:bg-gold-dim active:scale-[0.92] shadow-gold/20"
              : "bg-surface border border-border text-text-lo cursor-not-allowed opacity-50"
          )}
        >
          <Send className="w-6 h-6" />
        </button>
        </div>
      </div>
    </div>
  );
}
