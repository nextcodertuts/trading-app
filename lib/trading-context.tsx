"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";

interface Symbol {
  id: number;
  name: string;
  currentPrice: number;
  payout: number;
  enabled: boolean;
  binanceSymbol: string;
}

interface TradingContextType {
  selectedSymbol: Symbol | null;
  setSelectedSymbol: (symbol: Symbol) => void;
  currentPrice: number | null;
  priceDirection: "up" | "down" | null;
  userBalance: number;
  updateBalance: () => Promise<void>;
}

const TradingContext = createContext<TradingContextType | null>(null);

export function TradingProvider({ children }: { children: React.ReactNode }) {
  const [selectedSymbol, setSelectedSymbol] = useState<Symbol | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
  const [priceDirection, setPriceDirection] = useState<"up" | "down" | null>(
    null
  );
  const [userBalance, setUserBalance] = useState<number>(0);

  const updateBalance = async () => {
    try {
      const response = await fetch("/api/balance");
      if (response.ok) {
        const data = await response.json();
        setUserBalance(data.balance);
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  useEffect(() => {
    updateBalance();
  }, []);

  useEffect(() => {
    if (!selectedSymbol) return;

    const fetchPrice = async () => {
      try {
        const response = await fetch(
          `/api/market-data?symbolId=${selectedSymbol.id}&binanceSymbol=${selectedSymbol.binanceSymbol}`
        );
        if (!response.ok) throw new Error("Failed to fetch price");
        const data = await response.json();

        setPreviousPrice(currentPrice);
        setCurrentPrice(data.manipulatedPrice);

        if (previousPrice && currentPrice) {
          setPriceDirection(currentPrice > previousPrice ? "up" : "down");
        }
      } catch (error) {
        console.error("Error fetching price:", error);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 1000);
    return () => clearInterval(interval);
  }, [selectedSymbol, currentPrice, previousPrice]);

  return (
    <TradingContext.Provider
      value={{
        selectedSymbol,
        setSelectedSymbol,
        currentPrice,
        priceDirection,
        userBalance,
        updateBalance,
      }}
    >
      {children}
    </TradingContext.Provider>
  );
}

export function useTrading() {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error("useTrading must be used within a TradingProvider");
  }
  return context;
}

export default function MyComponent() {
  const { selectedSymbol, currentPrice, priceDirection, userBalance } =
    useTrading();

  return (
    <div>
      {selectedSymbol && (
        <div>
          <p>Symbol: {selectedSymbol.name}</p>
          <p>Current Price: {currentPrice}</p>
          <p>Price Direction: {priceDirection}</p>
          <p>User Balance: {userBalance}</p>
        </div>
      )}
    </div>
  );
}
