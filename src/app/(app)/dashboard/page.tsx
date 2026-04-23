"use client";

import { useAuth } from "@/hooks/useAuth";
import { useNotes } from "@/hooks/useNotes";
import { getGreeting, formatThaiDate, cn } from "@/lib/utils";
import { summarizeNotes } from "@/lib/thaillm";
import { NoteModal } from "@/components/notes/NoteModal";
import { NoteCard } from "@/components/notes/NoteCard";
import { Modal } from "@/components/ui/Modal";
import { Plus, Sparkles, Quote, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import type { NoteCategory } from "@/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const { notes, loading, addNote, deleteNote } = useNotes(user?.uid);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
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

  const handleDelete = async (id: string) => {
    await deleteNote(id);
    toast.success("ลบโน้ตแล้ว");
  };

  const recentNotes = notes.slice(0, 3);

  return (
    <>
      {/* AI Summary Trigger - Back to Top Bar */}
      <div className="md:hidden fixed top-3 right-32 z-40">
        <button
          onClick={() => setSummaryOpen(true)}
          disabled={summaryLoading && !summary}
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
            summaryLoading && !summary
              ? "bg-border text-text-lo"
              : "bg-gold/10 text-gold hover:bg-gold/20 shadow-lg shadow-gold/5"
          )}
        >
          <Sparkles className={cn("w-5 h-5", summaryLoading ? "animate-pulse" : "")} />
        </button>
      </div>

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
      <p className="text-base text-text-md mb-12">
        {notes.length > 0
          ? `${notes.length} รายการที่บันทึกไว้`
          : "เริ่มบันทึกความทรงจำแรกของคุณ"}
      </p>

      {/* Quick Add (The Hero Button) - Removed Pulse */}
      <div className="flex flex-col items-center justify-center mb-16">
        <div className="relative">
          <button
            onClick={() => setSheetOpen(true)}
            className="relative flex items-center justify-center w-28 h-28 md:w-32 md:h-32 bg-gradient-to-br from-gold to-gold-dim text-base shadow-[0_0_40px_-5px_rgba(240,180,41,0.4)] hover:shadow-[0_0_60px_-5px_rgba(240,180,41,0.5)] rounded-full transition-all duration-500 cursor-pointer active:scale-90 group overflow-hidden"
            aria-label="เพิ่มโน้ตใหม่"
          >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-white/20 opacity-50" />
            <Plus className="w-12 h-12 md:w-16 md:h-16 text-text-inv relative z-10 transition-transform duration-500 group-hover:rotate-90 group-hover:scale-110" strokeWidth={3} />
          </button>
        </div>
        
        <span className="mt-4 font-display font-bold text-xs text-gold uppercase tracking-[0.3em] opacity-80">
          จดบันทึกใหม่
        </span>
      </div>

      {/* Recent Notes Section */}
      {notes.length > 0 && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-bold text-text-hi tracking-tight">บันทึกล่าสุด</h2>
            <Link 
              href="/notes" 
              className="text-sm font-medium text-gold hover:text-gold-dim flex items-center gap-1 transition-colors"
            >
              ดูทั้งหมด
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="flex flex-col gap-4">
            {recentNotes.map((note) => (
              <NoteCard key={note.id} note={note} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {/* Summary Modal - Samsung AI Style */}
      <Modal 
        open={summaryOpen} 
        onClose={() => setSummaryOpen(false)}
      >
        <div className="relative p-1 sm:p-2">
          {/* Background Decorative Gradient */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-gold/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gold/5 rounded-full blur-[80px] pointer-events-none" />

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold to-gold-dim flex items-center justify-center shadow-lg shadow-gold/20">
              <Sparkles className="w-6 h-6 text-text-inv" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-text-hi tracking-tight">AI Insights</h2>
              <p className="text-[10px] text-gold uppercase tracking-[0.2em] font-bold">Powered by JamDai Intelligence</p>
            </div>
          </div>
          
          <div className="relative min-h-[160px] flex flex-col justify-center">
            {summaryLoading ? (
              <div className="space-y-4">
                <div className="h-4 bg-gold/5 rounded-full w-full animate-pulse" />
                <div className="h-4 bg-gold/5 rounded-full w-[90%] animate-pulse [animation-delay:0.2s]" />
                <div className="h-4 bg-gold/5 rounded-full w-[75%] animate-pulse [animation-delay:0.4s]" />
              </div>
            ) : (
              <div className="animate-fade-in">
                <p className="text-2xl md:text-3xl text-text-hi leading-[1.4] font-medium tracking-tight">
                  {summary || "ยังไม่มีข้อมูลเพียงพอสำหรับการสรุปในขณะนี้ ลองจดบันทึกเพิ่มสิ!"}
                </p>
              </div>
            )}
          </div>
          
          <div className="mt-12 flex flex-col gap-6">
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-2">
                <p className="text-[10px] text-text-lo uppercase tracking-widest font-bold">คัดกรองจาก</p>
                <div className="flex gap-1.5">
                  {Array.from(new Set(notes.map(n => n.category))).slice(0, 3).map(cat => (
                    <span key={cat} className="px-2.5 py-1 rounded-lg bg-gold/5 border border-gold/10 text-[10px] text-gold font-bold">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={() => setSummaryOpen(false)}
                className="px-8 py-3.5 bg-text-hi text-text-inv rounded-2xl text-sm font-bold hover:opacity-90 transition-opacity active:scale-[0.98]"
              >
                รับทราบ
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <NoteModal
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSave={handleSave}
      />
    </>
  );
}

