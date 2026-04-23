"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Bot, Pencil, Camera, Mic, MicOff, Loader2, Bell } from "lucide-react";
import type { NoteCategory } from "@/types";
import { categorizeNote, detectReminders } from "@/lib/thaillm";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

interface NoteModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (text: string, category: NoteCategory) => Promise<void>;
}

type Mode = "text" | "image";

export function NoteModal({ open, onClose, onSave }: NoteModalProps) {
  const [mode, setMode] = useState<Mode>("text");
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [reminder, setReminder] = useState<{ date?: string; time?: string; suggestion: string } | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (text.trim().length > 10) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(async () => {
        const result = await detectReminders(text);
        setReminder(result);
      }, 1500);
    } else {
      setReminder(null);
    }
  }, [text]);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("เบราว์เซอร์ของคุณไม่รองรับการพิมพ์ด้วยเสียง");
        return;
      }

      const rec = new SpeechRecognition();
      rec.lang = "th-TH";
      rec.continuous = true;
      rec.interimResults = true;

      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onerror = () => setIsListening(false);
      
      rec.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setText(prev => prev + (prev.endsWith(" ") || prev === "" ? "" : " ") + finalTranscript);
        }
      };

      rec.start();
      setRecognition(rec);
    }
  };
  const handleSave = async () => {
    if (!text.trim()) return;
    
    try {
      setAnalyzing(true);
      const category = await categorizeNote(text.trim());
      setAnalyzing(false);
      
      setSaving(true);
      await onSave(text.trim(), category);
      
      setText("");
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setAnalyzing(false);
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (saving || analyzing) return;
    setText("");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      {/* Mode tabs */}
      <div className="flex gap-4 mb-6">
        {[
          { mode: "text" as Mode, icon: Pencil, label: "พิมพ์ข้อความ" },
          { mode: "image" as Mode, icon: Camera, label: "รูปภาพ" },
        ].map(({ mode: m, icon: Icon, label }) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              "flex items-center gap-2.5 px-5 py-3 rounded-2xl text-base font-medium border transition-colors duration-150 cursor-pointer",
              mode === m
                ? "bg-gold-mist border-gold/40 text-gold"
                : "border-transparent text-text-lo hover:text-text-md hover:bg-surface"
            )}
          >
            <Icon className="w-5 h-5" />
            {label}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="จดสิ่งที่ต้องการจำ..."
        className="w-full min-h-[200px] sm:min-h-[250px] bg-transparent border-none p-2 text-2xl sm:text-3xl text-text-hi placeholder:text-text-lo/40 focus:outline-none resize-none mb-4 transition-all duration-300 font-sans"
      />

      {/* Voice Control - Center Bottom */}
      <div className="flex justify-center mb-8">
        <button
          onClick={toggleListening}
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 relative",
            isListening 
              ? "bg-red-500 text-white shadow-2xl shadow-red-500/40 scale-110" 
              : "bg-gold/10 text-gold hover:bg-gold/20"
          )}
        >
          {isListening ? (
            <>
              <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-25" />
              <Mic className="w-8 h-8 relative z-10" />
            </>
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </button>
      </div>

      {/* AI Indicator & Save */}
      <div className="flex flex-col gap-4">
        {reminder && (
          <div className="bg-gold/10 border border-gold/20 rounded-2xl p-4 flex items-center justify-between animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold">
                <Bell className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gold uppercase tracking-wider">ตรวจพบการนัดหมาย</p>
                <p className="text-sm text-text-hi truncate">{reminder.suggestion}</p>
              </div>
            </div>
            <button 
              onClick={() => {
                toast.success("ตั้งแจ้งเตือนแล้ว (จำลอง)");
                setReminder(null);
              }}
              className="px-4 py-2 bg-gold text-text-inv text-xs font-bold rounded-xl hover:bg-gold-dim transition-colors"
            >
              ตั้งเตือน
            </button>
          </div>
        )}

        {analyzing && (
          <div className="flex items-center justify-center gap-2 text-gold animate-pulse text-sm">
            <Bot className="w-4 h-4" />
            <span>AI กำลังวิเคราะห์หมวดหมู่...</span>
          </div>
        )}
        <Button
          variant="primary"
          className="w-full text-xl py-6 rounded-[24px] shadow-xl shadow-gold/20"
          onClick={handleSave}
          disabled={!text.trim() || saving || analyzing}
        >
          {saving ? "กำลังบันทึก..." : analyzing ? "รอสักครู่..." : "บันทึกโน้ต (AI จัดหมวดหมู่ให้)"}
        </Button>
      </div>
    </Modal>
  );
}
