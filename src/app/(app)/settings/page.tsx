"use client";

import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  LogOut,
  Moon,
  Sun,
  Shield,
  Lock,
  Download,
  User,
  Bot,
  Sparkles,
  Info,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user, signOut, updateUserProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Profile states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhoto, setNewPhoto] = useState("");
  const [updating, setUpdating] = useState(false);

  // Privacy states
  const [hasPin, setHasPin] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [tempPin, setTempPin] = useState("");

  // PWA Install state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    setMounted(true);
    setHasPin(!!localStorage.getItem("jamdai_pin"));
    if (user) {
      setNewName(user.displayName || "");
      setNewPhoto(user.photoURL || "");
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, [user]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstallable(false);
    setDeferredPrompt(null);
  };

  const handleUpdateProfile = async () => {
    setUpdating(true);
    try {
      await updateUserProfile({ displayName: newName, photoURL: newPhoto });
      toast.success("อัปเดตโปรไฟล์สำเร็จ");
      setIsEditModalOpen(false);
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setUpdating(false);
    }
  };

  const handleTogglePin = () => {
    if (hasPin) {
      localStorage.removeItem("jamdai_pin");
      setHasPin(false);
      toast.success("ยกเลิกรหัสผ่านแล้ว");
    } else {
      setIsPinModalOpen(true);
    }
  };

  const handleSavePin = () => {
    if (tempPin.length === 4) {
      localStorage.setItem("jamdai_pin", tempPin);
      setHasPin(true);
      setTempPin("");
      setIsPinModalOpen(false);
      toast.success("ตั้งรหัสผ่านสำเร็จ");
    } else {
      toast.error("กรุณาใส่รหัส 4 หลัก");
    }
  };

  const initial = (user?.displayName || user?.email || "?").charAt(0).toUpperCase();

  if (!mounted) return null;

  return (
    <div className="space-y-8 pb-8">
      <h1 className="font-display font-bold text-3xl text-text-hi tracking-tight italic">ตั้งค่า</h1>

      {/* ── Section: บัญชีผู้ใช้ ── */}
      <section className="space-y-3">
        <p className="text-[10px] font-mono font-semibold text-text-lo tracking-widest uppercase px-1">บัญชีผู้ใช้</p>
        <div className="bg-surface border border-border rounded-[14px] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gold/20 text-gold flex items-center justify-center text-lg font-bold shrink-0 overflow-hidden">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                ) : (
                  initial
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-hi truncate">
                  {user?.displayName || "ผู้ใช้งาน"}
                </p>
                <p className="text-xs text-text-lo truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-3 py-1.5 text-xs font-medium text-gold hover:bg-gold-mist rounded-lg transition-colors active:scale-95"
            >
              แก้ไข
            </button>
          </div>
          <div className="border-t border-border">
            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-4 py-4 text-rose-400 hover:bg-rose-500/5 transition-colors active:scale-[0.98]"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── Section: การแสดงผล ── */}
      <section className="space-y-3">
        <p className="text-[10px] font-mono font-semibold text-text-lo tracking-widest uppercase px-1">การแสดงผล</p>
        <div className="bg-surface border border-border rounded-[14px] overflow-hidden">
          <div className="px-4 py-4">
            <p className="text-[10px] text-text-lo uppercase tracking-widest font-mono mb-3">โหมดสี</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTheme("dark")}
                className={cn(
                  "flex items-center justify-center gap-2 py-3 rounded-xl border transition-all active:scale-95",
                  theme === "dark" ? "bg-gold border-gold text-text-inv" : "bg-base border-border text-text-lo"
                )}
              >
                <Moon className="w-4 h-4" />
                <span className="text-sm font-medium">มืด</span>
              </button>
              <button
                onClick={() => setTheme("light")}
                className={cn(
                  "flex items-center justify-center gap-2 py-3 rounded-xl border transition-all active:scale-95",
                  theme === "light" ? "bg-gold border-gold text-text-inv" : "bg-base border-border text-text-lo"
                )}
              >
                <Sun className="w-4 h-4" />
                <span className="text-sm font-medium">สว่าง</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: AI ── */}
      <section className="space-y-3">
        <p className="text-[10px] font-mono font-semibold text-text-lo tracking-widest uppercase px-1">AI</p>
        <div className="bg-surface border border-border rounded-[14px] overflow-hidden">
          <div className="flex items-center gap-4 px-4 py-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-gold" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-hi">JamDai AI</p>
              <p className="text-xs text-text-lo">ผู้ช่วยความจำส่วนตัว สรุปและค้นหาโน้ตอัตโนมัติ</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: ความปลอดภัย ── */}
      <section className="space-y-3">
        <p className="text-[10px] font-mono font-semibold text-text-lo tracking-widest uppercase px-1">ความปลอดภัย</p>
        <div className="bg-surface border border-border rounded-[14px] overflow-hidden">
          <button
            onClick={handleTogglePin}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-base/50 transition-colors active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-text-md" />
              <div className="text-left">
                <span className="text-sm text-text-hi font-medium block">ล็อคแอป</span>
                <span className="text-[10px] text-text-lo">{hasPin ? "กำลังใช้งาน" : "ปิดการใช้งาน"}</span>
              </div>
            </div>
            <div className={cn("w-11 h-6 rounded-full p-0.5 transition-colors", hasPin ? "bg-gold" : "bg-border")}>
              <div className={cn("w-5 h-5 bg-white rounded-full transition-transform", hasPin ? "translate-x-5" : "translate-x-0")} />
            </div>
          </button>
        </div>
      </section>

      {/* ── Section: แอปพลิเคชัน ── */}
      <section className="space-y-3">
        <p className="text-[10px] font-mono font-semibold text-text-lo tracking-widest uppercase px-1">แอปพลิเคชัน</p>
        <div className="bg-surface border border-border rounded-[14px] overflow-hidden divide-y divide-border">
          {isInstallable && (
            <button
              onClick={handleInstallClick}
              className="w-full flex items-center gap-3 px-4 py-4 bg-gold/5 hover:bg-gold/10 transition-colors active:scale-[0.98]"
            >
              <Download className="w-5 h-5 text-gold" />
              <div className="text-left">
                <span className="text-sm text-gold font-semibold block">ติดตั้งแอป</span>
                <span className="text-[10px] text-text-lo font-mono uppercase tracking-wider">เข้าถึงไว ใช้งานลื่นไหลกว่าเดิม</span>
              </div>
            </button>
          )}
          <div className="flex items-center gap-3 px-4 py-4">
            <Info className="w-5 h-5 text-text-lo" />
            <span className="text-sm text-text-md">เวอร์ชัน 1.0.0</span>
          </div>
        </div>
      </section>

      <p className="text-center text-[10px] text-text-lo font-mono uppercase tracking-wider pb-4">
        JamDai · จำได้ · Made with ❤️
      </p>

      {/* Edit Profile Modal */}
      <Modal open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-display font-bold text-text-hi italic">แก้ไขโปรไฟล์</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-semibold text-text-lo uppercase tracking-wider ml-1">ชื่อที่แสดง</label>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="ชื่อของคุณ" className="w-full px-4 py-3 bg-surface border border-border rounded-[14px] text-sm text-text-hi focus:border-gold/40 focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-semibold text-text-lo uppercase tracking-wider ml-1">ลิงก์รูปโปรไฟล์</label>
              <input type="text" value={newPhoto} onChange={(e) => setNewPhoto(e.target.value)} placeholder="https://..." className="w-full px-4 py-3 bg-surface border border-border rounded-[14px] text-xs text-text-hi focus:border-gold/40 focus:outline-none" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setIsEditModalOpen(false)}>ยกเลิก</Button>
            <Button variant="primary" className="flex-1" onClick={handleUpdateProfile} disabled={updating}>
              {updating ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* PIN Modal */}
      <Modal open={isPinModalOpen} onClose={() => setIsPinModalOpen(false)}>
        <div className="space-y-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gold/10 text-gold flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-display font-bold text-text-hi italic">ตั้งรหัสผ่านใหม่</h2>
            <p className="text-xs text-text-lo">กรุณาใส่รหัส 4 หลัก</p>
          </div>
          <input type="password" maxLength={4} value={tempPin} onChange={(e) => setTempPin(e.target.value.replace(/\D/g, ""))} autoFocus className="w-36 text-center text-3xl tracking-[1em] py-4 bg-surface border border-border rounded-2xl text-gold focus:border-gold/40 focus:outline-none mx-auto font-mono block" />
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setIsPinModalOpen(false)}>ยกเลิก</Button>
            <Button variant="primary" className="flex-1" onClick={handleSavePin}>บันทึกรหัส</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
