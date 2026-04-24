"use client";

import { useAuth } from "@/hooks/useAuth";
import { useNotes } from "@/hooks/useNotes";
import { getGreeting, formatThaiDate } from "@/lib/utils";
import { summarizeNotes } from "@/lib/thaillm";
import { NoteModal } from "@/components/notes/NoteModal";
import { NoteCard } from "@/components/notes/NoteCard";
import { NoteDetailModal } from "@/components/notes/NoteDetailModal";
import { Plus, Sparkles, ChevronRight, Clock } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import type { Note, NoteCategory } from "@/types";
import Link from "next/link";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/Modal";

export default function DashboardPage() {
  const { user } = useAuth();
  const { notes, loading, addNote, deleteNote, updateNote, togglePin } = useNotes(user?.uid);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const handleOpenSummary = async () => {
    setSummaryOpen(true);
    setSummaryLoading(true);
    try {
      const s = await summarizeNotes(notes);
      setSummary(s);
    } catch (error) {
      console.error("Summary failed", error);
      setSummary("ขออภัย ไม่สามารถดึงข้อมูลสรุปได้ในขณะนี้");
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleSave = async (text: string, category: NoteCategory) => {
    await addNote(text, category);
    toast.success("บันทึกโน้ตสำเร็จ");
  };

  const handleDelete = async (id: string) => {
    await deleteNote(id);
    setSelectedNote(null);
    toast.success("ลบโน้ตแล้ว");
  };

  const handlePin = async (id: string) => {
    await togglePin(id);
  };

  const handleUpdate = async (noteId: string, data: Partial<Pick<Note, "text" | "category">>) => {
    await updateNote(noteId, data);
  };

  const recentNotes = notes.slice(0, 6);

  const oldNote = useMemo(() => {
    const now = new Date();
    for (const n of notes) {
      const diffDays = Math.floor((now.getTime() - n.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      if ((diffDays >= 6 && diffDays <= 8) || (diffDays >= 29 && diffDays <= 31)) {
        return n;
      }
    }
    return null;
  }, [notes]);

  return (
    <>
      {/* Date & AI Summary Button */}
      <div className="flex items-center justify-between mb-4">
        <p className="font-mono text-[10px] text-text-lo uppercase tracking-wider">
          {formatThaiDate(new Date())}
        </p>
        
        {notes.length > 0 && (
          <button
            onClick={handleOpenSummary}
            className="relative flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-gold/30 text-gold shadow-[0_0_15px_rgba(240,180,41,0.15)] hover:bg-gold/5 active:scale-95 transition-all animate-fade-in overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gold/0 via-gold/10 to-gold/0 -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span className="text-xs font-bold tracking-wider font-display">JamDai AI</span>
          </button>
        )}
      </div>

      {/* Greeting */}
      <h1 className="font-display font-bold text-3xl sm:text-4xl text-text-hi mb-1 tracking-tighter italic">
        {getGreeting()},
      </h1>
      <h2 className="font-display font-bold text-3xl sm:text-4xl text-gold mb-6 tracking-tighter italic">
        {user?.displayName?.split(" ")[0] || "คุณ"}
      </h2>

      <p className="text-sm text-text-md mb-8">
        {notes.length > 0
          ? `${notes.length} รายการที่บันทึกไว้`
          : "เริ่มบันทึกความทรงจำแรกของคุณ"}
      </p>

      {/* Review Old Note Widget */}
      {oldNote && (
        <div className="mb-8 bg-gold/5 border border-gold/20 rounded-[14px] p-5 cursor-pointer hover:bg-gold/10 transition-colors active:scale-[0.98]" onClick={() => setSelectedNote(oldNote)}>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-gold/20 flex items-center justify-center shrink-0">
              <Clock className="w-4.5 h-4.5 text-gold" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-mono text-gold uppercase tracking-wider mb-1">
                จำได้ไหม? โน้ตจากอดีต
              </p>
              <p className="text-sm text-text-hi leading-relaxed line-clamp-2">
                {oldNote.text}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI Summary Modal — JamDai Premium AI inspired */}
      <Modal open={summaryOpen} onClose={() => setSummaryOpen(false)}>
        <div className="relative">
          {/* Background Glow */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold/10 blur-[50px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gold/10 blur-[50px] rounded-full pointer-events-none" />
          
          <div className="relative space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(240,180,41,0.15)]">
                <Sparkles className="w-6 h-6 text-gold" />
              </div>
              <div className="pt-1">
                <h2 className="text-2xl font-display font-bold text-gold tracking-tight flex items-center gap-2">
                  JamDai AI
                  <span className="px-1.5 py-0.5 rounded-md bg-gold/10 text-[9px] font-mono text-gold uppercase tracking-widest border border-gold/20">Beta</span>
                </h2>
                <p className="text-[11px] text-text-md mt-0.5">สรุปภาพรวมโน้ตประจำวันของคุณ</p>
              </div>
            </div>
            
            <div className="relative bg-base/80 backdrop-blur-xl p-5 rounded-[20px] border border-gold/10 shadow-inner">
              <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-gold/[0.02] to-transparent pointer-events-none" />
              {summaryLoading ? (
                <div className="space-y-4 py-2">
                  <div className="flex gap-2 items-center mb-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce" style={{ animationDelay: "300ms" }} />
                    <span className="text-[10px] font-mono text-gold/70 uppercase tracking-widest ml-2">Analyzing...</span>
                  </div>
                  <div className="h-2 bg-gold/10 rounded-full w-full animate-pulse" />
                  <div className="h-2 bg-gold/10 rounded-full w-[85%] animate-pulse" style={{ animationDelay: "0.15s" }} />
                  <div className="h-2 bg-gold/10 rounded-full w-[65%] animate-pulse" style={{ animationDelay: "0.3s" }} />
                </div>
              ) : (
                <div className="relative py-1">
                  <p className="text-sm text-text-hi leading-loose whitespace-pre-line font-medium relative z-10">
                    {summary || "ไม่พบข้อมูลสำหรับสรุปในวันนี้ ลองเพิ่มโน้ตใหม่ดูสิ!"}
                  </p>
                </div>
              )}
            </div>
            
            <div className="pt-2 flex justify-end">
               <button onClick={() => setSummaryOpen(false)} className="px-6 py-2.5 bg-gradient-to-r from-gold to-gold-dim hover:from-gold-dim hover:to-gold text-text-inv text-sm font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(240,180,41,0.2)] active:scale-95">
                 ปิดหน้าต่าง
               </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* ★ Hero "+" Button — จุดเด่นของ JamDai (Mobile) */}
      <div className="md:hidden flex flex-col items-center justify-center mb-16 mt-4">
        <div className="relative">
          {/* Outer glow pulse ring */}
          <div className="absolute inset-0 rounded-full bg-gold/20 animate-ping" style={{ animationDuration: "3s" }} />
          {/* Glow ring */}
          <div className="absolute -inset-3 rounded-full bg-gradient-to-br from-gold/10 to-transparent blur-xl" />
          {/* Main button */}
          <button
            onClick={() => setSheetOpen(true)}
            className="relative flex items-center justify-center w-28 h-28 bg-gradient-to-br from-gold to-gold-dim text-text-inv rounded-full transition-all duration-500 cursor-pointer active:scale-90 group"
            style={{
              boxShadow: "0 0 50px -5px rgba(240,180,41,0.45), 0 0 20px -5px rgba(240,180,41,0.3)",
            }}
          >
            <Plus className="w-12 h-12" strokeWidth={2.5} />
          </button>
        </div>
        <span className="mt-5 font-mono font-semibold text-[10px] text-gold uppercase tracking-[0.3em] opacity-70">
          จดบันทึกใหม่
        </span>
      </div>

      {/* Quick Add — Desktop */}
      <div className="hidden md:flex justify-center mb-10">
        <div
          onClick={() => setSheetOpen(true)}
          className="w-full max-w-[700px] bg-surface border border-border rounded-[14px] px-5 py-3.5 flex items-center justify-between text-text-lo hover:border-border-hi transition-all cursor-text active:scale-[0.99]"
        >
          <span className="text-sm font-medium">จดบันทึกใหม่...</span>
          <Plus className="w-5 h-5" />
        </div>
      </div>

      {/* Recent Notes */}
      {recentNotes.length > 0 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold text-text-hi tracking-tight">บันทึกล่าสุด</h3>
            <Link
              href="/notes"
              className="text-xs font-medium text-gold hover:text-gold-dim flex items-center gap-1 transition-colors active:scale-95"
            >
              ดูทั้งหมด
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-4">
            {recentNotes.map((note) => (
              <div key={note.id} className="w-full">
                <NoteCard
                  note={note}
                  layout="masonry"
                  onDelete={handleDelete}
                  onPin={handlePin}
                  onClick={() => setSelectedNote(note)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Note Detail */}
      <NoteDetailModal
        note={selectedNote}
        open={!!selectedNote}
        onClose={() => setSelectedNote(null)}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
      />

      <NoteModal
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSave={handleSave}
      />
    </>
  );
}
