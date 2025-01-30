"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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

export function TradeHistory() {
  const { data: openTrades } = useQuery({
    queryKey: ["orders", "open"],
    queryFn: async () => {
      const response = await fetch("/api/orders?status=open");
      if (!response.ok) throw new Error("Failed to fetch open trades");
      const data = await response.json();
      return data.orders;
    },
    refetchInterval: 1000,
  });

  const { data: closedTrades } = useQuery({
    queryKey: ["orders", "historical"],
    queryFn: async () => {
      const response = await fetch("/api/orders?status=historical");
      if (!response.ok) throw new Error("Failed to fetch trades");
      const data = await response.json();
      return data.orders;
    },
    refetchInterval: 5000,
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Open Trades</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[300px] overflow-y-auto">
            {openTrades?.map((trade: Trade) => (
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
                  <span className="font-medium">${trade.amount}</span>
                  <Badge variant="secondary">ACTIVE</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Trade History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[300px] overflow-y-auto">
            {closedTrades?.map((trade: Trade) => (
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
                    {formatDistanceToNow(new Date(trade.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium">${trade.amount}</span>
                  <Badge
                    variant={
                      trade.outcome === "win"
                        ? "success"
                        : trade.outcome === "loss"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {trade.outcome?.toUpperCase() || "PENDING"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
