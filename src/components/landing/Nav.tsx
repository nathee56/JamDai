"use client";

import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 transition-all duration-300 ${
        scrolled
          ? "border-b border-border backdrop-blur-xl bg-base/80"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="font-display font-bold text-xl text-gold">จำได้</span>
        <span className="font-mono text-[10px] text-text-lo tracking-wider uppercase">
          JamDai
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Link href={user ? "/dashboard" : "/auth"}>
          <Button
            variant={scrolled ? "primary" : "outline"}
            size="sm"
          >
            {user ? "แดชบอร์ด" : "เริ่มใช้งาน"}
          </Button>
        </Link>
      </div>
    </nav>
  );
}
