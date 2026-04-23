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
    <div className="fixed inset-0 top-16 md:top-0 md:left-72 bottom-0 flex flex-col bg-base z-10 overflow-hidden">
      <div className="max-w-[800px] w-full mx-auto px-4 py-4 md:px-10 md:py-8 flex flex-col h-full">
        {/* Header - Desktop only or subtle on mobile */}
        <div className="hidden md:flex items-center justify-between pb-4 border-b border-border mb-4">
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

        {/* Messages - Flex-1 will grow and scroll */}
        <div className="flex-1 overflow-y-auto hide-scrollbar space-y-6 pb-20 pt-4">
          {messages.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full text-center px-4 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center mb-6 shadow-inner">
                <Sparkles className="w-8 h-8 text-gold" />
              </div>
              <h2 className="font-display font-bold text-2xl text-text-hi mb-3 tracking-tight">
                สวัสดีครับ มีอะไรให้ช่วยจำไหม?
              </h2>
              <p className="text-xs text-text-lo mb-10 max-w-[280px]">
                ถามเกี่ยวกับสิ่งที่จดไว้ หรือให้ช่วยสรุปข้อมูลต่างๆ ได้เลยครับ
              </p>
              <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                {suggestions.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => handleSend(s.prompt)}
                    className="px-4 py-3.5 rounded-2xl text-xs font-semibold bg-surface border border-border text-text-hi hover:border-gold/30 hover:text-gold hover:bg-gold-mist/20 transition-all duration-300 cursor-pointer text-left shadow-sm active:scale-[0.98]"
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
                  "flex gap-3 max-w-[85%] sm:max-w-[75%] animate-[fade-in-up_0.3s_ease-out]",
                  msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                )}
              >
                {/* Avatar */}
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gold to-gold-dim flex items-center justify-center shrink-0 mt-1 shadow-lg shadow-gold/10">
                    <Sparkles className="w-4 h-4 text-text-inv" />
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={cn(
                    "px-5 py-4 text-[15px] leading-relaxed shadow-sm transition-all",
                    msg.role === "user"
                      ? "bg-gold text-text-inv rounded-[24px] rounded-br-none font-medium"
                      : "bg-surface border border-border text-text-hi rounded-[24px] rounded-bl-none shadow-gold/5"
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-[75%] animate-fade-in">
              <div className="w-8 h-8 rounded-xl bg-gold/10 flex items-center justify-center shrink-0 mt-1">
                <Sparkles className="w-4 h-4 text-gold animate-pulse" />
              </div>
              <div className="bg-surface border border-border rounded-2xl rounded-bl-none px-5 py-4 flex gap-1.5 items-center">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-gold/40 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input bar - Mobile Fixed Bottom */}
        <div className="fixed bottom-24 left-0 right-0 md:relative md:bottom-0 px-4 md:px-0 py-4 bg-gradient-to-t from-base via-base to-transparent z-20">
          <div className="max-w-[800px] mx-auto flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                placeholder="คุยกับ AI..."
                rows={1}
                className="w-full bg-surface/80 backdrop-blur-xl border border-border rounded-[28px] px-6 py-5 text-base text-text-hi placeholder:text-text-lo/40 focus:border-gold/40 focus:ring-4 focus:ring-gold/5 focus:outline-none resize-none max-h-32 transition-all duration-300 leading-relaxed shadow-2xl"
              />
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className={cn(
                "w-16 h-16 rounded-[28px] flex items-center justify-center shrink-0 transition-all duration-500 cursor-pointer shadow-xl",
                input.trim()
                  ? "bg-gold text-text-inv hover:bg-gold-dim active:scale-[0.9] shadow-gold/30"
                  : "bg-surface border border-border text-text-lo cursor-not-allowed opacity-50"
              )}
            >
              {isLoading ? (
                <RotateCcw className="w-6 h-6 animate-spin" />
              ) : (
                <Send className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
