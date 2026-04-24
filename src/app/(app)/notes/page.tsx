"use client";

import { useAuth } from "@/hooks/useAuth";
import { useNotes } from "@/hooks/useNotes";
import { NoteCard } from "@/components/notes/NoteCard";
import { NoteModal } from "@/components/notes/NoteModal";
import { NoteDetailModal } from "@/components/notes/NoteDetailModal";
import { cn } from "@/lib/utils";
import { Plus, Search, LayoutGrid, List, FileText } from "lucide-react";
import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import type { Note, NoteCategory } from "@/types";

const allCategories: (NoteCategory | "all" | "starred")[] = [
  "all",
  "starred",
  "ความรู้",
  "การเงิน",
  "ความทรงจำ",
  "งาน",
  "สุขภาพ",
  "อื่นๆ",
];

export default function NotesPage() {
  const { user } = useAuth();
  const { notes, loading, addNote, deleteNote, updateNote, togglePin } = useNotes(user?.uid);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [filter, setFilter] = useState<NoteCategory | "all" | "starred">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [layout, setLayout] = useState<"masonry" | "list">("masonry");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const filteredNotes = useMemo(() => {
    let result = notes;
    if (filter === "starred") {
      result = result.filter((n) => n.isStarred || n.pinned);
    } else if (filter !== "all") {
      result = result.filter((n) => n.category === filter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((n) => n.text.toLowerCase().includes(q));
    }
    return result;
  }, [notes, filter, searchQuery]);

  const starredNotes = useMemo(() => filteredNotes.filter((n) => n.isStarred || n.pinned), [filteredNotes]);
  const unstarredNotes = useMemo(() => filteredNotes.filter((n) => !n.isStarred && !n.pinned), [filteredNotes]);

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

  return (
    <>
      {/* Search Bar */}
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-lo pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ค้นหาโน้ต..."
          className="w-full pl-12 pr-5 py-3.5 bg-surface border border-border rounded-[14px] text-sm text-text-hi placeholder:text-text-lo focus:border-gold/40 focus:outline-none transition-colors duration-150"
        />
      </div>

      {/* Filter + Layout Toggle */}
      <div className="flex items-center justify-between mb-5">
        {/* Category Filter — horizontal scroll */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar flex-1 mr-3">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                "px-3.5 py-2 rounded-[10px] text-xs font-medium border whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 active:scale-95",
                filter === cat
                  ? "bg-gold text-text-inv border-gold"
                  : "border-border text-text-lo hover:border-border-hi hover:text-text-md"
              )}
            >
              {cat === "all" ? "ทั้งหมด" : cat === "starred" ? "⭐ ติดดาว" : cat}
            </button>
          ))}
        </div>

        {/* Layout Toggle */}
        <button
          onClick={() => setLayout(layout === "masonry" ? "list" : "masonry")}
          className="w-9 h-9 flex items-center justify-center rounded-[10px] border border-border text-text-lo hover:text-text-md hover:border-border-hi transition-colors shrink-0 active:scale-95"
          title={layout === "masonry" ? "สลับเป็น List" : "สลับเป็น Masonry"}
        >
          {layout === "masonry" ? (
            <List className="w-4 h-4" />
          ) : (
            <LayoutGrid className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="masonry-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton h-32 rounded-[14px]" />
          ))}
        </div>
      ) : filteredNotes.length > 0 ? (
        <div className="space-y-5">
          {/* Starred Section */}
          {starredNotes.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-mono text-text-lo uppercase tracking-wider px-1">
                ⭐ ติดดาวไว้
              </p>
              {layout === "masonry" ? (
                <div className="masonry-grid">
                  {starredNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      layout={layout}
                      onDelete={handleDelete}
                      onPin={handlePin}
                      onClick={() => setSelectedNote(note)}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {starredNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      layout={layout}
                      onDelete={handleDelete}
                      onPin={handlePin}
                      onClick={() => setSelectedNote(note)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Unstarred Notes */}
          {unstarredNotes.length > 0 && (
            <div className="space-y-3">
              {starredNotes.length > 0 && (
                <p className="text-[10px] font-mono text-text-lo uppercase tracking-wider px-1">
                  อื่นๆ
                </p>
              )}
              {layout === "masonry" ? (
                <div className="masonry-grid">
                  {unstarredNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      layout={layout}
                      onDelete={handleDelete}
                      onPin={handlePin}
                      onClick={() => setSelectedNote(note)}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {unstarredNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      layout={layout}
                      onDelete={handleDelete}
                      onPin={handlePin}
                      onClick={() => setSelectedNote(note)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-20">
          <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-text-lo" />
          </div>
          <p className="text-sm text-text-md mb-1">
            {searchQuery || filter !== "all"
              ? "ไม่พบโน้ตที่ตรงกับเงื่อนไข"
              : "ยังไม่มีโน้ต"}
          </p>
          <p className="text-xs text-text-lo">
            {searchQuery
              ? "ลองเปลี่ยนคำค้นหาหรือหมวดหมู่"
              : "กดปุ่ม + เพื่อสร้างโน้ตแรกของคุณ"}
          </p>
        </div>
      )}

      {/* Note Detail Modal */}
      <NoteDetailModal
        note={selectedNote}
        open={!!selectedNote}
        onClose={() => setSelectedNote(null)}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
      />

      {/* FAB — Floating Action Button */}
      <button
        onClick={() => setSheetOpen(true)}
        className="md:hidden fixed z-30 w-[52px] h-[52px] rounded-full bg-gold text-text-inv flex items-center justify-center active:scale-90 transition-all duration-200 cursor-pointer"
        style={{
          bottom: "calc(80px + env(safe-area-inset-bottom, 0px))",
          right: "20px",
          boxShadow: "0 4px 20px rgba(240,180,41,0.25)",
        }}
      >
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </button>

      <NoteModal
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSave={handleSave}
      />
    </>
  );
}
