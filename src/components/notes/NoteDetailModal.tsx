"use client";

import { CATEGORY_CONFIG, NOTE_COLORS, type Note, type NoteCategory } from "@/types";
import { formatThaiDate, cn } from "@/lib/utils";
import { ArrowLeft, Calendar, Tag, Trash2, Check, Sparkles, Share, Star } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { sendMessage } from "@/lib/thaillm";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface NoteDetailModalProps {
  note: Note | null;
  open: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onUpdate?: (noteId: string, data: Partial<Pick<Note, "text" | "category" | "colorId" | "isStarred">>) => void;
}

const allCategories: NoteCategory[] = ["ความรู้", "การเงิน", "ความทรงจำ", "งาน", "สุขภาพ", "อื่นๆ"];

export function NoteDetailModal({ note, open, onClose, onDelete, onUpdate }: NoteDetailModalProps) {
  const [editText, setEditText] = useState("");
  const [editCategory, setEditCategory] = useState<NoteCategory>("อื่นๆ");
  const [editColor, setEditColor] = useState<string>("default");
  const [isStarred, setIsStarred] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [saved, setSaved] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const quickActions = [
    { label: "✨ สรุป 3 ข้อ", prompt: "ช่วยสรุปโน้ตนี้ให้เป็น 3 ข้อสั้นๆ" },
    { label: "🔑 ดึง Keywords", prompt: "ดึง Keywords สำคัญจากโน้ตนี้มาเป็นข้อๆ" },
    { label: "📖 อธิบายให้เข้าใจง่าย", prompt: "ช่วยอธิบายเนื้อหาในโน้ตนี้ให้เข้าใจง่ายๆ หน่อย" },
    { label: "📝 ปรับภาษาให้เป็นทางการ", prompt: "ช่วยปรับภาษาในโน้ตนี้ให้เป็นทางการและสละสลวยขึ้น" },
  ];

  const handleQuickAi = async (prompt: string) => {
    if (!note) return;
    setAiLoading(true);
    setAiResult(null);
    try {
      const fullPrompt = `${prompt}\n\nโน้ต:\n${note.text}`;
      const result = await sendMessage(fullPrompt, [], []);
      setAiResult(result);
    } catch (e) {
      setAiResult("ขออภัย เกิดข้อผิดพลาด");
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (note) {
      setEditText(note.text);
      setEditCategory(note.category);
      setEditColor(note.colorId || "default");
      setIsStarred(note.isStarred || false);
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
  const currentColor = NOTE_COLORS.find(c => c.id === editColor) || NOTE_COLORS[0];
  const modalStyle = editColor !== "default" ? { backgroundColor: currentColor.bg } : {};
  const textStyle = editColor !== "default" ? { color: currentColor.text } : {};

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm md:z-[60] z-[60] hidden md:block"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-base z-[60] md:hidden"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ y: "20%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "20%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
            className="fixed z-[70] flex items-center justify-center pointer-events-none transition-all duration-300 inset-0 md:p-4 top-[calc(56px+env(safe-area-inset-top,0px))] md:top-0 bottom-[calc(64px+env(safe-area-inset-bottom,0px))] md:bottom-0"
          >
            <div 
              className="pointer-events-auto w-full h-full md:h-auto md:max-h-[90vh] md:max-w-[600px] bg-elevated md:rounded-2xl flex flex-col overflow-hidden transition-all duration-300 shadow-2xl border border-border/10 md:border-border/40"
              style={modalStyle}
            >
              {/* Header */}
              <div className="sticky top-0 bg-transparent backdrop-blur-md z-10 flex items-center justify-between px-5 py-4 border-b border-border/50 shrink-0 md:safe-none">
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

              {/* Color Picker */}
              <div className="px-5 py-3 border-b border-border/50 flex gap-3 overflow-x-auto hide-scrollbar">
                {NOTE_COLORS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setEditColor(c.id);
                      if (note && onUpdate) onUpdate(note.id, { colorId: c.id });
                    }}
                    className={cn(
                      "w-6 h-6 rounded-full border-[3px] transition-transform active:scale-90 shrink-0",
                      editColor === c.id ? "border-gold scale-110" : "border-transparent hover:scale-110"
                    )}
                    style={{ backgroundColor: c.bg === "var(--color-surface)" ? "#222" : c.bg }}
                  />
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4 hide-scrollbar">
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
                  className="w-full min-h-[300px] bg-transparent text-xl leading-relaxed focus:outline-none resize-none font-sans placeholder:text-text-lo/50"
                  style={textStyle}
                  placeholder="เขียนอะไรก็ได้..."
                />

                {/* Quick AI Buttons */}
                <div className="pt-4 border-t border-border/50">
                  <p className="text-xs text-text-lo mb-3 font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-gold" />
                    JamDai AI
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {quickActions.map((act) => (
                      <button
                        key={act.label}
                        onClick={() => handleQuickAi(act.prompt)}
                        disabled={aiLoading}
                        className="px-3 py-2 bg-surface hover:bg-surface-hi border border-border text-xs text-text-hi rounded-[10px] transition-colors active:scale-95 disabled:opacity-50"
                      >
                        {act.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Result Section */}
                <AnimatePresence>
                  {(aiLoading || aiResult) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-gold-mist/50 border border-gold/20 rounded-xl p-4 mt-2">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium text-gold flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4" />
                            ผลลัพธ์จาก AI
                          </h3>
                          {!aiLoading && aiResult && (
                            <button
                              onClick={() => setAiResult(null)}
                              className="text-text-lo hover:text-text-hi text-xs p-1"
                            >
                              ปิด
                            </button>
                          )}
                        </div>
                        {aiLoading ? (
                          <div className="flex gap-1.5 items-center py-2">
                            {[0, 1, 2].map((i) => (
                              <span key={i} className="w-1.5 h-1.5 rounded-full bg-gold/40 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-text-hi whitespace-pre-line leading-relaxed">
                            {aiResult}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer Actions */}
              <div className="mt-auto bg-transparent backdrop-blur-md border-t border-border/50 px-5 py-4 flex items-center justify-between shrink-0">
                {/* Actions: Delete & Share & Star */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => {
                      const newStarred = !isStarred;
                      setIsStarred(newStarred);
                      if (note && onUpdate) onUpdate(note.id, { isStarred: newStarred });
                    }}
                    className={cn(
                      "flex items-center gap-2 text-sm font-medium transition-colors py-2 px-3 rounded-xl active:scale-95",
                      isStarred ? "text-gold bg-gold/10 hover:bg-gold/20" : "text-text-md hover:text-text-hi hover:bg-surface"
                    )}
                  >
                    <Star className={cn("w-4 h-4", isStarred ? "fill-gold" : "")} />
                    <span className="hidden sm:inline">{isStarred ? "ติดดาวแล้ว" : "ติดดาว"}</span>
                  </button>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/share/${note.id}`;
                      navigator.clipboard.writeText(url);
                      toast.success("คัดลอกลิงก์แชร์แล้ว");
                    }}
                    className="flex items-center gap-2 text-text-md hover:text-text-hi text-sm font-medium transition-colors py-2 px-3 rounded-xl hover:bg-surface active:scale-95"
                  >
                    <Share className="w-4 h-4" />
                    <span className="hidden sm:inline">แชร์</span>
                  </button>
                  {onDelete && (
                    <button
                      onClick={() => {
                        onDelete(note.id);
                        onClose();
                      }}
                      className="flex items-center gap-2 text-rose-400 hover:text-rose-500 text-sm font-medium transition-colors py-2 px-3 rounded-xl hover:bg-rose-500/10 active:scale-95"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

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
