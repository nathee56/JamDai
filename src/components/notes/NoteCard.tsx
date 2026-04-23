"use client";

import { cn } from "@/lib/utils";
import { formatRelativeDate } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { CATEGORY_CONFIG, type Note } from "@/types";
import { useState } from "react";

interface NoteCardProps {
  note: Note;
  onDelete?: (id: string) => void;
}

export function NoteCard({ note, onDelete }: NoteCardProps) {
  const [hovered, setHovered] = useState(false);
  const catConfig = CATEGORY_CONFIG[note.category];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="bg-surface border border-border rounded-2xl p-6 transition-all duration-150 hover:border-border-hi hover:-translate-y-[2px] hover:shadow-lg hover:shadow-black/5 cursor-pointer flex flex-col h-full"
    >
      {/* Image */}
      {note.imageUrl && (
        <div className="w-full h-48 sm:h-56 rounded-xl overflow-hidden mb-4 shrink-0">
          <img
            src={note.imageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Text */}
      <p className="text-xl sm:text-2xl text-text-md leading-relaxed line-clamp-4 mb-4 flex-1">
        {note.text}
      </p>

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-auto pt-2">
        <div className="flex items-center gap-3">
          {/* Category badge */}
          <span
            className={cn(
              "text-sm font-mono uppercase tracking-wider border px-4 py-1.5 rounded-md",
              catConfig.borderClass,
              catConfig.textClass,
              catConfig.bgClass
            )}
          >
            {catConfig.label}
          </span>

          {/* Date */}
          <span className="text-sm text-text-lo">
            {formatRelativeDate(note.createdAt)}
          </span>
        </div>

        {/* Delete */}
        {onDelete && hovered && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note.id);
            }}
            className="text-text-lo hover:text-red-400 transition-colors duration-150 cursor-pointer p-2"
          >
            <Trash2 className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}
