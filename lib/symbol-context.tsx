"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";

interface SymbolData {
  id: number;
  name: string;
  displayName: string;
  currentPrice: number;
  manipulatedPrice: number;
}

interface SymbolContextType {
  symbolData: SymbolData | null;
  setSymbolId: (id: number) => void;
}

const SymbolContext = createContext<SymbolContextType | undefined>(undefined);

export function SymbolProvider({ children }: { children: React.ReactNode }) {
  const [symbolId, setSymbolId] = useState<number | null>(null);
  const [symbolData, setSymbolData] = useState<SymbolData | null>(null);

  useEffect(() => {
    if (symbolId === null) return;

    const fetchSymbolData = async () => {
      try {
        const response = await fetch(`/api/symbol-data?symbolId=${symbolId}`);
        const data = await response.json();
        setSymbolData(data);
      } catch (error) {
        console.error("Error fetching symbol data:", error);
      }
    };

    fetchSymbolData();
    const interval = setInterval(fetchSymbolData, 1000); // Update every second

    return () => clearInterval(interval);
  }, [symbolId]);

  return (
    <SymbolContext.Provider value={{ symbolData, setSymbolId }}>
      {children}
    </SymbolContext.Provider>
  );
}

export function useSymbol() {
  const context = useContext(SymbolContext);
  if (context === undefined) {
    throw new Error("useSymbol must be used within a SymbolProvider");
  }
  return context;
}
