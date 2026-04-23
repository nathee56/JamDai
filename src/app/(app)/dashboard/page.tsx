"use client";

import { useAuth } from "@/hooks/useAuth";
import { useNotes } from "@/hooks/useNotes";
import { getGreeting, formatThaiDate } from "@/lib/utils";
import { summarizeNotes } from "@/lib/thaillm";
import { NoteModal } from "@/components/notes/NoteModal";
import { NoteCard } from "@/components/notes/NoteCard";
import { NoteDetailModal } from "@/components/notes/NoteDetailModal";
import { Plus, Sparkles, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import type { Note, NoteCategory } from "@/types";
import Link from "next/link";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const { user } = useAuth();
  const { notes, loading, addNote, deleteNote, updateNote, togglePin } = useNotes(user?.uid);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
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

  return (
    <>
      {/* Date */}
      <p className="font-mono text-[10px] text-text-lo uppercase tracking-wider mb-2">
        {formatThaiDate(new Date())}
      </p>

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

      {/* AI Summary Widget — Samsung Daily Summary inspired */}
      {notes.length > 0 && (
        <div className="mb-8 bg-surface border border-border rounded-[14px] p-5 transition-all duration-300 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center shrink-0">
              <Sparkles className="w-4.5 h-4.5 text-gold" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-mono text-gold uppercase tracking-wider mb-0.5">
                สรุปวันนี้
              </p>
              {summaryLoading ? (
                <div className="space-y-2 mt-2">
                  <div className="h-3 bg-gold/5 rounded-full w-full animate-pulse" />
                  <div className="h-3 bg-gold/5 rounded-full w-[85%] animate-pulse" style={{ animationDelay: "0.15s" }} />
                  <div className="h-3 bg-gold/5 rounded-full w-[65%] animate-pulse" style={{ animationDelay: "0.3s" }} />
                </div>
              ) : (
                <p className="text-sm text-text-hi leading-relaxed animate-fade-in">
                  {summary || "กำลังวิเคราะห์โน้ตของคุณ..."}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

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
          className="w-full max-w-[600px] bg-surface border border-border rounded-[14px] px-5 py-3.5 flex items-center justify-between text-text-lo hover:border-border-hi transition-all cursor-text active:scale-[0.99]"
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

          <div className="masonry-grid">
            {recentNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                layout="masonry"
                onDelete={handleDelete}
                onPin={handlePin}
                onClick={() => setSelectedNote(note)}
              />
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
