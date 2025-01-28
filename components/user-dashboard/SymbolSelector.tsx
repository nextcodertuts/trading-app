"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTrading } from "@/lib/trading-context";

interface Symbol {
  id: number;
  name: string;
  currentPrice: number;
  payout: number;
  enabled: boolean;
  binanceSymbol: string;
}

export function SymbolSelector() {
  const [symbols, setSymbols] = useState<Symbol[]>([]);
  const { selectedSymbol, setSelectedSymbol } = useTrading();

  useEffect(() => {
    const fetchSymbols = async () => {
      try {
        const response = await fetch("/api/symbols");
        if (!response.ok) throw new Error("Failed to fetch symbols");
        const data = await response.json();
        const enabledSymbols = data.symbols.filter((s: Symbol) => s.enabled);
        setSymbols(enabledSymbols);

        // Set first symbol as default if none selected
        if (!selectedSymbol && enabledSymbols.length > 0) {
          setSelectedSymbol(enabledSymbols[0]);
        }
      } catch (error) {
        console.error("Error fetching symbols:", error);
      }
    };

    fetchSymbols();
  }, [selectedSymbol, setSelectedSymbol]);

  return (
    <div className="absolute top-2 left-0 flex gap-2 overflow-x-auto p-2 rounded-lg z-50">
      {symbols.map((symbol) => (
        <Button
          key={symbol.id}
          variant={selectedSymbol?.id === symbol.id ? "default" : "outline"}
          className={cn(
            "whitespace-nowrap",
            selectedSymbol?.id === symbol.id &&
              "bg-primary text-primary-foreground"
          )}
          onClick={() => setSelectedSymbol(symbol)}
        >
          {symbol.name}
          <span className="ml-2 text-xs">({symbol.payout}%)</span>
        </Button>
      ))}
    </div>
  );
}
