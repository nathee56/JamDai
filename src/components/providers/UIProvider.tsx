"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface UIContextType {
  elderlyMode: boolean;
  toggleElderlyMode: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [elderlyMode, setElderlyMode] = useState(false);

  useEffect(() => {
    const isElderly = localStorage.getItem("jamdai_elderly_mode") === "true";
    setElderlyMode(isElderly);
  }, []);

  useEffect(() => {
    if (elderlyMode) {
      document.documentElement.classList.add("elderly-mode");
      localStorage.setItem("jamdai_elderly_mode", "true");
    } else {
      document.documentElement.classList.remove("elderly-mode");
      localStorage.setItem("jamdai_elderly_mode", "false");
    }
  }, [elderlyMode]);

  const toggleElderlyMode = () => setElderlyMode((prev) => !prev);

  return (
    <UIContext.Provider value={{ elderlyMode, toggleElderlyMode }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}
