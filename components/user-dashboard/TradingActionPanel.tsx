"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useTrading } from "@/lib/trading-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const timeOptions = [
  { value: "5", label: "5s" },
  { value: "10", label: "10s" },
  { value: "15", label: "15s" },
  { value: "30", label: "30s" },
  { value: "60", label: "1m" },
  { value: "120", label: "2m" },
  { value: "180", label: "3m" },
  { value: "300", label: "5m" },
];

const predefinedAmounts = [10, 50, 100, 500, 1000];

export function TradingActionPanel() {
  const { toast } = useToast();
  const { selectedSymbol, currentPrice, updateBalance } = useTrading();
  const [tradeDetails, setTradeDetails] = useState({
    amount: "",
    time: "60",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTradeDetails({ ...tradeDetails, [name]: value });
  };

  const handleTimeChange = (value: string) => {
    setTradeDetails({ ...tradeDetails, time: value });
  };

  const handlePredefinedAmount = (amount: number) => {
    setTradeDetails({ ...tradeDetails, amount: amount.toString() });
  };

  const placeOrder = async (direction: "up" | "down") => {
    if (!selectedSymbol) {
      toast({
        title: "Error",
        description: "Please select a trading symbol first.",
        variant: "destructive",
      });
      return;
    }

    if (!tradeDetails.amount || Number(tradeDetails.amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbolId: selectedSymbol.id,
          amount: Number(tradeDetails.amount),
          direction,
          entryPrice: currentPrice,
          expiresAt: new Date(
            Date.now() + Number(tradeDetails.time) * 1000
          ).toISOString(),
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Order placed successfully! Direction: ${direction.toUpperCase()}`,
        });
        setTradeDetails({ ...tradeDetails, amount: "" });
        updateBalance();
      } else {
        throw new Error("Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Place Trade</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">
              Quick Amount
            </label>
            <div className="grid grid-cols-5 gap-2">
              {predefinedAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePredefinedAmount(amount)}
                >
                  ${amount}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Custom Amount
            </label>
            <Input
              name="amount"
              type="number"
              value={tradeDetails.amount}
              onChange={handleInputChange}
              placeholder="Enter trade amount"
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Expiry Time
            </label>
            <Select onValueChange={handleTimeChange} value={tradeDetails.time}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <Button
              onClick={() => placeOrder("up")}
              className="py-6 text-lg font-semibold bg-green-500 hover:bg-green-600 text-white"
              disabled={!selectedSymbol || !currentPrice}
            >
              <ArrowUp className="mr-2 h-5 w-5" />
              Up
            </Button>
            <Button
              onClick={() => placeOrder("down")}
              className="py-6 text-lg font-semibold bg-red-500 hover:bg-red-600 text-white"
              disabled={!selectedSymbol || !currentPrice}
            >
              <ArrowDown className="mr-2 h-5 w-5" />
              Down
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
