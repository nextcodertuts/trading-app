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

export function BinaryTradeHistory() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [expandedTrade, setExpandedTrade] = useState<number | null>(null);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const response = await fetch("/api/orders?status=historical");
        if (!response.ok) {
          throw new Error("Failed to fetch trades");
        }
        const data = await response.json();
        setTrades(data.orders);
      } catch (error) {
        console.error("Error fetching trades:", error);
      }
    };

    fetchTrades();
    const interval = setInterval(fetchTrades, 5000); // Fetch every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const toggleExpand = (tradeId: number) => {
    setExpandedTrade(expandedTrade === tradeId ? null : tradeId);
  };

  return (
    <div className="">
      <h2 className="text-lg font-bold mb-6">Trade History</h2>
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
