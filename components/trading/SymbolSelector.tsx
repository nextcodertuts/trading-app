"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
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
  currentPrice: number;
  payout: number;
  enabled: boolean;
  binanceSymbol: string;
}

export function SymbolSelector() {
  const [symbols, setSymbols] = useState<Symbol[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<Symbol | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const fetchSymbols = async () => {
      try {
        const response = await fetch("/api/symbols");
        if (!response.ok) throw new Error("Failed to fetch symbols");
        const data = await response.json();
        setSymbols(data.symbols);

        // Set the initial selected symbol based on the current pathname
        const currentSymbol = data.symbols.find(
          (s: Symbol) => pathname === `/trade/${s.name}`
        );
        setSelectedSymbol(currentSymbol || data.symbols[0]);
      } catch (error) {
        console.error("Error fetching symbols:", error);
      }
    };

    fetchSymbols();
  }, [pathname]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[200px] justify-between">
          {selectedSymbol ? (
            <>
              {selectedSymbol.name}
              <span className="ml-2 text-xs">({selectedSymbol.payout}%)</span>
            </>
          ) : (
            "Select Symbol"
          )}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]">
        {symbols.map((symbol) => (
          <DropdownMenuItem key={symbol.id} asChild>
            <Link href={`/trading/${symbol.name}`}>
              <span className="flex justify-between w-full">
                {symbol.name}
                <span className="text-xs">({symbol.payout}%)</span>
              </span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
