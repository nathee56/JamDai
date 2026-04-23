"use client";

import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import { useUI } from "@/components/providers/UIProvider";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  LogOut,
  Moon,
  Sun,
  Bell,
  Shield,
  ChevronRight,
  Trash2,
  Camera,
  Check,
  Lock,
  Download,
  User,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user, signOut, updateUserProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const { uiStyle, setUIStyle } = useUI();
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

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [user]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
    }
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

  return (
    <div className="space-y-8">
      <h1 className="font-display font-bold text-4xl text-text-hi tracking-tight">ตั้งค่า</h1>

      {/* Profile Card */}
      <section className="space-y-3">
        <p className="text-xs font-semibold text-text-lo tracking-widest uppercase px-1">บัญชีของคุณ</p>
        <div className="bg-surface border border-border rounded-2xl p-5 flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gold/20 text-gold flex items-center justify-center text-xl font-bold shrink-0 overflow-hidden">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                initial
              )}
            </div>
            <div className="min-w-0">
              <p className="text-base font-semibold text-text-hi truncate">
                {user?.displayName || "ผู้ใช้งาน"}
              </p>
              <p className="text-sm text-text-lo truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="px-4 py-2 text-sm font-medium text-gold hover:bg-gold-mist rounded-xl transition-colors"
          >
            แก้ไข
          </button>
        </div>
      </section>

      {/* Theme & Style */}
      <section className="space-y-3">
        <p className="text-xs font-semibold text-text-lo tracking-widest uppercase px-1">การแสดงผล</p>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden divide-y divide-border">
          {/* Theme Mode */}
          <div className="p-4 bg-base/50">
            <p className="text-[10px] text-text-lo uppercase tracking-widest font-bold mb-3 px-1">โหมดสี</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTheme("dark")}
                className={cn(
                  "flex items-center justify-center gap-2 py-3 rounded-xl border transition-all duration-200",
                  theme === "dark" ? "bg-gold border-gold text-text-inv" : "bg-surface border-border text-text-lo"
                )}
              >
                <Moon className="w-4 h-4" />
                <span className="text-sm font-bold">มืด</span>
              </button>
              <button
                onClick={() => setTheme("light")}
                className={cn(
                  "flex items-center justify-center gap-2 py-3 rounded-xl border transition-all duration-200",
                  theme === "light" ? "bg-gold border-gold text-text-inv" : "bg-surface border-border text-text-lo"
                )}
              >
                <Sun className="w-4 h-4" />
                <span className="text-sm font-bold">สว่าง</span>
              </button>
            </div>
          </div>

          {/* UI Style */}
          <div className="p-4">
            <p className="text-[10px] text-text-lo uppercase tracking-widest font-bold mb-3 px-1">สไตล์อินเทอร์เฟซ</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setUIStyle("minimal")}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-4 rounded-xl border transition-all duration-300",
                  uiStyle === "minimal" ? "bg-gold/10 border-gold text-gold" : "bg-surface border-border text-text-lo"
                )}
              >
                <span className="text-sm font-bold">Minimal</span>
                <span className="text-[9px] uppercase tracking-tighter opacity-60">เรียบง่าย สบายตา</span>
              </button>
              <button
                onClick={() => setUIStyle("liquid")}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 py-4 rounded-xl border transition-all duration-500 overflow-hidden group",
                  uiStyle === "liquid" 
                    ? "bg-gold/20 border-gold text-gold shadow-[0_0_20px_-5px_rgba(240,180,41,0.3)]" 
                    : "bg-surface border-border text-text-lo"
                )}
              >
                {uiStyle === "liquid" && (
                  <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-transparent animate-pulse" />
                )}
                <span className="relative z-10 text-sm font-bold">Liquid Glass</span>
                <span className="relative z-10 text-[9px] uppercase tracking-tighter opacity-60">หรูหรา ลื่นไหล</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* General */}
      <section className="space-y-3">
        <p className="text-xs font-semibold text-text-lo tracking-widest uppercase px-1">ทั่วไป</p>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden divide-y divide-border">
          <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-border/30 transition-colors duration-150 cursor-pointer">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-text-md" />
              <span className="text-base text-text-hi font-medium">การแจ้งเตือน</span>
            </div>
            <ChevronRight className="w-4 h-4 text-text-lo" />
          </button>
          <button 
            onClick={handleTogglePin}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-border/30 transition-colors duration-150 cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-text-md" />
              <div>
                <span className="text-base text-text-hi font-medium block">ล็อคแอป (Privacy Lock)</span>
                <span className="text-xs text-text-lo">{hasPin ? "กำลังใช้งาน" : "ปิดการใช้งาน"}</span>
              </div>
            </div>
            <div className={cn(
              "w-12 h-6 rounded-full p-1 transition-colors duration-200",
              hasPin ? "bg-gold" : "bg-border"
            )}>
              <div className={cn(
                "w-4 h-4 bg-white rounded-full transition-transform duration-200",
                hasPin ? "translate-x-6" : "translate-x-0"
              )} />
            </div>
          </button>
          <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-border/30 transition-colors duration-150 cursor-pointer">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-text-md" />
              <span className="text-base text-text-hi font-medium">จัดการบัญชี</span>
            </div>
            <ChevronRight className="w-4 h-4 text-text-lo" />
          </button>
          
          {isInstallable && (
            <button 
              onClick={handleInstallClick}
              className="w-full flex items-center justify-between px-5 py-4 bg-gold/5 hover:bg-gold/10 transition-colors duration-150 cursor-pointer border-t border-gold/10"
            >
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-gold" />
                <div className="text-left">
                  <span className="text-base text-gold font-bold block">ติดตั้งแอป JamDai</span>
                  <span className="text-[10px] text-text-lo uppercase tracking-wider">เข้าถึงไว ใช้งานลื่นไหลกว่าเดิม</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gold/50" />
            </button>
          )}
        </div>
      </section>

      {/* Danger Zone */}
      <section className="space-y-3">
        <p className="text-xs font-semibold text-text-lo tracking-widest uppercase px-1">โซนอันตราย</p>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-red-500/10 transition-colors duration-150 cursor-pointer">
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-red-400" />
              <div className="text-left">
                <p className="text-base text-red-400 font-medium">ลบข้อมูลทั้งหมด</p>
                <p className="text-xs text-text-lo">ลบโน้ตและรูปภาพทั้งหมด ไม่สามารถกู้คืนได้</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-red-400/50" />
          </button>
        </div>
      </section>

      {/* Sign Out */}
      <button
        onClick={signOut}
        className="w-full flex items-center justify-center gap-3 px-5 py-4 bg-surface border border-border rounded-2xl text-red-400 font-semibold hover:bg-red-500/10 transition-colors duration-150 cursor-pointer"
      >
        <LogOut className="w-5 h-5" />
        ออกจากระบบ
      </button>

      <p className="text-center text-xs text-text-lo pb-4">JamDai v1.1.0 · จำได้ · Made with ❤️</p>

      {/* Edit Profile Modal */}
      <Modal open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gold/10 text-gold flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-text-hi">แก้ไขโปรไฟล์</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-lo uppercase ml-1">ชื่อที่แสดง</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="ชื่อของคุณ"
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text-hi focus:border-gold/40 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-lo uppercase ml-1">ลิงก์รูปโปรไฟล์ (URL)</label>
              <input
                type="text"
                value={newPhoto}
                onChange={(e) => setNewPhoto(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text-hi focus:border-gold/40 focus:outline-none text-sm"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setIsEditModalOpen(false)}>
              ยกเลิก
            </Button>
            <Button variant="primary" className="flex-1" onClick={handleUpdateProfile} disabled={updating}>
              {updating ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* PIN Setup Modal */}
      <Modal open={isPinModalOpen} onClose={() => setIsPinModalOpen(false)}>
        <div className="space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gold/10 text-gold flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-text-hi">ตั้งรหัสผ่านใหม่</h2>
            <p className="text-sm text-text-lo">กรุณาใส่รหัส 4 หลักเพื่อความปลอดภัย</p>
          </div>

          <input
            type="password"
            maxLength={4}
            value={tempPin}
            onChange={(e) => setTempPin(e.target.value.replace(/\D/g, ""))}
            autoFocus
            className="w-40 text-center text-4xl tracking-[1em] py-4 bg-surface border border-border rounded-2xl text-gold focus:border-gold/40 focus:outline-none mx-auto font-mono"
          />

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setIsPinModalOpen(false)}>
              ยกเลิก
            </Button>
            <Button variant="primary" className="flex-1" onClick={handleSavePin}>
              บันทึกรหัส
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
