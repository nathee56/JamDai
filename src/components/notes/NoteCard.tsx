"use client";

import { cn, formatRelativeDate } from "@/lib/utils";
import { Pin, Trash2, MoreVertical } from "lucide-react";
import { CATEGORY_CONFIG, type Note } from "@/types";
import { useState, useRef, useCallback } from "react";

interface NoteCardProps {
  note: Note;
  onDelete?: (id: string) => void;
  onPin?: (id: string) => void;
  onClick?: () => void;
  layout?: "masonry" | "list";
}

export function NoteCard({ note, onDelete, onPin, onClick, layout = "masonry" }: NoteCardProps) {
  const catConfig = CATEGORY_CONFIG[note.category];
  const [contextMenu, setContextMenu] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const longPressTriggered = useRef(false);

  const handleTouchStart = useCallback(() => {
    longPressTriggered.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      setContextMenu(true);
    }, 500);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    // Only trigger click if long press was NOT triggered
    if (!longPressTriggered.current && onClick) {
      onClick();
    }
  }, [onClick]);

  const handleTouchMove = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  }, []);

  if (layout === "list") {
    return (
      <>
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
          onClick={onClick}
          className="bg-surface border border-border rounded-[14px] p-4 transition-all duration-150 hover:border-border-hi active:scale-[0.98] cursor-pointer flex items-start gap-4"
        >
          {/* Pin indicator */}
          {note.pinned && (
            <Pin className="w-3.5 h-3.5 text-gold shrink-0 mt-1 fill-gold" />
          )}

          <div className="flex-1 min-w-0">
            <p className="text-sm text-text-hi leading-relaxed line-clamp-2 mb-2">
              {note.text}
            </p>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-[10px] font-mono uppercase tracking-wider border px-2 py-0.5 rounded",
                  catConfig.borderClass,
                  catConfig.textClass,
                  catConfig.bgClass
                )}
              >
                {catConfig.label}
              </span>
              <span className="text-[10px] text-text-lo">
                {formatRelativeDate(note.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Context Menu Overlay */}
        {contextMenu && (
          <ContextMenu
            note={note}
            onClose={() => setContextMenu(false)}
            onDelete={onDelete}
            onPin={onPin}
          />
        )}
      </>
    );
  }

  // Masonry layout (default)
  return (
    <>
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        onClick={(e) => {
          // Desktop click handler
          if (!('ontouchstart' in window)) {
            onClick?.();
          }
        }}
        className="bg-surface border border-border rounded-[14px] p-4 transition-all duration-150 hover:border-border-hi active:scale-[0.98] cursor-pointer flex flex-col relative group"
      >
        {/* Pin icon */}
        {note.pinned && (
          <div className="absolute top-3 right-3 z-10">
            <Pin className="w-3.5 h-3.5 text-gold fill-gold" />
          </div>
        )}

        {/* Image */}
        {note.imageUrl && (
          <div className="w-full rounded-lg overflow-hidden mb-3 -mt-1 -mx-1" style={{ width: "calc(100% + 8px)" }}>
            <img
              src={note.imageUrl}
              alt=""
              className="w-full h-auto max-h-40 object-cover"
            />
          </div>
        )}

        {/* Text — show based on content length for masonry effect */}
        <p className="text-sm text-text-md leading-relaxed line-clamp-6 mb-3 flex-1">
          {note.text}
        </p>

        {/* Bottom row */}
        <div className="flex items-center gap-2 mt-auto">
          <span
            className={cn(
              "text-[10px] font-mono uppercase tracking-wider border px-2 py-0.5 rounded",
              catConfig.borderClass,
              catConfig.textClass,
              catConfig.bgClass
            )}
          >
            {catConfig.label}
          </span>
          <span className="text-[10px] text-text-lo">
            {formatRelativeDate(note.createdAt)}
          </span>
        </div>
      </div>

      {/* Context Menu Overlay */}
      {contextMenu && (
        <ContextMenu
          note={note}
          onClose={() => setContextMenu(false)}
          onDelete={onDelete}
          onPin={onPin}
        />
      )}
    </>
  );
}

/* ── Long Press Context Menu ── */
function ContextMenu({
  note,
  onClose,
  onDelete,
  onPin,
}: {
  note: Note;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onPin?: (id: string) => void;
}) {
  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-[80] context-menu-overlay"
        onClick={onClose}
      />
      {/* Menu */}
      <div className="fixed bottom-0 left-0 right-0 z-[90] p-5 safe-bottom context-menu">
        <div className="bg-elevated border border-border rounded-2xl overflow-hidden max-w-md mx-auto">
          {onPin && (
            <button
              onClick={() => {
                onPin(note.id);
                onClose();
              }}
              className="w-full flex items-center gap-4 px-5 py-4 text-text-hi hover:bg-surface transition-colors active:scale-[0.98]"
            >
              <Pin className={cn("w-5 h-5", note.pinned ? "text-gold fill-gold" : "text-text-md")} />
              <span className="text-sm font-medium">
                {note.pinned ? "เลิกปักหมุด" : "ปักหมุด"}
              </span>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => {
                onDelete(note.id);
                onClose();
              }}
              className="w-full flex items-center gap-4 px-5 py-4 text-rose-400 hover:bg-rose-500/10 transition-colors border-t border-border active:scale-[0.98]"
            >
              <Trash2 className="w-5 h-5" />
              <span className="text-sm font-medium">ลบโน้ต</span>
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-full mt-3 bg-elevated border border-border rounded-2xl px-5 py-4 text-text-hi text-sm font-medium hover:bg-surface transition-colors max-w-md mx-auto block active:scale-[0.98]"
        >
          ยกเลิก
        </button>
      </div>
    </>
  );
}
