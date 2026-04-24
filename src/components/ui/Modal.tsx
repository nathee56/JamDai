"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  fullScreen?: boolean;
}

export function Modal({ open, onClose, title, children, fullScreen = false }: ModalProps) {
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
          <div 
            className={cn(
              "fixed z-[70] flex items-center justify-center pointer-events-none transition-all duration-300",
              fullScreen 
                ? "inset-0 md:inset-0 p-0 md:p-4 top-[calc(56px+env(safe-area-inset-top,0px))] md:top-0 bottom-[calc(80px+env(safe-area-inset-bottom,0px))] md:bottom-0" 
                : "inset-0 p-2 sm:p-4"
            )}
          >
            <motion.div
              initial={fullScreen ? { y: "20%", opacity: 0 } : { scale: 0.95, opacity: 0, y: 10 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={fullScreen ? { y: "20%", opacity: 0 } : { scale: 0.95, opacity: 0, y: 10 }}
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 300,
                mass: 0.8
              }}
              className={cn(
                "bg-elevated shadow-2xl pointer-events-auto overflow-hidden mx-auto flex flex-col transition-all duration-300",
                fullScreen 
                  ? "w-full h-full md:h-auto md:max-w-[800px] md:rounded-[2rem] md:border md:border-border" 
                  : "w-full max-w-[800px] border border-border rounded-[2rem]"
              )}
            >
              <div className={cn(
                "flex-1 flex flex-col",
                fullScreen ? "px-6 py-8 md:px-12 md:py-12" : "px-6 py-8 sm:px-12 sm:py-12"
              )}>
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
