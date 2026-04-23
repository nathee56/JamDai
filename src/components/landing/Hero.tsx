"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ChevronDown, Sparkles } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-dvh flex flex-col items-center justify-center text-center px-6 overflow-hidden">
      {/* Background: radial gold gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(240,180,41,0.07) 0%, transparent 70%)",
        }}
      />

      {/* Background: subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Glowing orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-gold/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-[680px] mx-auto px-4">
        {/* Label badge */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-gold bg-gold/5 border border-gold/20 px-4 py-1.5 rounded-full mb-8"
        >
          <Sparkles className="w-3 h-3 text-gold" /> ผู้ช่วยความจำ AI ส่วนตัว
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 flex flex-col items-center"
        >
          <span className="block font-display font-bold text-[clamp(2.75rem,8vw,5.5rem)] text-text-hi leading-[1.1] tracking-tighter">
            จำทุกอย่าง
          </span>
          <span className="block font-display font-bold text-[clamp(2.75rem,8vw,5.5rem)] text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-200 leading-[1.1] tracking-tighter">
            ด้วย AI
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="text-text-md text-sm md:text-base max-w-[420px] mx-auto mb-10 leading-relaxed px-4"
        >
          บันทึกโน้ต รูปภาพ ข้อความ — แล้วให้ AI ช่วยจำและค้นหาได้ทุกเวลาที่คุณต้องการ
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-3 mb-12"
        >
          <Link href="/auth">
            <Button variant="primary" size="lg">
              เริ่มใช้งานฟรี
            </Button>
          </Link>
          <span className="text-text-lo text-xs font-mono tracking-wide">
            ใช้ Google Login · ไม่ต้องใส่บัตร
          </span>
        </motion.div>

        {/* Phone Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto w-[260px] animate-float"
        >
          <div className="border border-border-hi rounded-2xl bg-surface overflow-hidden shadow-[0_0_60px_rgba(240,180,41,0.06)]">
            {/* Status bar */}
            <div className="h-6 bg-void flex items-center justify-center">
              <div className="w-20 h-1 bg-border-hi rounded-full" />
            </div>

            {/* Screen content */}
            <div className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-sm text-gold">
                  จำได้
                </span>
                <div className="w-5 h-5 rounded-full bg-gold/20" />
              </div>

              {/* Greeting */}
              <div>
                <p className="text-[10px] text-text-lo">สวัสดีตอนเช้า</p>
                <p className="text-sm font-semibold text-text-hi">
                  คุณ <span className="text-gold">สมชาย</span>
                </p>
              </div>

              {/* Mock note cards */}
              {[
                {
                  cat: "ความทรงจำ",
                  title: "ทริปเชียงใหม่กับเพื่อน",
                  color: "text-violet-400",
                  border: "border-violet-800/50",
                },
                {
                  cat: "การเงิน",
                  title: "สรุปรายจ่ายเดือน มี.ค.",
                  color: "text-emerald-400",
                  border: "border-emerald-800/50",
                },
                {
                  cat: "ความรู้",
                  title: "สูตรทำ Sourdough Bread",
                  color: "text-blue-400",
                  border: "border-blue-800/50",
                },
              ].map((note, i) => (
                <div
                  key={i}
                  className="bg-elevated border border-border rounded-lg p-3 space-y-1"
                >
                  <span
                    className={`text-[8px] font-mono uppercase tracking-wider ${note.color}`}
                  >
                    {note.cat}
                  </span>
                  <p className="text-[11px] font-medium text-text-hi">
                    {note.title}
                  </p>
                  <p className="text-[9px] text-text-lo leading-snug">
                    รายละเอียดโน้ตจะแสดงที่นี่...
                  </p>
                </div>
              ))}
            </div>

            {/* Bottom nav */}
            <div className="flex items-center justify-around py-2 border-t border-border bg-elevated/50">
              {["หน้าหลัก", "โน้ต", "คลัง", "AI"].map((label, i) => (
                <div
                  key={label}
                  className={`text-center ${i === 0 ? "text-gold" : "text-text-lo"}`}
                >
                  <div className="text-[10px] font-mono">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-text-lo"
      >
        <span className="text-[10px] font-mono tracking-wider">เลื่อนลง</span>
        <ChevronDown className="w-3 h-3 animate-bounce" />
      </motion.div>
    </section>
  );
}
