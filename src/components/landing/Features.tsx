"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Search,
  Layers,
  Camera,
  FileText,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Brain,
    title: "AI จำแทนคุณ",
    description:
      "ค้นหาจากโน้ตทั้งหมดด้วยภาษาธรรมชาติ ถามอะไรก็ตอบได้จากสิ่งที่คุณบันทึก",
  },
  {
    icon: Search,
    title: "Semantic Search",
    description:
      "ถามแบบคนพูดกัน ไม่ต้องจำ keyword แม้จำชื่อไม่ได้ก็ยังหาเจอ",
  },
  {
    icon: Layers,
    title: "Auto-Categorize",
    description:
      "AI จัดหมวดหมู่ให้อัตโนมัติ ไม่ต้องแท็กเอง ไม่ต้องสร้างโฟลเดอร์",
  },
  {
    icon: Camera,
    title: "บันทึกด้วยรูปภาพ",
    description: "ถ่ายรูปแล้วให้ AI อ่านข้อมูล จดจำทุกอย่างที่ตาเห็น",
  },
  {
    icon: FileText,
    title: "โน้ตข้อความ",
    description: "พิมพ์ได้เร็ว บันทึกทันใจ ไม่มีข้อจำกัดเรื่องความยาว",
  },
  {
    icon: Zap,
    title: "เร็วและเบา",
    description: "Mobile-first design เปิดมาใช้ได้เลย ไม่ต้องดาวน์โหลด",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function Features() {
  return (
    <section className="py-24 px-6" id="features">
      <div className="max-w-[960px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="inline-block font-mono text-[10px] uppercase tracking-wider text-text-lo mb-3">
            Features
          </span>
          <h2 className="font-display font-bold text-[clamp(1.75rem,4vw,2.75rem)] text-text-hi tracking-tighter">
            ทุกอย่างที่คุณต้องการ
          </h2>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group bg-surface border border-border rounded-lg p-6 transition-all duration-150 hover:border-border-hi hover:-translate-y-0.5"
            >
              {/* Icon */}
              <div className="w-9 h-9 rounded-md bg-gold-mist flex items-center justify-center mb-4">
                <feature.icon className="w-[18px] h-[18px] text-gold" />
              </div>

              {/* Text */}
              <h3 className="font-sans font-semibold text-text-hi text-base mb-1.5">
                {feature.title}
              </h3>
              <p className="font-sans text-sm text-text-md leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
