"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";
import { LockScreen } from "@/components/ui/LockScreen";
import {
  Home,
  FileText,
  Image,
  Bot,
  LogOut,
  Settings,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { href: "/dashboard", icon: Home, label: "หน้าหลัก" },
  { href: "/notes", icon: FileText, label: "โน้ต" },
  { href: "/gallery", icon: Image, label: "คลัง" },
  { href: "/ai", icon: Bot, label: "AI" },
  { href: "/settings", icon: Settings, label: "ตั้งค่า" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hasPin = !!localStorage.getItem("jamdai_pin");
    if (hasPin) {
      setIsLocked(true);
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) router.push("/auth");
  }, [user, loading, router]);

  if (loading || !mounted) {
    return (
      <div className="min-h-dvh bg-void flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="font-display font-bold text-3xl text-gold italic">จำได้</span>
          <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const initial = (user.displayName || user.email || "?").charAt(0).toUpperCase();

  return (
    <div className="h-dvh bg-base flex overflow-hidden relative">
      {isLocked && <LockScreen onUnlock={() => setIsLocked(false)} />}

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex w-72 h-dvh fixed top-0 left-0 flex-col border-r border-border p-8 z-30 bg-surface">
        <div className="mb-10">
          <span className="font-display font-bold text-3xl text-gold tracking-tight italic">จำได้</span>
          <span className="block font-mono text-xs text-text-lo tracking-wider uppercase mt-1">JamDai</span>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-medium transition-colors duration-150 active:scale-[0.97]",
                  active
                    ? "bg-gold-mist text-gold border-l-[3px] border-gold -ml-[3px]"
                    : "text-text-md hover:bg-border/50 hover:text-text-hi"
                )}
              >
                <item.icon className="w-[22px] h-[22px]" strokeWidth={1.5} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border pt-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gold/20 text-gold flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                initial
              )}
            </div>
            <div className="min-w-0">
              <p className="text-base text-text-hi font-semibold truncate">{user.displayName || "ผู้ใช้งาน"}</p>
              <p className="text-xs text-text-lo truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <button
              onClick={signOut}
              className="text-text-lo hover:text-rose-400 text-sm flex items-center gap-2 transition-colors duration-150 cursor-pointer font-medium active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              ออกจากระบบ
            </button>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* ── Mobile Top Bar ── */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 flex items-center justify-between px-5 z-40 shrink-0 bg-base/80 backdrop-blur-2xl border-b border-white/[0.06] safe-top"
        style={{ height: "calc(56px + env(safe-area-inset-top, 0px))" }}
      >
        <span className="font-display font-bold text-xl text-text-hi tracking-tight italic">จำได้.</span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-xs font-semibold text-text-hi overflow-hidden">
            {user.photoURL ? (
              <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
            ) : (
              initial
            )}
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 md:ml-72 flex flex-col overflow-hidden relative z-10">
        {/* Mobile top spacer */}
        <div className="md:hidden shrink-0" style={{ height: "calc(56px + env(safe-area-inset-top, 0px))" }} />

        {/* Scrollable area */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="max-w-[1400px] mx-auto px-5 py-6 md:px-10 md:py-12">
            {children}
          </div>
          {/* Bottom spacer for nav */}
          <div className="md:hidden" style={{ height: "calc(80px + env(safe-area-inset-bottom, 0px))" }} />
        </div>
      </main>

      {/* ── Mobile Bottom Navigation — New Design ── */}
      <nav
        className="md:hidden fixed left-0 right-0 bottom-0 z-40 border-t safe-bottom"
        style={{
          height: `calc(64px + env(safe-area-inset-bottom, 0px))`,
          background: "rgba(13,13,13,0.92)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1 relative pt-2 flex-1 transition-colors duration-150"
              >
                {/* Active indicator line — top */}
                {active && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-[1px] bg-gold"
                    style={{ animation: "indicator-in 0.2s cubic-bezier(0.16,1,0.3,1) forwards" }}
                  />
                )}

                <item.icon
                  className={cn(
                    "w-[22px] h-[22px] transition-colors duration-150",
                    active ? "text-gold" : "text-[#505050]"
                  )}
                  strokeWidth={1.5}
                />
                <span
                  className={cn(
                    "text-[9px] font-mono uppercase tracking-wider transition-colors duration-150",
                    active ? "text-gold" : "text-[#505050]"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
