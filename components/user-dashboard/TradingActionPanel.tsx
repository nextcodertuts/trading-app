"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUp, ArrowDown } from "lucide-react";

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

export function TradingActionPanel() {
  const { toast } = useToast();
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

  const placeOrder = async (direction: "up" | "down") => {
    if (!tradeDetails.amount || Number.parseFloat(tradeDetails.amount) <= 0) {
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
        body: JSON.stringify({ ...tradeDetails, direction }),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Order placed successfully! Direction: ${direction.toUpperCase()}`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to place order!",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-sm mx-auto">
      <h2 className="text-xl font-bold text-center text-gray-800">
        Place Your Trade
      </h2>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Amount
          </label>
          <Input
            id="amount"
            name="amount"
            type="number"
            value={tradeDetails.amount}
            onChange={handleInputChange}
            placeholder="Enter trade amount"
            className="w-full"
          />
        </div>

        <div>
          <label
            htmlFor="time"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Time
          </label>
          <Select onValueChange={handleTimeChange} value={tradeDetails.time}>
            <SelectTrigger id="time" className="w-full">
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

        <div className="flex flex-col gap-2">
          <Button
            onClick={() => placeOrder("up")}
            className="py-6 text-lg font-semibold bg-green-500 hover:bg-green-600 text-white"
          >
            <ArrowUp className="mr-2 h-5 w-5" />
            Up
          </Button>
          <Button
            onClick={() => placeOrder("down")}
            className="py-6 text-lg font-semibold bg-red-500 hover:bg-red-600 text-white"
          >
            <ArrowDown className="mr-2 h-5 w-5" />
            Down
          </Button>
        </div>
      </div>
    </div>
  );
}
