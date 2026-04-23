"use client";

import { useAuth } from "@/hooks/useAuth";
import { useNotes } from "@/hooks/useNotes";
import { NoteDetailModal } from "@/components/notes/NoteDetailModal";
import { useMemo, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";
import type { Note } from "@/types";

export default function GalleryPage() {
  const { user } = useAuth();
  const { notes, loading, deleteNote, updateNote } = useNotes(user?.uid);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const imageNotes = useMemo(
    () => notes.filter((n) => n.imageUrl),
    [notes]
  );

  const handleDelete = async (id: string) => {
    await deleteNote(id);
    setSelectedNote(null);
  };

  const handleUpdate = async (noteId: string, data: Partial<Pick<Note, "text" | "category">>) => {
    await updateNote(noteId, data);
  };

  return (
    <>
      <h1 className="font-display font-bold text-3xl text-text-hi tracking-tight italic mb-6">
        คลังรูปภาพ
      </h1>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-40 rounded-[14px]" />
          ))}
        </div>
      ) : imageNotes.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {imageNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => setSelectedNote(note)}
              className="bg-surface border border-border rounded-[14px] overflow-hidden hover:border-border-hi transition-colors duration-150 cursor-pointer active:scale-[0.98]"
            >
              <img
                src={note.imageUrl}
                alt=""
                className="w-full h-40 object-cover"
              />
              <div className="p-3">
                <p className="text-xs text-text-md line-clamp-2 leading-relaxed mb-1">
                  {note.text}
                </p>
                <p className="text-[10px] text-text-lo font-mono">
                  {formatRelativeDate(note.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24">
          <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-6 h-6 text-text-lo" />
          </div>
          <p className="text-sm text-text-md mb-1">ยังไม่มีรูปภาพ</p>
          <p className="text-xs text-text-lo">
            ถ่ายรูปหรืออัปโหลดภาพเพื่อเริ่มบันทึก
          </p>
        </div>
      )}

      <NoteDetailModal
        note={selectedNote}
        open={!!selectedNote}
        onClose={() => setSelectedNote(null)}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
      />
    </>
  );
}
