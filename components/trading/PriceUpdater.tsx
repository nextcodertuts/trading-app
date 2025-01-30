"use client";

import { useEffect, useState } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

export function PriceUpdater({ symbolId }: { symbolId: number }) {
  const [price, setPrice] = useState<number | null>(null);
  const [prevPrice, setPrevPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch(`/api/market-data?symbolId=${symbolId}`);
        if (!response.ok) throw new Error("Failed to fetch price");
        const data = await response.json();

        setPrevPrice(price);
        setPrice(data.manipulatedPrice);
      } catch (error) {
        console.error("Error fetching price:", error);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 1000);
    return () => clearInterval(interval);
  }, [symbolId, price]); // Added price to dependencies

  const priceDirection =
    prevPrice !== null ? (price! > prevPrice ? "up" : "down") : null;

  return (
    <div className="flex items-center justify-between">
      <div
        className={`text-xl text-bold flex items-center ${
          priceDirection === "up" ? "text-green-500" : "text-red-500"
        }`}
      >
        ${price?.toFixed(2) ?? "Loading..."}
      </div>
      <div
        className={`flex items-center ${
          priceDirection === "up" ? "text-green-500" : "text-red-500"
        }`}
      >
        {priceDirection === "up" ? (
          <ArrowUp className="w-4 h-4" />
        ) : (
          <ArrowDown className="w-4 h-4" />
        )}
      </div>
    </div>
  );
}
