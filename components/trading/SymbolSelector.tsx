import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

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
    <div className="z-50 mb-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            {currentSymbol.displayName}
            <span className="ml-2 text-xs">({currentSymbol.payout}%)</span>
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full">
          {symbols.map((symbol) => (
            <DropdownMenuItem key={symbol.id} asChild>
              <Link
                href={`/trading/${symbol.id}`}
                className={cn(
                  "flex w-full justify-between",
                  currentSymbol.id === symbol.id &&
                    "bg-primary text-primary-foreground"
                )}
              >
                <span>{symbol.displayName}</span>
                <span className="ml-2 text-xs">({symbol.payout}%)</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
