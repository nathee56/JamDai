"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getNoteById } from "@/lib/firestore";
import type { Note } from "@/types";
import { formatThaiDate, cn } from "@/lib/utils";
import { CATEGORY_CONFIG } from "@/types";
import { Calendar, Tag } from "lucide-react";

export default function SharePage() {
  const { noteId } = useParams();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNote = async () => {
      if (typeof noteId === "string") {
        try {
          const data = await getNoteById(noteId);
          setNote(data);
        } catch (error) {
          console.error("Failed to fetch note:", error);
        }
      }
      setLoading(false);
    };
    fetchNote();
  }, [noteId]);

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-base flex flex-col items-center justify-center p-6">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin mb-4" />
        <p className="text-text-lo text-sm animate-pulse">กำลังโหลด...</p>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-[100dvh] bg-base flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-text-hi mb-2">ไม่พบโน้ต</h1>
        <p className="text-text-lo mb-8">โน้ตนี้อาจถูกลบไปแล้วหรือคุณไม่มีสิทธิ์เข้าถึง</p>
        <div className="text-xs text-text-lo/50 flex items-center gap-1 font-mono uppercase tracking-wider">
          <span>สร้างด้วย</span>
          <span className="font-display font-bold text-gold italic normal-case">จำได้.</span>
        </div>
      </div>
    );
  }

  const catConfig = CATEGORY_CONFIG[note.category];

  return (
    <div className="min-h-[100dvh] bg-base flex flex-col">
      <div className="flex-1 max-w-2xl w-full mx-auto p-5 md:py-12 flex flex-col">
        {/* Note Card */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm flex-1 md:flex-none flex flex-col">
          {/* Header */}
          <div className="px-5 py-4 border-b border-border bg-elevated/50 flex items-center justify-between">
            <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-mono uppercase tracking-wider", catConfig.borderClass, catConfig.textClass, catConfig.bgClass)}>
              <Tag className="w-3 h-3" />
              {catConfig.label}
            </div>
            <div className="flex items-center gap-1.5 text-text-lo text-xs">
              <Calendar className="w-3.5 h-3.5" />
              {formatThaiDate(note.createdAt)}
            </div>
          </div>

          {/* Content */}
          <div className="p-5 md:p-8 flex-1 overflow-y-auto">
            {note.imageUrl && (
              <div className="w-full rounded-xl overflow-hidden mb-6">
                <img src={note.imageUrl} alt="" className="w-full h-auto object-cover" />
              </div>
            )}
            <div className="text-base text-text-hi whitespace-pre-line leading-relaxed font-sans">
              {note.text}
            </div>
          </div>
        </div>

        {/* Watermark */}
        <div className="mt-8 mb-4 text-center">
          <a href="/" className="inline-flex flex-col items-center gap-1 group">
            <span className="text-xs text-text-lo group-hover:text-text-md transition-colors">สร้างด้วย</span>
            <span className="font-display font-bold text-xl text-gold italic group-hover:scale-105 transition-transform">จำได้.</span>
          </a>
        </div>
      </div>
    </div>
  );
}
