"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

interface Symbol {
  id: number;
  name: string;
  displayName: string;
  currentPrice: number;
  manipulatedPrice: number;
  binanceSymbol: string;
}

interface TradingContextType {
  selectedSymbol: Symbol | null;
  setSelectedSymbol: (symbol: Symbol) => void;
  currentPrice: number | null;
  previousPrice: number | null;
  priceDirection: "up" | "down" | null;
  userBalance: number;
  manipulatedPrice: number | null;
}

const TradingContext = createContext<TradingContextType | null>(null);

export const useTrading = () => {
  const context = useContext(TradingContext);
  if (context === null) {
    throw new Error("useTrading must be used within a TradingProvider");
  }
  return context;
};

export const TradingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<Symbol | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
  const [priceDirection, setPriceDirection] = useState<"up" | "down" | null>(
    null
  );
  const [userBalance, setUserBalance] = useState<number>(1000);
  const [manipulatedPrice, setManipulatedPrice] = useState<number | null>(null);

  const fetchPrice = useCallback(async () => {
    if (!selectedSymbol) return;

    try {
      const response = await fetch(
        `/api/market-data?symbolId=${selectedSymbol.id}&binanceSymbol=${selectedSymbol.binanceSymbol}`
      );
      if (!response.ok) throw new Error("Failed to fetch price");
      const data = await response.json();

      setPreviousPrice(currentPrice);
      setCurrentPrice(data.currentPrice);
      setManipulatedPrice(data.manipulatedPrice);

      if (previousPrice && currentPrice) {
        setPriceDirection(currentPrice > previousPrice ? "up" : "down");
      }
    } catch (error) {
      console.error("Error fetching price:", error);
    }
  }, [selectedSymbol, currentPrice, previousPrice]);

  useEffect(() => {
    if (selectedSymbol) {
      fetchPrice();
      const interval = setInterval(fetchPrice, 1000);
      return () => clearInterval(interval);
    }
  }, [selectedSymbol, fetchPrice]);

  return (
    <TradingContext.Provider
      value={{
        selectedSymbol,
        setSelectedSymbol,
        currentPrice,
        previousPrice,
        priceDirection,
        userBalance,
        manipulatedPrice,
      }}
    >
      {children}
    </TradingContext.Provider>
  );
};
