"use client";

import React, { createContext, useContext } from "react";

interface UIContextType {
  uiStyle: "minimal";
  setUIStyle: (style: "minimal") => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  return (
    <UIContext.Provider value={{ uiStyle: "minimal", setUIStyle: () => {} }}>
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
