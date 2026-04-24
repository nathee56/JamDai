"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Sparkles, Brain, Search, X } from "lucide-react";

const slides = [
  {
    icon: <Search className="w-10 h-10 text-gold" />,
    title: "จำได้. คืออะไร?",
    description: "จดโน้ตง่ายๆ ทุกรูปแบบ ไม่ว่าจะสั้นหรือยาว เราช่วยคุณจำทุกเรื่องสำคัญ",
  },
  {
    icon: <Sparkles className="w-10 h-10 text-gold" />,
    title: "AI ช่วยจัดการให้",
    description: "ไม่ต้องเสียเวลาจัดหมวดหมู่ AI ของเราจะแยกประเภทโน้ตให้อัตโนมัติ",
  },
  {
    icon: <Brain className="w-10 h-10 text-gold" />,
    title: "ถามอะไรก็ได้",
    description: "JamDai AI พร้อมตอบคำถามจากโน้ตของคุณ เหมือนมีผู้ช่วยส่วนตัว",
  },
];

export function Onboarding() {
  const [open, setOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const hasSeen = localStorage.getItem("jamdai_onboarding");
    if (!hasSeen) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("jamdai_onboarding", "true");
    setOpen(false);
  };

  const handleNext = () => {
    if (slideIndex < slides.length - 1) {
      setSlideIndex(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-base/80 backdrop-blur-md">
      <div className="w-full max-w-sm bg-surface border border-border rounded-[24px] shadow-2xl overflow-hidden relative flex flex-col">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-text-lo hover:text-text-hi transition-colors z-10 p-2"
        >
          ข้าม
        </button>

        <div className="flex-1 flex flex-col items-center text-center px-6 py-12">
          <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mb-6">
            {slides[slideIndex].icon}
          </div>
          <h2 className="text-2xl font-display font-bold text-text-hi mb-3">
            {slides[slideIndex].title}
          </h2>
          <p className="text-sm text-text-md leading-relaxed">
            {slides[slideIndex].description}
          </p>
        </div>

        <div className="px-6 pb-8 pt-4 flex flex-col gap-6">
          <div className="flex justify-center gap-2">
            {slides.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  i === slideIndex ? "bg-gold w-6" : "bg-border-hi"
                )}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="w-full py-3.5 bg-gold text-text-inv rounded-[14px] font-medium active:scale-95 transition-all duration-150"
          >
            {slideIndex === slides.length - 1 ? "เริ่มใช้งาน" : "ถัดไป"}
          </button>
        </div>
      </div>
    </div>
  );
}
