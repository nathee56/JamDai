"use client";

import { useState, useEffect } from "react";
import { Lock, Delete, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface LockScreenProps {
  onUnlock: () => void;
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [isVibrating, setIsVibrating] = useState(false);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError(false);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  useEffect(() => {
    if (pin.length === 4) {
      const savedPin = localStorage.getItem("jamdai_pin");
      if (pin === savedPin) {
        onUnlock();
      } else {
        setError(true);
        setIsVibrating(true);
        setTimeout(() => {
          setPin("");
          setIsVibrating(false);
        }, 500);
      }
    }
  }, [pin, onUnlock]);

  return (
    <div className="fixed inset-0 z-[100] bg-base flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className={cn(
        "flex flex-col items-center max-w-xs w-full transition-transform duration-100",
        isVibrating && "animate-shake"
      )}>
        <div className="w-16 h-16 rounded-3xl bg-gold/10 text-gold flex items-center justify-center mb-8">
          <Lock className="w-8 h-8" />
        </div>
        
        <h1 className="text-2xl font-display font-bold text-text-hi mb-2 tracking-tight italic">ใส่รหัสผ่าน</h1>
        <p className="text-sm text-text-lo mb-10">กรุณาใส่รหัส 4 หลักเพื่อเข้าใช้งาน</p>

        {/* PIN Indicators */}
        <div className="flex gap-4 mb-12">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "w-4 h-4 rounded-full border-2 transition-all duration-200",
                pin.length > i ? "bg-gold border-gold scale-125" : "border-border",
                error && "border-red-500 bg-red-500/20"
              )}
            />
          ))}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-4 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num.toString())}
              className="h-16 rounded-2xl bg-surface border border-border text-2xl font-semibold text-text-hi hover:bg-border/30 active:scale-95 transition-all"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleKeyPress("0")}
            className="h-16 rounded-2xl bg-surface border border-border text-2xl font-semibold text-text-hi hover:bg-border/30 active:scale-95 transition-all"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-16 rounded-2xl flex items-center justify-center text-text-lo hover:text-text-hi active:scale-95 transition-all"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
