"use client";

import { useAuth } from "@/hooks/useAuth";
import { useNotes } from "@/hooks/useNotes";
import { getGreeting, formatThaiDate, cn } from "@/lib/utils";
import { summarizeNotes } from "@/lib/thaillm";
import { NoteCard } from "@/components/notes/NoteCard";
import { NoteModal } from "@/components/notes/NoteModal";
import { Plus, FileText } from "lucide-react";
import { useState } from "react";
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

  const handleDelete = async (id: string) => {
    await deleteNote(id);
    toast.success("ลบโน้ตแล้ว");
  };

  const recentNotes = notes.slice(0, 6);

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

      {/* AI Summary Widget */}
      {(summaryLoading || summary) && (
        <div className="mb-10 animate-fade-in">
          <div className="bg-gold-glow border border-gold/20 rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Plus className="w-20 h-20 rotate-45" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                <span className="font-mono text-[10px] text-gold uppercase tracking-[0.2em] font-bold">
                  AI สรุปภาพรวม
                </span>
              </div>
              {summaryLoading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-gold/10 rounded-full w-3/4 animate-pulse" />
                  <div className="h-4 bg-gold/10 rounded-full w-1/2 animate-pulse" />
                </div>
              ) : (
                <p className="text-lg text-text-hi leading-relaxed font-medium">
                  {summary}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Add (Large Centered Button) */}
      <div className="flex justify-center mb-12 mt-4">
        <button
          onClick={() => setSheetOpen(true)}
          className="flex items-center justify-center w-24 h-24 md:w-28 md:h-28 bg-gold text-base hover:bg-gold/90 shadow-xl hover:shadow-2xl hover:shadow-gold/20 rounded-full transition-all duration-300 cursor-pointer active:scale-95"
          aria-label="เพิ่มโน้ตใหม่"
        >
          <Plus className="w-10 h-10 md:w-12 md:h-12 text-text-inv" strokeWidth={2.5} />
        </button>
      </div>

      {/* Recent Notes */}
      <div className="flex items-center justify-between mb-6">
        <span className="font-mono text-xs text-text-lo uppercase tracking-wider">
          บันทึกล่าสุด
        </span>
      </div>

      {loading ? (
        <div className="flex flex-col gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-48 sm:h-64 rounded-3xl" />
          ))}
        </div>
      ) : recentNotes.length > 0 ? (
        <div className="flex flex-col gap-6">
          {recentNotes.map((note) => (
            <NoteCard key={note.id} note={note} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-transparent border border-dashed border-border rounded-2xl mt-4">
          <div className="w-16 h-16 mx-auto flex items-center justify-center mb-4 text-gold/50">
            <FileText className="w-10 h-10" strokeWidth={1.5} />
          </div>
          <p className="text-text-hi font-semibold text-lg mb-1">ยังไม่มีโน้ตในระบบ</p>
          <p className="text-text-lo text-sm">
            กดปุ่ม "+" ด้านบนเพื่อเริ่มบันทึกโน้ตแรกของคุณ
          </p>
        </div>
      )}

      <NoteModal
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSave={handleSave}
      />
    </>
  );
}
