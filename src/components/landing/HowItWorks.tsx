"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Login ด้วย Google",
    description:
      "คลิกเดียวเข้าสู่ระบบ ไม่ต้องสมัครสมาชิก ไม่ต้องจำรหัสผ่าน ใช้บัญชี Google ที่มีอยู่ได้เลย",
  },
  {
    number: "02",
    title: "บันทึกทุกอย่าง",
    description:
      "พิมพ์ข้อความ ถ่ายรูป หรืออัปโหลดภาพ AI จะจัดหมวดหมู่ให้อัตโนมัติ ไม่ต้องคิดเรื่องจัดระเบียบ",
  },
  {
    number: "03",
    title: "ถาม AI ได้ทุกเรื่อง",
    description:
      'อยากรู้อะไรก็ถาม เช่น "เดือนนี้ใช้จ่ายเท่าไร?" หรือ "ทริปล่าสุดไปไหนบ้าง?" AI จะตอบจากโน้ตของคุณ',
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 px-6 bg-void/50" id="how">
      <div className="max-w-[680px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="inline-block font-mono text-[10px] uppercase tracking-wider text-text-lo mb-3">
            How it works
          </span>
          <h2 className="font-display font-bold text-[clamp(1.75rem,4vw,2.75rem)] text-text-hi tracking-tighter">
            ใช้งานง่าย 3 ขั้นตอน
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="space-y-12">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{
                duration: 0.4,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex gap-6 items-start"
            >
              {/* Number */}
              <span className="font-mono text-4xl font-bold text-gold/40 leading-none shrink-0 w-14 tabular-nums">
                {step.number}
              </span>

              {/* Content */}
              <div>
                <h3 className="font-sans font-semibold text-text-hi text-lg mb-1.5">
                  {step.title}
                </h3>
                <p className="font-sans text-sm text-text-md leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
