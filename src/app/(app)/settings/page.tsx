"use client";

import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  LogOut,
  Moon,
  Sun,
  Bell,
  Shield,
  User,
  ChevronRight,
  Trash2,
} from "lucide-react";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const initial = (user?.displayName || user?.email || "?").charAt(0).toUpperCase();

  return (
    <div className="space-y-8">
      <h1 className="font-display font-bold text-4xl text-text-hi tracking-tight">ตั้งค่า</h1>

      {/* Profile Card */}
      <section className="space-y-3">
        <p className="text-xs font-semibold text-text-lo tracking-widest uppercase px-1">บัญชีของคุณ</p>
        <div className="bg-surface border border-border rounded-2xl p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gold/20 text-gold flex items-center justify-center text-xl font-bold shrink-0">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold text-text-hi truncate">
              {user?.displayName || "ผู้ใช้งาน"}
            </p>
            <p className="text-sm text-text-lo truncate">{user?.email}</p>
            <p className="text-xs text-text-lo mt-0.5 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              เข้าสู่ระบบด้วย Google
            </p>
          </div>
        </div>
      </section>

      {/* Theme */}
      <section className="space-y-3">
        <p className="text-xs font-semibold text-text-lo tracking-widest uppercase px-1">การแสดงผล</p>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden divide-y divide-border">
          <button
            onClick={() => setTheme("dark")}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-border/30 transition-colors duration-150 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-text-md" />
              <span className="text-base text-text-hi font-medium">Dark Mode</span>
            </div>
            {mounted && (
              <div className={`w-5 h-5 rounded-full border-2 transition-colors ${theme === "dark" ? "bg-gold border-gold" : "border-border"}`} />
            )}
          </button>
          <button
            onClick={() => setTheme("light")}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-border/30 transition-colors duration-150 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Sun className="w-5 h-5 text-text-md" />
              <span className="text-base text-text-hi font-medium">Light Mode</span>
            </div>
            {mounted && (
              <div className={`w-5 h-5 rounded-full border-2 transition-colors ${theme === "light" ? "bg-gold border-gold" : "border-border"}`} />
            )}
          </button>
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
          <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-border/30 transition-colors duration-150 cursor-pointer">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-text-md" />
              <span className="text-base text-text-hi font-medium">ความเป็นส่วนตัว</span>
            </div>
            <ChevronRight className="w-4 h-4 text-text-lo" />
          </button>
          <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-border/30 transition-colors duration-150 cursor-pointer">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-text-md" />
              <span className="text-base text-text-hi font-medium">จัดการบัญชี</span>
            </div>
            <ChevronRight className="w-4 h-4 text-text-lo" />
          </button>
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

      <p className="text-center text-xs text-text-lo pb-4">JamDai v1.0.0 · จำได้ · Made with ❤️</p>
    </div>
  );
}
