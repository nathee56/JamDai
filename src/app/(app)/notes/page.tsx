"use client";

import { useAuth } from "@/hooks/useAuth";
import { useNotes } from "@/hooks/useNotes";
import { NoteCard } from "@/components/notes/NoteCard";
import { NoteModal } from "@/components/notes/NoteModal";
import { cn } from "@/lib/utils";
import { Plus, Search } from "lucide-react";
import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import type { NoteCategory } from "@/types";

const allCategories: (NoteCategory | "all")[] = [
  "all",
  "ความรู้",
  "การเงิน",
  "ความทรงจำ",
  "งาน",
  "สุขภาพ",
  "อื่นๆ",
];

export default function NotesPage() {
  const { user } = useAuth();
  const { notes, loading, addNote, deleteNote } = useNotes(user?.uid);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [filter, setFilter] = useState<NoteCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNotes = useMemo(() => {
    let result = notes;
    if (filter !== "all") {
      result = result.filter((n) => n.category === filter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((n) => n.text.toLowerCase().includes(q));
    }
    return result;
  }, [notes, filter, searchQuery]);

  const handleSave = async (text: string, category: NoteCategory) => {
    await addNote(text, category);
    toast.success("บันทึกโน้ตสำเร็จ");
  };

  const handleDelete = async (id: string) => {
    await deleteNote(id);
    toast.success("ลบโน้ตแล้ว");
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-sans font-bold text-4xl sm:text-5xl text-text-hi tracking-tight">โน้ต</h1>
        <button
          onClick={() => setSheetOpen(true)}
          className="w-14 h-14 flex items-center justify-center rounded-2xl bg-gold text-text-inv hover:bg-gold-dim active:scale-[0.97] transition-all duration-150 cursor-pointer shadow-lg shadow-gold/20"
        >
          <Plus className="w-8 h-8" strokeWidth={2.5} />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-text-lo pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ค้นหาโน้ต..."
          className="w-full pl-14 pr-6 py-5 bg-surface border border-border rounded-2xl text-xl sm:text-2xl text-text-hi placeholder:text-text-lo focus:border-gold/40 focus:outline-none transition-colors duration-150"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-8">
        {allCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={cn(
              "px-6 py-3 rounded-xl text-base sm:text-lg font-semibold border whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0",
              filter === cat
                ? "bg-gold text-text-inv border-gold shadow-md shadow-gold/20"
                : "border-border text-text-lo hover:border-border-hi hover:text-text-md hover:bg-surface"
            )}
          >
            {cat === "all" ? "ทั้งหมด" : cat}
          </button>
        ))}
      </div>

      {/* Notes grid */}
      {loading ? (
        <div className="flex flex-col gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-48 sm:h-64 rounded-3xl" />
          ))}
        </div>
      ) : filteredNotes.length > 0 ? (
        <div className="flex flex-col gap-6">
          {filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-text-lo text-sm">
            {searchQuery || filter !== "all"
              ? "ไม่พบโน้ตที่ตรงกับเงื่อนไข"
              : "ยังไม่มีโน้ต"}
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
