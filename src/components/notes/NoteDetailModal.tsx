"use client";

import { CATEGORY_CONFIG, type Note, type NoteCategory } from "@/types";
import { formatThaiDate, cn } from "@/lib/utils";
import { ArrowLeft, Calendar, Tag, Trash2, Check } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NoteDetailModalProps {
  note: Note | null;
  open: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onUpdate?: (noteId: string, data: Partial<Pick<Note, "text" | "category">>) => void;
}

const allCategories: NoteCategory[] = ["ความรู้", "การเงิน", "ความทรงจำ", "งาน", "สุขภาพ", "อื่นๆ"];

export function NoteDetailModal({ note, open, onClose, onDelete, onUpdate }: NoteDetailModalProps) {
  const [editText, setEditText] = useState("");
  const [editCategory, setEditCategory] = useState<NoteCategory>("อื่นๆ");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [saved, setSaved] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (note) {
      setEditText(note.text);
      setEditCategory(note.category);
      setSaved(false);
    }
  }, [note]);

  // Auto-save with debounce
  const autoSave = useCallback(
    (text: string) => {
      if (!note || !onUpdate) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        await onUpdate(note.id, { text });
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      }, 800);
    },
    [note, onUpdate]
  );

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setEditText(val);
    autoSave(val);
  };

  const handleCategoryChange = (cat: NoteCategory) => {
    setEditCategory(cat);
    setShowCategoryPicker(false);
    if (note && onUpdate) {
      onUpdate(note.id, { category: cat });
    }
  };

  if (!note) return null;

  const catConfig = CATEGORY_CONFIG[editCategory];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          {/* Bottom Sheet on Mobile / Modal on Desktop */}
          <motion.div
            initial={{ y: "100%", opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
            className="fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center z-[70] pointer-events-none"
          >
            <div className="pointer-events-auto w-full md:w-full md:max-w-[700px] bg-elevated md:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto safe-bottom">
              {/* Header */}
              <div className="sticky top-0 bg-elevated/95 backdrop-blur-sm z-10 flex items-center justify-between px-5 py-4 border-b border-border">
                <button
                  onClick={onClose}
                  className="flex items-center gap-2 text-text-md hover:text-text-hi transition-colors active:scale-95"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="text-sm font-medium">กลับ</span>
                </button>
                <div className="flex items-center gap-3">
                  {saved && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-emerald-400 text-xs font-mono uppercase tracking-wider flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      บันทึกแล้ว
                    </motion.span>
                  )}
                  <div className="flex items-center gap-1.5 text-text-lo text-xs">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatThaiDate(note.createdAt)}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-5 py-6 space-y-4">
                {/* Image */}
                {note.imageUrl && (
                  <div className="w-full rounded-xl overflow-hidden">
                    <img src={note.imageUrl} alt="" className="w-full h-auto object-cover" />
                  </div>
                )}

                {/* Editable text */}
                <textarea
                  ref={textareaRef}
                  value={editText}
                  onChange={handleTextChange}
                  className="w-full min-h-[200px] bg-transparent text-base text-text-hi leading-relaxed focus:outline-none resize-none font-sans placeholder:text-text-lo"
                  placeholder="เขียนอะไรก็ได้..."
                />
              </div>

              {/* Footer Actions */}
              <div className="sticky bottom-0 bg-elevated/95 backdrop-blur-sm border-t border-border px-5 py-4 flex items-center justify-between safe-bottom">
                {/* Delete */}
                {onDelete && (
                  <button
                    onClick={() => {
                      onDelete(note.id);
                      onClose();
                    }}
                    className="flex items-center gap-2 text-rose-400 hover:text-rose-500 text-sm font-medium transition-colors py-2 px-3 rounded-xl hover:bg-rose-500/10 active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                    ลบ
                  </button>
                )}

                {/* Category Picker */}
                <div className="relative">
                  <button
                    onClick={() => setShowCategoryPicker(!showCategoryPicker)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-mono uppercase tracking-wider transition-colors active:scale-95",
                      catConfig.borderClass,
                      catConfig.textClass,
                      catConfig.bgClass
                    )}
                  >
                    <Tag className="w-3.5 h-3.5" />
                    {catConfig.label}
                  </button>

                  {/* Category Dropdown */}
                  <AnimatePresence>
                    {showCategoryPicker && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className="absolute bottom-12 right-0 bg-elevated border border-border rounded-xl overflow-hidden shadow-2xl z-20 min-w-[160px]"
                      >
                        {allCategories.map((cat) => {
                          const cfg = CATEGORY_CONFIG[cat];
                          return (
                            <button
                              key={cat}
                              onClick={() => handleCategoryChange(cat)}
                              className={cn(
                                "w-full text-left px-4 py-3 text-sm font-medium transition-colors hover:bg-surface flex items-center gap-3 active:scale-95",
                                editCategory === cat ? "text-gold bg-gold-mist" : "text-text-hi"
                              )}
                            >
                              <span className={cn("w-2 h-2 rounded-full", cfg.bgClass, cfg.borderClass, "border")} />
                              {cfg.label}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
