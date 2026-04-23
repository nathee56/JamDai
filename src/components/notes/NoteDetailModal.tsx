"use client";

import { Modal } from "@/components/ui/Modal";
import { CATEGORY_CONFIG, type Note, type NoteCategory } from "@/types";
import { formatThaiDate } from "@/lib/utils";
import { Calendar, Tag, Trash2, Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface NoteDetailModalProps {
  note: Note | null;
  open: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export function NoteDetailModal({ note, open, onClose, onDelete }: NoteDetailModalProps) {
  if (!note) return null;

  const catConfig = CATEGORY_CONFIG[note.category];

  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-6">
        {/* Date & Category Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-2 text-text-lo text-sm font-medium">
            <Calendar className="w-4 h-4" />
            {formatThaiDate(note.createdAt)}
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${catConfig.borderClass} ${catConfig.bgClass} ${catConfig.textClass}`}>
            <Tag className="w-3 h-3" />
            {catConfig.label}
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-4">
          {note.imageUrl && (
            <div className="w-full rounded-2xl overflow-hidden shadow-lg">
              <img src={note.imageUrl} alt="" className="w-full h-auto object-cover" />
            </div>
          )}
          
          <div className="min-h-[200px]">
            <p className="text-xl sm:text-2xl text-text-hi leading-relaxed whitespace-pre-wrap font-sans">
              {note.text}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-border">
          {onDelete ? (
            <button
              onClick={() => {
                onDelete(note.id);
                onClose();
              }}
              className="flex items-center gap-2 text-red-400 hover:text-red-500 font-bold transition-colors py-2 px-4 rounded-xl hover:bg-red-500/10"
            >
              <Trash2 className="w-5 h-5" />
              <span>ลบโน้ตนี้</span>
            </button>
          ) : <div />}

          <Button variant="primary" onClick={onClose} className="px-8">
            ปิด
          </Button>
        </div>
      </div>
    </Modal>
  );
}
