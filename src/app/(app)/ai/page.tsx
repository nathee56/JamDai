"use client";

import { useAuth } from "@/hooks/useAuth";
import { useNotes } from "@/hooks/useNotes";
import { sendMessage } from "@/lib/thaillm";
import { cn } from "@/lib/utils";
import { Sparkles, Send, RotateCcw } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import type { ChatMessage } from "@/types";

const suggestions = [
  { label: "สรุปภาพรวม", prompt: "เดือนนี้บันทึกอะไรบ้าง? สรุปให้หน่อย" },
  { label: "การเงิน", prompt: "สรุปโน้ตการเงินและค่าใช้จ่ายที่บันทึกไว้" },
  { label: "ความรู้", prompt: "มีเทคนิคหรือความรู้อะไรใหม่ๆ ที่บันทึกไว้บ้าง?" },
  { label: "งาน", prompt: "สรุปงานที่ต้องทำหรือโน้ตเกี่ยวกับงานให้หน่อย" },
  { label: "สุขภาพ", prompt: "บันทึกเรื่องสุขภาพล่าสุดคืออะไร?" },
  { label: "ไอเดีย", prompt: "ช่วยดึงไอเดียที่ฉันเคยจดไว้มานำเสนอหน่อย" },
];

export default function AIPage() {
  const { user } = useAuth();
  const { notes } = useNotes(user?.uid);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    scrollRef.current && (scrollRef.current.scrollTop = scrollRef.current.scrollHeight);
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const handleSend = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || isLoading) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    try {
      const response = await sendMessage(content, messages, notes);
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: response, timestamp: new Date() }]);
    } catch {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: "ขออภัย เกิดข้อผิดพลาด กรุณาลองใหม่", timestamp: new Date() }]);
    } finally { setIsLoading(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target; el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 96) + "px";
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-base z-10 md:left-72" style={{ top: "calc(56px + env(safe-area-inset-top, 0px))" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
        <div>
          <h1 className="font-display font-semibold text-text-hi text-sm italic">JamDai AI</h1>
          <p className="text-[10px] text-text-lo font-mono uppercase tracking-wider">ผู้ช่วยความจำส่วนตัว</p>
        </div>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])} className="w-8 h-8 flex items-center justify-center rounded-[10px] text-text-lo hover:text-text-md hover:bg-surface transition-colors active:scale-90" title="ล้างแชท">
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto hide-scrollbar px-5 py-4 space-y-5">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center mb-5">
              <Sparkles className="w-7 h-7 text-gold" />
            </div>
            <h2 className="font-display font-bold text-xl text-text-hi mb-2 tracking-tight italic">มีอะไรให้ช่วยจำไหม?</h2>
            <p className="text-xs text-text-lo mb-8 max-w-[260px]">ถามเกี่ยวกับสิ่งที่จดไว้ หรือให้ช่วยสรุปข้อมูลต่างๆ</p>
            <div className="grid grid-cols-2 gap-2.5 w-full max-w-sm">
              {suggestions.map((s) => (
                <button key={s.label} onClick={() => handleSend(s.prompt)} className="px-3.5 py-3 rounded-[14px] text-xs font-medium bg-surface border border-border text-text-hi hover:border-gold/30 hover:text-gold transition-all cursor-pointer text-left active:scale-[0.97]">
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={cn("flex gap-3 max-w-[85%] animate-[fade-in-up_0.3s_ease-out]", msg.role === "user" ? "ml-auto flex-row-reverse" : "")}>
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-gold to-gold-dim flex items-center justify-center shrink-0 mt-1">
                  <Sparkles className="w-3.5 h-3.5 text-text-inv" />
                </div>
              )}
              <div className={cn("px-4 py-3 text-sm leading-relaxed", msg.role === "user" ? "bg-gold text-text-inv rounded-2xl rounded-br-sm font-medium" : "bg-surface border border-border text-text-hi rounded-2xl rounded-bl-sm whitespace-pre-line")}>
                {msg.content}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex gap-3 max-w-[75%] animate-fade-in">
            <div className="w-7 h-7 rounded-xl bg-gold/10 flex items-center justify-center shrink-0 mt-1">
              <Sparkles className="w-3.5 h-3.5 text-gold animate-pulse" />
            </div>
            <div className="bg-surface border border-border rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
              {[0, 1, 2].map((i) => (<span key={i} className="w-1.5 h-1.5 rounded-full bg-gold/40 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar — Fixed at bottom */}
      <div className="shrink-0 border-t border-border bg-base px-4 pt-3 pb-[calc(64px+env(safe-area-inset-bottom,0px))] md:pb-3">
        <div className="max-w-[800px] mx-auto flex items-end gap-2">
          <textarea ref={textareaRef} value={input} onChange={handleInput} onKeyDown={handleKeyDown} placeholder="คุยกับ AI..." rows={1} className="flex-1 bg-surface border border-border rounded-2xl px-4 py-3 text-sm text-text-hi placeholder:text-text-lo/50 focus:border-gold/40 focus:outline-none resize-none max-h-24 transition-all leading-relaxed" />
          <button onClick={() => handleSend()} disabled={!input.trim() || isLoading} className={cn("w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all active:scale-90", input.trim() ? "bg-gold text-text-inv" : "bg-surface border border-border text-text-lo opacity-50")}>
            {isLoading ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
