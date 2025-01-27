/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

interface PriceData {
  basePrice: number;
  manipulatedPrice: number;
  timestamp: string;
}

export function LivePriceDisplay() {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch(
          "/api/market-data?symbolId=1&binanceSymbol=BTCUSDT"
        );
        if (!response.ok) throw new Error("Failed to fetch price");
        const data = await response.json();

        setPreviousPrice(priceData?.manipulatedPrice || null);
        setPriceData(data);
      } catch (error) {
        console.error("Error fetching price:", error);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 1000);
    return () => clearInterval(interval);
  }, []);

  const getPriceChangeIndicator = () => {
    if (!previousPrice || !priceData) return null;

    const isUp = priceData.manipulatedPrice > previousPrice;
    return isUp ? (
      <ArrowUp className="w-6 h-6 text-green-500" />
    ) : (
      <ArrowDown className="w-6 h-6 text-red-500" />
    );
  };

  if (!priceData) return <div>Loading...</div>;

  return (
    <div className="bg-card p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">BTC/USDT</h2>
        {getPriceChangeIndicator()}
      </div>

      <div className="mt-4">
        <div className="text-3xl font-bold text-primary">
          ${priceData.manipulatedPrice.toFixed(2)}
        </div>
        <div className="text-sm text-muted-foreground mt-2">
          Last updated: {new Date(priceData.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
