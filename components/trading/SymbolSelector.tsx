import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Symbol {
  id: number;
  name: string;
  displayName: string;
  payout: number;
  binanceSymbol: string;
}

export function SymbolSelector({
  symbols,
  currentSymbol,
}: {
  symbols: Symbol[];
  currentSymbol: Symbol;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto rounded-lg z-50 mb-2">
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
          <Link href={`/trading/${symbol.binanceSymbol}`}>
            {symbol.displayName}
            <span className="ml-2 text-xs">({symbol.payout}%)</span>
          </Link>
        </Button>
      ))}
    </div>
  );
}
