"use client";

import { useTrading } from "@/lib/trading-context";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LivePriceDisplay() {
  const { selectedSymbol, currentPrice, priceDirection } = useTrading();

  if (!selectedSymbol || !currentPrice) {
    return <div>Select a symbol to view price data...</div>;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className=" font-semibold">
          {selectedSymbol.name} Market Price
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold">${currentPrice.toFixed(2)}</div>
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
        <div className="text-xs text-muted-foreground mt-2">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
}
