"use client";

import { useAuth } from "@/hooks/useAuth";
import { useNotes } from "@/hooks/useNotes";
import { useMemo } from "react";
import { Image as ImageIcon } from "lucide-react";

export default function GalleryPage() {
  const { user } = useAuth();
  const { notes, loading } = useNotes(user?.uid);

  const imageNotes = useMemo(
    () => notes.filter((n) => n.imageUrl),
    [notes]
  );

  return (
    <>
      <h1 className="font-sans font-semibold text-xl text-text-hi mb-5">
        คลังรูปภาพ
      </h1>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-40 rounded-lg" />
          ))}
        </div>
      ) : imageNotes.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {imageNotes.map((note) => (
            <div
              key={note.id}
              className="bg-surface border border-border rounded-lg overflow-hidden hover:border-border-hi transition-colors duration-150 cursor-pointer"
            >
              <img
                src={note.imageUrl}
                alt=""
                className="w-full h-40 object-cover"
              />
              <div className="p-3">
                <p className="text-xs text-text-md line-clamp-2 leading-relaxed">
                  {note.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24">
          <div className="w-12 h-12 rounded-lg bg-surface border border-border flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-5 h-5 text-text-lo" />
          </div>
          <p className="text-text-lo text-sm">ยังไม่มีรูปภาพ</p>
          <p className="text-text-lo text-[10px] mt-1">
            ถ่ายรูปหรืออัปโหลดภาพเพื่อเริ่มบันทึก
          </p>
        </div>
      )}
    </>
  );
}
