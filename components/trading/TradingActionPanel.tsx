/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useBinanceWebSocket } from "@/lib/hooks/useBinanceWebSocket";

interface Symbol {
  id: number;
  name: string;
  displayName: string;
  payout: number;
  minAmount: number;
  maxAmount: number;
}

interface Props {
  symbol: Symbol;
}

export function TradingActionPanel({ symbol }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const priceData = useBinanceWebSocket(symbol.name);
  const [tradeDetails, setTradeDetails] = useState({
    amount: symbol.minAmount.toString(),
    time: "60",
  });

  const placeOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to place order");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Order placed successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const placeOrder = (direction: "up" | "down") => {
    if (!priceData?.price) {
      toast({
        title: "Error",
        description: "Please wait for price data to load",
        variant: "destructive",
      });
      return;
    }

    const amount = Number(tradeDetails.amount);
    if (amount < symbol.minAmount || amount > symbol.maxAmount) {
      toast({
        title: "Error",
        description: `Amount must be between ${symbol.minAmount} and ${symbol.maxAmount}`,
        variant: "destructive",
      });
      return;
    }

    placeOrderMutation.mutate({
      symbolId: symbol.id,
      amount,
      direction,
      entryPrice: priceData.price,
      duration: Number(tradeDetails.time),
    });
  };

  return (
    <Card>
      <CardContent className="space-y-4 pb-2 px-1">
        <div className="space-y-1">
          <div className="text-sm text-center text-muted-foreground">
            Payout: {symbol.payout}%
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
                type="number"
                value={tradeDetails.amount}
                onChange={(e) =>
                  setTradeDetails({ ...tradeDetails, amount: e.target.value })
                }
                min={symbol.minAmount}
                max={symbol.maxAmount}
                step="0.01"
                placeholder="Amount"
              />
              <div className="text-xs text-muted-foreground mt-1">
                Min: ${symbol.minAmount} - Max: ${symbol.maxAmount}
              </div>
            </div>

            <Select
              value={tradeDetails.time}
              onValueChange={(value) =>
                setTradeDetails({ ...tradeDetails, time: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 seconds</SelectItem>
                <SelectItem value="60">1 minute</SelectItem>
                <SelectItem value="300">5 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => placeOrder("up")}
              className="bg-green-500 hover:bg-green-600"
              disabled={placeOrderMutation.isPending}
            >
              <ArrowUp className="mr-2" />
              Up
            </Button>
            <Button
              onClick={() => placeOrder("down")}
              className="bg-red-500 hover:bg-red-600"
              disabled={placeOrderMutation.isPending}
            >
              <ArrowDown className="mr-2" />
              Down
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
