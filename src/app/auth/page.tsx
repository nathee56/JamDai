"use client";

import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function AuthPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      toast.error(err.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    }
  };

  return (
    <div className="min-h-[100dvh] bg-void flex items-center justify-center p-6 relative">
      {/* Theme toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Glow behind card */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "400px",
          height: "400px",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -40%)",
          background:
            "radial-gradient(circle, rgba(240,180,41,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[360px] bg-surface border border-border rounded-xl px-8 py-10 text-center"
      >
        {/* Logo */}
        <h1 className="font-display font-bold text-5xl text-gold mb-2">จำได้</h1>
        <p className="font-mono text-[10px] text-text-lo uppercase tracking-wider mb-6">
          ผู้ช่วยความจำ AI ส่วนตัว
        </p>

        {/* Divider */}
        <div className="w-full h-px bg-border mb-6" />

        {/* Description */}
        <p className="text-sm text-text-md leading-relaxed mb-8">
          เข้าสู่ระบบเพื่อเริ่มบันทึกโน้ต
          <br />
          รูปภาพ และความทรงจำ
        </p>

        {/* Google Sign-In Button */}
        <button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white text-[#111] font-semibold text-sm py-3 px-4 rounded-md hover:bg-gray-50 active:scale-[0.98] transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {loading ? "กำลังโหลด..." : "เข้าสู่ระบบด้วย Google"}
        </button>

        {/* Footer */}
        <p className="text-[10px] text-text-lo mt-6">
          ข้อมูลปลอดภัยด้วย Firebase
        </p>
      </motion.div>
    </div>
  );
}
