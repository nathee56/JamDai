"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Bot, Pencil, Camera } from "lucide-react";
import type { NoteCategory } from "@/types";
import { categorizeNote } from "@/lib/thaillm";

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
        className="w-full min-h-[250px] sm:min-h-[300px] bg-transparent border-none p-2 text-2xl sm:text-3xl text-text-hi placeholder:text-text-lo/40 focus:outline-none resize-none mb-8 transition-all duration-300 font-sans"
        autoFocus
      />

      {/* AI Indicator & Save */}
      <div className="flex flex-col gap-4">
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
