"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
              }}
              className="w-full max-w-[800px] bg-elevated border border-border rounded-[2rem] shadow-2xl pointer-events-auto overflow-hidden mx-auto"
            >
              <div className="px-6 py-8 sm:px-12 sm:py-12">
                {/* Header */}
                {title && (
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-sans font-bold text-text-hi text-2xl">
                      {title}
                    </h3>
                    <button
                      onClick={onClose}
                      className="w-12 h-12 flex items-center justify-center rounded-full text-text-lo hover:text-text-md hover:bg-border/50 transition-colors duration-150 cursor-pointer"
                    >
                      <X className="w-8 h-8" />
                    </button>
                  </div>
                )}

                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
