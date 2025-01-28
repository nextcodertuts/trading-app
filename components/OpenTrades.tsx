"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Timer } from "lucide-react";
import { differenceInSeconds } from "date-fns";

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

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const response = await fetch("/api/orders?status=open");
        if (!response.ok) throw new Error("Failed to fetch open trades");
        const data = await response.json();
        setTrades(data.orders);
      } catch (error) {
        console.error("Error fetching open trades:", error);
      }
    };

    fetchTrades();
    const interval = setInterval(fetchTrades, 1000);
    return () => clearInterval(interval);
  }, []);

  const getTimeLeft = (expiresAt: string) => {
    const seconds = differenceInSeconds(new Date(expiresAt), new Date());
    return seconds > 0 ? seconds : 0;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Open Trades</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[300px] overflow-y-auto">
          {trades.map((trade) => (
            <div
              key={trade.id}
              className="flex items-center justify-between p-3 border-b hover:bg-accent/50 transition-colors"
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{trade.symbol.name}</span>
                  {trade.direction === "up" ? (
                    <ArrowUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  Entry: ${trade.entryPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Timer className="w-4 h-4" />
                  <span>{getTimeLeft(trade.expiresAt)}s</span>
                </div>
                <span className="font-medium">${trade.amount}</span>
                <Badge variant="secondary">ACTIVE</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
