"use client";

import React, { useState, useEffect } from "react";
import { TradeItem } from "./TradeItem";

interface Trade {
  id: number;
  symbolId: number;
  symbol: { name: string };
  amount: number;
  direction: "up" | "down";
  entryPrice: number;
  exitPrice: number | null;
  outcome: "win" | "loss" | null;
  expiresAt: string;
  createdAt: string;
}

export function OpenTrades() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [expandedTrade, setExpandedTrade] = useState<number | null>(null);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const response = await fetch("/api/orders?status=open");
        if (!response.ok) {
          throw new Error("Failed to fetch open trades");
        }
        const data = await response.json();
        setTrades(data.orders);
      } catch (error) {
        console.error("Error fetching open trades:", error);
      }
    };

    fetchTrades();
    const interval = setInterval(fetchTrades, 1000); // Fetch every second for open trades

    return () => clearInterval(interval);
  }, []);

  const toggleExpand = (tradeId: number) => {
    setExpandedTrade(expandedTrade === tradeId ? null : tradeId);
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Open Trades</h2>
      <div className="space-y-4">
        {trades.map((trade) => (
          <TradeItem
            key={trade.id}
            trade={trade}
            isExpanded={expandedTrade === trade.id}
            onToggle={() => toggleExpand(trade.id)}
          />
        ))}
      </div>
    </div>
  );
}
