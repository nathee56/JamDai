"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode } from "react";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Sheet({ open, onClose, title, children }: SheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
              mass: 0.8,
            }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-elevated border-t border-border rounded-t-2xl max-h-[88vh] overflow-y-auto"
          >
            <div className="px-6 pt-3 pb-6">
              {/* Handle */}
              <div className="w-8 h-1 rounded-full bg-border-hi mx-auto mb-5" />

              {/* Header */}
              {title && (
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-sans font-semibold text-text-hi text-lg">
                    {title}
                  </h3>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-md text-text-lo hover:text-text-md hover:bg-border/50 transition-colors duration-150 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
