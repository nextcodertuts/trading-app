"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "../ui/scroll-area";

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
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

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

  const { data: historicalTrades } = useQuery({
    queryKey: ["orders", "historical"],
    queryFn: async () => {
      const response = await fetch("/api/orders?status=historical");
      if (!response.ok) throw new Error("Failed to fetch historical trades");
      const data = await response.json();
      return data.orders;
    },
    refetchInterval: 5000,
  });

  const allTrades = [...(openTrades || []), ...(historicalTrades || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <Card>
      <CardHeader className="p-2">
        <CardTitle className="text-base">Trades</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="max-h-[400px] overflow-y-auto scroll-smooth">
          {allTrades.map((trade: Trade) => (
            <Sheet key={trade.id}>
              <SheetTrigger asChild>
                <div
                  className="flex items-center justify-between p-2 border-b hover:bg-accent/50 transition-colors cursor-pointer text-xs"
                  onClick={() => setSelectedTrade(trade)}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{trade.symbol.name}</span>
                    {trade.direction === "up" ? (
                      <ArrowUp className="w-3 h-3 text-green-500" />
                    ) : (
                      <ArrowDown className="w-3 h-3 text-red-500" />
                    )}
                    <span className="text-muted-foreground">
                      ${trade.amount}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        trade.outcome === "win"
                          ? "success"
                          : trade.outcome === "loss"
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-[10px] px-1"
                    >
                      {trade.outcome?.toUpperCase() || "ACTIVE"}
                    </Badge>
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </div>
                </div>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Trade Details</SheetTitle>
                </SheetHeader>
                {selectedTrade && (
                  <div className="mt-4 space-y-2 text-sm">
                    <p>
                      <strong>Symbol:</strong> {selectedTrade.symbol.name}
                    </p>
                    <p>
                      <strong>Direction:</strong>{" "}
                      {selectedTrade.direction.toUpperCase()}
                    </p>
                    <p>
                      <strong>Amount:</strong> ${selectedTrade.amount}
                    </p>
                    <p>
                      <strong>Entry Price:</strong> $
                      {selectedTrade.entryPrice.toFixed(2)}
                    </p>
                    {selectedTrade.exitPrice && (
                      <p>
                        <strong>Exit Price:</strong> $
                        {selectedTrade.exitPrice.toFixed(2)}
                      </p>
                    )}
                    <p>
                      <strong>Status:</strong>{" "}
                      {selectedTrade.outcome?.toUpperCase() || "ACTIVE"}
                    </p>
                    <p>
                      <strong>Created:</strong>{" "}
                      {formatDistanceToNow(new Date(selectedTrade.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                    {selectedTrade.outcome && (
                      <p>
                        <strong>Expired:</strong>{" "}
                        {formatDistanceToNow(
                          new Date(selectedTrade.expiresAt),
                          { addSuffix: true }
                        )}
                      </p>
                    )}
                  </div>
                )}
              </SheetContent>
            </Sheet>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
