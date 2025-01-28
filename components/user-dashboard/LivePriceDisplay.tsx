// components/user-dashboard/LivePriceDisplay.tsx
/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
"use client";

import { useTrading } from "@/lib/trading-context";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export function LivePriceDisplay() {
  const { selectedSymbol, manipulatedPrice, currentPrice, priceDirection } =
    useTrading();

  if (!selectedSymbol || !currentPrice) {
    return <div>Select a symbol to view price data...</div>;
  }

  return (
    <Card>
      <CardHeader className="p-3">
        <CardTitle className=" font-semibold">
          {selectedSymbol.name} Market Price
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2 pt-0 px-3">
        <div className="flex items-center justify-between">
          <div
            className={`text-xl text-bold flex items-center ${
              priceDirection === "up" ? "text-green-500" : "text-red-500"
            }`}
          >
            ${manipulatedPrice.toFixed(2)}
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
        <div className="text-xs text-muted-foreground mt-2">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
}
