"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";
import { LockScreen } from "@/components/ui/LockScreen";
import { useUI } from "@/components/providers/UIProvider";
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
  const { uiStyle } = useUI();
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
      <div className="min-h-dvh bg-base flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="font-display font-bold text-2xl text-gold">จำได้</span>
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

      {/* Removed Liquid Background Decor */}

      {/* ── Desktop Sidebar ── */}
      <aside className={cn(
        "hidden md:flex w-72 h-dvh fixed top-0 left-0 flex-col border-r border-border p-8 z-30 transition-all duration-500",
        uiStyle === "liquid" ? "bg-surface" : "bg-surface"
      )}>
        <div className="mb-10">
          <span className="font-display font-bold text-3xl text-gold tracking-tight">จำได้</span>
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
                  "flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-medium transition-colors duration-150",
                  active
                    ? "bg-gold-mist text-gold border-l-[3px] border-gold -ml-[3px]"
                    : "text-text-md hover:bg-border/50 hover:text-text-hi"
                )}
              >
                <item.icon className="w-[22px] h-[22px]" strokeWidth={2} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border pt-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gold/20 text-gold flex items-center justify-center text-sm font-bold shrink-0">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="text-base text-text-hi font-semibold truncate">{user.displayName || "ผู้ใช้งาน"}</p>
              <p className="text-xs text-text-lo truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <button
              onClick={signOut}
              className="text-text-lo hover:text-red-400 text-sm flex items-center gap-2 transition-colors duration-150 cursor-pointer font-medium"
            >
              <LogOut className="w-4 h-4" />
              ออกจากระบบ
            </button>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* ── Mobile Top Bar ── */}
      <header className={cn(
        "md:hidden fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-40 shrink-0 transition-all duration-500 bg-base/80 backdrop-blur-2xl border-b border-border/50"
      )}>
        <span className="font-display font-bold text-2xl text-text-hi tracking-tight">จำได้.</span>
        <div className="flex items-center gap-2">
          {/* AI Summary Button - Integrated in Header */}
          <button
            id="ai-summary-btn"
            className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center transition-all active:scale-90"
            aria-label="AI Summary"
          >
            <Bot className="w-5 h-5" />
          </button>
          <ThemeToggle />
          <div className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center text-sm font-semibold text-text-hi">
            {initial}
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 md:ml-72 flex flex-col overflow-hidden relative z-10">
        {/* Mobile top spacer */}
        <div className="md:hidden h-16 shrink-0" />

        {/* Scrollable area — keyboard resizes this, NOT the bottom nav */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="max-w-[1400px] mx-auto px-6 py-8 md:px-10 md:py-12">
            {children}
          </div>
          {/* Bottom spacer inside scroll — so content isn't hidden behind nav */}
          <div className="md:hidden h-28" />
        </div>
      </main>

      {/* ── Mobile Bottom Navigation ── */}
      {/* Background Blur Overlay for scrolling content - Hide in Liquid mode */}
      {uiStyle !== "liquid" && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-base via-base/80 to-transparent backdrop-blur-md pointer-events-none z-30" />
      )}
      
      {/* fixed position is NOT affected by keyboard resize */}
      <div
        className="md:hidden fixed left-0 right-0 z-40 px-6 flex justify-center"
        style={{ bottom: "max(24px, env(safe-area-inset-bottom))" }}
      >
        <nav className={cn(
          "flex items-center justify-around shadow-2xl rounded-full px-2 py-2 w-full max-w-[400px] transition-all duration-500",
          uiStyle === "liquid" 
            ? "bg-elevated" 
            : "bg-elevated/80 backdrop-blur-3xl border border-border/60"
        )}>
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300",
                  active
                    ? "bg-gold text-text-inv shadow-lg shadow-gold/20"
                    : "text-text-lo hover:text-text-hi"
                )}
              >
                <item.icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
