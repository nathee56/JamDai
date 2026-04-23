"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export function CTA() {
  return (
    <section className="py-24 px-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-[640px] mx-auto text-center rounded-xl p-12 border border-gold/15 shadow-[0_0_60px_rgba(240,180,41,0.06)]"
        style={{
          background:
            "linear-gradient(135deg, var(--color-surface) 0%, rgba(240,180,41,0.04) 100%)",
        }}
      >
        <h2 className="font-display font-bold text-[clamp(1.75rem,5vw,2.75rem)] text-text-hi tracking-tighter mb-6">
          หยุดลืม เริ่ม<span className="text-gold">จำได้</span>
        </h2>
        <p className="text-text-md text-sm mb-8 max-w-sm mx-auto leading-relaxed">
          เริ่มบันทึกความคิด ความทรงจำ และแผนการทุกอย่างของคุณวันนี้
        </p>
        <Link href="/auth">
          <Button variant="primary" size="lg">
            เริ่มใช้งานฟรี
          </Button>
        </Link>
      </motion.div>
    </section>
  );
}
