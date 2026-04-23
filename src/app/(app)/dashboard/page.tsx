"use client";

import { useAuth } from "@/hooks/useAuth";
import { useNotes } from "@/hooks/useNotes";
import { getGreeting, formatThaiDate, cn } from "@/lib/utils";
import { summarizeNotes } from "@/lib/thaillm";
import { NoteModal } from "@/components/notes/NoteModal";
import { Plus, Sparkles, Quote } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import type { NoteCategory } from "@/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const { notes, loading, addNote, deleteNote } = useNotes(user?.uid);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    if (!loading && notes.length > 0 && !summary) {
      const fetchSummary = async () => {
        setSummaryLoading(true);
        try {
          const s = await summarizeNotes(notes);
          setSummary(s);
        } catch (error) {
          console.error("Summary failed", error);
        } finally {
          setSummaryLoading(false);
        }
      };
      fetchSummary();
    }
  }, [notes, loading, summary]);

  const handleSave = async (text: string, category: NoteCategory) => {
    await addNote(text, category);
    toast.success("บันทึกโน้ตสำเร็จ");
  };

  return (
    <>
      {/* Date */}
      <p className="font-mono text-xs text-text-lo uppercase tracking-wider mb-2">
        {formatThaiDate(new Date())}
      </p>

      {/* Greeting */}
      <h1 className="font-display font-bold text-4xl sm:text-5xl text-text-hi mb-4 tracking-tighter flex flex-col gap-1 sm:gap-2">
        <span>{getGreeting()},</span>
        <span className="text-gold">
          {user?.displayName?.split(" ")[0] || "คุณ"}
        </span>
      </h1>
      <p className="text-base text-text-md mb-8">
        {notes.length > 0
          ? `${notes.length} รายการที่บันทึกไว้`
          : "เริ่มบันทึกความทรงจำแรกของคุณ"}
      </p>

      {/* AI Summary Widget - Premium Upgrade */}
      {(summaryLoading || summary) && (
        <div className="mb-12 animate-fade-in">
          <div className="relative group">
            {/* Ambient Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-gold/20 to-gold/0 rounded-[32px] blur-xl opacity-50 group-hover:opacity-75 transition duration-1000" />
            
            <div className="relative bg-surface border border-gold/10 rounded-[30px] p-7 md:p-9 overflow-hidden">
              {/* Decorative Background Elements */}
              <div className="absolute top-0 right-0 p-6 text-gold/5 pointer-events-none">
                <Sparkles className="w-32 h-32" />
              </div>
              <div className="absolute -bottom-6 -left-6 text-gold/5 pointer-events-none">
                <Quote className="w-24 h-24 rotate-180" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-gold/10 flex items-center justify-center shadow-inner">
                    <Sparkles className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <span className="block font-display font-bold text-xs text-gold uppercase tracking-[0.25em]">
                      AI Insights
                    </span>
                    <span className="block text-[10px] text-text-lo uppercase tracking-wider font-medium mt-0.5">
                      สรุปภาพรวมจากบันทึกของคุณ
                    </span>
                  </div>
                </div>

                {summaryLoading ? (
                  <div className="space-y-3">
                    <div className="h-5 bg-gold/5 rounded-full w-full animate-pulse" />
                    <div className="h-5 bg-gold/5 rounded-full w-4/5 animate-pulse" />
                    <div className="h-5 bg-gold/5 rounded-full w-3/5 animate-pulse" />
                  </div>
                ) : (
                  <div className="relative">
                    <Quote className="absolute -top-2 -left-2 w-8 h-8 text-gold/10 pointer-events-none" />
                    <p className="text-xl md:text-2xl text-text-hi leading-relaxed font-semibold pl-4">
                      {summary}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add (The Hero Button) */}
      <div className="flex flex-col items-center justify-center mb-16 mt-6">
        <div className="relative">
          {/* Pulsing Outer Rings */}
          <div className="absolute inset-0 rounded-full bg-gold/20 animate-ping opacity-20 scale-125" />
          <div className="absolute inset-0 rounded-full bg-gold/10 animate-ping opacity-40 [animation-delay:0.5s] scale-150" />
          
          <button
            onClick={() => setSheetOpen(true)}
            className="relative flex items-center justify-center w-28 h-28 md:w-32 md:h-32 bg-gradient-to-br from-gold to-gold-dim text-base shadow-[0_0_40px_-5px_rgba(240,180,41,0.5)] hover:shadow-[0_0_60px_-5px_rgba(240,180,41,0.6)] rounded-full transition-all duration-500 cursor-pointer active:scale-90 group overflow-hidden"
            aria-label="เพิ่มโน้ตใหม่"
          >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-white/20 opacity-50" />
            <Plus className="w-12 h-12 md:w-16 md:h-16 text-text-inv relative z-10 transition-transform duration-500 group-hover:rotate-90 group-hover:scale-110" strokeWidth={3} />
          </button>
        </div>
        
        <span className="mt-4 font-display font-bold text-xs text-gold uppercase tracking-[0.3em] opacity-80 animate-pulse">
          จดบันทึกใหม่
        </span>
      </div>

      <NoteModal
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSave={handleSave}
      />
    </>
  );
}
