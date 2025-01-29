/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Symbol {
  id: number;
  name: string;
  payout: number;
}

export function SymbolSelector({
  symbols,
  currentSymbol,
}: {
  symbols: Symbol[];
  currentSymbol: Symbol;
}) {
  const pathname = usePathname();

  return (
    <div className="flex gap-2 overflow-x-auto rounded-lg z-50">
      {symbols.map((symbol) => (
        <Button
          key={symbol.id}
          variant={currentSymbol.id === symbol.id ? "default" : "outline"}
          className={cn(
            "whitespace-nowrap",
            currentSymbol.id === symbol.id &&
              "bg-primary text-primary-foreground"
          )}
          asChild
        >
          <Link href={`/trading/${symbol.name}`}>
            {symbol.name}
            <span className="ml-2 text-xs">({symbol.payout}%)</span>
          </Link>
        </Button>
      ))}
    </div>
  );
}
