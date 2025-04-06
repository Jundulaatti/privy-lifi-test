"use client";

import { createContext, useContext, ReactNode } from "react";
import { useLiFiWallet } from "../hooks/useLiFiWallet";

// Create the context
const LiFiContext = createContext<ReturnType<typeof useLiFiWallet> | undefined>(
  undefined
);

// Provider component
export function LiFiProvider({ children }: { children: ReactNode }) {
  const lifiWallet = useLiFiWallet();

  return (
    <LiFiContext.Provider value={lifiWallet}>{children}</LiFiContext.Provider>
  );
}

// Hook to use the context
export function useLiFi() {
  const context = useContext(LiFiContext);
  if (context === undefined) {
    throw new Error("useLiFi must be used within a LiFiProvider");
  }
  return context;
}
