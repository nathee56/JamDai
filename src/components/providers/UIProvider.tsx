"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type UIStyle = "minimal" | "liquid";

interface UIContextType {
  uiStyle: UIStyle;
  setUIStyle: (style: UIStyle) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [uiStyle, setUIStyleState] = useState<UIStyle>("minimal");

  useEffect(() => {
    const saved = localStorage.getItem("jamdai_ui_style") as UIStyle;
    if (saved) {
      setUIStyleState(saved);
      document.documentElement.classList.toggle("liquid", saved === "liquid");
    }
  }, []);

  const setUIStyle = (style: UIStyle) => {
    setUIStyleState(style);
    localStorage.setItem("jamdai_ui_style", style);
    document.documentElement.classList.toggle("liquid", style === "liquid");
  };

  return (
    <UIContext.Provider value={{ uiStyle, setUIStyle }}>
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
